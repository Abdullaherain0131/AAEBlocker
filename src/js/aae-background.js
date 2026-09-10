(function() {
    console.log("AAE_LOCAL_CORE: Background Interceptor Başlatıldı (Anti-Adblock Katili)");

    // Piyasadaki en yaygın reklam engelleyici tespit (anti-adblock) scriptleri
    const blockedScripts = [
        "*://*.fuckadblock.js*",
        "*://*.blockadblock.js*",
        "*://*/adblock-detector.js*",
        "*://*/detect.js*",
        "*://*/ads.js*",
        "*://*/adframe.js*",
        "*://*/show_ads.js*"
    ];

    let recentBlocks = [];

    if (typeof chrome !== 'undefined' && chrome.webRequest && chrome.webRequest.onBeforeRequest) {
        chrome.webRequest.onBeforeRequest.addListener(
            function(details) {
                console.log("AAE_LOCAL_CORE: Kalkan engelledi -> " + details.url);
                recentBlocks.push(details.url);
                if (recentBlocks.length > 50) recentBlocks.shift();
                return { cancel: true };
            },
            { urls: blockedScripts, types: ["script"] },
            ["blocking"]
        );
        console.log("AAE_LOCAL_CORE: WebRequest filtreleri aktif.");
    }
    
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
            if (msg.type === "GET_RECENT_BLOCKS") {
                sendResponse({ blocks: recentBlocks });
            }
        });
    }

    // ---------------------------------------------------------
    // BULUT SENKRONİZASYONU (Firebase AI Ağırlıkları)
    // ---------------------------------------------------------
    const firebaseDatabaseURL = "https://aaeb-19471-default-rtdb.europe-west1.firebasedatabase.app";
    
    const syncWeightsFromCloud = async () => {
        try {
            const response = await fetch(`${firebaseDatabaseURL}/mlp_weights.json`);
            if (response.ok) {
                const weights = await response.json();
                if (weights && weights.hiddenWeights && weights.outputWeights && chrome.storage && chrome.storage.local) {
                    chrome.storage.local.set({ aae_mlp_weights: weights }, () => {
                        console.log("AAE_LOCAL_CORE: AI ağırlıkları buluttan güncellendi.");
                    });
                }
            }
        } catch (e) {
            console.warn("AAE_LOCAL_CORE: Firebase erişim hatası (internetsiz mod devrede)", e);
        }
    };

    // İlk açılışta ve her 60 saniyede bir senkronize et
    syncWeightsFromCloud();
    setInterval(syncWeightsFromCloud, 60000);

})();
