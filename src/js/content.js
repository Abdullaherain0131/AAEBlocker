// AAEBlocker V-NEXUS Matrix Executor
console.log("🚀 [AAEBlocker] Skynet Matrix Executor Başlatılıyor...");

let brain = null;
const THRESHOLD = 0.85;
const INPUT_SIZE = 120;

// Relu ve Sigmoid Fonksiyonları
const relu = (x) => Math.max(0, x);
const sigmoid = (x) => 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, x))));

// Matris Çarpımı Fonksiyonu
function dotProduct(input, weights, bias) {
    let result = new Float32Array(weights.length); // weights is array of arrays [neurons][inputs]
    for (let i = 0; i < weights.length; i++) {
        let sum = bias[i];
        for (let j = 0; j < input.length; j++) {
            sum += input[j] * weights[i][j];
        }
        result[i] = sum;
    }
    return result;
}

// Sinir Ağı İleri Besleme (Forward Propagation)
function predict(features) {
    if (!brain) return 0;
    
    // Layer 1
    let z1 = dotProduct(features, brain.w_ih, brain.b_h);
    let a1 = new Float32Array(z1.length);
    for (let i=0; i<z1.length; i++) a1[i] = relu(z1[i]);
    
    // Layer 2
    let z2 = dotProduct(a1, brain.w_h2, brain.b_h2);
    let a2 = new Float32Array(z2.length);
    for (let i=0; i<z2.length; i++) a2[i] = relu(z2[i]);
    
    // Layer 3
    let z3 = dotProduct(a2, brain.w_h3, brain.b_h3);
    let a3 = new Float32Array(z3.length);
    for (let i=0; i<z3.length; i++) a3[i] = relu(z3[i]);
    
    // Output Layer (Layer 4)
    let z4 = dotProduct(a3, brain.w_ho, brain.b_o);
    return sigmoid(z4[0]);
}

// Elementten Özellik (Feature) Çıkartma
function extractFeatures(el) {
    let features = new Float32Array(INPUT_SIZE);
    features.fill(0);
    
    try {
        let rect = el.getBoundingClientRect();
        
        // 1-5: Boyut ve Pozisyon özellikleri
        features[0] = Math.min(1.0, rect.width / 2000.0);
        features[1] = Math.min(1.0, rect.height / 2000.0);
        features[2] = Math.min(1.0, rect.x / 2000.0);
        features[3] = Math.min(1.0, rect.y / 5000.0);
        features[4] = (rect.width > 200 && rect.height > 50) ? 1.0 : 0.0;
        
        // 6-15: Sınıf ve ID tehlike analizi
        let className = (el.className && typeof el.className === 'string') ? el.className.toLowerCase() : "";
        let idName = el.id ? el.id.toLowerCase() : "";
        let combined = className + " " + idName;
        
        features[5] = combined.includes("ad") ? 0.8 : 0.0;
        features[6] = combined.includes("sponsor") ? 0.9 : 0.0;
        features[7] = combined.includes("banner") ? 0.7 : 0.0;
        features[8] = combined.includes("popup") ? 0.8 : 0.0;
        features[9] = combined.includes("outbrain") ? 1.0 : 0.0;
        features[10] = combined.includes("taboola") ? 1.0 : 0.0;
        
        // 16-20: Tag ismi
        let tag = el.tagName.toLowerCase();
        features[11] = (tag === "iframe") ? 0.9 : 0.0;
        features[12] = (tag === "img") ? 0.5 : 0.0;
        features[13] = (tag === "script") ? 0.9 : 0.0;
        features[14] = (tag === "div") ? 0.2 : 0.0;
        features[15] = (tag === "ins") ? 0.95 : 0.0;
        
        // 21-25: Link ve Kaynak analizi
        if (tag === "img" || tag === "iframe" || tag === "script") {
            let src = el.src || "";
            features[16] = src.includes("ad") ? 0.8 : 0.0;
            features[17] = src.includes("doubleclick") ? 1.0 : 0.0;
            features[18] = src.includes("googleads") ? 1.0 : 0.0;
            features[19] = src.includes("syndication") ? 0.9 : 0.0;
            features[20] = Math.min(1.0, src.length / 500.0);
        }
        
        // 26-30: Stil (CSS) analizi
        let style = window.getComputedStyle(el);
        features[21] = style.position === "absolute" ? 0.5 : 0.0;
        features[22] = style.position === "fixed" ? 0.7 : 0.0;
        features[23] = parseInt(style.zIndex) > 900 ? 0.8 : 0.0;
        features[24] = style.display === "none" ? 1.0 : 0.0;
        features[25] = style.visibility === "hidden" ? 0.8 : 0.0;
        
        // Kalan özellikleri (26'dan 119'a kadar) ağın ezberlememesi için gürültü veya element derinliği olarak dolduralım
        let depth = 0;
        let parent = el.parentElement;
        while(parent) { depth++; parent = parent.parentElement; }
        features[26] = Math.min(1.0, depth / 20.0);
        
        for (let i = 27; i < INPUT_SIZE; i++) {
            // Yapay zeka eğitim sırasında boş kalan (gürültü) alanlar
            // Nötr veriye benzer olması için küçük değerler atıyoruz
            features[i] = Math.random() * 0.1;
        }

    } catch (e) {
        // Hata durumunda boş döndür
    }
    
    return features;
}

// Element Tarayıcı
function scanElement(el) {
    if (!brain) return;
    
    // Çok küçük veya çok büyük root elementleri atla
    if (el.tagName === "BODY" || el.tagName === "HTML") return;
    
    // Özellikleri çıkart
    let features = extractFeatures(el);
    
    // Yapay Zekaya Sor
    let probability = predict(features);
    
    // İnfaz
    if (probability > THRESHOLD) {
        console.log(`💀 [AAEBlocker] REKLAM YOK EDİLDİ! Olasılık: %${(probability*100).toFixed(2)} | Element:`, el);
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.setProperty('opacity', '0', 'important');
        el.style.setProperty('pointer-events', 'none', 'important');
    }
}

// Sayfa yüklendiğinde Beyni İndir ve Taramaya Başla
async function bootSkynet() {
    try {
        const url = chrome.runtime.getURL("js/aae-unified-omnicore.json");
        console.log("🧠 [AAEBlocker] Yapay Zeka Matrisi yükleniyor...", url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.aiConfig) {
            brain = data.aiConfig;
            console.log("✅ [AAEBlocker] Zeka Yüklendi! Aktif Parametreler Yüklendi.");
            
            // Mevcut Elementleri Tara
            const elements = document.querySelectorAll("div, iframe, img, ins, script");
            elements.forEach(scanElement);
            
            // Gelecekte eklenecek elementleri tara (MutationObserver)
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Sadece Element Node
                            scanElement(node);
                            // Altındaki elementleri de tara
                            const children = node.querySelectorAll("div, iframe, img, ins, script");
                            children.forEach(scanElement);
                        }
                    });
                });
            });
            
            observer.observe(document.body, { childList: true, subtree: true });
        } else {
            console.error("❌ [AAEBlocker] JSON içinde aiConfig bulunamadı!");
        }
    } catch (e) {
        console.error("❌ [AAEBlocker] Beyin yüklenirken hata:", e);
    }
}

// Eklenti çalıştı
bootSkynet();
