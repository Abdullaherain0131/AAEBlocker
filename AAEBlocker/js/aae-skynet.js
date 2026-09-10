/**
 * ═══════════════════════════════════════════════════════════════
 * AAE-Skynet V9 — Yapay Zeka Sinir Ağı Reklam Engelleyici
 * 512 Parametreli Derin Sinir Ağı + Asenkron Kuyruk Mimarisi
 * Performans: requestIdleCallback + WeakSet + IndexedDB Cache
 * ═══════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';
    const DEBUG = false;
    const log = (...args) => { if (DEBUG) console.log('[AAE-Skynet]', ...args); };

    // ─── Kısıtlanmış Sayfa Kontrolü ────────────────────────
    const proto = location.protocol;
    if (proto === 'about:' || proto === 'moz-extension:' || proto === 'chrome:') return;

    // ─── Frame Koruması ────────────────────────────────────
    const isIframe = window !== window.top;
    if (isIframe) {
        try {
            if (window.innerWidth > 0 && window.innerWidth < 100 &&
                window.innerHeight > 0 && window.innerHeight < 100) {
                log('Çok küçük iframe, atlanıyor.');
                return;
            }
        } catch(e) { return; }
    }

    let isCrossOrigin = false;
    if (isIframe) {
        try { window.top.location.origin; } catch(e) { isCrossOrigin = true; }
    }

    // ─── Sabitler ──────────────────────────────────────────
    const INPUT_SIZE = 512;
    const THRESHOLD = 0.85;
    const MAX_QUEUE_SIZE = 500;
    const STATS_FLUSH_MS = 5000;

    // ─── Sinir Ağı Matematik ───────────────────────────────
    const relu = (x) => Math.max(0, x);
    const sigmoid = (x) => 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, x))));

    function dotProduct(input, weights, bias) {
        const result = new Float32Array(weights.length);
        for (let i = 0; i < weights.length; i++) {
            let sum = bias[i];
            for (let j = 0; j < input.length; j++) {
                sum += input[j] * weights[i][j];
            }
            result[i] = sum;
        }
        return result;
    }

    function predict(brain, features) {
        if (brain === 'tflite_active' && window.AAETFLiteBridge) {
            return window.AAETFLiteBridge.predict(features);
        }

        if (window.AAEAccelerator && window.AAEAccelerator.isWASM && window.AAEAccelerator.forwardPass) {
            return window.AAEAccelerator.forwardPass(features, brain);
        }
        
        // Katman 1: Giriş → Gizli1 (ReLU)
        let z1 = dotProduct(features, brain.w_ih, brain.b_h);
        let a1 = new Float32Array(z1.length);
        for (let i = 0; i < z1.length; i++) a1[i] = relu(z1[i]);

        // Katman 2: Gizli1 → Gizli2 (ReLU)
        let z2 = dotProduct(a1, brain.w_h2, brain.b_h2);
        let a2 = new Float32Array(z2.length);
        for (let i = 0; i < z2.length; i++) a2[i] = relu(z2[i]);

        // Katman 3: Gizli2 → Gizli3 (ReLU)
        let z3 = dotProduct(a2, brain.w_h3, brain.b_h3);
        let a3 = new Float32Array(z3.length);
        for (let i = 0; i < z3.length; i++) a3[i] = relu(z3[i]);

        // Katman 4: Gizli3 → Çıkış (Sigmoid)
        let z4 = dotProduct(a3, brain.w_ho, brain.b_o);
        return sigmoid(z4[0]);
    }

    // ─── Ön Hesaplanmış Gürültü (Math.random yerine) ──────
    const LATENT_NOISE = new Float32Array(INPUT_SIZE - 30);
    for (let i = 0; i < LATENT_NOISE.length; i++) {
        LATENT_NOISE[i] = ((i * 7 + 13) % 100) / 10000; // Deterministik mikro gürültü
    }

    // ─── Reklam Ağı Domain Listesi ─────────────────────────
    const AD_DOMAINS = [
        'doubleclick.net', 'googlesyndication.com', 'googleadservices.com',
        'adnxs.com', 'advertising.com', 'criteo.com', 'outbrain.com',
        'taboola.com', 'mgid.com', 'amazon-adsystem.com', 'adsrvr.org'
    ];

    // ─── Özellik Çıkarma (512 Boyutlu Vektör) ─────────────
    function extractFeatures(el) {
        const features = new Float32Array(INPUT_SIZE);
        let f = 0;

        try {
            // 0-3: Boyutlar
            const rect = el.getBoundingClientRect();
            features[f++] = Math.min(1.0, rect.width / 2000);
            features[f++] = Math.min(1.0, rect.height / 2000);
            features[f++] = (rect.width > 300 && rect.height > 250) ? 1.0 : 0.0;
            features[f++] = (rect.width > 700 && rect.height > 80) ? 1.0 : 0.0;

            // 4-9: Anahtar Kelime Analizi (class + id)
            const className = (el.className && typeof el.className === 'string') ? el.className.toLowerCase() : '';
            const idName = el.id ? el.id.toLowerCase() : '';
            const combined = className + ' ' + idName;

            features[f++] = combined.includes('ad') ? 0.8 : 0.0;
            features[f++] = combined.includes('sponsor') ? 0.9 : 0.0;
            features[f++] = combined.includes('taboola') ? 1.0 : 0.0;
            features[f++] = combined.includes('outbrain') ? 1.0 : 0.0;
            features[f++] = combined.includes('banner') ? 0.8 : 0.0;
            features[f++] = combined.includes('popup') ? 0.7 : 0.0; // f=10

            // 10-13: Etiket Tipi
            const tag = el.tagName;
            features[f++] = (tag === 'IFRAME') ? 0.9 : 0.0;
            features[f++] = (tag === 'IMG') ? 0.5 : 0.0;
            features[f++] = (tag === 'INS') ? 0.95 : 0.0;
            features[f++] = (tag === 'DIV') ? 0.3 : 0.0; // f=14

            // 14-16: Kaynak URL Analizi
            const src = (el.src || '').toLowerCase();
            features[f++] = src.includes('doubleclick') ? 1.0 : 0.0;
            features[f++] = src.includes('googlesyndication') ? 1.0 : 0.0;
            features[f++] = AD_DOMAINS.some(d => src.includes(d)) ? 1.0 : 0.0; // f=17

            // 17-22: Metin Analizi (NLP)
            const text = (el.textContent || '').substring(0, 200).toLowerCase();
            features[f++] = text.includes('advertisement') ? 1.0 : 0.0;
            features[f++] = text.includes('reklam') ? 1.0 : 0.0;
            features[f++] = text.includes('sponsor') ? 0.9 : 0.0;
            features[f++] = Math.min(1.0, text.length / 500);
            const textLen = text.trim().length;
            const imgCount = el.getElementsByTagName('img').length;
            features[f++] = (imgCount > 0 && textLen < 50) ? 1.0 : 0.0; // f=22

            // 22-25: DOM Hiyerarşi + Konum
            features[f++] = Math.min(1.0, el.childElementCount / 20);
            features[f++] = el.parentElement ? Math.min(1.0, el.parentElement.childElementCount / 30) : 0;

            // Üst eleman zinciri analizi (3 seviye)
            let adParentScore = 0;
            let p = el.parentElement;
            for (let i = 0; i < 3 && p; i++) {
                const pText = ((p.className && typeof p.className === 'string') ? p.className : '') + ' ' + (p.id || '');
                if (pText.toLowerCase().includes('ad')) adParentScore += 0.3;
                p = p.parentElement;
            }
            features[f++] = Math.min(1.0, adParentScore); // f=25

            // 25-29: Stil Analizi (tek getComputedStyle çağrısı)
            const style = window.getComputedStyle(el);
            features[f++] = (style.position === 'fixed' || style.position === 'sticky') ? 0.8 : 0.0;
            features[f++] = style.position === 'absolute' ? 0.5 : 0.0;
            const zIndex = parseInt(style.zIndex);
            features[f++] = (!isNaN(zIndex) && zIndex > 999) ? 1.0 : (!isNaN(zIndex) && zIndex > 99) ? 0.5 : 0.0;
            features[f++] = (style.opacity < 0.1 || style.visibility === 'hidden') ? 1.0 : 0.0; // f=29

            // Data ve ARIA özellikleri
            features[f++] = Object.keys(el.dataset).length > 2 ? 0.5 : 0.0; // f=30

            // 30-511: Statik gürültü (latent uzay genişletme)
            features.set(LATENT_NOISE, 30);

        } catch (e) { /* Güvenli hata yutma */ }

        return features;
    }

    // ─── Bellek Yönetimi ───────────────────────────────────
    const scannedNodes = new WeakSet();
    const scanQueue = [];
    let isProcessing = false;

    // ─── İstatistik (Debounced) ─────────────────────────────
    let pendingStats = { domBlocks: 0, totalScanned: 0, lastThreat: '' };
    let statsFlushTimer = null;

    function recordBlock(el) {
        pendingStats.domBlocks++;
        const desc = '<' + el.tagName.toLowerCase() + '> ' +
            (el.id || el.className || '').substring(0, 20);
        pendingStats.lastThreat = desc;
        flushStatsLazy();
    }

    function recordScan(count) {
        pendingStats.totalScanned += count;
        flushStatsLazy();
    }

    function flushStatsLazy() {
        if (statsFlushTimer) return;
        statsFlushTimer = setTimeout(() => {
            try {
                chrome.runtime.sendMessage({
                    type: 'BATCH_STATS',
                    updates: { ...pendingStats }
                });
            } catch(e) {}
            pendingStats = { domBlocks: 0, totalScanned: 0, lastThreat: '' };
            statsFlushTimer = null;
        }, STATS_FLUSH_MS);
    }

    // ─── Kuyruk Mimarisi ───────────────────────────────────
    function queueElement(el) {
        if (!el || el.nodeType !== 1 || scannedNodes.has(el)) return;

        const tag = el.tagName;
        // Güvenli etiketleri atla
        if (['ARTICLE', 'MAIN', 'NAV', 'HEADER', 'FOOTER', 'P', 'SECTION',
             'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'B', 'I', 'STRONG',
             'EM', 'BODY', 'HTML', 'SCRIPT', 'STYLE', 'HEAD', 'META', 'LINK',
             'TITLE', 'FORM', 'INPUT', 'LABEL', 'SELECT', 'OPTION', 'BUTTON',
             'TABLE', 'TR', 'TD', 'TH', 'THEAD', 'TBODY', 'UL', 'OL', 'LI'
        ].includes(tag)) {
            scannedNodes.add(el);
            return;
        }

        // Cross-origin iframe'lerde agresifliği azalt
        if (isCrossOrigin && tag !== 'IFRAME' && tag !== 'INS') {
            scannedNodes.add(el);
            return;
        }

        // Kuyruk boyut kontrolü
        if (scanQueue.length >= MAX_QUEUE_SIZE) {
            scanQueue.shift();
        }
        scanQueue.push(el);
        scheduleProcess();
    }

    function scheduleProcess() {
        if (isProcessing) return;
        isProcessing = true;
        if ('requestIdleCallback' in window) {
            requestIdleCallback(processQueue, { timeout: 2000 });
        } else {
            setTimeout(() => processQueue({ timeRemaining: () => 15, didTimeout: true }), 100);
        }
    }

    function processQueue(deadline) {
        isProcessing = false;
        let processed = 0;

        while (scanQueue.length > 0) {
            if (deadline && !deadline.didTimeout && deadline.timeRemaining() < 3) {
                scheduleProcess();
                break;
            }

            const el = scanQueue.shift();
            if (!el || !el.isConnected || scannedNodes.has(el)) continue;
            scannedNodes.add(el);

            const features = extractFeatures(el);
            const score = predict(activeBrain, features);
            processed++;

            // Güvenli element kontrolü (false-positive koruması)
            let isSafe = false;
            if (el.textContent && el.textContent.trim().length > 400) {
                const imgs = el.getElementsByTagName('img').length;
                if (imgs <= 1) isSafe = true;
            }

            if (score >= THRESHOLD && !isSafe) {
                el.style.setProperty('display', 'none', 'important');
                el.style.setProperty('visibility', 'hidden', 'important');
                el.style.setProperty('pointer-events', 'none', 'important');

                // Iframe ise ebeveyni de kontrol et
                if (el.tagName === 'IFRAME' && el.parentElement) {
                    const pRect = el.parentElement.getBoundingClientRect();
                    const eRect = el.getBoundingClientRect();
                    if (Math.abs(pRect.width - eRect.width) < 50 &&
                        Math.abs(pRect.height - eRect.height) < 50) {
                        el.parentElement.style.setProperty('display', 'none', 'important');
                    }
                }

                recordBlock(el);
                log('Reklam engellendi! Skor:', score.toFixed(3), el.tagName, el.id || el.className);
            }
        }

        if (processed > 0) recordScan(processed);
    }

    // ─── Beyin Aktifleştirme (Genel Değişken) ──────────────
    let activeBrain = null;

    // ─── IndexedDB Tembel Yükleme ──────────────────────────
    const IDB_NAME = 'AAEBlocker';
    const IDB_STORE = 'brain';

    function loadBrainFromIDB() {
        return new Promise((resolve) => {
            try {
                const req = indexedDB.open(IDB_NAME, 1);
                req.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains(IDB_STORE)) {
                        db.createObjectStore(IDB_STORE);
                    }
                };
                req.onsuccess = (e) => {
                    const db = e.target.result;
                    const tx = db.transaction(IDB_STORE, 'readonly');
                    const get = tx.objectStore(IDB_STORE).get('current');
                    get.onsuccess = () => resolve(get.result || null);
                    get.onerror = () => resolve(null);
                };
                req.onerror = () => resolve(null);
            } catch(e) { resolve(null); }
        });
    }

    function saveBrainToIDB(data) {
        try {
            const req = indexedDB.open(IDB_NAME, 1);
            req.onsuccess = (e) => {
                const db = e.target.result;
                const tx = db.transaction(IDB_STORE, 'readwrite');
                tx.objectStore(IDB_STORE).put(data, 'current');
            };
        } catch(e) {}
    }

    // ─── Boot Sekansı ──────────────────────────────────────
    async function boot() {
        log('Boot başlıyor...');
        
        // Hangi motorun kullanılacağını belirle (Background script ayarladı)
        const engineType = await new Promise(resolve => {
            chrome.storage.local.get('aiEngine', (res) => resolve(res.aiEngine || 'wasm_js'));
        });
        
        log(`Motor Tipi: ${engineType}`);

        if (engineType === 'tflite') {
            // TFLite (Mobil) Akışı
            if (window.AAETFLiteBridge) {
                const loaded = await window.AAETFLiteBridge.loadModel();
                if (loaded) {
                    activeBrain = 'tflite_active';
                    log('TFLite Motoru aktif!');
                } else {
                    log('TFLite yüklenemedi. Skynet devre dışı.');
                    return;
                }
            }
        } else {
            // JS / WASM (Masaüstü) Akışı
            // 1. IndexedDB'den önce kontrol et
            let brainData = await loadBrainFromIDB();

            // 2. Yoksa extension bundle'dan yükle
            if (!brainData) {
                try {
                    const url = chrome.runtime.getURL('js/aae-unified-omnicore-512.json');
                    log('Beyin dosyadan yükleniyor...');
                    const response = await fetch(url);
                    const json = await response.json();

                    if (json && json.aiConfig) {
                        brainData = json.aiConfig;
                        saveBrainToIDB(brainData);
                        log('Beyin dosyadan yüklendi ve IndexedDB\'ye kaydedildi.');
                    } else if (json && json.w_ih) {
                        brainData = json;
                        saveBrainToIDB(brainData);
                        log('Beyin (düz format) yüklendi ve IndexedDB\'ye kaydedildi.');
                    }
                } catch (e) {
                    log('Beyin yüklenemedi:', e.message);
                    return;
                }
            } else {
                log('Beyin IndexedDB\'den yüklendi.');
            }

            if (!brainData || !brainData.w_ih) {
                log('Geçerli beyin verisi bulunamadı, Skynet devre dışı.');
                return;
            }

            activeBrain = brainData;
            log('WASM/JS Beyin aktif! Katmanlar hazır.');
        }

        // 3. DOM hazır olunca gözlemciyi başlat
        const startScanning = () => {
            // Mevcut elementleri tara
            const existing = document.querySelectorAll('div, iframe, img, ins');
            existing.forEach(el => queueElement(el));

            // Gelecekte eklenenleri izle
            const observer = new MutationObserver((mutations) => {
                for (const m of mutations) {
                    for (const node of m.addedNodes) {
                        if (node.nodeType === 1) {
                            queueElement(node);
                            // Alt elementleri de kontrol et
                            if (node.querySelectorAll) {
                                node.querySelectorAll('div, iframe, img, ins').forEach(queueElement);
                            }
                        }
                    }
                }
            });

            if (document.body) {
                observer.observe(document.body, { childList: true, subtree: true });
                log('MutationObserver başlatıldı.');
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startScanning);
        } else {
            startScanning();
        }
    }

    // chrome.storage'dan güncellenen ağırlıkları dinle
    try {
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area === 'local' && changes.aae_brain_version) {
                // Yeni versiyon geldiğinde IDB'den tekrar yükle
                loadBrainFromIDB().then(data => {
                    if (data && data.w_ih) {
                        activeBrain = data;
                        log('Beyin OTA güncellemesi uygulandı.');
                    }
                });
            }
        });
    } catch(e) {}

    // ─── Mesaj Dinleyici (Element picker, training) ────────
    try {
        chrome.runtime.onMessage.addListener((msg) => {
            if (msg.type === 'AAE_TRAIN_AD') {
                // Sağ tıklanan element üzerinde AI eğitimi (gelecek implementasyon)
                log('Eğitim isteği alındı.');
            }
        });
    } catch(e) {}

    // Başlat!
    boot();

})();
