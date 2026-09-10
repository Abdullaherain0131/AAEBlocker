// ═══════════════════════════════════════════════════════════════
// AAEBlocker V9 — Arka Plan Motor (Background Engine)
// Performans Odaklı | Firebase Cloud Storage Uyumlu
// ═══════════════════════════════════════════════════════════════

(function() {
    'use strict';
    const DEBUG = false;
    const log = (...args) => { if (DEBUG) console.log('AAE_BG:', ...args); };

    log('Background Engine başlatıldı.');

    // ─── 1. AĞ SEVİYESİ ENGELLEME (WebRequest) ─────────────
    const blockedPatterns = [
        "*://*.fuckadblock.js*",
        "*://*.blockadblock.js*",
        "*://*/adblock-detector.js*",
        "*://*/detect-adblock.js*",
        "*://*/ads.js*",
        "*://*/adframe.js*",
        "*://*/show_ads.js*",
        "*://*/pagead2.googlesyndication.com/*",
        "*://*/securepubads.g.doubleclick.net/*",
        "*://*.amazon-adsystem.com/*",
        "*://*/adnxs.com/*",
        "*://*/criteo.com/*",
        "*://*/outbrain.com/widget/*",
        "*://*/taboola.com/libtrc/*",
        "*://*/mgid.com/*"
    ];

    // İstatistik Havuzu (Bellekte tutulur, periyodik olarak diske yazılır)
    let stats = {
        networkBlocks: 0,
        domBlocks: 0,
        overlayKills: 0,
        cookieRejects: 0,
        videoSkips: 0,
        totalScanned: 0,
        lastThreat: '-',
        sessionStart: Date.now(),
        uptime: 0
    };

    // Başlangıçta mevcut istatistikleri yükle
    chrome.storage.local.get('aiStats', (result) => {
        if (result.aiStats) {
            // Kalıcı sayaçları koru, oturum bilgilerini sıfırla
            stats.networkBlocks = result.aiStats.networkBlocks || 0;
            stats.domBlocks = result.aiStats.domBlocks || 0;
            stats.overlayKills = result.aiStats.overlayKills || 0;
            stats.cookieRejects = result.aiStats.cookieRejects || 0;
            stats.videoSkips = result.aiStats.videoSkips || 0;
            stats.totalScanned = result.aiStats.totalScanned || 0;
            stats.lastThreat = result.aiStats.lastThreat || '-';
        }
    });

    // İstatistikleri her 5 saniyede bir diske yaz (Batarya/IO dostu)
    setInterval(() => {
        stats.uptime = Math.floor((Date.now() - stats.sessionStart) / 1000);
        chrome.storage.local.set({ aiStats: stats });
    }, 5000);

    // Son engellenen URL'ler (popup'ta göstermek için)
    let recentBlocks = [];
    const MAX_RECENT = 30;

    if (chrome.webRequest && chrome.webRequest.onBeforeRequest) {
        chrome.webRequest.onBeforeRequest.addListener(
            function(details) {
                log('Ağ engellendi:', details.url.substring(0, 80));
                
                stats.networkBlocks++;
                stats.lastThreat = new URL(details.url).hostname.substring(0, 30);
                
                recentBlocks.push({
                    url: details.url.substring(0, 120),
                    time: Date.now(),
                    type: details.type
                });
                if (recentBlocks.length > MAX_RECENT) recentBlocks.shift();
                
                return { cancel: true };
            },
            { urls: blockedPatterns, types: ["script", "sub_frame", "image", "xmlhttprequest"] },
            ["blocking"]
        );
        log('WebRequest filtreleri aktif.');
    }

    // ─── 2. MESAJ KÖPRÜSÜ (Content Script ↔ Background) ─────
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        switch (msg.type) {
            case 'GET_RECENT_BLOCKS':
                sendResponse({ blocks: recentBlocks });
                break;
            
            case 'GET_STATS':
                stats.uptime = Math.floor((Date.now() - stats.sessionStart) / 1000);
                sendResponse({ stats: stats });
                break;
            
            case 'INCREMENT_STAT':
                // Content script'lerden gelen istatistik artışları
                if (msg.key && stats[msg.key] !== undefined) {
                    stats[msg.key] += (msg.value || 1);
                }
                if (msg.threat) {
                    stats.lastThreat = msg.threat.substring(0, 40);
                }
                break;
            
            case 'BATCH_STATS':
                // Toplu istatistik güncellemesi (content script her 5 saniyede bir gönderir)
                if (msg.updates) {
                    for (const [key, value] of Object.entries(msg.updates)) {
                        if (stats[key] !== undefined && typeof value === 'number') {
                            stats[key] += value;
                        }
                    }
                    if (msg.updates.lastThreat) {
                        stats.lastThreat = msg.updates.lastThreat;
                    }
                }
                break;
        }
        return false; // Senkron yanıt
    });

    // ─── 3. FIREBASE CLOUD STORAGE ENTEGRASYONU (OTA AI Güncelleme) ───
    
    // Cihaz algılama
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    log(`Sistem Algılandı: ${isMobile ? 'Android (TFLite Yüklenecek)' : 'PC (WASM/JS Yüklenecek)'}`);
    
    // Motor tipini kaydet (content script'ler için)
    chrome.storage.local.set({ aiEngine: isMobile ? 'tflite' : 'wasm_js' });
    
    const AI_UPDATE_CONFIG = {
        pcMetadataURL: 'https://raw.githubusercontent.com/Abdullaherain0131/AAEBlocker/master/AAEBlocker/omnicore-metadata.json',
        androidMetadataURL: 'https://raw.githubusercontent.com/Abdullaherain0131/AAEBlocker/master/AAEBlocker/mobile-tflite-metadata.json',
        checkInterval: 24 * 60 * 60 * 1000,
        lastCheck: 0
    };

    const checkForAIUpdate = async () => {
        const metadataURL = isMobile ? AI_UPDATE_CONFIG.androidMetadataURL : AI_UPDATE_CONFIG.pcMetadataURL;
        
        // Demo amaçlı URL'yi kontrol et
        if (metadataURL.includes('your-project')) {
            log('Firebase URL yapılandırılmamış. Yerel dosyalar kullanılacak.');
            return;
        }
        
        const now = Date.now();
        if (now - AI_UPDATE_CONFIG.lastCheck < AI_UPDATE_CONFIG.checkInterval) return;
        AI_UPDATE_CONFIG.lastCheck = now;
        
        try {
            log(`AI beyin güncellemesi kontrol ediliyor... (${isMobile ? 'Mobil TFLite' : 'PC JSON'})`);
            const response = await fetch(metadataURL);
            if (!response.ok) return;
            
            const metadata = await response.json();
            
            const stored = await new Promise(resolve => {
                chrome.storage.local.get('aae_brain_version', (r) => resolve(r.aae_brain_version || '0'));
            });
            
            if (metadata.version && metadata.version !== stored) {
                log('Yeni AI beyin versiyonu bulundu:', metadata.version);
                
                if (metadata.downloadURL) {
                    const brainResponse = await fetch(metadata.downloadURL);
                    if (brainResponse.ok) {
                        let brainData;
                        
                        if (isMobile) {
                            // TFLite modeli blob (ArrayBuffer) olarak indir
                            const buffer = await brainResponse.arrayBuffer();
                            brainData = buffer;
                        } else {
                            // PC modeli JSON olarak indir
                            brainData = await brainResponse.json();
                        }
                        
                        await saveBrainToIDB(brainData);
                        chrome.storage.local.set({ aae_brain_version: metadata.version });
                        
                        log('AI beyni güncellendi! Versiyon:', metadata.version);
                    }
                }
            }
        } catch (e) {
            log('AI güncelleme hatası (çevrimdışı mod):', e.message);
        }
    };

    // IndexedDB yardımcı fonksiyonları (büyük veri depolama)
    const IDB_NAME = 'AAEBlocker';
    const IDB_STORE = 'brain';
    const IDB_VERSION = 1;

    function openIDB() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(IDB_NAME, IDB_VERSION);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(IDB_STORE)) {
                    db.createObjectStore(IDB_STORE);
                }
            };
            req.onsuccess = (e) => resolve(e.target.result);
            req.onerror = (e) => reject(e.target.error);
        });
    }

    async function saveBrainToIDB(data) {
        const db = await openIDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(IDB_STORE, 'readwrite');
            tx.objectStore(IDB_STORE).put(data, 'current');
            tx.oncomplete = resolve;
            tx.onerror = (e) => reject(e.target.error);
        });
    }

    // İlk açılışta kontrol et, sonra her 6 saatte bir
    setTimeout(checkForAIUpdate, 10000);
    setInterval(checkForAIUpdate, 6 * 60 * 60 * 1000);

    // ─── 4. BAĞLAM MENÜSÜ (Sağ Tık) ──────────────────────────
    if (chrome.menus || chrome.contextMenus) {
        const menus = chrome.menus || chrome.contextMenus;
        
        menus.create({
            id: 'aae-train-ad',
            title: '🎯 AAEBlocker: Bu Elementi Reklam Olarak Öğret',
            contexts: ['all']
        });
        
        menus.create({
            id: 'aae-sniper-mode',
            title: '🔫 AAEBlocker: Sniper Modu (Tek Tıkla Sil)',
            contexts: ['all']
        });

        const menuHandler = (info, tab) => {
            if (!tab || !tab.id) return;
            
            if (info.menuItemId === 'aae-train-ad') {
                chrome.tabs.sendMessage(tab.id, { type: 'AAE_TRAIN_AD' });
            } else if (info.menuItemId === 'aae-sniper-mode') {
                chrome.tabs.sendMessage(tab.id, { type: 'AAE_SNIPER_MODE' });
            }
        };

        if (menus.onClicked) {
            menus.onClicked.addListener(menuHandler);
        }
    }

    log('Background Engine hazır.');
})();
