// AAEBlocker Core Content Script V8 - Anti-Fingerprinting & Ultimate Ad Blocker

// 0. AĞ VE ZAMANLAYICI PROXY'Sİ (Anti-Adblock ve Reklam İsteklerini Engelleme)
const injectProxy = () => {
    const script = document.createElement('script');
    script.textContent = `
        (function() {
            // Anti-adblock trigger kelimeleri - Yüksek Hızlı Regex (DFA Engine) Optimizasyonu
            const blockedPatterns = ['adblock', 'ads', 'sponsor', 'detect', 'blocking', 'blocked', 'banner', 'analytics', 'tracker', 'ad-system'];
            const blockRegex = new RegExp(blockedPatterns.join('|'), 'i');
            
            // XHR Proxy
            const origXHR = window.XMLHttpRequest;
            window.XMLHttpRequest = function() {
                const xhr = new origXHR();
                const origOpen = xhr.open;
                xhr.open = function(method, url) {
                    if (blockRegex.test(String(url))) {
                        console.log('[AAEBlocker] Engellendi (XHR):', url);
                        return origOpen.apply(this, [method, 'data:application/json,{"blocked":true}']);
                    }
                    return origOpen.apply(this, arguments);
                };
                return xhr;
            };

            // Fetch Proxy
            const origFetch = window.fetch;
            window.fetch = async function() {
                const url = typeof arguments[0] === 'string' ? arguments[0] : (arguments[0] && arguments[0].url ? arguments[0].url : '');
                if (blockRegex.test(String(url))) {
                    console.log('[AAEBlocker] Engellendi (Fetch):', url);
                    return new Response(JSON.stringify({blocked: true}), {status: 200});
                }
                return origFetch.apply(this, arguments);
            };

            // Timer (setInterval/setTimeout) Proxy
            const origSetInterval = window.setInterval;
            window.setInterval = function(fn, time) {
                if (fn && fn.toString().toLowerCase().includes('adblock')) {
                    console.log('[AAEBlocker] Adblock algılayıcı setInterval engellendi!');
                    return 99999; 
                }
                return origSetInterval.apply(this, arguments);
            };

            const origSetTimeout = window.setTimeout;
            window.setTimeout = function(fn, time) {
                if (fn && fn.toString().toLowerCase().includes('adblock')) {
                    console.log('[AAEBlocker] Adblock algılayıcı setTimeout engellendi!');
                    return 99999; 
                }
                return origSetTimeout.apply(this, arguments);
            };
        })();
    `;
    (document.head || document.documentElement).appendChild(script);
    script.remove();
};
injectProxy();

document.addEventListener('DOMContentLoaded', () => {
    
    let destroyedCount = 0;

    // --- CYBERPUNK HUD (Heads-Up Display) ---
    const hud = document.createElement('div');
    hud.id = 'aae-cyber-hud';
    hud.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 300px;
        background: rgba(11, 15, 25, 0.9);
        border: 1px solid #00ffcc;
        border-left: 4px solid #ff00ff;
        color: #00ffcc;
        font-family: 'Courier New', Courier, monospace;
        font-size: 13px;
        padding: 15px;
        z-index: 2147483647;
        box-shadow: 0 0 15px rgba(0, 255, 204, 0.2);
        pointer-events: none;
        backdrop-filter: blur(5px);
        transition: all 0.3s ease;
    `;
    
    hud.innerHTML = `
        <div style="font-weight:bold; color:#ff00ff; margin-bottom:5px;">> AAEBlocker_Terminal v8.0</div>
        <div id="aae-hud-log"></div>
        <div style="margin-top:5px; color:#fff;">> Tehditler İmha Edildi: <span id="aae-hud-count" style="color:#00ffcc; font-size: 16px; font-weight: bold;">0</span></div>
    `;
    document.documentElement.appendChild(hud);

    const logToHud = (msg) => {
        const logDiv = document.getElementById('aae-hud-log');
        if (logDiv) {
            const entry = document.createElement('div');
            entry.textContent = `> ${msg}`;
            entry.style.color = '#00ffcc';
            entry.style.opacity = '0';
            entry.style.transition = 'opacity 0.5s';
            logDiv.appendChild(entry);
            
            setTimeout(() => entry.style.opacity = '1', 50);
            if (logDiv.children.length > 3) logDiv.removeChild(logDiv.firstChild);
        }
    };

    const updateHudCount = (add) => {
        destroyedCount += add;
        const countSpan = document.getElementById('aae-hud-count');
        if (countSpan) countSpan.textContent = destroyedCount;
        
        hud.style.boxShadow = '0 0 25px rgba(255, 0, 255, 0.8)';
        setTimeout(() => hud.style.boxShadow = '0 0 15px rgba(0, 255, 204, 0.2)', 200);
    };

    logToHud("Sistem Devrede.");
    logToHud("Donanım Gizleniyor (Anti-Fingerprint)...");

    // 1. ANTI-ADBLOCK DEFUSER, API SPOOFING & GHOST MODE
    const defuserScript = document.createElement('script');
    defuserScript.textContent = `
        // AAE_CORE YEREL SİBER SİLAH SİSTEMİ (V10)
        
        // 1.1 API SPOOFING & Gelişmiş Sezgisel Analiz (Advanced Heuristic Analysis)
        const aae_isTarget = (el) => {
            if (!el) return false;
            if (el.hasAttribute('data-aae-ai-scanned') || el.style.opacity === '0' || el.style.visibility === 'hidden') return true;
            
            // Tüm siteler için geçerli evrensel reklam/tuzak sınıf ve ID kontrolü
            const cls = (typeof el.className === 'string') ? el.className.toLowerCase() : '';
            const id = (el.id || '').toLowerCase();
            const tag = el.tagName ? el.tagName.toLowerCase() : '';
            
            const adPatterns = ['ad', 'ads', 'banner', 'sponsor', 'pub_300', 'pub_728', 'text-ad', 'text_ad', 'advert'];
            return adPatterns.some(p => cls.includes(p) || id.includes(p)) && ['div', 'iframe', 'img', 'ins'].includes(tag);
        };
        
        const origGetComputedStyle = window.getComputedStyle;
        window.getComputedStyle = function(el, pseudo) {
            const style = origGetComputedStyle.call(this, el, pseudo);
            if (aae_isTarget(el)) {
                return new Proxy(style, {
                    get(target, prop) {
                        if (prop === 'display') return 'block';
                        if (prop === 'visibility') return 'visible';
                        if (prop === 'opacity') return '1';
                        if (prop === 'width') return '300px';
                        if (prop === 'height') return '250px';
                        return Reflect.get(target, prop);
                    }
                });
            }
            return style;
        };

        const origGetBoundingClientRect = Element.prototype.getBoundingClientRect;
        Element.prototype.getBoundingClientRect = function() {
            if (aae_isTarget(this)) {
                return { x: 100, y: 100, width: 300, height: 250, top: 100, right: 400, bottom: 350, left: 100 };
            }
            return origGetBoundingClientRect.call(this);
        };
        
        // 1.1.2 HARDCORE DOM DIMENSION SPOOFING (Aternos Bypass)
        const spoofProp = (proto, prop, fakeValue) => {
            const orig = Object.getOwnPropertyDescriptor(proto, prop);
            if (orig) {
                Object.defineProperty(proto, prop, {
                    get: function() {
                        if (aae_isTarget(this)) return fakeValue;
                        return orig.get.call(this);
                    }
                });
            }
        };

        // Sniper Mode Logic for V13
        window.startAaeSniperMode = function() {
            if (document.getElementById('aae-sniper-overlay')) return;

            const overlayer = document.createElement('div');
            overlayer.id = 'aae-sniper-overlay';
            overlayer.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.4);z-index:999998;cursor:crosshair;pointer-events:none;';
            document.body.appendChild(overlayer);

            let hoveredEl = null;
            let originalOutline = '';

            const moveHandler = (e) => {
                if (hoveredEl) {
                    hoveredEl.style.outline = originalOutline;
                    hoveredEl.style.boxShadow = '';
                }
                
                let el = document.elementFromPoint(e.clientX, e.clientY);
                // Only target fixed/sticky elements
                while(el && el !== document.body && el !== document.documentElement) {
                    const style = window.getComputedStyle(el);
                    if(style.position === 'fixed' || style.position === 'sticky') {
                        break;
                    }
                    el = el.parentElement;
                }

                if (el && el !== document.body && el !== document.documentElement) {
                    hoveredEl = el;
                    originalOutline = hoveredEl.style.outline;
                    hoveredEl.style.outline = '4px solid #0f0';
                    hoveredEl.style.boxShadow = '0 0 20px #0f0';
                } else {
                    hoveredEl = null;
                }
            };

            const clickHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (hoveredEl) {
                    hoveredEl.style.outline = originalOutline;
                    hoveredEl.style.boxShadow = '';
                    
                    // Sniper animation
                    if (!document.getElementById('aae-sniper-anim')) {
                        const style = document.createElement('style');
                        style.id = 'aae-sniper-anim';
                        style.textContent = \`
                            @keyframes aaeSniperShot {
                                0% { transform: scale(1); filter: brightness(1) drop-shadow(0 0 0 #0f0); }
                                20% { transform: scale(1.1); filter: brightness(2) drop-shadow(0 0 30px #0f0); background: #0f0; }
                                100% { transform: scale(0); filter: brightness(0); opacity: 0; }
                            }
                            .aae-sniped {
                                animation: aaeSniperShot 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards !important;
                                pointer-events: none !important;
                            }
                        \`;
                        (document.head || document.documentElement).appendChild(style);
                    }
                    
                    hoveredEl.classList.add('aae-sniped');
                    setTimeout(() => hoveredEl.style.setProperty('display', 'none', 'important'), 500);
                    
                    // AI kalıcı olarak öğrenebilir
                    const className = hoveredEl.className ? '.' + hoveredEl.className.split(' ').join('.') : '';
                    const idName = hoveredEl.id ? '#' + hoveredEl.id : '';
                    const selector = idName || className || hoveredEl.tagName.toLowerCase();
                    
                    if(selector) {
                        chrome.storage.local.get(['aae_learned_selectors'], (res) => {
                            const learned = res.aae_learned_selectors || [];
                            if (!learned.includes(selector)) {
                                learned.push(selector);
                                chrome.storage.local.set({ aae_learned_selectors: learned });
                            }
                        });
                    }
                }
                document.removeEventListener('mousemove', moveHandler, true);
                document.removeEventListener('click', clickHandler, true);
                overlayer.remove();
            };

            document.addEventListener('mousemove', moveHandler, true);
            document.addEventListener('click', clickHandler, true);
        };

        spoofProp(HTMLElement.prototype, 'offsetHeight', 250);
        spoofProp(HTMLElement.prototype, 'offsetWidth', 300);
        spoofProp(Element.prototype, 'clientHeight', 250);
        spoofProp(Element.prototype, 'clientWidth', 300);

        // 1.2 INTERSECTION OBSERVER MANİPÜLASYONU
        const origIntersectionObserver = window.IntersectionObserver;
        window.IntersectionObserver = class extends origIntersectionObserver {
            constructor(callback, options) {
                const proxyCallback = (entries, observer) => {
                    entries.forEach(entry => {
                        if (aae_isTarget(entry.target)) {
                            Object.defineProperty(entry, 'isIntersecting', { value: true });
                            Object.defineProperty(entry, 'intersectionRatio', { value: 1 });
                        }
                    });
                    return callback(entries, observer);
                };
                super(proxyCallback, options);
            }
        };

        // 1.3 SHADOW DOM DELİCİ (Closed Shadow DOM Bypass)
        const origAttachShadow = Element.prototype.attachShadow;
        Element.prototype.attachShadow = function(init) {
            if (init && init.mode === 'closed') {
                init.mode = 'open'; // Sitenin gizli DOM kalkanını kırıyoruz!
            }
            const shadow = origAttachShadow.call(this, init);
            const shadowObserver = new MutationObserver((mutations) => {
                mutations.forEach(m => m.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.textContent.toLowerCase().includes('adblock')) {
                        node.style.setProperty('display', 'none', 'important');
                    }
                }));
            });
            shadowObserver.observe(shadow, { childList: true, subtree: true });
            return shadow;
        };
        
        // 1.3.5 EVRENSEL SCRIPT HATA YAKALAMA (Universal Script Error Handling)
        // Sitelerin, engellenen ağ isteklerini dinleyerek anti-adblock'u tetiklemesini önler
        const origAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            if (type === 'error' && (this.tagName === 'SCRIPT' || this.tagName === 'IMG')) {
                // Hata dinleyicisini sabote et (Asla tetiklenme veya sessize al)
                return;
            }
            return origAddEventListener.call(this, type, listener, options);
        };
        
        // Inline onerror attribute'larını iptal et veya onload ile değiştir
        const origSetAttribute = Element.prototype.setAttribute;
        Element.prototype.setAttribute = function(name, value) {
            if (name.toLowerCase() === 'onerror') {
                return; // onerror atanmasını tamamen reddet
            }
            return origSetAttribute.call(this, name, value);
        };

        // 1.4 İHBAR SİNYALLERİNİ KESME (Telemetry Blocker)
        const blockKeywords = ['adblock', 'ads_blocked', 'ad-block', 'ad_detected'];
        
        const origSendBeacon = navigator.sendBeacon;
        navigator.sendBeacon = function(url, data) {
            const strUrl = String(url).toLowerCase();
            const strData = String(data).toLowerCase();
            if (blockKeywords.some(kw => strUrl.includes(kw) || strData.includes(kw))) {
                return true; // Sinyali iptal et ama siteye "gitti" yalanı söyle
            }
            return origSendBeacon.call(this, url, data);
        };

        const origFetch = window.fetch;
        window.fetch = async function(...args) {
            const url = typeof args[0] === 'string' ? args[0].toLowerCase() : (args[0].url ? args[0].url.toLowerCase() : '');
            let body = '';
            if (args[1] && args[1].body) body = String(args[1].body).toLowerCase();
            
            if (blockKeywords.some(kw => url.includes(kw) || body.includes(kw))) {
                return new Response(JSON.stringify({ status: "ok" }), { status: 200, headers: { 'Content-Type': 'application/json' }});
            }
            return origFetch.apply(this, args);
        };

        // Anti-Adblock Spoofing (Geleneksel)
        window.google_ad_status = 1;
        window.adsbygoogle = { push: function() {}, loaded: true };
        window.fuckAdBlock = { onDetected: function(){}, onNotDetected: function(cb){ setTimeout(cb, 100); }, setOption: function(){} };
        window.BlockAdBlock = window.fuckAdBlock;
        Object.defineProperty(window, 'adblock', { get: function() { return false; }, set: function() {} });
        Object.defineProperty(window, 'isAdBlockActive', { get: function() { return false; }, set: function() {} });
        Object.defineProperty(window, 'canRunAds', { get: function() { return true; }, set: function() {} });
        
        // Anti-Fingerprinting (Canvas Noise Injector)
        const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
        HTMLCanvasElement.prototype.toDataURL = function() {
            const ctx = this.getContext('2d');
            if (ctx) {
                ctx.fillStyle = 'rgba(' + Math.random()*255 + ',' + Math.random()*255 + ',' + Math.random()*255 + ',0.01)';
                ctx.fillRect(0, 0, 1, 1);
            }
            return originalToDataURL.apply(this, arguments);
        };
        
        // Anti-Fingerprinting (Audio API Noise)
        if (window.AudioContext || window.webkitAudioContext) {
            const originalCreateOscillator = (window.AudioContext || window.webkitAudioContext).prototype.createOscillator;
            (window.AudioContext || window.webkitAudioContext).prototype.createOscillator = function() {
                const osc = originalCreateOscillator.apply(this, arguments);
                osc.frequency.value += (Math.random() - 0.5); // Add micro noise
                return osc;
            };
        }

        // Spoof Hardware (Prevent tracking by memory/CPU cores)
        Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
        Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 4 });
    `;
    document.documentElement.appendChild(defuserScript);
    defuserScript.remove(); 

    // 1.5 UNIVERSAL ANTI-ADBLOCK OVERLAY KILLER (Tüm Siteler İçin Geçerli)
    const killOverlays = () => {
        let overlayKilled = false;
        
        // Evrensel Anti-Adblock anahtar kelimeleri (Türkçe ve İngilizce)
        const adblockKeywords = [
            "bir reklam engelleyici", "reklam engelleyici tespit edildi",
            "yine de reklam engelleyici", "reklam engelleyiciyi kapatın",
            "adblock detected", "disable your adblocker", "turn off adblock",
            "please disable adblock", "adblocker detected", "whitelist our site",
            "we noticed you are using an ad blocker", "ad blocker is enabled",
            "support us by disabling", "lütfen reklam engelleyiciyi",
            "turn off your ad blocker", "we see you are using an adblocker", 
            "reklam engelleyici kullanıyorsunuz", "reklam engelleyicinizi kapatın", 
            "please whitelist", "disable adblocker to continue"
        ];

        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walker.nextNode()) {
            const text = node.nodeValue.trim().toLowerCase();
            if (text.length > 5 && adblockKeywords.some(kw => text.includes(kw))) {
                // Kapsayıcı şablonu (overlay) bul
                let parent = node.parentElement;
                while (parent && parent.tagName !== 'BODY' && parent.tagName !== 'HTML') {
                    const style = window.getComputedStyle(parent);
                    // CSS sezgisel analizi (Tam ekran engelleyici kalıpları)
                    const isFixed = style.position === 'fixed' || style.position === 'absolute';
                    const isFullHeight = parseInt(style.height) > window.innerHeight * 0.4 || style.height === '100vh';
                    const hasBackdrop = style.backdropFilter !== 'none' || style.backgroundColor.includes('rgba');
                    const highZIndex = parseInt(style.zIndex) > 100;
                    
                    if (isFixed && (isFullHeight || highZIndex || hasBackdrop)) {
                        parent.style.setProperty('display', 'none', 'important'); 
                        parent.style.setProperty('opacity', '0', 'important'); 
                        parent.style.setProperty('pointer-events', 'none', 'important'); 
                        overlayKilled = true;
                        logToHud("Evrensel Anti-Adblock Kalkanı Kırıldı!");
                        break;
                    }
                    parent = parent.parentElement;
                }
            }
        }
        
        // Eğer bir kalkan kırıldıysa, sitenin asıl içeriğini zorla geri getir
        if (overlayKilled) {
            const hiddenMains = document.querySelectorAll('.page-content, main, #main, .wrapper, #wrapper, div');
            hiddenMains.forEach(el => {
                if (window.getComputedStyle(el).display === 'none') {
                    el.style.setProperty('display', 'block', 'important');
                    el.style.setProperty('visibility', 'visible', 'important');
                    el.style.setProperty('opacity', '1', 'important');
                }
            });
            // Tüm sayfada Scroll kilidini kır
            document.body.style.setProperty('overflow', 'auto', 'important');
            document.body.style.setProperty('position', 'static', 'important');
            document.documentElement.style.setProperty('overflow', 'auto', 'important');
            document.documentElement.style.setProperty('position', 'static', 'important');
        }

        // Evrensel otomatik tıklama (Bypass butonları)
        const buttonKeywords = [
            "yine de devam et", "yine de reklam engelleyiciyle devam et", 
            "continue with adblocker anyway", "continue without supporting", 
            "i understand", "kabul ediyorum", "anladım", "devam et",
            "kabul et", "continue without disabling", "hayır, teşekkürler", 
            "no thanks", "kapat"
        ];
        const buttons = document.querySelectorAll('div, button, a, span');
        for (let btn of buttons) {
            const text = (btn.textContent || "").toLowerCase().trim();
            if (buttonKeywords.some(kw => text.includes(kw)) && window.getComputedStyle(btn).display !== 'none') {
                btn.click();
                btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
                logToHud("Bypass Butonuna Zorla Tıklandı!");
                updateHudCount(1);
            }
        }
    };
    
    // 1.6 BİLİNEN ANTİ-ADBLOCK UZANTILARI İÇİN STATİK LİSTE (AdblockDetectorBypass'tan entegre edildi)
    const destroyKnownAdblockDetectors = () => {
        const knownSelectors = [
            ".adblock_title",".adblock_subtitle",".ab-detector-wrap","#abDetectorModal","#adDetectorElm",
            ".dialog-overlay",".dialog-overlay-blur","#arlinablock",".fc-ab-root","body > div.fc-ab-root",
            ".fbs-auth__container.fbs-auth__adblock",".paywall-overlay","#paywall-ui-responsive-modal",
            '[data-qa="wall-background"]',"#wall-bottom-drawer",".zephr-article-modal-backdrop.zephr-backdrop",
            ".tp-modal",".tp-backdrop.tp-active","[name='metering-modal']",".c-nudge__container.c-gate__container",
            ".tp_modal","div[class^='sp_message_container']","div[class^='sp_veil']","#tie-popup-adblock",
            ".tie-popup","#modal-whitelist","#modal-overlay","#nindo-popup-portal","#nindo-drawer-portal",
            ".bt-sw-container",".bt-sw-modal","#adblock_tooltip",".adblock-killme-overlay",".bfddebf37-blackout",
            ".protection","#tp-yt-iron-overlay-backdrop",".wa-limit-modal",".bck-adblock.is--active",
            ".adblock__container",".adblock-killme-overlay","#zdn-adblock-overlay",".zdn-adblock-message",
            ".ad-blocker-popup-modal","#adblock-wall","#uBO-wall","#anti-adblock",".anti-adblock",
            ".adblock-sticky",".adblock-banner","#adblock-bg","#adblock-popup",".ab-overlay",".ab-modal",
            ".sp-message-container", ".fc-consent-root", ".fc-dialog-container", "#sp_message_container", 
            "#sp_veil", "#adb-modal", ".adb-overlay", ".swal2-container", ".adblocker-modal"
        ];
        
        let destroyed = false;
        knownSelectors.forEach(selector => {
            try {
                document.querySelectorAll(selector).forEach(el => {
                    if (window.getComputedStyle(el).display !== 'none') {
                        el.style.setProperty('display', 'none', 'important');
                        el.style.setProperty('pointer-events', 'none', 'important');
                        destroyed = true;
                    }
                });
            } catch (e) {}
        });
        
        if (destroyed) {
            document.body.style.setProperty('overflow', 'auto', 'important');
            document.documentElement.style.setProperty('overflow', 'auto', 'important');
            logToHud("Statik Anti-Adblock Katmanı Temizlendi.");
        }
    };
    
    setInterval(killOverlays, 800);
    setInterval(destroyKnownAdblockDetectors, 1500);

    // 2. ULTRA DELUXE AD BOX ANNIHILATOR (Stealth Mode + Extreme Aggression)
    // Inject brutal CSS to nuke all native ads globally before JS even runs
    const brutalCSS = document.createElement('style');
    brutalCSS.textContent = `
        .taboola, .outbrain, .mgid, .revcontent, .ad-banner, .advertisement, 
        .ad-container, .sponsored-post, [id*="google_ads"], [class*="adsbygoogle"],
        [id*="taboola"], [id*="outbrain"], [data-ad-client], iframe[src*="adsystem"] {
            display: none !important;
            opacity: 0 !important;
            pointer-events: none !important;
            position: absolute !important;
            width: 1px !important;
            height: 1px !important;
        }
    `;
    document.head.appendChild(brutalCSS);

    const annihilateAds = () => {
        let destroyedThisTick = 0;
        const extremeAdSelectors = 'ins.adsbygoogle, iframe[id^="google_ads_iframe"], iframe[src*="doubleclick"], iframe[src*="amazon-adsystem"], .ad-container, .ad-slot, .ad-wrapper, .banner-ad, [id*="banner-ad"], [id^="div-gpt-ad"], .ad-box, .adSpace, .ad-zone, .ad-placeholder, .advertisement, [id*="taboola"], [id*="outbrain"], .sponsored, .promoted';
        const adContainers = document.querySelectorAll(extremeAdSelectors);
        adContainers.forEach(ad => {
            if (ad.style.opacity !== '0') {
                ad.style.opacity = '0';
                ad.style.pointerEvents = 'none';
                ad.style.position = 'absolute';
                ad.style.zIndex = '-9999';
                ad.innerHTML = '';
                destroyedThisTick++;
            }
        });

        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        let nodesToDestroy = [];
        while (node = walker.nextNode()) {
            const text = node.nodeValue.trim().toUpperCase();
            if (text === 'ADVERTISEMENT' || text === 'REKLAM' || text === 'ADVERTISEMENTS' || text === 'SPONSORED' || text === 'SPONSORLU') {
                nodesToDestroy.push(node.parentElement);
            }
        }
        
        nodesToDestroy.forEach(parent => {
            if (parent && parent.style.opacity !== '0') {
                parent.style.opacity = '0'; 
                parent.style.position = 'absolute';
                destroyedThisTick++;
                
                let adBox = parent.nextElementSibling;
                if (adBox && (adBox.tagName === 'DIV' || adBox.tagName === 'INS' || adBox.tagName === 'IFRAME')) {
                    adBox.style.opacity = '0';
                    adBox.style.position = 'absolute';
                    destroyedThisTick++;
                }
                let childrenBoxes = parent.querySelectorAll('div, ins, iframe');
                childrenBoxes.forEach(child => {
                    child.style.opacity = '0';
                    child.style.position = 'absolute';
                    destroyedThisTick++;
                });
            }
        });
        
        if (destroyedThisTick > 0) {
            logToHud(`${destroyedThisTick} Kötü Amaçlı Modül İmha Edildi.`);
            updateHudCount(destroyedThisTick);
        }
    };
    
    annihilateAds();
    setInterval(annihilateAds, 1000);

    // 3. COOKIE REJECTER
    const rejectKeywords = ["reject all", "tümünü reddet", "decline all", "tout refuser", "alles ablehnen", "kabul etme"];
    let attempts = 0;
    const interval = setInterval(() => {
        const buttons = document.querySelectorAll('button, a, [role="button"]');
        let clicked = false;
        for (let btn of buttons) {
            const text = (btn.textContent || "").toLowerCase().trim();
            if (rejectKeywords.includes(text) && btn.offsetHeight > 0) {
                btn.click();
                console.log("[AAEBlocker] Auto-rejected cookies!");
                clicked = true;
                break;
            }
        }
        if (clicked || attempts > 15) clearInterval(interval);
        attempts++;
    }, 800);
    
    // 4. WORD CENSOR
    chrome.storage.local.get(['aaeWordCensor'], (res) => {
        if (!res.aaeWordCensor) return;
        const words = res.aaeWordCensor.split(',').map(w => w.trim().toLowerCase()).filter(w => w.length > 2);
        if (words.length === 0) return;
        
        const censorWords = () => {
            const els = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div.tweet');
            els.forEach(el => {
                if (el.children.length > 3 || el.style.display === 'none') return;
                const txt = (el.textContent || "").toLowerCase();
                if (words.some(w => txt.includes(w))) {
                    el.style.display = 'none';
                    console.log("[AAEBlocker] Censored element");
                }
            });
        };
        censorWords();
        setInterval(censorWords, 2000);
    });

    // 5. MEDYA AVISI (Media Hunter)
    const huntMedia = () => {
        const videos = document.querySelectorAll('video');
        videos.forEach(vid => {
            if (vid.parentElement && !vid.parentElement.querySelector('.aae-media-hunter-btn')) {
                const parentStyle = window.getComputedStyle(vid.parentElement);
                if (parentStyle.position === 'static') {
                    vid.parentElement.style.position = 'relative';
                }
                
                const btn = document.createElement('a');
                btn.className = 'aae-media-hunter-btn';
                btn.textContent = 'İNDİR';
                btn.style.cssText = `
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: #ff00ff;
                    color: white;
                    padding: 8px 15px;
                    border-radius: 5px;
                    font-family: 'Courier New', monospace;
                    font-weight: bold;
                    text-decoration: none;
                    z-index: 999999;
                    box-shadow: 0 0 15px rgba(255,0,255,0.8);
                    border: 2px solid #fff;
                    cursor: pointer;
                    opacity: 0.7;
                    transition: 0.3s;
                `;
                
                btn.onmouseenter = () => { btn.style.opacity = '1'; btn.style.transform = 'scale(1.1)'; };
                btn.onmouseleave = () => { btn.style.opacity = '0.7'; btn.style.transform = 'scale(1)'; };
                
                btn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    let src = vid.src || (vid.querySelector('source') ? vid.querySelector('source').src : null);
                    if (src) {
                        logToHud("Medya Yakalandı: " + src.substring(0, 30) + "...");
                        window.open(src, '_blank');
                    } else {
                        logToHud("Gizli Medya Akışı! (DRM Korumalı olabilir)");
                        alert("Video kaynağı Blob veya DRM korumalı. Ancak AAEBlocker ağı dinliyor!");
                    }
                };
                
                vid.parentElement.appendChild(btn);
                logToHud("Sayfada Video Tespit Edildi!");
            }
        });
    };
    setInterval(huntMedia, 2000);

    // 6. ÖDEME DUVARI KIRICI (Paywall Cracker)
    const crackPaywalls = () => {
        let cracked = false;
        const allElements = document.querySelectorAll('*');
        for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i];
            const style = window.getComputedStyle(el);
            
            // Remove Blur
            if (style.filter.includes('blur') || style.backdropFilter.includes('blur')) {
                el.style.setProperty('filter', 'none', 'important');
                el.style.setProperty('backdrop-filter', 'none', 'important');
                cracked = true;
            }
            
            // Remove Text Selection Blocks
            if (style.userSelect === 'none' && (el.tagName === 'P' || el.tagName === 'ARTICLE' || el.tagName === 'DIV')) {
                el.style.setProperty('user-select', 'auto', 'important');
                el.style.setProperty('-webkit-user-select', 'auto', 'important');
            }
            
            // Fix hidden faded articles (gradient fades)
            if ((el.tagName === 'ARTICLE' || el.className.includes('article') || el.className.includes('content')) && parseInt(style.maxHeight) < 800) {
                el.style.setProperty('max-height', 'none', 'important');
                el.style.setProperty('overflow', 'visible', 'important');
            }
        }
        if (cracked) logToHud("Ödeme Duvarı / Şifreleme Kırıldı!");
        
        // "Linki Görmek İçin Giriş Yap" Decoder Attempt
        const hiddenLinkTexts = document.evaluate("//text()[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'linki görmek için') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'login to see link')]", document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
        for (let i = 0; i < hiddenLinkTexts.snapshotLength; i++) {
            const node = hiddenLinkTexts.snapshotItem(i);
            const parent = node.parentElement;
            if (parent && !parent.hasAttribute('data-aae-checked')) {
                parent.setAttribute('data-aae-checked', 'true');
                // Try to find a data attribute that looks like base64
                Array.from(parent.attributes).forEach(attr => {
                    if (attr.value.length > 10 && !attr.value.includes(' ')) {
                        try {
                            const decoded = atob(attr.value);
                            if (decoded.startsWith('http')) {
                                node.nodeValue = " [AAEBlocker Çözdü: " + decoded + "] ";
                                parent.style.color = "#00ffcc";
                                logToHud("Gizli Link Çözüldü!");
                            }
                        } catch(e) {}
                    }
                });
            }
        }
    };
    setInterval(crackPaywalls, 3000);

    // 7. ZEHİRLİ LİNK DEDEKTÖRÜ (De-Cloaker)
    const decloakLinks = () => {
        const badDomains = ["bit.ly", "adf.ly", "ouo.io", "linkvertise", "bc.vc", "tinyurl", "shorte.st"];
        const links = document.querySelectorAll('a');
        links.forEach(a => {
            if (a.href && !a.hasAttribute('data-aae-decloaked')) {
                a.setAttribute('data-aae-decloaked', 'true');
                if (badDomains.some(d => a.href.includes(d))) {
                    a.style.setProperty('color', '#ff0000', 'important');
                    a.style.setProperty('text-shadow', '0 0 5px #ff0000', 'important');
                    a.style.setProperty('font-weight', 'bold', 'important');
                    const warning = document.createElement('span');
                    warning.textContent = ' ☠️ [TUZAK LİNK]';
                    warning.style.color = '#ff0000';
                    a.appendChild(warning);
                    logToHud("Zehirli Link Tespit Edildi!");
                }
            }
        });
    };
    setInterval(decloakLinks, 2000);

    // 8. ZEN MODU (Alt + Z)
    let zenModeActive = false;
    document.addEventListener('keydown', (e) => {
        if (e.altKey && e.key.toLowerCase() === 'z') {
            zenModeActive = !zenModeActive;
            if (zenModeActive) {
                logToHud("ZEN MODU AKTİF: Dış Dünya Susturuldu.");
                const all = document.querySelectorAll('body *');
                all.forEach(el => {
                    if (['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'ARTICLE', 'BR', 'B', 'STRONG', 'I', 'EM', 'SPAN', 'A'].includes(el.tagName)) {
                        el.setAttribute('data-zen', 'keep');
                    } else {
                        if (!el.contains(document.querySelector('article')) && !el.querySelector('p')) {
                            el.style.setProperty('opacity', '0', 'important');
                            el.style.setProperty('pointer-events', 'none', 'important');
                        }
                    }
                });
                document.body.style.setProperty('background', '#0b0f19', 'important');
                document.body.style.setProperty('color', '#00ffcc', 'important');
            } else {
                logToHud("ZEN MODU DEVRE DIŞI.");
                // Reload page to exit Zen Mode cleanly
                window.location.reload();
            }
        }
    });

    // 9. YAPAY ZEKA GÖRSEL ALGI VE ÖĞRENEN SİNİR AĞI MODÜLÜ (ORTAK BEYİN - CLOUD SYNC)
    // Bulut (Firebase) Senkronizasyonu Background Script'e (aae-background.js) taşındı.
    
    const aiConfig = {
        w1: [[-0.0320, 0.0494, -0.0315, 0.0319, -0.0148, 0.0195, -0.0299, -0.0336, 0.0489, -0.0028, -0.0149, 0.0390, -0.0325, -0.0386, -0.0489, 0.0329, 0.0166, -0.0111, -0.0336, -0.0129, 0.0148, -0.0144, -0.0360, 0.0475, 0.0127, 0.0496, -0.0420, 0.0390, -0.0142, 0.0327, -0.0421, -0.0208, -0.0479, 0.0421, 0.0300, 0.0115, -0.0287, 0.0244, 0.0422, -0.0370, 0.0441, -0.0261, 0.0227, -0.0466, -0.0420, -0.0129, -0.0285, -0.0067, -0.0471, 0.0115, 0.0333, 0.0006, -0.0020, -0.0432, 0.0340, 0.0350, 0.0349, 0.0057, -0.0251, 0.0073, 0.0404, -0.0053, -0.0310, 0.0125, -0.0379, -0.0455, 0.0133, 0.0477, -0.0281, -0.0092, 0.0405, -0.0341, 0.0097, -0.0127, -0.0244, 0.0304, -0.0399, 0.0168, -0.0310, 0.0126, -0.0305, 0.0313, 0.0388, 0.0044, -0.0172, 0.0262, -0.0148, 0.0136, 0.0100, -0.0041, -0.0036, -0.0106, -0.0422, -0.0114, 0.0105, -0.0044, -0.0063, 0.0052, -0.0159, 0.0050, -0.0267, 0.0383, 0.0209, 0.0221, -0.0395, -0.0330, -0.0126, -0.0349, -0.0127, -0.0173, -0.0256, -0.0173, 0.0489, -0.0194, -0.0030, 0.0060, 0.0492, -0.0373, 0.0405, -0.0306, -0.0201, -0.0063, -0.0312, 0.0170, 0.0324, -0.0408, -0.0207, 0.0428],[-0.0211, 0.0361, -0.0148, -0.0121, -0.0291, 0.0056, 0.0038, 0.0445, -0.0342, -0.0165, 0.0130, -0.0091, 0.0026, 0.0442, -0.0287, 0.0322, 0.0155, 0.0306, -0.0023, -0.0108, -0.0100, -0.0366, -0.0320, 0.0359, -0.0310, 0.0011, -0.0145, -0.0328, 0.0051, 0.0273, 0.0061, 0.0465, -0.0219, 0.0470, -0.0295, -0.0437, -0.0112, 0.0422, -0.0356, -0.0086, -0.0047, -0.0428, -0.0240, 0.0258, -0.0451, -0.0152, -0.0090, 0.0107, 0.0043, -0.0491, 0.0148, 0.0151, 0.0477, -0.0200, -0.0266, 0.0194, 0.0464, 0.0019, 0.0409, -0.0152, 0.0394, 0.0301, 0.0457, 0.0264, 0.0125, -0.0088, -0.0329, -0.0350, 0.0289, -0.0468, 0.0377, -0.0199, -0.0114, 0.0442, -0.0405, -0.0355, -0.0468, -0.0183, 0.0034, -0.0059, 0.0430, -0.0220, 0.0068, -0.0446, -0.0312, 0.0483, -0.0408, -0.0224, 0.0401, 0.0014, 0.0460, 0.0358, 0.0025, 0.0363, -0.0108, 0.0121, -0.0466, 0.0189, 0.0208, 0.0023, -0.0009, 0.0455, 0.0467, 0.0169, 0.0139, 0.0357, 0.0136, 0.0364, -0.0218, 0.0105, 0.0124, -0.0450, -0.0074, 0.0300, 0.0068, 0.0048, -0.0221, -0.0320, 0.0223, 0.0104, 0.0188, -0.0355, -0.0002, -0.0018, -0.0367, -0.0291, 0.0174, 0.0491],[0.0390, 0.0130, 0.0260, -0.0289, -0.0307, 0.0125, 0.0093, -0.0272, -0.0282, -0.0433, 0.0063, 0.0144, 0.0129, -0.0354, -0.0029, 0.0153, 0.0079, -0.0146, 0.0139, -0.0346, -0.0110, -0.0415, -0.0063, -0.0163, 0.0415, 0.0329, 0.0163, -0.0378, 0.0074, 0.0393, -0.0232, -0.0357, -0.0160, 0.0314, -0.0008, 0.0296, -0.0336, -0.0214, 0.0138, -0.0057, 0.0110, -0.0420, -0.0228, 0.0323, -0.0078, -0.0288, 0.0178, 0.0003, 0.0120, 0.0095, -0.0407, -0.0352, -0.0470, 0.0288, -0.0490, -0.0364, 0.0166, -0.0242, -0.0003, -0.0417, 0.0222, 0.0160, 0.0329, 0.0235, -0.0267, 0.0425, 0.0069, -0.0065, 0.0123, -0.0261, -0.0206, -0.0377, -0.0190, 0.0495, -0.0286, 0.0428, 0.0276, -0.0384, -0.0171, -0.0110, -0.0070, 0.0325, 0.0318, -0.0497, 0.0143, 0.0078, 0.0077, 0.0204, 0.0164, 0.0355, -0.0177, 0.0435, 0.0209, -0.0497, -0.0290, -0.0229, 0.0478, 0.0062, 0.0170, 0.0425, -0.0295, -0.0364, -0.0147, -0.0061, 0.0259, -0.0042, -0.0258, -0.0079, -0.0261, -0.0489, 0.0038, 0.0447, -0.0050, 0.0384, 0.0203, -0.0410, 0.0401, -0.0194, 0.0191, -0.0126, 0.0062, 0.0117, 0.0127, 0.0443, -0.0405, -0.0126, 0.0135, -0.0062],[0.0146, -0.0026, -0.0467, -0.0006, -0.0268, -0.0076, -0.0014, -0.0104, -0.0375, 0.0466, -0.0076, 0.0214, 0.0471, -0.0410, 0.0240, 0.0078, -0.0154, -0.0315, -0.0290, -0.0218, 0.0489, -0.0469, -0.0151, -0.0437, -0.0240, -0.0112, -0.0151, -0.0340, -0.0335, 0.0241, -0.0354, -0.0328, -0.0399, -0.0499, 0.0486, 0.0154, -0.0098, 0.0195, 0.0166, 0.0129, -0.0363, 0.0247, 0.0215, 0.0201, -0.0288, -0.0291, -0.0358, -0.0265, -0.0128, 0.0110, -0.0183, 0.0183, -0.0446, 0.0150, -0.0342, 0.0098, 0.0332, -0.0273, 0.0056, 0.0226, -0.0297, -0.0100, -0.0077, -0.0078, -0.0485, -0.0222, -0.0105, 0.0138, 0.0216, -0.0499, -0.0315, 0.0326, -0.0123, 0.0085, -0.0438, 0.0248, -0.0349, -0.0434, 0.0241, 0.0433, 0.0483, -0.0086, -0.0064, 0.0021, 0.0218, 0.0493, 0.0294, -0.0464, -0.0270, -0.0058, -0.0360, -0.0392, -0.0241, 0.0212, 0.0307, -0.0139, -0.0026, -0.0153, -0.0025, -0.0232, -0.0175, -0.0236, -0.0354, 0.0388, -0.0012, 0.0133, -0.0191, -0.0402, 0.0023, 0.0199, -0.0212, -0.0076, -0.0180, 0.0499, -0.0332, 0.0376, 0.0304, -0.0101, 0.0500, -0.0489, 0.0453, 0.0062, -0.0004, 0.0206, 0.0066, -0.0433, -0.0077, -0.0434],[0.0116, 0.0022, 0.0161, 0.0047, -0.0313, 0.0278, 0.0328, 0.0295, -0.0078, 0.0158, 0.0229, -0.0371, -0.0293, 0.0003, 0.0338, 0.0186, -0.0220, -0.0061, -0.0210, 0.0459, 0.0278, 0.0364, 0.0175, -0.0042, -0.0415, -0.0126, 0.0114, 0.0265, -0.0066, 0.0369, -0.0457, -0.0147, 0.0049, -0.0204, -0.0235, 0.0120, 0.0446, -0.0461, 0.0111, -0.0145, -0.0060, 0.0243, 0.0197, 0.0065, -0.0070, 0.0109, 0.0434, 0.0076, 0.0385, 0.0386, 0.0273, 0.0338, -0.0341, -0.0298, 0.0087, -0.0487, 0.0385, -0.0062, 0.0005, 0.0114, 0.0398, 0.0167, -0.0318, -0.0141, 0.0417, 0.0056, 0.0053, -0.0334, -0.0136, -0.0156, -0.0201, 0.0106, -0.0277, -0.0026, 0.0098, -0.0464, -0.0485, -0.0053, -0.0411, 0.0365, -0.0442, -0.0454, -0.0220, 0.0027, 0.0276, -0.0330, 0.0148, -0.0387, 0.0095, -0.0302, -0.0026, 0.0445, -0.0069, -0.0365, -0.0223, -0.0231, -0.0101, 0.0336, -0.0363, -0.0006, 0.0172, -0.0349, 0.0474, -0.0495, 0.0013, 0.0269, 0.0470, 0.0303, -0.0160, 0.0124, -0.0044, -0.0086, -0.0193, 0.0451, 0.0456, -0.0144, 0.0235, 0.0366, -0.0237, -0.0442, 0.0302, -0.0089, 0.0164, 0.0097, 0.0317, 0.0152, 0.0048, -0.0248],[-0.0277, -0.0105, -0.0072, 0.0195, -0.0460, 0.0367, -0.0394, 0.0270, -0.0263, 0.0497, -0.0317, -0.0167, 0.0116, -0.0434, 0.0359, -0.0455, -0.0130, -0.0379, 0.0267, -0.0303, 0.0480, -0.0042, 0.0304, 0.0467, 0.0400, 0.0347, 0.0242, -0.0244, -0.0185, -0.0272, 0.0328, -0.0332, -0.0157, -0.0095, 0.0390, -0.0301, 0.0165, -0.0259, -0.0170, -0.0426, 0.0338, 0.0342, -0.0391, 0.0162, -0.0152, -0.0172, -0.0007, 0.0026, -0.0071, -0.0022, -0.0323, -0.0302, -0.0039, 0.0396, -0.0393, 0.0445, -0.0278, -0.0329, 0.0207, -0.0092, -0.0446, 0.0051, 0.0136, -0.0092, 0.0090, 0.0139, 0.0068, 0.0131, 0.0469, 0.0060, -0.0220, 0.0158, 0.0257, -0.0215, 0.0097, 0.0229, -0.0170, -0.0448, -0.0358, -0.0463, 0.0442, 0.0461, 0.0005, 0.0000, -0.0170, 0.0058, -0.0205, -0.0269, 0.0057, 0.0134, -0.0375, 0.0431, 0.0107, -0.0253, -0.0067, -0.0277, 0.0149, 0.0117, -0.0259, -0.0420, 0.0277, 0.0236, -0.0461, -0.0268, 0.0239, 0.0231, 0.0060, -0.0251, 0.0251, -0.0289, -0.0284, 0.0358, -0.0249, -0.0145, -0.0250, -0.0166, -0.0288, 0.0000, 0.0113, -0.0366, 0.0491, -0.0075, -0.0489, 0.0201, -0.0376, 0.0162, -0.0305, 0.0442],[0.0393, 0.0329, -0.0257, -0.0006, 0.0257, -0.0132, -0.0380, -0.0156, -0.0318, -0.0397, 0.0219, 0.0185, 0.0491, -0.0356, 0.0325, 0.0187, 0.0228, 0.0466, 0.0186, 0.0050, 0.0392, 0.0495, 0.0029, -0.0466, 0.0436, 0.0175, -0.0016, -0.0439, 0.0444, -0.0497, -0.0427, -0.0369, 0.0404, -0.0460, -0.0475, 0.0108, 0.0126, 0.0086, 0.0346, 0.0424, -0.0465, -0.0156, -0.0063, 0.0289, -0.0494, 0.0394, -0.0073, -0.0138, 0.0342, -0.0024, 0.0464, 0.0179, -0.0001, 0.0387, -0.0378, -0.0123, 0.0187, -0.0132, 0.0191, 0.0189, -0.0407, 0.0272, 0.0117, -0.0275, 0.0195, -0.0232, 0.0389, 0.0399, -0.0217, -0.0185, -0.0056, 0.0411, 0.0023, 0.0423, 0.0408, 0.0288, 0.0264, -0.0428, -0.0426, 0.0474, 0.0017, -0.0383, 0.0034, -0.0302, 0.0372, 0.0194, -0.0345, 0.0356, 0.0410, 0.0461, -0.0343, 0.0493, 0.0317, -0.0107, -0.0163, 0.0438, -0.0447, 0.0093, -0.0084, -0.0256, 0.0118, 0.0282, -0.0203, 0.0027, -0.0319, -0.0297, 0.0080, -0.0304, -0.0196, 0.0463, -0.0241, -0.0349, 0.0237, 0.0123, 0.0288, -0.0238, 0.0306, -0.0245, 0.0086, -0.0163, -0.0182, -0.0318, 0.0324, 0.0252, 0.0165, -0.0420, -0.0248, -0.0259],[0.0496, 0.0479, -0.0407, -0.0392, -0.0083, -0.0398, -0.0109, -0.0417, -0.0257, 0.0359, 0.0132, -0.0333, 0.0159, 0.0251, 0.0169, 0.0370, -0.0274, -0.0351, 0.0235, -0.0126, -0.0269, 0.0042, -0.0405, -0.0238, -0.0010, 0.0108, 0.0079, -0.0189, -0.0311, 0.0223, -0.0233, 0.0165, 0.0386, -0.0372, -0.0122, 0.0017, -0.0332, 0.0325, -0.0182, -0.0203, -0.0091, -0.0337, 0.0373, -0.0176, 0.0012, 0.0017, -0.0438, -0.0104, -0.0031, 0.0393, -0.0427, -0.0016, 0.0027, 0.0246, -0.0288, -0.0472, 0.0252, 0.0423, -0.0430, 0.0124, -0.0387, -0.0488, -0.0353, 0.0255, 0.0202, 0.0260, 0.0181, -0.0417, -0.0295, 0.0282, 0.0422, -0.0182, 0.0261, -0.0405, -0.0391, 0.0186, 0.0258, -0.0044, 0.0160, -0.0080, -0.0031, 0.0153, -0.0456, 0.0016, -0.0304, 0.0255, -0.0482, 0.0037, -0.0015, 0.0057, 0.0292, 0.0371, 0.0337, 0.0136, -0.0158, 0.0078, -0.0216, -0.0413, 0.0246, -0.0049, 0.0292, -0.0420, -0.0051, 0.0260, 0.0246, 0.0471, -0.0494, 0.0118, -0.0284, -0.0468, 0.0258, 0.0219, 0.0081, -0.0444, 0.0388, -0.0300, -0.0247, -0.0323, -0.0240, -0.0282, -0.0424, -0.0309, 0.0009, -0.0278, -0.0116, -0.0060, 0.0016, 0.0392],[0.0121, 0.0238, 0.0204, 0.0498, 0.0400, 0.0045, -0.0065, 0.0252, -0.0370, 0.0277, 0.0053, 0.0075, -0.0295, 0.0188, 0.0416, 0.0217, -0.0496, 0.0488, 0.0076, 0.0126, -0.0245, -0.0189, -0.0237, 0.0085, -0.0370, 0.0486, 0.0230, 0.0104, 0.0316, -0.0270, 0.0292, 0.0023, -0.0242, 0.0458, -0.0335, 0.0117, -0.0268, -0.0476, -0.0362, 0.0319, -0.0297, -0.0474, -0.0366, -0.0389, -0.0297, -0.0121, 0.0033, 0.0289, 0.0001, 0.0264, 0.0093, 0.0306, -0.0155, -0.0203, -0.0275, 0.0396, -0.0484, -0.0291, 0.0163, 0.0005, 0.0100, 0.0226, 0.0438, 0.0218, 0.0173, 0.0082, 0.0151, -0.0466, -0.0226, 0.0181, 0.0006, -0.0248, 0.0205, -0.0092, -0.0078, -0.0187, -0.0133, 0.0044, -0.0048, 0.0375, 0.0336, -0.0040, 0.0120, -0.0337, -0.0146, -0.0325, 0.0195, -0.0413, -0.0298, -0.0291, 0.0387, -0.0101, -0.0044, 0.0419, 0.0061, -0.0060, -0.0466, -0.0242, 0.0176, -0.0089, 0.0082, -0.0225, -0.0424, 0.0142, 0.0025, -0.0444, 0.0246, -0.0118, 0.0257, 0.0043, 0.0475, 0.0444, -0.0217, -0.0376, -0.0119, -0.0408, 0.0363, 0.0410, -0.0188, -0.0130, 0.0421, 0.0166, 0.0399, 0.0276, 0.0259, 0.0297, -0.0072, -0.0273],[0.0038, 0.0457, -0.0086, 0.0019, -0.0253, 0.0425, -0.0281, 0.0191, -0.0385, -0.0354, 0.0008, -0.0485, -0.0363, 0.0177, -0.0120, -0.0240, 0.0014, -0.0079, 0.0350, -0.0318, 0.0303, -0.0356, -0.0492, 0.0093, 0.0456, -0.0324, 0.0122, 0.0356, -0.0390, -0.0488, -0.0280, -0.0045, 0.0259, 0.0171, -0.0407, 0.0350, -0.0198, -0.0221, -0.0453, 0.0191, 0.0409, -0.0171, 0.0442, -0.0294, -0.0097, 0.0160, -0.0153, -0.0011, -0.0250, -0.0405, -0.0102, 0.0166, 0.0372, 0.0185, 0.0280, -0.0401, 0.0494, -0.0079, 0.0255, 0.0401, -0.0028, -0.0040, 0.0374, -0.0081, -0.0185, -0.0231, 0.0108, -0.0455, 0.0057, -0.0161, -0.0404, -0.0478, -0.0022, 0.0060, 0.0305, -0.0065, -0.0150, -0.0213, -0.0074, -0.0273, -0.0337, -0.0035, 0.0482, 0.0128, 0.0474, -0.0291, -0.0493, 0.0077, 0.0180, -0.0150, 0.0237, -0.0099, 0.0178, -0.0126, -0.0390, -0.0162, 0.0480, 0.0422, 0.0027, -0.0111, 0.0168, 0.0324, 0.0059, -0.0162, -0.0279, -0.0253, -0.0023, 0.0399, -0.0117, 0.0354, 0.0041, -0.0091, 0.0296, 0.0420, 0.0356, -0.0269, -0.0171, -0.0169, -0.0326, -0.0023, 0.0039, 0.0284, -0.0386, 0.0262, 0.0103, 0.0420, -0.0076, 0.0293],[-0.0341, 0.0308, 0.0254, 0.0141, 0.0031, 0.0497, -0.0042, 0.0491, 0.0246, -0.0204, 0.0323, 0.0212, 0.0298, 0.0238, -0.0179, -0.0453, -0.0086, 0.0281, 0.0394, -0.0124, 0.0050, -0.0072, -0.0275, -0.0349, 0.0498, 0.0482, -0.0213, -0.0039, 0.0112, 0.0374, -0.0128, -0.0390, 0.0099, 0.0109, 0.0206, -0.0243, 0.0013, -0.0297, -0.0086, 0.0167, 0.0489, 0.0079, 0.0327, -0.0110, 0.0468, 0.0390, 0.0384, -0.0276, -0.0022, 0.0034, 0.0374, 0.0328, 0.0029, 0.0126, 0.0262, -0.0366, 0.0131, 0.0451, 0.0255, 0.0154, -0.0079, -0.0198, -0.0327, 0.0354, -0.0155, 0.0323, 0.0197, -0.0109, 0.0444, -0.0408, -0.0456, -0.0376, 0.0406, 0.0219, -0.0095, 0.0188, 0.0005, -0.0459, -0.0144, -0.0257, -0.0473, 0.0061, -0.0196, -0.0481, 0.0015, -0.0487, -0.0343, 0.0194, 0.0317, 0.0128, 0.0486, -0.0114, 0.0150, 0.0011, -0.0313, -0.0152, 0.0167, -0.0391, 0.0299, 0.0184, -0.0030, 0.0209, -0.0407, -0.0033, 0.0038, 0.0277, -0.0294, -0.0454, -0.0141, 0.0261, -0.0112, 0.0087, -0.0240, -0.0027, -0.0181, 0.0078, 0.0406, -0.0056, -0.0052, 0.0251, -0.0378, 0.0411, -0.0206, -0.0333, 0.0425, -0.0073, -0.0401, 0.0024],[0.0279, 0.0180, -0.0422, -0.0045, -0.0358, -0.0403, -0.0488, -0.0183, -0.0030, 0.0162, 0.0417, 0.0200, -0.0406, 0.0393, -0.0323, 0.0221, -0.0470, 0.0071, -0.0434, 0.0132, 0.0023, -0.0428, -0.0153, -0.0075, -0.0416, 0.0053, -0.0217, 0.0299, -0.0199, -0.0196, 0.0001, -0.0109, -0.0411, -0.0378, 0.0074, 0.0382, 0.0453, 0.0074, -0.0310, 0.0234, -0.0363, -0.0132, -0.0282, 0.0414, 0.0308, 0.0111, 0.0391, -0.0444, -0.0470, 0.0275, 0.0068, 0.0109, -0.0015, 0.0443, 0.0422, -0.0018, 0.0023, -0.0043, 0.0212, 0.0053, 0.0407, -0.0180, 0.0086, -0.0150, -0.0238, 0.0477, 0.0437, 0.0092, 0.0378, 0.0313, 0.0496, -0.0019, -0.0311, 0.0128, -0.0464, -0.0408, 0.0321, 0.0487, 0.0047, 0.0145, 0.0345, 0.0273, -0.0219, -0.0308, -0.0404, 0.0001, -0.0442, -0.0039, 0.0005, -0.0186, -0.0384, -0.0263, -0.0036, -0.0042, -0.0214, 0.0121, -0.0123, -0.0265, -0.0117, -0.0348, 0.0116, 0.0386, -0.0220, 0.0087, -0.0042, -0.0324, -0.0329, 0.0363, -0.0330, 0.0048, 0.0225, 0.0238, 0.0344, -0.0427, -0.0116, -0.0125, 0.0329, 0.0395, -0.0309, 0.0448, -0.0281, -0.0123, 0.0387, 0.0151, -0.0314, -0.0250, -0.0193, 0.0017],[0.0030, 0.0000, -0.0161, 0.0470, -0.0264, 0.0184, 0.0059, -0.0232, 0.0350, -0.0028, -0.0363, -0.0059, -0.0010, 0.0065, -0.0101, -0.0261, 0.0259, 0.0171, 0.0328, 0.0454, -0.0149, -0.0149, -0.0262, 0.0022, 0.0462, -0.0378, -0.0403, -0.0469, 0.0080, -0.0374, 0.0220, -0.0315, 0.0326, -0.0236, 0.0079, 0.0337, 0.0339, 0.0261, -0.0460, -0.0173, 0.0110, 0.0151, 0.0136, 0.0171, 0.0213, -0.0372, 0.0193, -0.0274, -0.0407, 0.0018, -0.0443, 0.0386, -0.0389, 0.0182, 0.0223, -0.0482, 0.0027, -0.0038, -0.0372, 0.0380, -0.0453, 0.0151, 0.0246, -0.0439, 0.0256, 0.0049, -0.0110, 0.0279, 0.0069, -0.0414, -0.0131, 0.0211, -0.0017, 0.0400, 0.0237, -0.0471, -0.0320, -0.0287, 0.0398, 0.0065, -0.0057, -0.0149, 0.0204, 0.0374, -0.0186, 0.0250, -0.0156, -0.0113, -0.0158, 0.0072, 0.0175, 0.0291, 0.0073, 0.0108, -0.0149, 0.0314, -0.0395, 0.0138, 0.0347, 0.0289, 0.0475, -0.0281, -0.0034, -0.0191, 0.0111, -0.0031, -0.0275, -0.0002, 0.0038, 0.0262, -0.0481, 0.0224, -0.0003, 0.0202, -0.0203, 0.0484, 0.0077, -0.0222, -0.0023, -0.0211, -0.0328, -0.0496, -0.0252, 0.0031, -0.0455, -0.0174, 0.0202, -0.0296],[0.0311, -0.0086, 0.0072, -0.0025, -0.0311, 0.0208, -0.0460, -0.0186, 0.0057, 0.0127, -0.0427, -0.0351, -0.0160, -0.0277, -0.0293, -0.0055, 0.0459, 0.0031, -0.0084, 0.0164, -0.0421, -0.0328, 0.0012, -0.0307, 0.0140, -0.0157, 0.0181, -0.0230, 0.0451, -0.0319, -0.0374, 0.0102, -0.0277, -0.0477, 0.0284, -0.0008, 0.0116, 0.0413, -0.0460, 0.0253, -0.0261, -0.0304, 0.0036, 0.0256, 0.0386, -0.0496, 0.0116, -0.0199, -0.0246, -0.0433, -0.0339, -0.0211, 0.0436, 0.0381, -0.0263, -0.0451, -0.0111, 0.0495, -0.0082, -0.0412, -0.0387, -0.0046, -0.0029, 0.0058, -0.0254, -0.0369, 0.0351, -0.0054, -0.0463, 0.0280, -0.0417, 0.0089, -0.0276, -0.0126, 0.0328, 0.0356, -0.0108, -0.0085, 0.0375, 0.0385, -0.0032, -0.0459, 0.0153, 0.0313, 0.0079, 0.0045, 0.0302, 0.0205, -0.0269, -0.0324, 0.0240, -0.0237, -0.0456, -0.0402, 0.0450, -0.0400, 0.0069, 0.0092, 0.0425, -0.0042, 0.0029, -0.0184, -0.0329, -0.0084, -0.0427, -0.0487, 0.0160, -0.0349, -0.0366, -0.0307, -0.0475, 0.0485, -0.0377, 0.0213, 0.0375, 0.0155, -0.0495, -0.0266, -0.0309, 0.0260, -0.0263, -0.0280, -0.0211, -0.0443, -0.0466, 0.0313, 0.0170, -0.0136],[0.0421, -0.0018, -0.0087, -0.0185, -0.0284, -0.0085, -0.0339, -0.0287, 0.0115, -0.0347, 0.0267, 0.0421, 0.0450, -0.0107, 0.0207, -0.0084, -0.0472, -0.0350, -0.0222, 0.0255, -0.0415, 0.0441, 0.0315, 0.0001, -0.0433, -0.0100, -0.0233, -0.0175, -0.0179, -0.0341, -0.0271, -0.0036, -0.0494, 0.0109, -0.0009, -0.0421, -0.0497, -0.0014, -0.0237, -0.0312, -0.0094, 0.0328, -0.0405, 0.0427, -0.0140, -0.0182, 0.0288, 0.0325, 0.0444, -0.0170, -0.0162, -0.0130, -0.0246, -0.0040, 0.0277, 0.0102, 0.0136, -0.0340, -0.0281, -0.0421, -0.0187, -0.0431, -0.0100, 0.0341, -0.0490, 0.0324, -0.0187, -0.0278, -0.0253, -0.0135, -0.0444, -0.0489, -0.0148, -0.0135, -0.0216, 0.0326, -0.0228, -0.0146, 0.0096, -0.0488, -0.0417, 0.0373, 0.0176, 0.0348, -0.0353, 0.0327, 0.0223, -0.0231, 0.0459, -0.0229, -0.0245, 0.0475, -0.0030, 0.0488, 0.0401, 0.0393, 0.0485, -0.0026, -0.0187, -0.0202, 0.0241, 0.0248, -0.0482, 0.0423, 0.0222, 0.0426, -0.0139, 0.0144, -0.0194, -0.0318, 0.0444, -0.0067, -0.0252, 0.0425, -0.0463, -0.0159, 0.0144, -0.0013, -0.0079, -0.0436, -0.0369, -0.0164, 0.0113, -0.0253, -0.0296, 0.0094, -0.0203, 0.0488],[0.0368, -0.0170, 0.0144, -0.0163, 0.0162, -0.0039, -0.0246, 0.0049, 0.0395, 0.0070, 0.0223, 0.0290, 0.0285, -0.0161, -0.0453, 0.0178, -0.0002, -0.0170, 0.0478, 0.0053, 0.0361, 0.0455, -0.0481, 0.0226, 0.0194, 0.0350, -0.0140, 0.0038, -0.0456, 0.0429, -0.0259, 0.0225, -0.0007, -0.0107, -0.0231, 0.0084, -0.0131, -0.0469, 0.0115, -0.0135, -0.0169, 0.0204, -0.0348, 0.0216, -0.0373, -0.0234, -0.0072, -0.0142, -0.0029, -0.0188, 0.0163, 0.0473, -0.0467, -0.0413, 0.0061, 0.0314, 0.0453, 0.0289, 0.0288, -0.0325, 0.0436, -0.0115, -0.0142, 0.0215, -0.0160, -0.0360, -0.0212, -0.0269, 0.0170, -0.0383, -0.0081, -0.0032, 0.0016, 0.0441, 0.0357, 0.0486, -0.0043, -0.0403, -0.0130, 0.0184, -0.0092, -0.0137, -0.0216, -0.0301, -0.0031, -0.0461, 0.0467, -0.0415, 0.0117, -0.0179, 0.0298, -0.0362, 0.0421, 0.0013, -0.0099, -0.0159, -0.0131, -0.0054, 0.0419, 0.0353, 0.0260, -0.0386, 0.0295, -0.0141, -0.0261, 0.0242, -0.0287, -0.0349, -0.0328, -0.0269, -0.0012, 0.0332, -0.0216, -0.0332, -0.0258, 0.0203, 0.0298, 0.0268, -0.0107, -0.0290, -0.0043, -0.0176, -0.0353, 0.0012, -0.0268, -0.0374, -0.0149, -0.0255],[0.0408, 0.0263, -0.0215, 0.0108, -0.0241, -0.0419, -0.0340, -0.0311, 0.0251, 0.0360, -0.0386, -0.0325, -0.0164, -0.0210, 0.0150, 0.0404, -0.0019, -0.0183, 0.0143, 0.0314, -0.0360, -0.0417, 0.0274, 0.0260, -0.0473, 0.0136, 0.0094, -0.0442, 0.0195, -0.0394, 0.0282, 0.0125, -0.0033, 0.0031, 0.0485, 0.0327, -0.0348, -0.0342, -0.0128, 0.0078, -0.0410, 0.0122, -0.0190, -0.0033, -0.0384, -0.0183, -0.0234, -0.0100, -0.0381, -0.0043, 0.0378, 0.0099, 0.0132, 0.0345, -0.0329, 0.0287, 0.0169, 0.0109, 0.0317, -0.0407, -0.0323, -0.0340, -0.0153, -0.0048, -0.0401, 0.0033, -0.0489, -0.0215, -0.0473, 0.0226, 0.0374, -0.0150, -0.0344, 0.0290, 0.0313, -0.0095, 0.0378, -0.0144, -0.0287, 0.0011, 0.0058, 0.0430, -0.0441, 0.0202, 0.0359, -0.0362, 0.0126, 0.0214, -0.0321, -0.0076, -0.0333, -0.0164, -0.0423, -0.0146, 0.0473, 0.0488, 0.0073, -0.0206, -0.0344, -0.0238, -0.0131, -0.0076, 0.0287, 0.0278, -0.0333, 0.0007, 0.0417, -0.0123, 0.0310, -0.0242, 0.0490, -0.0174, -0.0141, 0.0208, 0.0239, 0.0124, 0.0378, 0.0018, -0.0413, -0.0272, -0.0317, 0.0283, -0.0083, -0.0145, -0.0371, 0.0318, -0.0186, 0.0209],[-0.0398, 0.0374, 0.0299, 0.0174, 0.0209, -0.0037, 0.0471, 0.0462, -0.0417, 0.0194, 0.0240, 0.0294, -0.0321, 0.0078, -0.0115, 0.0395, 0.0459, -0.0072, 0.0140, -0.0374, 0.0176, -0.0444, -0.0178, -0.0159, 0.0330, -0.0217, -0.0181, 0.0188, 0.0020, 0.0055, -0.0341, 0.0166, -0.0230, 0.0291, 0.0431, -0.0452, -0.0108, -0.0414, -0.0166, 0.0082, 0.0131, 0.0243, 0.0429, -0.0393, -0.0362, -0.0021, 0.0369, 0.0012, -0.0113, -0.0329, -0.0466, -0.0496, -0.0371, 0.0314, -0.0339, -0.0066, -0.0297, 0.0150, -0.0172, 0.0141, -0.0418, 0.0101, 0.0087, -0.0281, -0.0480, 0.0353, -0.0068, 0.0187, -0.0469, 0.0316, -0.0204, 0.0390, -0.0308, -0.0419, -0.0452, -0.0305, 0.0344, -0.0165, 0.0003, 0.0267, -0.0463, -0.0102, 0.0245, -0.0479, 0.0159, 0.0101, -0.0191, -0.0034, 0.0432, -0.0410, -0.0304, -0.0116, 0.0382, 0.0221, 0.0439, -0.0400, 0.0165, -0.0447, 0.0047, 0.0031, 0.0005, -0.0343, -0.0015, -0.0030, -0.0385, 0.0309, -0.0019, 0.0429, -0.0045, 0.0063, -0.0279, 0.0328, -0.0086, 0.0036, 0.0471, -0.0453, -0.0107, 0.0178, -0.0300, -0.0260, 0.0322, 0.0238, -0.0266, 0.0187, -0.0308, 0.0132, 0.0170, -0.0040],[0.0385, -0.0193, 0.0043, -0.0437, 0.0469, -0.0112, 0.0400, 0.0498, 0.0271, -0.0295, -0.0182, 0.0191, -0.0444, 0.0372, 0.0192, 0.0390, -0.0121, -0.0459, -0.0101, 0.0073, 0.0350, 0.0225, 0.0126, -0.0267, -0.0093, -0.0070, -0.0130, -0.0232, 0.0137, -0.0288, 0.0351, 0.0042, -0.0052, -0.0206, -0.0034, 0.0262, 0.0390, -0.0313, -0.0267, 0.0465, -0.0209, -0.0233, 0.0381, 0.0098, -0.0425, 0.0021, 0.0465, -0.0364, 0.0449, 0.0113, -0.0043, -0.0465, 0.0370, -0.0475, -0.0099, 0.0413, 0.0435, 0.0100, 0.0082, 0.0023, 0.0240, -0.0326, 0.0433, 0.0359, -0.0333, 0.0157, 0.0135, 0.0290, -0.0108, 0.0204, -0.0435, -0.0443, 0.0061, 0.0240, -0.0196, 0.0038, 0.0169, -0.0386, 0.0102, -0.0296, -0.0249, 0.0017, -0.0163, 0.0462, 0.0162, -0.0495, 0.0029, -0.0444, -0.0352, 0.0130, 0.0379, -0.0425, -0.0421, -0.0033, -0.0475, -0.0261, -0.0304, -0.0179, -0.0064, -0.0199, 0.0419, 0.0051, 0.0015, -0.0039, 0.0406, -0.0057, -0.0024, -0.0051, 0.0480, -0.0339, -0.0098, 0.0344, -0.0112, -0.0253, 0.0049, -0.0262, -0.0176, 0.0357, 0.0135, -0.0112, 0.0295, -0.0047, 0.0151, -0.0095, 0.0475, 0.0006, 0.0405, -0.0397],[0.0249, 0.0100, -0.0172, -0.0424, 0.0069, -0.0167, -0.0078, 0.0181, -0.0074, 0.0058, 0.0499, 0.0274, 0.0298, -0.0433, 0.0236, -0.0479, -0.0027, 0.0314, -0.0036, 0.0394, -0.0173, 0.0114, 0.0478, -0.0401, -0.0102, 0.0274, 0.0225, -0.0168, 0.0368, 0.0074, -0.0272, 0.0468, 0.0186, 0.0451, 0.0353, 0.0159, 0.0254, 0.0355, -0.0211, 0.0457, 0.0375, 0.0321, -0.0421, 0.0024, 0.0181, -0.0304, 0.0378, -0.0255, -0.0417, -0.0312, -0.0157, -0.0148, -0.0425, 0.0105, -0.0008, -0.0258, 0.0346, -0.0371, 0.0152, -0.0153, -0.0073, -0.0437, -0.0453, 0.0456, -0.0071, -0.0033, -0.0287, -0.0176, -0.0347, 0.0435, -0.0405, 0.0422, -0.0434, -0.0438, -0.0468, -0.0175, -0.0491, -0.0165, -0.0168, -0.0378, -0.0331, -0.0140, 0.0083, -0.0061, -0.0417, 0.0472, 0.0075, 0.0441, 0.0245, -0.0333, 0.0254, 0.0138, -0.0157, -0.0238, 0.0386, 0.0137, -0.0013, 0.0487, 0.0121, 0.0228, -0.0191, -0.0016, -0.0153, 0.0033, 0.0238, -0.0418, -0.0439, -0.0466, 0.0106, -0.0493, 0.0072, 0.0276, -0.0156, -0.0467, -0.0143, -0.0052, -0.0195, -0.0318, -0.0281, 0.0168, 0.0344, -0.0270, 0.0222, 0.0094, -0.0022, -0.0265, -0.0029, 0.0021],[-0.0039, 0.0455, 0.0281, 0.0026, 0.0152, 0.0075, -0.0307, -0.0361, 0.0240, -0.0021, -0.0383, -0.0267, -0.0001, -0.0464, -0.0143, -0.0369, -0.0410, -0.0406, 0.0283, -0.0188, -0.0493, 0.0159, -0.0374, 0.0449, 0.0318, 0.0335, -0.0002, -0.0197, -0.0340, -0.0334, 0.0473, 0.0486, 0.0280, -0.0010, 0.0267, 0.0474, -0.0012, 0.0009, 0.0449, 0.0268, -0.0350, 0.0321, 0.0416, 0.0035, -0.0488, 0.0269, 0.0233, -0.0278, -0.0102, 0.0126, -0.0147, -0.0306, 0.0157, 0.0189, -0.0439, -0.0237, 0.0142, 0.0439, 0.0305, 0.0171, 0.0126, 0.0365, -0.0039, -0.0124, -0.0369, -0.0375, -0.0167, 0.0178, -0.0332, -0.0289, -0.0304, 0.0099, 0.0341, 0.0318, 0.0464, 0.0484, -0.0135, -0.0294, 0.0328, 0.0029, 0.0283, -0.0001, -0.0366, -0.0448, -0.0301, -0.0393, -0.0100, -0.0142, 0.0036, -0.0247, 0.0210, 0.0165, 0.0131, -0.0101, -0.0148, -0.0249, 0.0282, -0.0296, 0.0139, 0.0496, -0.0282, 0.0362, -0.0415, 0.0365, 0.0171, 0.0054, -0.0113, 0.0190, -0.0459, 0.0161, 0.0430, -0.0031, -0.0485, 0.0399, -0.0256, -0.0124, -0.0360, 0.0340, 0.0483, 0.0354, -0.0253, 0.0189, 0.0402, 0.0013, 0.0471, -0.0427, 0.0221, 0.0387],[0.0222, -0.0445, -0.0305, 0.0224, -0.0222, 0.0459, -0.0030, -0.0289, -0.0459, 0.0369, 0.0134, 0.0104, -0.0452, -0.0092, -0.0266, -0.0436, -0.0135, -0.0082, -0.0194, -0.0237, 0.0311, -0.0326, -0.0110, 0.0382, 0.0007, 0.0443, 0.0297, -0.0302, 0.0019, 0.0444, -0.0006, 0.0154, 0.0234, -0.0097, 0.0178, 0.0425, 0.0403, -0.0028, -0.0294, 0.0263, 0.0463, -0.0145, -0.0298, -0.0225, 0.0415, -0.0084, -0.0215, 0.0144, 0.0453, -0.0144, -0.0449, 0.0041, -0.0239, -0.0373, -0.0463, 0.0251, -0.0403, 0.0345, -0.0298, 0.0220, 0.0432, 0.0128, 0.0023, -0.0203, -0.0201, 0.0291, -0.0131, -0.0394, 0.0116, 0.0425, 0.0041, -0.0461, -0.0119, -0.0148, -0.0342, -0.0437, -0.0119, 0.0339, -0.0473, -0.0036, -0.0041, 0.0252, 0.0146, 0.0189, 0.0476, -0.0334, 0.0446, -0.0440, 0.0274, 0.0165, -0.0360, -0.0399, -0.0430, -0.0425, -0.0442, -0.0136, 0.0333, -0.0077, -0.0291, -0.0064, -0.0371, 0.0324, -0.0422, 0.0440, -0.0300, 0.0282, -0.0138, -0.0193, -0.0328, 0.0407, -0.0286, 0.0224, 0.0327, 0.0105, -0.0361, 0.0210, -0.0204, 0.0277, -0.0412, 0.0333, -0.0070, 0.0026, -0.0472, 0.0281, -0.0450, -0.0444, -0.0256, 0.0101],[0.0013, 0.0267, 0.0046, 0.0340, 0.0106, -0.0336, -0.0473, 0.0026, 0.0235, -0.0427, -0.0025, 0.0101, -0.0247, -0.0231, -0.0135, 0.0009, -0.0395, -0.0285, -0.0483, 0.0315, 0.0121, 0.0453, -0.0191, 0.0172, 0.0346, 0.0178, -0.0379, 0.0129, 0.0318, -0.0352, 0.0160, 0.0450, 0.0372, -0.0480, -0.0430, 0.0468, -0.0214, -0.0395, -0.0221, -0.0464, 0.0327, -0.0467, 0.0348, -0.0279, 0.0451, 0.0119, 0.0443, 0.0187, -0.0031, 0.0457, 0.0437, -0.0280, 0.0390, 0.0025, -0.0162, -0.0403, -0.0076, -0.0129, -0.0448, -0.0072, -0.0402, 0.0492, 0.0050, 0.0055, 0.0116, 0.0301, -0.0112, -0.0294, -0.0017, 0.0077, 0.0315, 0.0303, -0.0239, 0.0287, 0.0407, -0.0218, -0.0025, -0.0032, 0.0374, -0.0274, 0.0484, -0.0369, -0.0425, 0.0385, 0.0091, 0.0410, 0.0291, -0.0043, -0.0366, -0.0279, 0.0234, 0.0007, 0.0059, -0.0422, 0.0098, 0.0187, -0.0450, -0.0027, -0.0145, 0.0417, -0.0003, 0.0254, -0.0094, -0.0264, 0.0264, 0.0363, -0.0314, -0.0175, 0.0113, -0.0132, 0.0274, -0.0275, 0.0047, -0.0142, -0.0253, 0.0252, 0.0106, 0.0067, 0.0489, 0.0195, -0.0355, 0.0363, 0.0219, -0.0037, 0.0286, -0.0025, -0.0144, 0.0139],[0.0312, 0.0308, 0.0297, -0.0252, -0.0374, -0.0496, -0.0053, 0.0136, -0.0276, 0.0247, -0.0383, 0.0162, 0.0112, -0.0312, -0.0269, -0.0140, 0.0198, 0.0473, 0.0064, 0.0442, 0.0263, 0.0327, 0.0123, 0.0055, 0.0234, -0.0471, 0.0293, 0.0385, 0.0413, 0.0374, 0.0311, -0.0270, -0.0439, 0.0488, 0.0482, 0.0142, 0.0445, 0.0103, 0.0294, 0.0461, 0.0139, 0.0079, 0.0081, -0.0028, -0.0320, 0.0258, 0.0189, -0.0494, 0.0136, 0.0125, 0.0046, -0.0137, -0.0364, 0.0110, 0.0251, -0.0316, 0.0120, 0.0199, -0.0455, 0.0218, 0.0299, -0.0027, 0.0229, -0.0224, 0.0453, 0.0263, -0.0461, 0.0251, -0.0149, -0.0003, 0.0415, 0.0219, 0.0283, -0.0050, 0.0394, -0.0308, 0.0338, -0.0008, 0.0374, 0.0461, -0.0298, 0.0414, -0.0143, -0.0229, 0.0318, 0.0322, 0.0305, 0.0266, -0.0305, -0.0497, 0.0290, 0.0244, 0.0088, -0.0368, -0.0421, 0.0476, -0.0064, -0.0298, -0.0111, -0.0425, -0.0153, 0.0295, -0.0185, -0.0431, 0.0469, -0.0447, -0.0093, 0.0168, 0.0002, -0.0369, -0.0258, -0.0164, -0.0444, 0.0300, 0.0146, 0.0094, -0.0338, -0.0052, 0.0387, 0.0404, 0.0022, 0.0318, -0.0081, -0.0087, 0.0400, 0.0087, -0.0297, -0.0231],[0.0374, -0.0294, -0.0209, 0.0332, 0.0090, -0.0009, -0.0246, 0.0404, 0.0309, 0.0421, -0.0466, -0.0354, -0.0465, -0.0018, -0.0468, -0.0361, -0.0314, -0.0480, -0.0087, -0.0197, -0.0043, -0.0064, 0.0307, 0.0147, -0.0166, -0.0103, -0.0060, 0.0351, -0.0446, 0.0310, 0.0279, 0.0293, 0.0109, 0.0094, -0.0170, 0.0325, -0.0027, -0.0202, -0.0055, -0.0434, -0.0365, 0.0205, 0.0204, 0.0308, 0.0298, 0.0457, -0.0486, 0.0203, 0.0162, 0.0195, -0.0179, 0.0278, -0.0147, -0.0361, -0.0110, 0.0037, -0.0447, -0.0433, 0.0395, -0.0124, 0.0255, -0.0309, -0.0105, -0.0215, -0.0453, 0.0206, -0.0260, -0.0493, 0.0038, -0.0053, 0.0280, -0.0292, 0.0203, -0.0420, 0.0446, 0.0222, -0.0268, 0.0233, 0.0356, 0.0023, -0.0474, 0.0398, 0.0025, -0.0008, 0.0178, -0.0130, -0.0079, -0.0169, 0.0143, -0.0065, 0.0276, -0.0323, 0.0479, 0.0493, -0.0147, 0.0042, -0.0303, 0.0224, 0.0405, 0.0396, -0.0373, -0.0081, 0.0312, -0.0198, -0.0045, 0.0043, 0.0418, -0.0393, -0.0138, -0.0346, 0.0348, 0.0082, 0.0398, -0.0287, 0.0215, 0.0416, -0.0010, 0.0007, -0.0404, -0.0135, 0.0311, 0.0210, -0.0267, 0.0406, 0.0421, -0.0401, -0.0083, 0.0173],[-0.0395, -0.0211, 0.0329, 0.0482, -0.0008, 0.0301, 0.0019, -0.0417, -0.0471, -0.0091, 0.0486, 0.0077, -0.0108, 0.0144, -0.0135, -0.0391, -0.0053, 0.0319, 0.0402, 0.0142, 0.0443, 0.0062, -0.0055, -0.0373, -0.0383, -0.0326, -0.0418, 0.0034, -0.0258, 0.0019, -0.0221, -0.0496, 0.0200, 0.0109, 0.0246, 0.0282, -0.0099, 0.0042, -0.0166, -0.0436, 0.0297, 0.0239, -0.0252, -0.0018, -0.0143, -0.0306, -0.0383, -0.0353, 0.0171, -0.0045, 0.0058, 0.0426, 0.0478, 0.0398, -0.0335, -0.0069, 0.0287, 0.0317, -0.0318, 0.0335, -0.0304, -0.0371, -0.0067, 0.0155, -0.0274, -0.0225, 0.0337, 0.0464, -0.0114, 0.0358, -0.0165, 0.0405, -0.0500, -0.0083, -0.0345, -0.0246, 0.0227, 0.0395, 0.0258, -0.0243, 0.0100, 0.0042, 0.0033, 0.0204, 0.0028, -0.0199, -0.0463, -0.0404, -0.0026, 0.0113, -0.0058, 0.0416, -0.0018, 0.0137, -0.0303, -0.0087, 0.0310, -0.0473, -0.0090, -0.0290, 0.0220, -0.0068, 0.0247, 0.0046, -0.0496, -0.0372, 0.0222, 0.0390, -0.0171, -0.0408, 0.0376, 0.0055, -0.0375, 0.0231, -0.0400, -0.0326, 0.0392, -0.0057, -0.0157, 0.0348, 0.0411, -0.0049, 0.0029, 0.0108, -0.0207, 0.0026, 0.0500, 0.0001],[-0.0436, 0.0456, 0.0476, -0.0444, 0.0267, -0.0105, -0.0097, -0.0318, -0.0248, -0.0308, -0.0085, -0.0321, -0.0201, -0.0046, -0.0024, 0.0034, 0.0280, 0.0037, 0.0031, 0.0046, -0.0379, 0.0137, 0.0087, 0.0445, 0.0337, 0.0143, -0.0149, -0.0310, 0.0059, -0.0407, 0.0245, -0.0151, -0.0017, -0.0305, 0.0254, 0.0006, -0.0461, 0.0088, -0.0269, -0.0144, -0.0150, 0.0061, 0.0453, -0.0195, -0.0491, -0.0498, -0.0271, 0.0493, 0.0324, 0.0041, -0.0142, -0.0198, 0.0414, -0.0276, -0.0204, 0.0352, -0.0155, 0.0214, -0.0216, 0.0266, 0.0440, 0.0471, -0.0023, -0.0244, -0.0146, -0.0350, 0.0034, 0.0072, 0.0108, -0.0087, 0.0365, 0.0342, 0.0285, 0.0403, -0.0174, 0.0181, -0.0459, 0.0133, -0.0219, -0.0433, 0.0247, 0.0143, 0.0252, 0.0297, 0.0273, 0.0443, 0.0117, 0.0005, 0.0051, 0.0093, 0.0429, 0.0362, 0.0379, -0.0131, -0.0313, 0.0210, -0.0066, 0.0238, 0.0266, 0.0438, 0.0331, 0.0401, 0.0278, -0.0132, -0.0306, 0.0360, 0.0374, 0.0107, -0.0290, 0.0460, 0.0269, -0.0379, -0.0152, 0.0491, 0.0292, -0.0138, -0.0328, -0.0311, 0.0103, -0.0116, 0.0388, 0.0161, 0.0468, -0.0324, 0.0461, 0.0265, 0.0386, 0.0062],[-0.0043, -0.0055, 0.0097, 0.0408, 0.0020, 0.0402, -0.0287, 0.0362, -0.0163, -0.0425, 0.0338, -0.0464, -0.0153, 0.0495, -0.0459, 0.0464, -0.0380, -0.0127, 0.0424, 0.0450, -0.0397, 0.0395, 0.0289, -0.0398, -0.0023, 0.0163, 0.0267, 0.0335, -0.0185, -0.0220, 0.0289, -0.0046, -0.0442, 0.0048, 0.0263, 0.0275, -0.0312, -0.0023, -0.0088, 0.0350, 0.0451, -0.0276, -0.0046, -0.0011, -0.0486, 0.0304, -0.0327, 0.0059, -0.0144, -0.0283, -0.0104, -0.0233, 0.0453, -0.0177, 0.0429, 0.0147, -0.0227, 0.0483, 0.0411, -0.0312, -0.0031, -0.0180, -0.0256, 0.0293, -0.0461, 0.0303, 0.0070, -0.0111, -0.0154, 0.0451, -0.0296, 0.0084, -0.0479, -0.0341, 0.0424, 0.0467, -0.0021, -0.0399, 0.0330, -0.0057, -0.0427, -0.0211, 0.0318, 0.0181, 0.0355, -0.0361, 0.0137, -0.0277, 0.0039, -0.0119, 0.0418, -0.0144, -0.0227, -0.0216, -0.0436, -0.0411, 0.0084, 0.0406, 0.0117, -0.0258, 0.0155, -0.0268, 0.0347, 0.0142, 0.0498, 0.0414, 0.0319, 0.0451, 0.0264, -0.0221, 0.0295, 0.0459, -0.0337, -0.0032, -0.0137, -0.0039, -0.0264, 0.0328, 0.0471, -0.0103, 0.0404, 0.0427, -0.0335, -0.0499, 0.0395, 0.0332, 0.0325, -0.0124],[-0.0486, -0.0135, -0.0223, 0.0158, 0.0140, 0.0406, 0.0435, -0.0049, 0.0272, -0.0339, -0.0444, -0.0120, -0.0203, -0.0379, -0.0310, 0.0377, -0.0107, -0.0156, 0.0200, 0.0449, 0.0468, 0.0336, 0.0060, -0.0236, 0.0041, 0.0159, -0.0396, -0.0089, -0.0472, 0.0429, -0.0481, -0.0175, -0.0190, 0.0262, 0.0073, 0.0111, 0.0460, -0.0250, -0.0373, -0.0070, 0.0440, -0.0021, 0.0074, -0.0328, -0.0148, 0.0423, -0.0277, -0.0475, 0.0465, 0.0485, -0.0251, -0.0300, 0.0414, 0.0196, 0.0103, -0.0302, 0.0440, -0.0434, 0.0205, 0.0059, 0.0223, 0.0042, -0.0087, 0.0138, -0.0071, -0.0467, -0.0107, 0.0391, 0.0364, -0.0296, -0.0007, 0.0486, 0.0267, 0.0297, -0.0283, 0.0312, -0.0153, 0.0197, 0.0066, -0.0129, -0.0100, -0.0460, 0.0368, -0.0436, -0.0106, -0.0345, -0.0084, -0.0105, -0.0343, 0.0068, 0.0366, 0.0459, 0.0002, -0.0038, -0.0457, 0.0454, 0.0356, 0.0442, -0.0325, -0.0165, 0.0309, 0.0261, -0.0109, -0.0180, 0.0141, 0.0181, 0.0399, 0.0226, -0.0329, 0.0481, -0.0287, -0.0477, -0.0404, -0.0210, 0.0477, -0.0380, -0.0036, 0.0050, -0.0264, 0.0464, 0.0412, -0.0004, 0.0200, 0.0170, -0.0447, -0.0148, 0.0377, -0.0035],[-0.0202, 0.0047, 0.0436, -0.0167, 0.0443, 0.0102, 0.0257, 0.0032, 0.0278, -0.0058, -0.0022, 0.0186, -0.0423, 0.0261, -0.0084, -0.0219, 0.0033, -0.0356, -0.0276, 0.0480, 0.0042, 0.0217, -0.0141, 0.0290, -0.0418, -0.0462, 0.0260, -0.0295, 0.0284, -0.0434, 0.0101, 0.0365, 0.0486, -0.0206, 0.0429, 0.0402, 0.0174, -0.0411, 0.0489, 0.0128, 0.0117, 0.0468, -0.0482, 0.0087, -0.0368, -0.0309, 0.0084, -0.0188, -0.0457, 0.0337, 0.0480, 0.0361, 0.0074, 0.0452, -0.0181, -0.0116, -0.0451, 0.0191, 0.0047, 0.0101, -0.0337, 0.0074, -0.0152, -0.0061, 0.0281, -0.0123, 0.0225, -0.0104, -0.0366, -0.0040, -0.0038, 0.0069, 0.0275, -0.0114, -0.0333, -0.0096, -0.0175, -0.0346, -0.0352, -0.0458, -0.0375, -0.0162, -0.0434, 0.0354, -0.0297, 0.0136, -0.0097, 0.0154, 0.0002, 0.0049, 0.0029, 0.0430, 0.0135, -0.0317, -0.0375, 0.0090, -0.0141, -0.0265, 0.0485, -0.0039, -0.0242, -0.0484, 0.0001, 0.0049, -0.0123, 0.0033, -0.0281, -0.0321, -0.0433, -0.0330, -0.0397, 0.0332, -0.0435, 0.0429, -0.0171, -0.0336, -0.0491, 0.0220, 0.0483, 0.0128, 0.0400, 0.0088, -0.0344, -0.0220, 0.0497, -0.0033, 0.0308, 0.0345],[0.0271, 0.0099, -0.0209, 0.0420, -0.0138, 0.0018, 0.0005, 0.0471, 0.0115, 0.0150, -0.0417, -0.0164, -0.0192, 0.0243, -0.0066, 0.0492, 0.0084, 0.0150, -0.0282, -0.0127, -0.0412, 0.0198, -0.0002, -0.0129, 0.0198, -0.0434, 0.0251, 0.0191, 0.0475, -0.0372, 0.0307, 0.0298, -0.0202, 0.0145, 0.0453, -0.0080, -0.0024, 0.0063, -0.0469, 0.0269, -0.0404, 0.0499, 0.0254, 0.0231, -0.0396, -0.0084, 0.0306, -0.0119, 0.0200, -0.0400, -0.0251, 0.0247, -0.0093, 0.0115, 0.0022, -0.0216, -0.0358, -0.0351, -0.0064, -0.0108, -0.0244, -0.0376, -0.0242, 0.0288, 0.0026, 0.0478, 0.0194, 0.0107, -0.0221, -0.0171, 0.0314, 0.0254, 0.0349, -0.0211, 0.0390, 0.0418, -0.0361, 0.0011, -0.0140, -0.0244, 0.0091, 0.0488, -0.0404, -0.0041, 0.0209, -0.0217, 0.0089, 0.0355, -0.0047, 0.0252, 0.0207, 0.0225, -0.0349, -0.0096, -0.0241, -0.0183, -0.0307, -0.0090, -0.0324, 0.0440, 0.0063, 0.0367, 0.0461, -0.0468, -0.0029, 0.0049, -0.0293, -0.0447, -0.0298, -0.0393, -0.0428, 0.0186, 0.0384, -0.0490, -0.0211, 0.0076, -0.0492, 0.0440, 0.0050, -0.0081, -0.0282, -0.0287, -0.0135, -0.0306, -0.0266, 0.0161, 0.0062, 0.0213],[0.0079, 0.0406, 0.0461, 0.0320, 0.0069, -0.0145, 0.0342, 0.0092, 0.0374, 0.0034, -0.0193, 0.0374, -0.0255, -0.0082, 0.0456, 0.0124, 0.0202, -0.0379, -0.0473, -0.0345, 0.0221, 0.0379, -0.0474, 0.0062, 0.0226, -0.0223, 0.0310, -0.0229, -0.0224, -0.0281, 0.0256, 0.0355, 0.0214, 0.0412, -0.0171, -0.0266, -0.0007, 0.0171, -0.0196, 0.0106, 0.0038, 0.0329, -0.0409, 0.0020, 0.0307, -0.0439, -0.0467, 0.0050, -0.0388, 0.0344, -0.0151, 0.0316, -0.0042, -0.0153, 0.0426, -0.0038, 0.0444, -0.0034, -0.0197, -0.0120, 0.0303, -0.0185, -0.0408, 0.0033, 0.0484, -0.0464, -0.0108, -0.0459, -0.0313, 0.0173, 0.0031, -0.0063, 0.0123, -0.0293, -0.0358, 0.0419, -0.0385, 0.0134, 0.0042, 0.0496, -0.0322, -0.0138, 0.0298, 0.0463, -0.0011, 0.0166, 0.0357, -0.0241, -0.0188, 0.0235, 0.0093, 0.0108, -0.0341, -0.0300, 0.0417, -0.0443, 0.0203, 0.0377, 0.0318, 0.0376, -0.0414, -0.0031, -0.0430, -0.0047, 0.0149, 0.0086, -0.0351, -0.0207, 0.0182, 0.0223, -0.0114, 0.0032, 0.0165, 0.0113, -0.0083, -0.0054, 0.0162, 0.0170, -0.0203, -0.0039, -0.0287, -0.0261, 0.0186, -0.0394, -0.0392, 0.0175, 0.0441, 0.0313],[-0.0318, -0.0236, 0.0114, -0.0243, -0.0113, 0.0125, -0.0177, 0.0125, -0.0278, -0.0480, -0.0413, 0.0054, -0.0007, -0.0292, 0.0073, -0.0259, 0.0381, -0.0111, 0.0424, 0.0462, -0.0397, -0.0387, 0.0080, -0.0070, 0.0306, 0.0210, -0.0360, -0.0147, -0.0240, -0.0499, -0.0087, 0.0199, -0.0092, 0.0196, 0.0336, 0.0333, 0.0440, -0.0158, 0.0048, 0.0079, -0.0125, -0.0309, 0.0106, 0.0001, -0.0402, -0.0403, -0.0349, 0.0131, 0.0424, 0.0343, 0.0329, 0.0311, 0.0330, -0.0446, 0.0011, 0.0353, -0.0039, -0.0441, -0.0061, -0.0449, -0.0243, -0.0332, -0.0275, -0.0144, -0.0276, -0.0498, -0.0200, -0.0440, -0.0132, 0.0256, 0.0368, 0.0152, -0.0478, -0.0242, -0.0202, -0.0347, -0.0382, 0.0381, 0.0365, 0.0045, 0.0056, -0.0077, -0.0215, 0.0252, -0.0196, -0.0182, 0.0259, 0.0118, -0.0327, -0.0295, -0.0413, -0.0316, 0.0060, 0.0043, 0.0341, -0.0289, -0.0409, 0.0396, 0.0427, -0.0251, 0.0230, 0.0341, -0.0087, -0.0409, -0.0464, 0.0146, 0.0445, -0.0069, -0.0192, 0.0084, 0.0220, -0.0378, 0.0116, 0.0238, -0.0005, -0.0255, 0.0254, 0.0343, 0.0228, 0.0227, -0.0210, 0.0055, 0.0234, 0.0374, 0.0258, 0.0421, -0.0457, -0.0163],[-0.0365, -0.0440, 0.0208, -0.0074, 0.0266, 0.0395, -0.0381, 0.0293, 0.0032, -0.0474, 0.0276, 0.0348, -0.0265, 0.0471, -0.0138, 0.0415, -0.0025, -0.0067, 0.0076, -0.0189, 0.0198, 0.0042, 0.0152, -0.0411, 0.0182, -0.0074, -0.0022, -0.0081, 0.0288, -0.0399, -0.0295, 0.0063, 0.0171, -0.0244, -0.0021, 0.0295, -0.0217, 0.0203, 0.0491, 0.0351, 0.0003, -0.0455, -0.0363, 0.0410, 0.0256, -0.0295, -0.0190, -0.0449, -0.0401, -0.0177, 0.0470, -0.0470, 0.0395, -0.0277, 0.0412, -0.0135, -0.0261, 0.0252, 0.0281, 0.0222, 0.0378, 0.0460, -0.0214, -0.0308, 0.0078, -0.0343, 0.0331, 0.0339, -0.0390, -0.0412, 0.0134, -0.0432, -0.0233, 0.0462, -0.0107, -0.0159, -0.0124, -0.0450, 0.0350, 0.0460, 0.0382, -0.0082, 0.0224, -0.0249, 0.0458, 0.0243, 0.0200, 0.0068, -0.0461, 0.0068, -0.0259, -0.0144, 0.0154, 0.0270, -0.0055, 0.0201, 0.0366, -0.0193, 0.0074, 0.0290, -0.0423, -0.0304, -0.0296, 0.0033, -0.0250, 0.0137, -0.0050, -0.0025, 0.0176, -0.0336, -0.0003, -0.0226, -0.0285, 0.0469, 0.0478, 0.0123, -0.0110, -0.0494, -0.0313, 0.0282, 0.0126, 0.0042, -0.0305, 0.0274, 0.0497, -0.0399, 0.0320, -0.0467],[0.0442, -0.0392, 0.0106, 0.0142, 0.0275, -0.0192, -0.0443, 0.0209, -0.0078, 0.0223, -0.0177, -0.0153, 0.0335, 0.0320, 0.0413, 0.0406, -0.0353, -0.0431, -0.0299, 0.0260, 0.0248, 0.0253, 0.0491, -0.0075, 0.0328, 0.0067, 0.0072, -0.0346, 0.0479, 0.0459, -0.0405, -0.0209, -0.0055, -0.0122, 0.0099, -0.0293, 0.0311, -0.0055, -0.0240, 0.0343, 0.0433, -0.0382, 0.0279, 0.0398, -0.0281, 0.0237, -0.0228, -0.0462, -0.0081, 0.0143, 0.0175, 0.0178, -0.0351, 0.0355, 0.0167, -0.0272, -0.0489, 0.0404, -0.0126, -0.0442, -0.0473, 0.0008, 0.0008, 0.0045, -0.0414, 0.0171, 0.0289, -0.0253, 0.0141, -0.0282, 0.0240, -0.0114, 0.0483, -0.0405, 0.0388, 0.0413, 0.0488, -0.0328, -0.0245, -0.0426, 0.0119, 0.0115, -0.0481, 0.0329, -0.0238, 0.0136, -0.0178, -0.0396, 0.0424, -0.0213, 0.0190, -0.0392, 0.0326, 0.0492, 0.0421, 0.0463, 0.0050, 0.0172, -0.0101, 0.0003, 0.0216, -0.0218, -0.0306, -0.0449, 0.0089, 0.0154, -0.0034, 0.0287, -0.0060, 0.0493, -0.0087, 0.0472, 0.0474, 0.0379, 0.0285, 0.0029, -0.0290, 0.0111, 0.0319, -0.0301, -0.0405, 0.0098, -0.0264, -0.0181, -0.0353, 0.0057, 0.0064, -0.0143],[0.0133, -0.0071, -0.0161, 0.0053, 0.0333, -0.0398, 0.0187, -0.0047, 0.0339, -0.0110, -0.0377, -0.0410, -0.0333, -0.0251, -0.0096, 0.0006, 0.0344, -0.0278, 0.0385, 0.0111, 0.0034, 0.0173, 0.0462, -0.0225, 0.0464, 0.0428, -0.0082, 0.0332, 0.0348, -0.0012, -0.0451, -0.0030, 0.0246, -0.0315, 0.0436, -0.0399, 0.0034, 0.0458, 0.0010, 0.0274, -0.0067, -0.0073, -0.0089, 0.0267, -0.0090, 0.0179, -0.0264, -0.0014, -0.0406, -0.0400, -0.0333, 0.0102, -0.0331, 0.0022, 0.0437, -0.0162, -0.0427, 0.0429, -0.0182, 0.0484, -0.0179, 0.0195, -0.0305, -0.0235, 0.0210, -0.0159, 0.0165, -0.0450, -0.0119, 0.0396, -0.0178, 0.0081, 0.0008, -0.0093, 0.0416, -0.0029, 0.0153, 0.0305, 0.0126, -0.0245, 0.0101, 0.0194, -0.0223, -0.0337, -0.0153, -0.0046, -0.0242, 0.0495, -0.0172, 0.0449, -0.0207, 0.0248, 0.0377, -0.0282, -0.0177, 0.0324, 0.0351, -0.0224, -0.0134, -0.0459, 0.0097, 0.0007, 0.0106, 0.0419, -0.0249, -0.0439, -0.0450, -0.0116, -0.0447, 0.0156, 0.0170, 0.0287, 0.0345, -0.0310, 0.0047, 0.0290, 0.0228, -0.0420, 0.0404, -0.0160, -0.0012, -0.0281, -0.0242, -0.0058, 0.0084, -0.0124, -0.0340, -0.0300],[-0.0455, -0.0097, -0.0097, -0.0321, 0.0228, -0.0420, 0.0302, -0.0412, 0.0204, 0.0469, -0.0286, 0.0454, -0.0003, 0.0096, 0.0247, 0.0009, 0.0150, -0.0231, 0.0146, 0.0261, 0.0133, 0.0392, -0.0445, 0.0124, 0.0308, -0.0413, 0.0005, -0.0343, 0.0246, 0.0026, 0.0020, -0.0024, 0.0166, 0.0081, -0.0484, -0.0440, 0.0405, 0.0145, -0.0099, -0.0362, 0.0491, -0.0260, 0.0496, 0.0212, -0.0498, 0.0434, -0.0368, 0.0352, -0.0383, -0.0419, 0.0173, 0.0460, -0.0492, 0.0468, -0.0340, -0.0325, -0.0149, -0.0448, -0.0162, -0.0479, 0.0000, 0.0253, 0.0109, 0.0300, -0.0013, 0.0166, 0.0110, 0.0286, -0.0054, -0.0404, -0.0252, 0.0272, -0.0067, 0.0162, -0.0172, -0.0328, 0.0307, -0.0050, -0.0381, 0.0330, -0.0177, -0.0398, 0.0369, -0.0437, 0.0265, -0.0452, -0.0030, -0.0263, 0.0435, 0.0419, 0.0021, 0.0321, 0.0273, -0.0436, 0.0059, 0.0271, 0.0379, 0.0136, -0.0155, 0.0152, -0.0316, -0.0154, -0.0262, 0.0435, -0.0009, -0.0378, -0.0387, 0.0163, -0.0312, -0.0065, 0.0319, -0.0411, -0.0097, -0.0422, -0.0023, -0.0298, 0.0312, -0.0032, -0.0313, -0.0184, -0.0245, -0.0245, -0.0046, 0.0195, 0.0110, 0.0136, -0.0136, 0.0039],[-0.0156, -0.0136, 0.0158, -0.0295, 0.0362, 0.0001, -0.0404, -0.0019, -0.0445, -0.0027, -0.0053, -0.0249, 0.0388, 0.0011, 0.0393, 0.0173, -0.0232, 0.0157, 0.0405, 0.0451, 0.0383, 0.0218, 0.0278, 0.0179, -0.0157, 0.0365, -0.0357, 0.0476, 0.0298, 0.0274, 0.0259, -0.0350, -0.0257, 0.0268, -0.0484, 0.0169, -0.0094, 0.0157, 0.0079, -0.0163, -0.0448, 0.0429, -0.0006, -0.0411, 0.0195, 0.0399, 0.0242, 0.0139, -0.0006, -0.0045, -0.0257, -0.0457, 0.0149, -0.0415, 0.0458, -0.0294, -0.0017, -0.0175, -0.0464, -0.0378, 0.0085, -0.0463, -0.0388, 0.0050, -0.0065, 0.0350, 0.0323, -0.0480, -0.0094, -0.0244, -0.0300, -0.0482, 0.0253, -0.0121, 0.0089, -0.0472, -0.0062, -0.0034, -0.0101, -0.0472, 0.0123, 0.0308, -0.0156, 0.0136, 0.0409, 0.0500, -0.0352, -0.0038, 0.0159, 0.0295, -0.0477, 0.0306, -0.0089, -0.0135, 0.0122, -0.0001, -0.0468, 0.0318, -0.0172, 0.0097, -0.0250, 0.0050, -0.0489, -0.0440, -0.0345, -0.0193, -0.0007, -0.0405, -0.0238, 0.0192, 0.0254, -0.0404, -0.0467, -0.0406, -0.0319, 0.0289, -0.0073, -0.0084, -0.0022, -0.0421, 0.0426, 0.0407, 0.0254, -0.0154, -0.0338, -0.0283, -0.0109, 0.0197],[0.0025, 0.0330, 0.0376, 0.0239, -0.0007, -0.0342, 0.0302, 0.0242, 0.0214, 0.0268, 0.0019, -0.0420, -0.0435, 0.0329, -0.0350, 0.0222, -0.0358, -0.0473, -0.0051, 0.0151, 0.0444, -0.0322, 0.0265, 0.0103, -0.0084, -0.0282, 0.0475, -0.0083, -0.0337, 0.0028, 0.0485, -0.0264, -0.0147, 0.0430, 0.0205, -0.0288, 0.0419, 0.0274, 0.0421, -0.0361, -0.0382, -0.0199, 0.0324, 0.0225, 0.0405, 0.0379, 0.0186, -0.0381, 0.0132, 0.0099, -0.0474, -0.0496, -0.0424, -0.0358, -0.0427, 0.0186, -0.0221, 0.0409, -0.0215, -0.0009, -0.0477, 0.0449, 0.0360, 0.0010, 0.0207, 0.0456, -0.0227, -0.0422, -0.0247, -0.0220, -0.0151, 0.0487, -0.0207, 0.0413, -0.0105, 0.0436, -0.0012, 0.0005, 0.0392, 0.0242, 0.0018, -0.0255, -0.0341, -0.0305, -0.0070, -0.0005, -0.0063, 0.0442, -0.0493, 0.0375, -0.0428, 0.0363, -0.0171, -0.0420, 0.0020, -0.0413, -0.0228, -0.0001, 0.0451, 0.0229, -0.0028, -0.0078, -0.0287, -0.0268, -0.0014, -0.0338, 0.0146, -0.0476, 0.0250, -0.0480, -0.0498, -0.0243, -0.0060, -0.0148, 0.0208, 0.0374, 0.0484, 0.0186, -0.0156, -0.0413, 0.0316, -0.0417, -0.0167, 0.0425, -0.0128, 0.0390, 0.0143, 0.0115],[0.0097, 0.0291, 0.0326, 0.0398, -0.0483, -0.0173, 0.0383, -0.0184, -0.0196, 0.0378, 0.0173, -0.0251, -0.0188, -0.0445, 0.0344, 0.0191, -0.0362, 0.0431, -0.0142, -0.0381, -0.0039, -0.0420, 0.0368, -0.0131, 0.0102, -0.0481, 0.0448, -0.0084, -0.0315, 0.0011, -0.0339, -0.0034, 0.0493, -0.0233, -0.0427, 0.0120, -0.0208, 0.0212, -0.0082, -0.0257, -0.0380, -0.0230, -0.0017, 0.0367, -0.0002, 0.0298, -0.0158, -0.0035, 0.0006, 0.0414, -0.0368, -0.0359, 0.0462, -0.0102, -0.0314, 0.0315, -0.0149, -0.0293, -0.0262, 0.0393, -0.0418, 0.0400, 0.0205, -0.0234, -0.0023, 0.0039, 0.0030, 0.0057, -0.0133, -0.0187, 0.0239, -0.0257, 0.0070, 0.0307, 0.0151, -0.0157, -0.0017, -0.0084, 0.0001, 0.0479, 0.0437, -0.0214, 0.0427, -0.0180, 0.0413, 0.0142, -0.0195, -0.0209, -0.0149, 0.0426, 0.0472, -0.0242, 0.0075, 0.0145, 0.0063, -0.0169, -0.0113, -0.0425, -0.0481, 0.0044, -0.0481, 0.0379, -0.0466, 0.0200, -0.0028, 0.0347, 0.0127, -0.0265, -0.0031, -0.0380, 0.0389, 0.0314, -0.0109, -0.0325, -0.0068, 0.0361, 0.0193, 0.0204, -0.0298, 0.0296, 0.0058, -0.0162, -0.0122, -0.0371, -0.0480, 0.0190, 0.0124, -0.0122],[0.0474, -0.0262, 0.0453, -0.0063, -0.0346, -0.0135, 0.0132, 0.0278, -0.0066, -0.0307, -0.0389, -0.0434, 0.0044, 0.0245, -0.0451, -0.0493, -0.0292, -0.0183, -0.0342, 0.0118, -0.0310, -0.0487, 0.0388, -0.0432, 0.0483, -0.0376, -0.0402, -0.0409, -0.0451, 0.0014, -0.0341, 0.0029, -0.0130, 0.0286, 0.0244, -0.0142, 0.0046, -0.0335, -0.0248, 0.0293, -0.0460, -0.0284, 0.0487, -0.0105, 0.0483, 0.0038, -0.0144, 0.0228, 0.0486, 0.0369, -0.0467, -0.0328, 0.0457, 0.0230, -0.0400, 0.0254, 0.0465, 0.0242, 0.0385, 0.0458, 0.0180, -0.0315, -0.0259, 0.0415, 0.0050, -0.0463, -0.0319, -0.0408, -0.0076, 0.0469, -0.0329, 0.0215, 0.0388, 0.0434, -0.0189, -0.0190, 0.0372, -0.0358, -0.0247, -0.0473, 0.0228, 0.0247, 0.0077, -0.0304, -0.0346, -0.0057, 0.0340, -0.0432, -0.0035, 0.0022, -0.0402, 0.0345, 0.0289, 0.0115, -0.0035, -0.0173, -0.0246, -0.0081, -0.0053, 0.0432, 0.0448, -0.0108, 0.0031, 0.0110, 0.0031, 0.0180, 0.0237, 0.0092, 0.0019, -0.0444, 0.0237, 0.0208, 0.0107, -0.0427, -0.0150, -0.0446, -0.0481, -0.0242, 0.0322, 0.0079, -0.0296, -0.0160, 0.0336, -0.0002, -0.0233, -0.0451, -0.0070, -0.0383],[0.0482, 0.0349, 0.0070, 0.0047, 0.0058, 0.0115, -0.0416, 0.0406, -0.0481, 0.0267, 0.0419, -0.0171, 0.0244, 0.0101, -0.0059, 0.0271, -0.0120, 0.0439, -0.0119, -0.0450, 0.0403, -0.0376, -0.0011, 0.0378, -0.0298, 0.0025, 0.0143, 0.0266, 0.0026, -0.0108, 0.0423, 0.0372, -0.0365, 0.0008, -0.0036, 0.0284, -0.0056, -0.0457, -0.0403, -0.0178, -0.0304, 0.0119, 0.0403, 0.0117, -0.0467, 0.0276, 0.0407, -0.0305, -0.0136, 0.0351, 0.0350, 0.0086, 0.0031, -0.0460, -0.0070, -0.0498, -0.0051, 0.0395, -0.0488, 0.0202, 0.0167, -0.0178, -0.0352, -0.0010, 0.0181, -0.0390, 0.0264, 0.0006, 0.0279, 0.0252, 0.0015, -0.0095, 0.0004, -0.0114, -0.0117, 0.0068, -0.0108, 0.0491, 0.0442, 0.0179, 0.0032, -0.0396, 0.0157, -0.0255, 0.0312, -0.0307, -0.0301, 0.0424, -0.0152, 0.0270, -0.0401, -0.0400, 0.0060, -0.0109, 0.0260, -0.0446, -0.0237, -0.0218, 0.0490, -0.0105, -0.0084, -0.0132, -0.0191, -0.0309, -0.0238, 0.0351, -0.0374, -0.0229, -0.0071, -0.0039, 0.0323, 0.0341, -0.0066, -0.0439, -0.0087, -0.0468, -0.0125, 0.0273, -0.0380, -0.0242, 0.0255, -0.0277, -0.0407, -0.0204, 0.0247, -0.0258, 0.0346, 0.0232],[0.0072, -0.0430, 0.0110, -0.0026, 0.0096, 0.0435, -0.0074, 0.0051, 0.0401, -0.0498, -0.0140, -0.0139, 0.0463, -0.0241, -0.0141, -0.0263, 0.0374, -0.0378, 0.0224, -0.0021, -0.0001, 0.0122, -0.0148, 0.0156, -0.0469, 0.0131, 0.0253, 0.0263, 0.0353, -0.0112, -0.0152, -0.0439, 0.0137, 0.0187, 0.0308, -0.0221, -0.0032, -0.0410, -0.0282, -0.0242, 0.0282, -0.0410, 0.0484, 0.0008, 0.0181, -0.0233, -0.0005, 0.0309, 0.0424, -0.0207, 0.0181, -0.0427, -0.0472, -0.0333, -0.0370, 0.0269, 0.0354, -0.0151, -0.0351, 0.0174, -0.0035, -0.0175, 0.0033, 0.0425, 0.0405, -0.0012, 0.0349, -0.0043, 0.0056, -0.0232, -0.0029, -0.0205, 0.0411, 0.0079, -0.0337, 0.0180, -0.0333, -0.0005, 0.0021, -0.0227, -0.0021, -0.0069, -0.0241, -0.0090, 0.0199, 0.0100, -0.0378, 0.0170, 0.0367, 0.0447, -0.0029, -0.0218, 0.0017, 0.0198, -0.0351, 0.0118, -0.0278, -0.0400, -0.0131, 0.0368, 0.0034, -0.0370, 0.0367, -0.0367, -0.0010, -0.0190, -0.0132, -0.0375, -0.0325, -0.0367, 0.0444, -0.0358, 0.0176, 0.0250, -0.0006, 0.0408, -0.0448, -0.0316, -0.0128, 0.0205, -0.0061, 0.0422, 0.0337, 0.0222, 0.0311, 0.0370, -0.0233, 0.0183],[-0.0131, 0.0299, 0.0017, 0.0263, -0.0292, 0.0330, 0.0084, -0.0480, 0.0011, 0.0084, 0.0440, 0.0493, -0.0230, 0.0332, 0.0494, -0.0438, 0.0240, -0.0248, 0.0210, 0.0418, -0.0289, -0.0450, 0.0266, -0.0268, -0.0462, 0.0048, -0.0281, 0.0468, -0.0407, -0.0405, -0.0030, 0.0024, -0.0409, 0.0443, -0.0484, -0.0019, -0.0273, -0.0269, 0.0065, 0.0328, -0.0239, 0.0494, 0.0048, -0.0423, -0.0136, 0.0264, -0.0496, 0.0184, -0.0320, 0.0154, 0.0384, -0.0314, -0.0006, -0.0041, -0.0157, -0.0211, 0.0042, 0.0230, 0.0410, 0.0282, 0.0313, -0.0398, 0.0107, 0.0038, -0.0271, 0.0211, 0.0266, -0.0288, 0.0484, -0.0462, 0.0224, 0.0243, 0.0333, -0.0140, -0.0345, -0.0439, 0.0321, -0.0184, 0.0392, 0.0383, 0.0459, 0.0451, 0.0121, 0.0110, 0.0085, -0.0457, -0.0432, 0.0335, -0.0349, -0.0305, -0.0299, 0.0172, -0.0021, 0.0130, -0.0191, 0.0392, -0.0464, 0.0266, -0.0159, 0.0486, -0.0439, 0.0009, 0.0250, 0.0058, 0.0412, -0.0097, -0.0130, -0.0033, 0.0141, 0.0434, 0.0181, 0.0126, 0.0367, 0.0059, -0.0279, -0.0127, -0.0478, -0.0179, -0.0161, 0.0259, 0.0285, 0.0050, -0.0165, 0.0495, 0.0311, -0.0400, 0.0252, 0.0139],[-0.0078, -0.0162, 0.0379, -0.0374, -0.0099, 0.0417, 0.0021, -0.0340, 0.0091, 0.0262, -0.0492, 0.0230, 0.0232, 0.0387, 0.0396, 0.0151, 0.0390, -0.0301, 0.0160, 0.0048, -0.0137, 0.0281, -0.0483, -0.0298, 0.0255, -0.0261, 0.0088, 0.0421, 0.0434, -0.0310, 0.0406, 0.0068, 0.0098, -0.0431, 0.0044, -0.0211, -0.0063, 0.0086, -0.0493, 0.0428, -0.0083, 0.0391, -0.0408, 0.0417, -0.0144, -0.0381, -0.0311, 0.0078, -0.0384, -0.0029, 0.0262, 0.0082, -0.0030, 0.0186, 0.0241, -0.0401, 0.0374, -0.0464, 0.0490, -0.0387, 0.0353, 0.0273, 0.0350, -0.0184, -0.0274, 0.0146, 0.0010, 0.0390, 0.0448, -0.0261, 0.0169, -0.0019, -0.0482, 0.0060, 0.0065, -0.0325, -0.0047, -0.0363, 0.0213, 0.0096, 0.0223, -0.0417, -0.0426, 0.0261, -0.0268, -0.0485, 0.0351, -0.0351, -0.0200, -0.0230, 0.0338, -0.0429, 0.0278, 0.0318, -0.0251, -0.0330, 0.0295, -0.0022, 0.0361, 0.0456, -0.0390, -0.0372, -0.0344, 0.0423, -0.0130, -0.0005, 0.0432, 0.0048, -0.0497, 0.0014, 0.0382, -0.0400, -0.0257, -0.0252, -0.0235, -0.0365, -0.0336, 0.0356, 0.0197, -0.0214, 0.0133, 0.0237, 0.0447, -0.0353, 0.0409, 0.0047, -0.0177, -0.0307],[-0.0146, 0.0229, 0.0027, 0.0241, -0.0468, 0.0096, 0.0197, 0.0231, 0.0169, 0.0210, 0.0109, -0.0478, -0.0272, 0.0179, -0.0443, 0.0399, -0.0044, 0.0063, -0.0212, -0.0137, -0.0483, 0.0351, -0.0293, 0.0154, -0.0128, 0.0462, 0.0098, 0.0376, 0.0140, -0.0158, 0.0466, -0.0235, 0.0291, -0.0185, 0.0378, 0.0077, -0.0093, -0.0256, -0.0125, 0.0007, -0.0074, -0.0240, -0.0131, -0.0466, 0.0084, -0.0022, 0.0289, -0.0183, -0.0104, 0.0106, -0.0165, -0.0418, -0.0133, -0.0456, -0.0346, -0.0050, 0.0148, -0.0308, -0.0152, 0.0106, 0.0130, 0.0467, 0.0323, -0.0255, -0.0193, 0.0478, -0.0176, 0.0193, -0.0453, 0.0436, -0.0067, 0.0375, 0.0470, 0.0075, -0.0229, 0.0042, -0.0411, 0.0190, 0.0128, 0.0128, 0.0252, 0.0276, -0.0265, 0.0295, 0.0122, -0.0319, 0.0310, -0.0341, -0.0496, 0.0423, -0.0140, -0.0062, -0.0494, 0.0464, -0.0046, -0.0351, -0.0171, -0.0110, -0.0267, -0.0496, -0.0336, -0.0180, -0.0350, 0.0487, -0.0318, 0.0314, -0.0344, -0.0046, 0.0232, 0.0346, 0.0469, 0.0390, 0.0479, -0.0157, 0.0214, -0.0318, -0.0475, 0.0450, 0.0192, -0.0461, -0.0332, -0.0154, -0.0169, 0.0202, 0.0090, -0.0184, -0.0417, 0.0045],[-0.0346, -0.0357, 0.0277, 0.0157, -0.0023, 0.0324, -0.0323, 0.0071, 0.0492, 0.0234, 0.0006, 0.0244, -0.0233, 0.0386, 0.0358, -0.0380, -0.0135, 0.0140, 0.0476, -0.0442, 0.0163, -0.0196, 0.0311, -0.0058, -0.0237, -0.0088, -0.0201, -0.0399, 0.0179, -0.0358, -0.0359, 0.0436, 0.0287, -0.0494, 0.0465, -0.0083, 0.0299, 0.0210, 0.0114, 0.0500, 0.0170, 0.0479, 0.0049, -0.0130, 0.0205, -0.0071, -0.0254, -0.0339, -0.0231, -0.0392, 0.0461, 0.0290, -0.0231, -0.0129, 0.0073, 0.0306, -0.0430, -0.0477, -0.0135, 0.0341, 0.0356, 0.0090, -0.0374, -0.0274, -0.0192, 0.0401, 0.0184, 0.0074, -0.0360, -0.0266, -0.0189, 0.0119, -0.0345, 0.0143, -0.0052, -0.0095, 0.0031, 0.0334, 0.0313, -0.0348, 0.0244, 0.0138, 0.0089, -0.0485, 0.0118, -0.0448, -0.0012, -0.0096, 0.0230, -0.0231, -0.0173, -0.0241, -0.0180, 0.0020, 0.0415, -0.0167, -0.0411, 0.0229, -0.0469, 0.0104, 0.0178, 0.0044, 0.0356, -0.0260, -0.0408, -0.0112, -0.0047, 0.0132, 0.0008, -0.0440, 0.0426, 0.0272, -0.0102, -0.0276, -0.0148, -0.0360, -0.0175, 0.0228, -0.0244, 0.0331, 0.0141, -0.0033, -0.0177, 0.0123, 0.0351, -0.0415, -0.0161, 0.0394],[-0.0314, -0.0113, 0.0350, -0.0305, -0.0098, 0.0175, 0.0321, -0.0264, 0.0366, -0.0399, 0.0130, 0.0089, 0.0133, -0.0316, -0.0240, 0.0285, -0.0328, -0.0056, -0.0204, -0.0036, -0.0402, 0.0011, -0.0485, 0.0438, 0.0210, 0.0434, -0.0140, 0.0283, 0.0132, -0.0364, 0.0281, -0.0405, 0.0204, 0.0190, 0.0346, -0.0354, -0.0149, 0.0316, 0.0380, 0.0009, -0.0215, -0.0080, 0.0011, 0.0083, 0.0287, -0.0276, 0.0131, -0.0438, 0.0204, 0.0454, 0.0276, -0.0330, 0.0169, 0.0096, -0.0219, 0.0168, -0.0079, 0.0370, -0.0245, -0.0190, -0.0476, 0.0224, 0.0479, 0.0475, 0.0260, -0.0441, -0.0371, 0.0496, 0.0102, -0.0340, -0.0095, 0.0476, -0.0027, 0.0266, -0.0294, 0.0200, 0.0407, -0.0406, -0.0178, -0.0033, -0.0303, -0.0091, 0.0264, 0.0163, 0.0019, 0.0019, -0.0090, -0.0413, 0.0183, -0.0428, 0.0313, 0.0260, -0.0491, 0.0216, -0.0423, -0.0176, -0.0436, 0.0311, -0.0283, 0.0459, 0.0315, -0.0128, 0.0454, -0.0300, 0.0369, 0.0447, 0.0003, -0.0430, -0.0401, 0.0047, -0.0190, 0.0346, -0.0149, 0.0063, -0.0112, 0.0010, -0.0418, 0.0046, 0.0177, 0.0111, -0.0228, -0.0219, 0.0410, 0.0395, 0.0009, 0.0497, 0.0105, 0.0208],[-0.0260, 0.0060, -0.0199, 0.0137, -0.0169, -0.0167, 0.0302, -0.0084, -0.0400, -0.0072, -0.0255, 0.0098, -0.0149, -0.0314, 0.0200, -0.0243, 0.0283, 0.0283, -0.0246, 0.0332, -0.0006, 0.0191, -0.0108, -0.0245, -0.0039, -0.0152, 0.0206, -0.0228, -0.0360, -0.0014, 0.0132, 0.0407, -0.0022, -0.0150, -0.0348, -0.0392, -0.0047, -0.0394, 0.0148, 0.0138, -0.0414, 0.0246, 0.0063, 0.0349, -0.0166, -0.0382, 0.0038, 0.0390, 0.0144, -0.0343, 0.0411, -0.0453, 0.0323, 0.0480, 0.0219, 0.0090, -0.0347, 0.0346, 0.0267, 0.0145, -0.0481, -0.0203, -0.0416, -0.0043, -0.0126, -0.0158, -0.0296, 0.0150, -0.0106, -0.0485, 0.0193, 0.0372, -0.0131, 0.0181, -0.0256, -0.0432, -0.0112, 0.0174, -0.0447, -0.0329, -0.0005, -0.0007, 0.0340, -0.0171, 0.0320, 0.0476, 0.0389, -0.0294, 0.0242, -0.0324, 0.0098, -0.0085, -0.0279, -0.0353, 0.0197, -0.0301, 0.0397, 0.0052, -0.0242, 0.0477, -0.0068, 0.0146, -0.0109, 0.0130, -0.0338, -0.0028, 0.0006, -0.0295, 0.0149, -0.0003, 0.0160, 0.0425, -0.0116, 0.0113, 0.0317, 0.0081, 0.0089, -0.0233, -0.0077, -0.0234, -0.0059, 0.0258, 0.0023, 0.0407, 0.0027, -0.0326, -0.0232, 0.0240],[-0.0328, 0.0337, 0.0082, -0.0263, 0.0238, -0.0269, -0.0495, 0.0186, -0.0080, 0.0153, 0.0025, 0.0054, -0.0078, 0.0213, -0.0133, 0.0326, 0.0027, -0.0283, -0.0480, -0.0134, 0.0381, -0.0291, -0.0215, 0.0180, 0.0365, 0.0102, 0.0180, -0.0215, -0.0339, 0.0453, -0.0386, 0.0400, 0.0475, -0.0472, 0.0357, -0.0207, -0.0483, -0.0129, 0.0007, -0.0112, -0.0445, 0.0238, 0.0053, 0.0235, 0.0250, -0.0340, 0.0108, 0.0162, 0.0351, 0.0156, -0.0488, -0.0343, 0.0291, 0.0286, 0.0197, 0.0159, -0.0155, 0.0237, -0.0139, -0.0074, 0.0304, -0.0008, -0.0103, -0.0252, -0.0192, 0.0491, -0.0420, 0.0238, -0.0319, 0.0048, 0.0481, -0.0400, 0.0227, -0.0440, -0.0375, -0.0020, 0.0392, -0.0081, -0.0494, 0.0037, 0.0114, -0.0383, -0.0145, 0.0201, -0.0043, -0.0008, -0.0034, -0.0302, -0.0118, -0.0231, -0.0347, 0.0430, -0.0190, -0.0404, -0.0261, 0.0136, -0.0461, -0.0244, -0.0133, -0.0297, -0.0283, 0.0360, 0.0307, 0.0004, 0.0106, 0.0042, 0.0185, 0.0171, 0.0011, -0.0399, 0.0192, -0.0476, 0.0376, -0.0290, 0.0496, -0.0322, 0.0154, 0.0174, 0.0127, -0.0365, 0.0101, 0.0015, 0.0035, -0.0085, -0.0280, -0.0462, -0.0380, -0.0435],[0.0348, 0.0342, -0.0188, -0.0194, -0.0284, -0.0123, 0.0415, 0.0356, 0.0252, 0.0226, 0.0480, 0.0373, -0.0099, 0.0489, 0.0335, -0.0187, 0.0067, 0.0402, -0.0030, -0.0079, 0.0361, 0.0486, -0.0416, 0.0325, 0.0123, 0.0020, -0.0345, -0.0093, 0.0464, -0.0056, -0.0391, 0.0287, -0.0103, 0.0491, -0.0375, 0.0478, -0.0237, 0.0401, 0.0295, 0.0204, 0.0243, 0.0121, -0.0396, -0.0106, -0.0474, -0.0070, 0.0459, -0.0347, -0.0175, 0.0483, 0.0186, -0.0383, 0.0227, -0.0411, 0.0135, 0.0077, 0.0419, -0.0405, -0.0337, -0.0201, 0.0016, 0.0329, -0.0190, -0.0446, -0.0485, -0.0243, 0.0173, -0.0151, 0.0438, 0.0500, 0.0091, -0.0467, -0.0177, 0.0495, 0.0153, 0.0120, 0.0402, 0.0316, -0.0459, 0.0462, 0.0278, -0.0326, -0.0193, 0.0279, 0.0429, -0.0468, 0.0269, 0.0498, -0.0298, -0.0005, 0.0001, -0.0131, 0.0396, 0.0065, -0.0420, -0.0414, 0.0437, 0.0297, 0.0412, -0.0497, -0.0319, 0.0118, 0.0026, -0.0455, 0.0189, 0.0305, 0.0189, -0.0406, 0.0338, 0.0020, -0.0402, -0.0232, -0.0303, 0.0449, -0.0452, 0.0158, 0.0253, -0.0258, 0.0488, -0.0190, 0.0335, -0.0266, 0.0491, -0.0331, -0.0232, -0.0433, -0.0235, 0.0334],[-0.0470, 0.0403, 0.0098, -0.0221, -0.0260, -0.0141, 0.0044, 0.0427, -0.0014, -0.0171, 0.0386, -0.0000, 0.0096, -0.0462, 0.0101, -0.0430, -0.0463, 0.0338, -0.0389, -0.0438, 0.0473, -0.0107, -0.0181, -0.0406, 0.0009, -0.0345, -0.0146, -0.0408, 0.0114, -0.0127, 0.0071, 0.0093, 0.0084, 0.0358, 0.0005, 0.0090, 0.0276, -0.0233, -0.0278, -0.0375, -0.0282, -0.0191, -0.0263, -0.0044, 0.0398, 0.0358, -0.0235, -0.0085, -0.0082, -0.0462, 0.0386, 0.0451, 0.0192, -0.0079, 0.0037, 0.0198, -0.0093, -0.0294, -0.0285, -0.0460, 0.0140, 0.0139, 0.0156, 0.0382, -0.0447, -0.0445, -0.0363, -0.0049, -0.0313, 0.0355, -0.0437, -0.0355, -0.0431, -0.0030, 0.0269, 0.0406, 0.0091, 0.0298, 0.0317, -0.0222, -0.0498, -0.0260, 0.0084, 0.0047, -0.0195, 0.0323, 0.0133, -0.0237, -0.0349, -0.0443, 0.0071, -0.0310, -0.0337, 0.0137, -0.0355, -0.0280, 0.0103, -0.0349, -0.0039, 0.0034, 0.0161, -0.0018, -0.0012, 0.0018, -0.0019, 0.0021, -0.0206, 0.0212, 0.0171, 0.0401, 0.0115, 0.0483, -0.0352, -0.0480, -0.0164, 0.0441, 0.0219, 0.0383, -0.0088, 0.0301, 0.0013, 0.0369, -0.0197, 0.0365, -0.0320, -0.0141, 0.0184, -0.0074],[-0.0097, -0.0447, 0.0436, -0.0474, -0.0403, 0.0127, 0.0185, -0.0139, -0.0118, 0.0021, 0.0215, -0.0172, 0.0267, -0.0368, 0.0209, -0.0324, 0.0060, -0.0360, 0.0327, 0.0299, 0.0109, 0.0045, 0.0274, 0.0412, -0.0169, -0.0470, 0.0043, -0.0330, 0.0450, -0.0285, -0.0010, 0.0439, -0.0358, 0.0106, 0.0298, 0.0057, 0.0171, 0.0474, -0.0482, 0.0174, -0.0147, -0.0334, -0.0290, -0.0031, -0.0066, 0.0008, 0.0206, 0.0194, -0.0035, 0.0354, -0.0358, -0.0341, -0.0282, -0.0471, 0.0105, -0.0482, 0.0054, 0.0392, 0.0393, 0.0122, 0.0136, -0.0178, 0.0358, -0.0497, 0.0188, 0.0245, -0.0312, 0.0072, 0.0285, 0.0055, 0.0219, -0.0266, 0.0172, -0.0073, 0.0045, 0.0065, 0.0184, 0.0138, -0.0100, -0.0007, 0.0455, 0.0440, -0.0306, -0.0089, 0.0227, -0.0266, 0.0055, -0.0344, -0.0190, -0.0039, -0.0383, 0.0031, 0.0324, 0.0374, 0.0453, 0.0473, 0.0498, -0.0362, -0.0341, 0.0069, -0.0462, -0.0113, -0.0317, 0.0485, -0.0444, -0.0492, 0.0384, 0.0020, 0.0354, 0.0432, 0.0180, -0.0245, 0.0122, 0.0036, -0.0095, 0.0191, 0.0013, 0.0307, 0.0210, 0.0040, -0.0190, -0.0233, -0.0370, -0.0500, 0.0121, 0.0326, -0.0138, -0.0259],[-0.0219, -0.0208, 0.0241, 0.0206, 0.0158, 0.0201, -0.0395, -0.0117, 0.0295, -0.0183, -0.0218, 0.0177, -0.0262, 0.0160, -0.0355, -0.0272, -0.0177, -0.0287, 0.0077, -0.0449, 0.0310, 0.0267, -0.0041, 0.0039, 0.0077, 0.0162, 0.0246, -0.0474, 0.0412, 0.0133, -0.0063, -0.0441, -0.0221, -0.0241, 0.0488, -0.0318, 0.0415, -0.0027, 0.0385, -0.0069, -0.0270, -0.0034, 0.0395, -0.0156, -0.0113, -0.0253, -0.0245, 0.0143, 0.0001, 0.0384, 0.0072, -0.0417, -0.0351, 0.0020, 0.0047, 0.0060, -0.0231, -0.0364, -0.0149, 0.0158, 0.0296, -0.0147, 0.0317, -0.0103, 0.0114, 0.0177, 0.0029, 0.0215, -0.0455, 0.0401, -0.0469, 0.0389, -0.0156, -0.0423, -0.0016, 0.0019, 0.0325, 0.0080, 0.0218, 0.0283, 0.0332, 0.0467, -0.0002, 0.0018, 0.0073, 0.0043, 0.0166, -0.0033, -0.0017, -0.0012, -0.0411, 0.0457, 0.0010, 0.0172, -0.0310, -0.0479, 0.0018, 0.0294, -0.0349, -0.0108, 0.0494, 0.0316, -0.0305, 0.0315, 0.0344, 0.0430, -0.0139, 0.0264, 0.0383, -0.0004, 0.0366, 0.0058, 0.0494, 0.0381, -0.0360, 0.0390, -0.0386, -0.0151, -0.0146, -0.0113, -0.0486, -0.0374, -0.0126, 0.0370, 0.0454, -0.0218, -0.0059, 0.0120],[-0.0127, -0.0243, -0.0162, 0.0046, 0.0114, 0.0210, -0.0375, -0.0411, -0.0104, -0.0349, 0.0047, -0.0188, -0.0244, -0.0084, 0.0280, 0.0454, 0.0346, 0.0364, 0.0339, 0.0278, 0.0387, 0.0396, -0.0185, -0.0475, 0.0163, -0.0132, -0.0327, 0.0438, -0.0442, -0.0422, 0.0021, -0.0425, 0.0160, 0.0209, -0.0223, 0.0306, -0.0123, -0.0221, -0.0413, 0.0085, 0.0238, 0.0410, 0.0335, -0.0135, -0.0149, -0.0476, -0.0220, 0.0491, -0.0392, -0.0403, -0.0472, -0.0070, 0.0412, 0.0085, 0.0223, -0.0207, -0.0161, 0.0488, -0.0417, -0.0080, 0.0122, -0.0083, 0.0273, 0.0327, -0.0434, -0.0223, 0.0113, -0.0240, -0.0329, -0.0010, -0.0191, 0.0093, -0.0310, -0.0156, -0.0071, -0.0354, -0.0121, 0.0163, 0.0475, 0.0457, 0.0007, -0.0301, -0.0205, -0.0394, -0.0422, -0.0162, -0.0312, -0.0167, 0.0195, -0.0412, -0.0415, 0.0136, 0.0330, 0.0445, -0.0040, 0.0463, 0.0184, 0.0279, -0.0326, -0.0477, 0.0156, -0.0047, 0.0070, -0.0273, -0.0360, 0.0064, -0.0284, -0.0281, -0.0438, 0.0034, -0.0216, 0.0020, -0.0292, 0.0498, -0.0216, -0.0376, 0.0381, -0.0393, 0.0028, -0.0250, -0.0469, -0.0284, -0.0440, 0.0402, -0.0335, -0.0293, 0.0391, 0.0007],[0.0086, -0.0276, 0.0030, -0.0115, -0.0254, -0.0497, 0.0185, 0.0077, -0.0078, -0.0199, 0.0007, 0.0023, -0.0414, -0.0206, -0.0255, -0.0374, 0.0187, 0.0418, -0.0444, 0.0052, -0.0345, 0.0466, -0.0246, -0.0169, 0.0405, -0.0384, -0.0246, -0.0180, 0.0315, 0.0036, 0.0210, -0.0084, 0.0125, -0.0249, 0.0426, -0.0113, -0.0241, -0.0205, -0.0223, 0.0401, 0.0014, -0.0174, 0.0221, 0.0008, -0.0077, -0.0328, 0.0470, 0.0377, 0.0111, -0.0306, -0.0221, -0.0193, 0.0034, -0.0255, -0.0037, -0.0186, -0.0423, 0.0025, -0.0340, 0.0047, 0.0151, 0.0135, -0.0366, -0.0433, 0.0200, -0.0443, 0.0063, -0.0160, 0.0217, 0.0145, 0.0129, 0.0056, -0.0365, 0.0424, 0.0499, 0.0174, 0.0363, -0.0298, 0.0196, 0.0239, 0.0183, 0.0244, 0.0057, 0.0244, -0.0460, -0.0480, -0.0007, 0.0293, -0.0465, 0.0160, -0.0093, -0.0159, -0.0416, -0.0367, 0.0198, 0.0219, -0.0243, 0.0423, -0.0447, -0.0492, 0.0247, 0.0318, 0.0405, 0.0316, -0.0306, 0.0160, 0.0035, 0.0203, -0.0351, -0.0234, 0.0192, -0.0388, -0.0084, -0.0354, 0.0416, -0.0212, 0.0432, 0.0094, -0.0469, 0.0091, 0.0291, -0.0374, 0.0023, 0.0319, 0.0432, 0.0192, 0.0002, 0.0325],[-0.0215, 0.0262, -0.0053, 0.0198, 0.0172, -0.0310, -0.0395, 0.0365, -0.0255, 0.0391, 0.0036, 0.0392, 0.0250, 0.0292, -0.0302, -0.0081, -0.0326, 0.0499, 0.0107, 0.0104, -0.0445, 0.0474, 0.0370, -0.0476, 0.0230, 0.0004, 0.0380, 0.0041, -0.0042, -0.0253, 0.0439, -0.0030, 0.0072, -0.0336, -0.0145, -0.0461, 0.0128, 0.0148, -0.0108, -0.0146, 0.0409, -0.0211, -0.0368, 0.0047, -0.0169, -0.0340, -0.0126, 0.0360, -0.0123, -0.0464, 0.0144, 0.0219, 0.0378, -0.0304, 0.0385, -0.0264, 0.0184, 0.0170, 0.0393, -0.0199, 0.0045, -0.0253, 0.0342, 0.0024, 0.0011, -0.0013, 0.0120, 0.0362, 0.0149, 0.0146, -0.0425, -0.0388, 0.0342, 0.0441, 0.0207, 0.0105, 0.0472, -0.0491, -0.0131, 0.0467, 0.0022, -0.0451, -0.0107, 0.0092, -0.0134, 0.0264, 0.0425, -0.0229, 0.0443, 0.0074, 0.0230, -0.0248, 0.0029, 0.0432, 0.0038, 0.0327, -0.0246, 0.0378, 0.0444, 0.0421, 0.0051, 0.0062, 0.0248, 0.0393, -0.0179, -0.0251, -0.0488, 0.0094, -0.0241, 0.0487, 0.0397, -0.0089, -0.0033, 0.0078, 0.0235, 0.0282, -0.0332, -0.0138, 0.0069, -0.0089, 0.0303, 0.0110, 0.0433, 0.0391, 0.0372, 0.0008, 0.0105, 0.0048],[-0.0154, 0.0082, 0.0015, -0.0195, -0.0237, -0.0398, -0.0206, -0.0152, 0.0290, 0.0311, 0.0328, -0.0457, -0.0022, 0.0028, -0.0178, -0.0074, -0.0065, -0.0127, 0.0005, 0.0384, 0.0358, 0.0500, -0.0462, -0.0150, -0.0126, -0.0425, -0.0008, -0.0223, 0.0490, -0.0293, -0.0475, 0.0177, 0.0496, -0.0108, 0.0469, -0.0374, 0.0254, 0.0266, 0.0347, 0.0326, 0.0008, -0.0065, -0.0003, -0.0411, 0.0408, 0.0214, 0.0097, 0.0384, 0.0116, -0.0187, -0.0234, -0.0305, 0.0303, -0.0388, 0.0190, -0.0215, 0.0025, 0.0243, -0.0455, -0.0066, 0.0094, 0.0387, -0.0085, 0.0233, 0.0376, -0.0184, -0.0055, -0.0155, -0.0260, -0.0487, 0.0474, 0.0223, -0.0277, 0.0329, -0.0221, 0.0226, -0.0406, -0.0002, -0.0175, 0.0333, 0.0460, -0.0170, 0.0066, -0.0330, 0.0445, 0.0247, -0.0039, 0.0467, 0.0356, 0.0311, 0.0268, 0.0398, -0.0384, -0.0247, 0.0191, 0.0241, 0.0466, 0.0026, -0.0237, 0.0064, -0.0429, -0.0374, 0.0321, -0.0289, 0.0246, -0.0140, 0.0312, -0.0420, -0.0088, 0.0146, 0.0343, 0.0102, -0.0411, -0.0155, -0.0000, -0.0401, 0.0342, -0.0268, 0.0222, -0.0449, -0.0462, -0.0258, -0.0137, -0.0041, -0.0293, -0.0384, -0.0242, -0.0121],[-0.0180, -0.0371, -0.0338, 0.0477, 0.0022, -0.0194, -0.0011, -0.0251, -0.0257, 0.0057, -0.0057, 0.0078, 0.0384, -0.0150, -0.0293, 0.0283, -0.0275, -0.0438, 0.0097, 0.0486, -0.0337, 0.0302, 0.0341, 0.0343, -0.0019, -0.0186, -0.0130, -0.0258, -0.0148, -0.0132, -0.0292, 0.0049, -0.0053, -0.0269, -0.0016, 0.0014, -0.0364, 0.0094, -0.0111, 0.0237, -0.0037, -0.0196, -0.0400, 0.0419, -0.0361, 0.0317, 0.0428, -0.0397, 0.0484, 0.0070, -0.0189, -0.0364, 0.0139, -0.0187, 0.0476, -0.0017, 0.0047, 0.0262, -0.0474, -0.0116, 0.0133, 0.0242, 0.0318, -0.0397, -0.0289, -0.0123, -0.0139, 0.0276, -0.0265, -0.0291, 0.0298, 0.0203, -0.0405, 0.0075, -0.0417, 0.0319, 0.0089, 0.0044, -0.0071, -0.0122, 0.0414, 0.0088, 0.0246, 0.0006, 0.0172, 0.0136, -0.0194, -0.0018, 0.0392, 0.0073, -0.0011, 0.0386, -0.0078, 0.0116, -0.0074, -0.0286, -0.0089, -0.0489, -0.0303, 0.0255, 0.0493, 0.0205, 0.0326, 0.0317, 0.0202, -0.0244, -0.0149, -0.0026, -0.0409, 0.0223, -0.0198, -0.0166, 0.0120, -0.0227, -0.0231, 0.0335, -0.0297, 0.0221, 0.0137, -0.0464, 0.0227, 0.0003, 0.0230, -0.0101, -0.0468, -0.0274, 0.0307, -0.0161],[-0.0092, 0.0014, 0.0255, -0.0253, 0.0425, -0.0456, 0.0033, -0.0331, -0.0210, -0.0352, -0.0111, -0.0490, -0.0281, -0.0315, 0.0028, 0.0117, 0.0003, 0.0476, 0.0198, 0.0383, -0.0172, 0.0253, 0.0377, -0.0264, -0.0365, 0.0389, -0.0388, -0.0132, -0.0428, 0.0389, -0.0178, -0.0020, 0.0352, -0.0286, 0.0250, 0.0234, -0.0375, 0.0030, -0.0398, -0.0181, -0.0141, 0.0130, 0.0240, -0.0173, -0.0453, 0.0470, -0.0175, -0.0262, 0.0445, -0.0159, -0.0219, 0.0074, -0.0352, -0.0341, 0.0318, 0.0008, 0.0303, 0.0229, -0.0227, 0.0326, -0.0420, 0.0164, 0.0440, -0.0460, 0.0427, -0.0309, -0.0428, 0.0489, 0.0210, -0.0198, 0.0023, -0.0009, 0.0055, -0.0177, -0.0430, 0.0204, 0.0160, 0.0127, -0.0344, 0.0011, 0.0127, 0.0411, -0.0453, -0.0013, -0.0245, 0.0043, -0.0014, -0.0197, 0.0186, -0.0023, 0.0385, 0.0493, -0.0089, 0.0231, -0.0309, 0.0454, 0.0016, -0.0448, 0.0264, -0.0126, -0.0146, 0.0117, -0.0289, -0.0360, 0.0140, 0.0029, 0.0032, 0.0284, -0.0201, -0.0413, -0.0228, 0.0238, 0.0119, -0.0244, -0.0367, 0.0293, 0.0222, 0.0193, -0.0481, -0.0331, -0.0117, -0.0264, 0.0213, 0.0256, 0.0183, -0.0002, 0.0269, -0.0489],[0.0070, -0.0377, -0.0317, -0.0238, -0.0015, 0.0063, -0.0083, -0.0107, 0.0477, 0.0432, 0.0462, -0.0058, 0.0382, 0.0309, 0.0100, -0.0463, -0.0010, 0.0093, -0.0279, 0.0112, -0.0003, 0.0234, 0.0350, 0.0259, -0.0352, 0.0479, 0.0477, 0.0155, 0.0428, -0.0091, -0.0360, 0.0286, -0.0025, -0.0267, 0.0448, 0.0142, -0.0132, -0.0434, 0.0095, -0.0285, 0.0083, -0.0240, -0.0334, -0.0466, -0.0122, 0.0093, 0.0175, -0.0324, -0.0191, 0.0121, -0.0382, 0.0161, -0.0158, -0.0401, 0.0179, 0.0046, -0.0452, 0.0469, -0.0053, 0.0306, 0.0226, -0.0399, 0.0317, -0.0195, 0.0493, 0.0455, 0.0410, 0.0191, -0.0396, -0.0068, 0.0419, 0.0181, -0.0481, -0.0489, 0.0179, 0.0174, 0.0333, 0.0231, 0.0131, -0.0177, -0.0299, -0.0378, -0.0267, 0.0476, -0.0280, 0.0274, 0.0186, 0.0312, -0.0368, -0.0436, -0.0264, 0.0032, 0.0116, -0.0049, -0.0239, 0.0497, 0.0161, 0.0033, 0.0024, 0.0407, -0.0049, 0.0000, -0.0129, -0.0199, -0.0275, -0.0320, 0.0271, 0.0156, -0.0024, -0.0439, 0.0081, 0.0465, -0.0281, -0.0221, 0.0381, -0.0044, 0.0495, 0.0124, 0.0090, 0.0464, -0.0189, 0.0431, 0.0142, -0.0101, -0.0275, -0.0464, -0.0268, -0.0177],[-0.0388, -0.0323, 0.0074, -0.0316, -0.0087, 0.0450, -0.0468, -0.0065, 0.0116, -0.0335, -0.0304, 0.0286, 0.0429, 0.0324, -0.0192, -0.0101, 0.0171, -0.0170, 0.0381, 0.0202, 0.0110, -0.0432, 0.0093, -0.0098, 0.0366, -0.0152, -0.0097, -0.0432, 0.0240, 0.0020, 0.0335, -0.0307, -0.0266, -0.0392, 0.0284, 0.0202, -0.0385, 0.0332, -0.0483, -0.0494, -0.0380, -0.0281, 0.0444, -0.0085, 0.0119, -0.0216, 0.0462, 0.0363, 0.0375, 0.0485, 0.0383, 0.0440, 0.0235, 0.0328, -0.0191, 0.0233, 0.0045, 0.0321, -0.0291, 0.0110, 0.0078, 0.0250, -0.0210, -0.0357, 0.0326, -0.0424, 0.0403, -0.0444, -0.0099, 0.0455, -0.0494, 0.0229, 0.0419, 0.0415, 0.0238, 0.0169, 0.0203, 0.0067, 0.0359, -0.0142, 0.0168, 0.0301, -0.0310, -0.0364, -0.0097, 0.0001, -0.0234, 0.0205, -0.0284, 0.0111, -0.0054, 0.0412, 0.0205, -0.0061, -0.0125, -0.0029, 0.0197, -0.0131, 0.0303, -0.0000, -0.0384, -0.0155, 0.0092, 0.0498, -0.0289, -0.0244, -0.0333, 0.0352, 0.0268, -0.0465, -0.0406, -0.0192, -0.0455, -0.0015, 0.0461, 0.0316, -0.0129, -0.0476, 0.0493, 0.0096, 0.0372, 0.0140, 0.0230, -0.0161, 0.0198, -0.0406, 0.0367, 0.0057],[-0.0279, -0.0483, -0.0496, 0.0321, 0.0252, -0.0046, -0.0131, -0.0495, 0.0265, -0.0078, -0.0145, -0.0068, 0.0190, -0.0003, -0.0485, -0.0068, -0.0162, 0.0066, 0.0444, 0.0226, 0.0213, -0.0175, 0.0398, 0.0117, -0.0082, -0.0081, 0.0063, -0.0378, 0.0413, 0.0294, 0.0434, 0.0379, 0.0468, 0.0486, 0.0495, 0.0110, -0.0337, -0.0072, 0.0382, 0.0424, -0.0251, 0.0384, -0.0486, 0.0492, -0.0469, 0.0105, 0.0428, 0.0488, -0.0496, -0.0062, -0.0106, 0.0116, 0.0321, 0.0079, -0.0095, -0.0449, -0.0031, -0.0075, 0.0436, 0.0062, 0.0384, -0.0316, 0.0287, -0.0099, 0.0435, 0.0113, -0.0457, -0.0478, -0.0273, 0.0426, -0.0233, 0.0457, 0.0259, -0.0246, -0.0297, -0.0434, 0.0272, 0.0412, 0.0304, -0.0384, 0.0140, 0.0279, 0.0415, 0.0408, 0.0236, 0.0479, 0.0072, -0.0185, 0.0384, -0.0345, 0.0065, 0.0068, 0.0068, 0.0008, 0.0108, 0.0189, -0.0428, -0.0483, -0.0421, -0.0105, 0.0005, 0.0321, -0.0194, 0.0368, 0.0500, -0.0310, 0.0222, -0.0117, 0.0143, -0.0262, 0.0447, -0.0321, -0.0174, -0.0314, 0.0396, 0.0176, -0.0190, -0.0124, -0.0050, 0.0358, -0.0282, -0.0407, -0.0304, 0.0031, -0.0354, 0.0186, -0.0187, -0.0345],[-0.0048, -0.0400, 0.0048, -0.0288, -0.0422, -0.0259, 0.0439, 0.0190, 0.0217, -0.0153, -0.0214, -0.0012, -0.0041, -0.0280, 0.0351, -0.0152, 0.0338, -0.0464, 0.0361, -0.0083, -0.0222, -0.0048, 0.0315, 0.0220, -0.0246, 0.0101, -0.0127, -0.0412, -0.0442, -0.0429, 0.0428, -0.0280, 0.0335, 0.0493, -0.0064, -0.0200, -0.0489, -0.0216, 0.0433, 0.0399, -0.0263, -0.0392, -0.0159, 0.0184, -0.0320, 0.0474, -0.0347, 0.0028, -0.0145, -0.0252, -0.0441, -0.0299, 0.0231, 0.0090, 0.0077, -0.0284, -0.0106, -0.0485, 0.0489, -0.0225, 0.0158, 0.0386, -0.0462, -0.0347, -0.0364, -0.0373, -0.0074, 0.0251, 0.0199, 0.0281, 0.0346, 0.0233, 0.0064, -0.0497, 0.0272, -0.0450, 0.0098, 0.0312, 0.0174, -0.0136, -0.0083, -0.0094, -0.0278, 0.0142, -0.0110, -0.0453, -0.0027, -0.0037, -0.0322, 0.0203, 0.0361, -0.0077, 0.0472, 0.0416, 0.0459, -0.0320, 0.0417, 0.0465, -0.0424, 0.0391, 0.0300, -0.0010, -0.0345, -0.0298, -0.0188, 0.0072, 0.0156, -0.0238, -0.0180, 0.0380, -0.0118, -0.0431, -0.0243, 0.0143, 0.0050, -0.0493, -0.0056, 0.0209, 0.0436, 0.0053, -0.0271, -0.0391, -0.0053, 0.0085, 0.0366, 0.0164, -0.0199, 0.0028]], b1: [-0.0231, -0.0285, 0.0211, 0.0073, -0.0485, 0.0473, -0.0462, 0.0157, -0.0094, 0.0187, -0.0058, -0.0099, -0.0098, 0.0074, 0.0174, 0.0345, 0.0378, 0.0213, -0.0144, 0.0424, 0.0399, -0.0482, 0.0339, 0.0081, -0.0026, 0.0318, 0.0184, -0.0424, 0.0255, -0.0346, 0.0166, -0.0410, 0.0191, 0.0199, -0.0218, -0.0430, -0.0389, -0.0044, 0.0497, -0.0051, 0.0351, 0.0176, -0.0485, -0.0010, -0.0362, -0.0465, 0.0069, 0.0395, -0.0209, 0.0344, -0.0448, -0.0280, 0.0271, -0.0383, 0.0398, 0.0310, 0.0022, -0.0011, 0.0441, 0.0369, 0.0175, -0.0499, -0.0424, -0.0255, -0.0441, -0.0026, 0.0353, -0.0405, -0.0268, -0.0047, -0.0341, 0.0069, -0.0251, -0.0092, 0.0183, -0.0413, -0.0483, 0.0403, 0.0343, -0.0389, -0.0412, 0.0354, -0.0125, -0.0083, 0.0115, -0.0259, -0.0235, -0.0221, 0.0327, -0.0164, 0.0043, 0.0328, -0.0104, 0.0463, -0.0203, -0.0290, 0.0165, 0.0137, 0.0465, -0.0426, 0.0257, -0.0308, -0.0132, -0.0323, -0.0311, -0.0009, 0.0298, -0.0106, -0.0025, 0.0273, -0.0013, -0.0290, -0.0251, -0.0427, 0.0280, -0.0474, 0.0223, 0.0245, 0.0344, 0.0143, -0.0357, -0.0494, 0.0307, -0.0142, -0.0425, 0.0003, 0.0120, -0.0296],
        w2: [[0.0060, -0.0217, -0.0452, -0.0092, 0.0443, 0.0024, -0.0399, -0.0220, -0.0296, -0.0245, 0.0127, -0.0253, 0.0160, 0.0347, -0.0392, -0.0125, 0.0353, 0.0093, 0.0474, -0.0477, 0.0137, -0.0002, -0.0477, 0.0251, 0.0362, -0.0145, 0.0066, -0.0368, 0.0113, 0.0196, 0.0299, -0.0066, 0.0403, 0.0379, -0.0248, 0.0161, -0.0342, -0.0117, 0.0178, -0.0330, -0.0248, 0.0482, -0.0293, -0.0225, -0.0111, -0.0048, 0.0190, 0.0190, -0.0220, -0.0478, 0.0433, 0.0330, 0.0400, -0.0288, 0.0241, 0.0434, -0.0452, 0.0163, -0.0253, -0.0014, -0.0190, -0.0419, -0.0298, -0.0039],[0.0246, 0.0200, -0.0119, 0.0155, -0.0488, 0.0006, 0.0498, -0.0275, -0.0015, 0.0455, -0.0016, -0.0378, -0.0188, 0.0390, 0.0314, 0.0250, -0.0148, 0.0385, -0.0333, 0.0489, 0.0375, 0.0084, 0.0231, -0.0332, -0.0102, -0.0404, 0.0110, -0.0278, 0.0494, -0.0169, -0.0071, 0.0317, 0.0175, 0.0243, -0.0493, 0.0437, -0.0311, -0.0101, -0.0204, 0.0362, 0.0005, 0.0113, -0.0456, -0.0354, -0.0127, -0.0451, -0.0415, -0.0315, -0.0172, 0.0230, -0.0188, 0.0288, 0.0472, -0.0378, 0.0133, 0.0427, 0.0231, -0.0124, 0.0316, -0.0103, 0.0253, 0.0115, -0.0033, 0.0321],[0.0174, -0.0079, 0.0424, 0.0405, -0.0029, -0.0364, -0.0034, 0.0288, -0.0374, 0.0306, 0.0017, -0.0171, -0.0474, -0.0142, 0.0338, 0.0059, -0.0180, 0.0002, -0.0160, -0.0493, 0.0195, -0.0334, -0.0153, 0.0100, 0.0403, 0.0226, 0.0087, 0.0104, 0.0221, -0.0326, 0.0334, -0.0088, -0.0047, 0.0038, 0.0071, 0.0496, -0.0303, -0.0495, 0.0462, -0.0332, -0.0319, 0.0215, -0.0125, -0.0272, 0.0358, 0.0107, -0.0366, 0.0303, -0.0019, 0.0348, -0.0495, 0.0299, 0.0492, -0.0130, 0.0215, -0.0036, 0.0251, 0.0127, -0.0215, 0.0460, 0.0187, 0.0006, 0.0395, 0.0185],[-0.0416, -0.0499, -0.0131, 0.0184, 0.0155, 0.0352, 0.0347, -0.0146, -0.0319, 0.0286, 0.0113, 0.0252, -0.0498, -0.0353, -0.0444, 0.0119, -0.0274, 0.0032, -0.0063, 0.0118, -0.0200, 0.0399, 0.0168, -0.0045, 0.0496, -0.0328, 0.0208, -0.0002, 0.0389, 0.0075, 0.0422, 0.0220, -0.0256, -0.0341, 0.0102, -0.0447, -0.0196, 0.0392, 0.0410, 0.0438, 0.0118, 0.0210, -0.0123, 0.0165, 0.0058, -0.0463, 0.0468, -0.0009, -0.0470, 0.0261, 0.0033, -0.0432, 0.0365, 0.0375, 0.0145, 0.0154, -0.0280, -0.0126, -0.0299, 0.0294, -0.0212, 0.0346, 0.0392, -0.0250],[-0.0457, 0.0036, -0.0004, -0.0433, -0.0021, -0.0079, 0.0499, 0.0375, -0.0142, 0.0241, 0.0118, -0.0092, -0.0242, 0.0423, -0.0474, -0.0252, 0.0273, -0.0068, -0.0236, -0.0181, -0.0340, 0.0025, -0.0096, -0.0324, 0.0294, -0.0264, 0.0491, -0.0257, -0.0411, 0.0214, 0.0472, -0.0184, 0.0015, -0.0096, -0.0314, -0.0259, -0.0432, -0.0151, 0.0474, -0.0440, -0.0100, -0.0444, 0.0309, 0.0394, -0.0299, -0.0458, -0.0267, 0.0341, 0.0345, 0.0094, 0.0212, -0.0338, 0.0479, 0.0283, 0.0004, -0.0364, 0.0262, 0.0072, -0.0398, 0.0045, -0.0233, 0.0139, 0.0271, -0.0262],[-0.0497, -0.0117, 0.0303, -0.0061, -0.0075, 0.0039, 0.0429, 0.0478, -0.0256, -0.0375, 0.0166, 0.0105, -0.0466, -0.0080, -0.0083, -0.0155, -0.0247, -0.0055, -0.0186, 0.0000, -0.0401, 0.0023, 0.0171, 0.0126, -0.0138, 0.0005, 0.0305, 0.0435, 0.0368, -0.0089, 0.0472, -0.0335, 0.0472, -0.0021, 0.0005, 0.0014, 0.0369, 0.0024, 0.0452, 0.0321, -0.0045, 0.0386, 0.0404, 0.0242, 0.0281, -0.0226, 0.0369, 0.0183, 0.0169, 0.0251, 0.0386, -0.0298, -0.0265, -0.0466, 0.0182, 0.0377, -0.0106, -0.0392, 0.0214, 0.0392, -0.0054, -0.0150, 0.0315, 0.0338],[-0.0486, -0.0276, -0.0481, -0.0358, 0.0291, 0.0061, -0.0148, -0.0369, 0.0291, -0.0449, 0.0150, 0.0085, -0.0370, -0.0403, 0.0029, 0.0293, -0.0371, 0.0185, -0.0256, 0.0060, 0.0167, -0.0329, -0.0254, -0.0238, -0.0133, 0.0459, 0.0073, 0.0258, 0.0012, -0.0026, 0.0103, 0.0169, -0.0369, 0.0481, 0.0455, -0.0468, 0.0222, 0.0315, -0.0031, -0.0394, -0.0448, -0.0467, 0.0461, -0.0426, -0.0394, -0.0386, -0.0015, -0.0461, -0.0094, 0.0111, 0.0312, -0.0123, 0.0488, 0.0101, 0.0335, 0.0404, 0.0078, 0.0319, 0.0228, -0.0457, 0.0128, -0.0497, 0.0482, 0.0222],[0.0344, -0.0420, 0.0037, -0.0459, -0.0267, -0.0061, -0.0425, -0.0131, 0.0041, 0.0338, 0.0445, 0.0244, -0.0450, -0.0133, -0.0363, 0.0070, 0.0117, -0.0383, -0.0150, -0.0017, 0.0140, 0.0116, -0.0071, 0.0289, -0.0294, 0.0477, -0.0400, -0.0430, -0.0218, 0.0179, 0.0364, -0.0218, 0.0069, -0.0075, 0.0365, 0.0075, 0.0006, -0.0105, -0.0374, 0.0327, 0.0075, 0.0171, 0.0352, 0.0074, -0.0175, 0.0359, -0.0393, 0.0373, -0.0424, 0.0119, -0.0422, 0.0294, -0.0210, -0.0010, -0.0459, 0.0174, 0.0148, 0.0363, -0.0496, 0.0220, -0.0410, -0.0455, -0.0460, 0.0393],[-0.0400, 0.0173, -0.0158, 0.0129, 0.0495, 0.0326, 0.0028, 0.0024, -0.0385, -0.0326, -0.0356, 0.0036, -0.0339, 0.0435, -0.0304, -0.0246, 0.0304, -0.0414, 0.0131, -0.0279, 0.0153, -0.0252, -0.0120, -0.0234, -0.0486, -0.0208, 0.0369, -0.0443, 0.0103, 0.0010, -0.0437, -0.0134, 0.0240, 0.0250, -0.0049, 0.0041, 0.0445, -0.0341, -0.0157, 0.0378, -0.0441, 0.0038, 0.0086, 0.0335, 0.0382, 0.0220, 0.0456, -0.0425, -0.0388, 0.0068, 0.0149, -0.0401, -0.0109, -0.0324, 0.0008, 0.0391, 0.0361, 0.0362, -0.0494, -0.0286, -0.0285, -0.0243, 0.0103, 0.0226],[-0.0201, -0.0012, 0.0107, -0.0215, -0.0412, -0.0401, -0.0107, -0.0249, 0.0234, 0.0303, 0.0402, -0.0442, -0.0177, 0.0409, -0.0465, -0.0370, 0.0042, 0.0359, -0.0252, -0.0009, -0.0301, 0.0311, 0.0358, -0.0043, -0.0031, -0.0387, -0.0037, 0.0190, -0.0038, -0.0338, 0.0366, 0.0479, 0.0191, -0.0414, 0.0406, -0.0376, 0.0369, 0.0447, 0.0203, -0.0325, -0.0335, 0.0127, 0.0222, 0.0033, -0.0020, -0.0106, -0.0465, -0.0095, 0.0367, -0.0345, 0.0209, -0.0070, 0.0004, -0.0396, -0.0291, -0.0342, 0.0083, -0.0224, -0.0164, -0.0304, 0.0058, 0.0465, 0.0278, -0.0341],[0.0402, -0.0262, 0.0084, -0.0038, -0.0287, -0.0050, 0.0105, 0.0323, 0.0055, 0.0217, 0.0210, 0.0432, 0.0440, -0.0401, 0.0064, 0.0146, 0.0129, -0.0450, -0.0324, 0.0455, 0.0464, 0.0116, 0.0158, 0.0456, -0.0024, -0.0079, 0.0254, -0.0077, -0.0278, -0.0245, 0.0107, 0.0213, -0.0233, -0.0390, -0.0014, -0.0415, 0.0156, 0.0234, -0.0176, 0.0182, 0.0380, -0.0261, -0.0305, 0.0135, -0.0256, -0.0485, 0.0467, -0.0170, -0.0423, 0.0061, 0.0212, -0.0321, -0.0096, -0.0183, -0.0384, -0.0478, -0.0298, -0.0249, -0.0262, 0.0057, 0.0384, 0.0019, -0.0465, -0.0343],[0.0195, -0.0398, 0.0151, -0.0200, 0.0133, 0.0224, 0.0001, -0.0321, 0.0460, 0.0311, 0.0408, 0.0405, -0.0255, 0.0303, -0.0434, -0.0119, -0.0079, 0.0122, -0.0370, 0.0230, 0.0302, -0.0411, -0.0009, 0.0192, -0.0150, -0.0093, -0.0203, -0.0246, -0.0399, 0.0414, 0.0039, 0.0274, -0.0061, -0.0053, 0.0231, 0.0411, -0.0296, 0.0114, 0.0244, -0.0373, 0.0223, 0.0250, 0.0055, -0.0056, -0.0388, -0.0189, -0.0169, 0.0297, -0.0216, -0.0366, -0.0445, -0.0152, -0.0488, -0.0435, -0.0145, -0.0139, -0.0377, -0.0024, -0.0354, -0.0414, -0.0068, -0.0418, 0.0402, -0.0266],[0.0373, -0.0172, 0.0093, 0.0307, 0.0410, 0.0393, -0.0418, 0.0045, 0.0465, -0.0377, 0.0472, 0.0397, -0.0342, 0.0277, -0.0234, 0.0082, 0.0062, 0.0295, -0.0254, -0.0087, -0.0450, 0.0193, -0.0059, -0.0154, -0.0397, 0.0240, -0.0036, 0.0333, -0.0234, -0.0205, -0.0403, 0.0394, 0.0240, 0.0270, 0.0465, 0.0131, 0.0414, 0.0040, -0.0268, 0.0364, 0.0397, -0.0117, 0.0029, 0.0314, 0.0082, 0.0420, -0.0036, 0.0109, 0.0220, -0.0476, 0.0134, -0.0211, -0.0314, 0.0334, -0.0348, 0.0363, -0.0333, 0.0180, -0.0323, -0.0069, -0.0219, 0.0241, 0.0336, 0.0095],[-0.0164, -0.0240, -0.0245, -0.0073, -0.0319, -0.0499, -0.0487, -0.0435, 0.0251, 0.0372, 0.0257, -0.0130, -0.0277, 0.0358, 0.0443, -0.0132, 0.0016, -0.0328, 0.0390, 0.0258, 0.0152, -0.0181, -0.0300, -0.0180, -0.0437, 0.0481, -0.0025, 0.0497, 0.0336, -0.0110, -0.0071, -0.0070, -0.0497, -0.0174, 0.0218, -0.0317, -0.0030, -0.0269, -0.0346, -0.0256, 0.0341, -0.0149, -0.0176, -0.0448, -0.0454, 0.0140, -0.0409, -0.0115, -0.0094, -0.0326, 0.0432, 0.0419, -0.0028, -0.0443, -0.0269, -0.0150, -0.0400, -0.0263, -0.0017, 0.0038, 0.0016, -0.0101, 0.0224, 0.0209],[-0.0223, 0.0232, -0.0136, -0.0219, 0.0018, 0.0325, 0.0245, -0.0007, 0.0086, -0.0161, -0.0499, 0.0485, 0.0405, 0.0341, -0.0126, -0.0281, -0.0234, -0.0114, -0.0398, 0.0277, -0.0395, 0.0317, 0.0439, -0.0003, -0.0094, -0.0025, -0.0422, 0.0082, 0.0146, 0.0282, -0.0122, -0.0049, -0.0044, -0.0079, 0.0296, 0.0387, -0.0020, 0.0191, 0.0290, -0.0035, 0.0029, -0.0496, -0.0149, -0.0004, -0.0473, 0.0412, -0.0234, 0.0288, -0.0390, -0.0389, 0.0055, -0.0006, 0.0119, 0.0321, 0.0121, 0.0461, 0.0327, -0.0029, 0.0356, 0.0000, 0.0071, 0.0359, 0.0433, 0.0419],[-0.0219, 0.0071, -0.0289, -0.0348, 0.0333, 0.0252, 0.0396, 0.0088, 0.0310, -0.0153, 0.0160, -0.0225, 0.0275, 0.0482, 0.0286, 0.0375, 0.0096, 0.0011, -0.0306, -0.0199, -0.0496, 0.0093, 0.0060, -0.0307, 0.0006, 0.0425, -0.0001, 0.0259, -0.0014, 0.0069, -0.0477, -0.0276, -0.0418, 0.0275, 0.0242, -0.0057, -0.0443, 0.0356, 0.0408, -0.0054, -0.0306, 0.0025, 0.0333, -0.0451, 0.0192, 0.0286, 0.0381, -0.0048, -0.0152, 0.0060, -0.0331, -0.0331, 0.0304, 0.0107, -0.0413, 0.0349, -0.0323, -0.0475, 0.0130, 0.0108, 0.0134, 0.0107, 0.0181, 0.0355],[-0.0355, -0.0251, 0.0136, 0.0442, 0.0159, -0.0272, -0.0442, 0.0429, -0.0490, 0.0166, -0.0027, -0.0050, -0.0068, 0.0011, 0.0106, -0.0303, 0.0378, -0.0057, -0.0261, 0.0076, -0.0030, 0.0331, -0.0492, 0.0018, 0.0199, 0.0328, -0.0263, 0.0075, 0.0039, 0.0393, 0.0247, -0.0413, 0.0196, 0.0385, -0.0272, 0.0426, 0.0227, -0.0345, -0.0073, 0.0236, 0.0389, -0.0270, -0.0210, -0.0303, -0.0499, -0.0059, -0.0148, 0.0425, -0.0288, -0.0392, 0.0191, 0.0225, -0.0139, -0.0036, 0.0487, 0.0330, 0.0214, 0.0089, 0.0473, 0.0404, 0.0258, 0.0262, 0.0129, 0.0217],[0.0036, -0.0188, -0.0209, -0.0100, -0.0317, 0.0194, -0.0403, 0.0050, -0.0377, 0.0185, 0.0007, -0.0130, -0.0240, 0.0191, -0.0239, -0.0242, 0.0368, 0.0417, -0.0371, 0.0370, -0.0083, 0.0453, 0.0275, 0.0402, -0.0394, 0.0190, -0.0261, 0.0023, 0.0113, -0.0485, 0.0449, 0.0151, -0.0050, -0.0452, -0.0013, -0.0091, 0.0001, 0.0387, 0.0272, 0.0234, 0.0313, 0.0319, -0.0141, -0.0223, 0.0103, -0.0383, 0.0453, -0.0106, -0.0002, 0.0211, 0.0497, 0.0186, 0.0280, -0.0119, 0.0363, 0.0115, -0.0124, -0.0052, 0.0271, -0.0219, 0.0126, 0.0324, -0.0020, 0.0269],[0.0216, -0.0020, 0.0151, 0.0488, -0.0037, -0.0371, -0.0326, 0.0186, 0.0354, 0.0350, 0.0015, -0.0227, 0.0028, -0.0103, 0.0098, 0.0004, -0.0350, -0.0271, 0.0448, 0.0476, -0.0384, 0.0186, -0.0435, 0.0151, -0.0480, 0.0331, -0.0478, -0.0105, 0.0120, -0.0335, 0.0348, 0.0287, -0.0131, -0.0382, -0.0089, 0.0226, -0.0263, -0.0434, -0.0275, 0.0420, 0.0089, 0.0096, 0.0067, -0.0191, -0.0465, 0.0044, 0.0033, 0.0495, 0.0426, 0.0167, 0.0039, -0.0060, 0.0311, -0.0446, 0.0153, -0.0276, -0.0403, 0.0050, -0.0240, -0.0067, 0.0186, 0.0034, -0.0422, 0.0278],[-0.0129, -0.0425, 0.0076, -0.0035, -0.0309, 0.0162, 0.0471, 0.0438, 0.0309, 0.0323, 0.0362, 0.0208, -0.0472, 0.0138, -0.0055, 0.0357, 0.0168, 0.0068, 0.0056, -0.0094, 0.0153, 0.0162, 0.0104, 0.0072, -0.0080, 0.0434, 0.0397, -0.0281, -0.0135, 0.0338, -0.0230, 0.0125, 0.0341, 0.0452, 0.0020, 0.0352, -0.0428, 0.0161, 0.0332, 0.0279, -0.0246, -0.0399, 0.0271, 0.0228, 0.0175, -0.0464, 0.0390, 0.0352, -0.0135, -0.0152, -0.0403, 0.0498, 0.0290, 0.0094, 0.0032, 0.0004, -0.0341, -0.0269, -0.0368, -0.0133, -0.0159, 0.0227, -0.0463, 0.0376],[-0.0271, -0.0061, 0.0402, -0.0416, 0.0237, 0.0360, 0.0320, 0.0148, 0.0018, 0.0363, -0.0439, -0.0324, -0.0420, -0.0004, -0.0051, -0.0297, -0.0010, -0.0312, 0.0379, 0.0211, 0.0219, -0.0139, 0.0125, -0.0208, -0.0320, 0.0061, 0.0172, -0.0220, 0.0351, 0.0094, -0.0022, -0.0007, -0.0403, -0.0031, 0.0383, 0.0078, 0.0283, 0.0174, -0.0173, -0.0372, -0.0378, -0.0397, 0.0168, -0.0279, 0.0380, 0.0473, -0.0227, 0.0440, 0.0028, 0.0054, 0.0240, 0.0120, 0.0377, -0.0386, 0.0317, -0.0466, 0.0203, -0.0219, 0.0324, 0.0411, 0.0138, -0.0024, -0.0219, -0.0380],[0.0485, -0.0154, -0.0417, -0.0270, 0.0274, 0.0010, 0.0299, -0.0347, -0.0093, 0.0104, 0.0447, -0.0100, 0.0057, -0.0129, -0.0311, 0.0270, -0.0268, -0.0397, -0.0201, -0.0354, -0.0415, -0.0448, 0.0216, -0.0453, -0.0091, 0.0340, 0.0143, -0.0268, -0.0122, 0.0345, -0.0084, -0.0305, 0.0391, -0.0328, 0.0441, -0.0480, 0.0499, -0.0195, -0.0131, 0.0264, 0.0144, -0.0250, -0.0485, 0.0067, -0.0332, 0.0014, -0.0172, 0.0290, 0.0271, 0.0382, 0.0018, -0.0132, -0.0343, 0.0172, 0.0022, -0.0170, -0.0115, 0.0292, 0.0091, -0.0361, 0.0122, 0.0154, 0.0037, -0.0487],[-0.0044, -0.0013, -0.0330, -0.0250, -0.0466, -0.0027, 0.0035, -0.0104, 0.0055, 0.0295, 0.0123, -0.0274, 0.0388, -0.0318, -0.0234, -0.0426, 0.0073, -0.0014, 0.0105, -0.0278, -0.0018, 0.0312, 0.0225, -0.0336, 0.0130, 0.0110, -0.0264, -0.0389, -0.0394, -0.0186, 0.0270, -0.0349, 0.0227, -0.0450, 0.0445, -0.0424, -0.0476, 0.0077, -0.0100, -0.0285, 0.0449, -0.0231, -0.0055, 0.0147, -0.0344, 0.0033, -0.0387, -0.0464, 0.0272, -0.0061, -0.0336, 0.0155, -0.0242, -0.0170, -0.0473, -0.0334, 0.0030, -0.0183, -0.0014, 0.0376, -0.0365, 0.0188, -0.0070, -0.0255],[0.0162, 0.0427, -0.0358, -0.0057, -0.0367, 0.0084, 0.0272, -0.0191, -0.0339, 0.0169, 0.0357, 0.0212, -0.0460, 0.0047, 0.0394, 0.0153, -0.0215, -0.0142, 0.0442, -0.0131, -0.0308, -0.0066, -0.0213, 0.0214, -0.0338, 0.0484, 0.0351, -0.0448, 0.0103, -0.0454, -0.0367, -0.0060, -0.0433, -0.0054, -0.0017, -0.0397, 0.0163, -0.0378, -0.0283, -0.0111, -0.0480, 0.0323, -0.0022, 0.0349, -0.0067, 0.0136, 0.0198, -0.0057, 0.0291, -0.0061, -0.0443, 0.0334, 0.0312, -0.0023, 0.0060, -0.0093, 0.0424, -0.0349, -0.0161, -0.0128, 0.0479, -0.0071, 0.0271, -0.0038],[0.0019, -0.0039, 0.0279, -0.0335, 0.0204, 0.0176, -0.0108, 0.0146, 0.0181, 0.0433, 0.0180, 0.0116, -0.0040, -0.0162, 0.0044, -0.0116, 0.0021, 0.0393, -0.0045, -0.0072, -0.0161, 0.0498, 0.0122, -0.0425, -0.0266, 0.0104, -0.0018, 0.0495, 0.0033, 0.0020, -0.0028, -0.0296, -0.0152, 0.0335, 0.0189, 0.0067, 0.0197, 0.0246, -0.0030, -0.0079, 0.0499, 0.0100, -0.0202, -0.0074, 0.0123, 0.0375, -0.0274, -0.0493, 0.0074, -0.0226, 0.0216, 0.0355, -0.0428, 0.0286, -0.0397, -0.0342, 0.0362, -0.0455, -0.0126, 0.0278, -0.0305, -0.0015, -0.0206, 0.0077],[0.0466, -0.0082, -0.0009, -0.0411, -0.0028, 0.0125, 0.0245, -0.0175, -0.0474, -0.0021, -0.0163, 0.0163, 0.0188, -0.0293, 0.0112, 0.0072, 0.0271, -0.0132, 0.0426, 0.0070, 0.0207, -0.0362, 0.0373, -0.0258, -0.0094, -0.0189, 0.0358, -0.0488, 0.0360, 0.0088, -0.0393, 0.0229, 0.0410, 0.0010, 0.0201, 0.0184, -0.0407, -0.0383, -0.0120, 0.0118, 0.0361, -0.0269, 0.0059, -0.0338, -0.0113, 0.0216, 0.0353, -0.0423, -0.0107, -0.0219, 0.0499, 0.0307, -0.0377, -0.0323, 0.0447, 0.0367, -0.0464, 0.0423, -0.0282, -0.0201, -0.0237, 0.0301, -0.0092, 0.0124],[0.0360, 0.0027, 0.0424, -0.0225, -0.0225, -0.0308, 0.0440, -0.0483, -0.0064, -0.0337, -0.0282, -0.0130, 0.0478, 0.0267, 0.0035, 0.0261, -0.0221, -0.0007, -0.0420, -0.0272, -0.0249, -0.0159, 0.0264, -0.0221, -0.0045, 0.0074, -0.0415, 0.0050, -0.0389, -0.0086, -0.0460, 0.0016, -0.0440, -0.0150, -0.0499, 0.0306, -0.0306, -0.0386, 0.0113, 0.0474, -0.0110, -0.0488, -0.0378, 0.0253, -0.0066, 0.0477, -0.0210, 0.0073, -0.0204, -0.0271, -0.0073, -0.0312, 0.0257, -0.0251, 0.0008, 0.0044, -0.0393, 0.0004, 0.0041, 0.0023, -0.0097, 0.0323, 0.0062, 0.0349],[0.0328, 0.0475, 0.0092, -0.0418, 0.0165, -0.0077, 0.0447, 0.0080, 0.0358, -0.0294, 0.0014, 0.0118, -0.0278, 0.0238, -0.0068, 0.0469, 0.0199, 0.0183, 0.0434, 0.0303, 0.0231, 0.0417, 0.0495, -0.0103, 0.0178, 0.0446, 0.0377, 0.0174, 0.0377, 0.0141, -0.0495, -0.0145, -0.0195, -0.0419, 0.0055, 0.0178, -0.0138, 0.0156, 0.0087, 0.0195, -0.0206, -0.0192, -0.0462, -0.0353, -0.0087, -0.0266, -0.0381, 0.0425, -0.0319, 0.0165, 0.0097, -0.0313, -0.0491, 0.0110, -0.0472, 0.0370, -0.0121, 0.0428, -0.0172, 0.0010, -0.0461, -0.0009, -0.0356, 0.0190],[-0.0247, -0.0435, -0.0497, -0.0450, 0.0421, -0.0481, -0.0066, 0.0383, 0.0045, -0.0169, -0.0202, 0.0349, 0.0338, 0.0490, 0.0014, 0.0329, -0.0366, 0.0016, 0.0307, 0.0076, 0.0401, -0.0381, 0.0257, 0.0154, 0.0401, 0.0229, -0.0116, -0.0427, -0.0265, -0.0090, 0.0475, 0.0448, 0.0089, -0.0437, 0.0436, 0.0006, -0.0325, 0.0255, -0.0422, -0.0274, 0.0287, 0.0440, -0.0172, -0.0323, -0.0306, -0.0080, -0.0123, -0.0275, 0.0370, -0.0390, -0.0081, -0.0444, -0.0170, -0.0247, 0.0252, 0.0040, 0.0244, 0.0100, 0.0325, 0.0228, -0.0067, -0.0278, 0.0048, 0.0457],[0.0391, -0.0449, 0.0484, -0.0351, -0.0023, 0.0061, -0.0485, 0.0461, -0.0320, -0.0086, -0.0267, -0.0180, -0.0039, 0.0229, 0.0441, 0.0480, 0.0487, 0.0325, -0.0210, -0.0496, -0.0342, 0.0400, 0.0064, 0.0014, -0.0036, -0.0281, -0.0249, -0.0101, 0.0081, -0.0161, -0.0389, -0.0480, 0.0046, 0.0078, -0.0358, -0.0305, -0.0227, -0.0271, 0.0233, -0.0181, 0.0097, -0.0282, 0.0282, 0.0186, 0.0370, 0.0077, -0.0013, -0.0136, 0.0143, 0.0407, -0.0194, -0.0450, -0.0442, -0.0400, -0.0262, 0.0347, -0.0373, 0.0269, -0.0012, 0.0234, 0.0168, 0.0424, -0.0026, 0.0373],[0.0041, 0.0266, 0.0284, 0.0284, 0.0429, 0.0195, 0.0271, 0.0422, -0.0417, 0.0133, -0.0068, 0.0376, 0.0005, 0.0416, 0.0436, -0.0450, 0.0095, 0.0239, -0.0215, 0.0207, -0.0220, -0.0198, -0.0157, -0.0110, 0.0319, 0.0299, 0.0131, 0.0322, 0.0029, 0.0451, -0.0020, 0.0451, -0.0098, -0.0176, 0.0201, 0.0179, -0.0031, -0.0404, -0.0165, 0.0312, 0.0440, 0.0311, 0.0167, -0.0226, -0.0232, -0.0244, 0.0356, 0.0148, 0.0273, -0.0098, 0.0117, 0.0253, 0.0222, 0.0370, -0.0145, -0.0062, 0.0388, -0.0045, -0.0036, 0.0391, -0.0008, 0.0046, -0.0140, 0.0153],[0.0382, -0.0057, 0.0227, 0.0185, -0.0473, -0.0391, 0.0422, 0.0218, 0.0235, 0.0251, 0.0391, 0.0093, 0.0495, -0.0078, -0.0314, 0.0494, -0.0410, -0.0022, -0.0450, 0.0026, -0.0468, 0.0253, 0.0334, 0.0489, 0.0181, -0.0114, 0.0325, 0.0174, 0.0301, -0.0189, -0.0339, 0.0491, 0.0081, -0.0012, -0.0134, -0.0252, -0.0399, -0.0176, -0.0225, -0.0230, 0.0253, 0.0355, 0.0409, 0.0280, -0.0298, 0.0270, 0.0227, -0.0057, -0.0085, 0.0048, 0.0157, 0.0355, -0.0151, 0.0231, 0.0413, -0.0219, 0.0433, -0.0284, 0.0489, -0.0328, -0.0405, -0.0202, 0.0156, 0.0345],[0.0010, 0.0194, 0.0358, 0.0224, 0.0061, 0.0072, -0.0479, 0.0291, -0.0033, 0.0428, -0.0160, -0.0338, 0.0102, -0.0218, 0.0165, 0.0246, -0.0413, -0.0460, 0.0480, 0.0316, -0.0046, 0.0419, 0.0402, 0.0280, 0.0255, -0.0173, -0.0168, 0.0456, 0.0476, -0.0009, 0.0403, -0.0162, -0.0316, -0.0246, -0.0198, -0.0268, -0.0389, 0.0025, -0.0110, 0.0328, -0.0101, 0.0490, 0.0115, -0.0113, 0.0061, 0.0474, 0.0359, -0.0196, -0.0064, -0.0483, -0.0440, 0.0046, 0.0376, 0.0427, -0.0469, -0.0036, -0.0061, 0.0123, 0.0247, 0.0175, 0.0446, -0.0066, 0.0317, -0.0102],[-0.0143, -0.0478, -0.0283, -0.0112, 0.0235, 0.0058, 0.0129, -0.0112, 0.0041, 0.0458, -0.0215, -0.0228, 0.0040, -0.0374, 0.0112, -0.0187, 0.0048, -0.0492, -0.0103, -0.0324, -0.0379, -0.0152, -0.0101, -0.0094, -0.0415, 0.0435, 0.0068, 0.0326, 0.0392, -0.0392, 0.0182, -0.0013, -0.0299, -0.0399, 0.0138, -0.0445, -0.0272, -0.0112, 0.0437, 0.0223, -0.0410, -0.0489, 0.0348, 0.0310, 0.0301, -0.0339, -0.0023, -0.0412, 0.0110, 0.0028, -0.0159, -0.0345, 0.0229, 0.0276, -0.0201, -0.0296, 0.0181, 0.0162, 0.0495, 0.0349, 0.0358, -0.0397, 0.0401, 0.0351],[0.0278, 0.0162, -0.0063, -0.0162, -0.0438, 0.0373, -0.0247, 0.0307, -0.0293, 0.0134, -0.0062, -0.0162, -0.0076, 0.0212, 0.0058, -0.0207, -0.0264, 0.0222, 0.0225, 0.0495, 0.0441, 0.0167, 0.0076, -0.0261, 0.0330, -0.0124, 0.0359, 0.0309, -0.0231, 0.0492, 0.0085, 0.0258, -0.0039, 0.0038, -0.0374, 0.0488, 0.0367, 0.0228, -0.0488, -0.0132, -0.0096, -0.0134, 0.0259, -0.0345, 0.0327, 0.0072, 0.0313, -0.0313, -0.0302, 0.0121, 0.0095, -0.0024, 0.0417, -0.0384, 0.0379, -0.0388, 0.0484, 0.0334, 0.0020, -0.0492, 0.0334, 0.0228, -0.0188, -0.0048],[-0.0468, -0.0254, -0.0264, -0.0100, -0.0337, 0.0160, -0.0182, -0.0080, -0.0268, -0.0388, 0.0227, 0.0362, 0.0141, -0.0206, 0.0388, -0.0100, -0.0099, 0.0173, -0.0221, -0.0005, -0.0148, -0.0148, -0.0452, 0.0279, -0.0184, -0.0373, -0.0234, 0.0498, 0.0365, 0.0433, 0.0035, 0.0380, 0.0451, -0.0102, -0.0450, 0.0208, -0.0335, 0.0151, 0.0049, -0.0135, 0.0022, -0.0290, 0.0136, 0.0465, -0.0335, 0.0277, 0.0398, 0.0420, 0.0335, -0.0052, -0.0439, 0.0189, 0.0245, -0.0084, -0.0109, -0.0404, -0.0060, -0.0433, -0.0199, 0.0216, 0.0231, 0.0239, 0.0500, -0.0350],[0.0374, -0.0011, -0.0092, -0.0417, -0.0496, 0.0047, 0.0219, 0.0452, -0.0218, -0.0153, 0.0174, 0.0358, -0.0183, -0.0017, -0.0172, -0.0469, 0.0350, 0.0453, 0.0024, 0.0407, 0.0111, 0.0274, 0.0253, -0.0136, -0.0400, 0.0246, -0.0367, -0.0158, -0.0348, -0.0303, -0.0295, 0.0487, 0.0422, -0.0490, 0.0429, 0.0131, 0.0213, -0.0494, 0.0164, -0.0431, -0.0096, 0.0377, 0.0075, 0.0062, 0.0177, 0.0223, 0.0099, -0.0271, -0.0448, 0.0410, -0.0242, 0.0297, 0.0020, -0.0014, 0.0442, 0.0105, -0.0399, -0.0232, -0.0018, -0.0092, -0.0257, 0.0107, 0.0293, 0.0488],[-0.0172, 0.0347, -0.0278, 0.0469, 0.0425, -0.0395, 0.0093, -0.0405, -0.0161, -0.0444, 0.0020, -0.0065, -0.0068, -0.0390, 0.0132, -0.0033, -0.0184, -0.0050, -0.0252, -0.0248, -0.0376, 0.0259, -0.0251, -0.0087, 0.0064, -0.0080, 0.0278, 0.0232, 0.0014, 0.0153, -0.0105, 0.0002, 0.0088, 0.0472, 0.0137, -0.0183, -0.0309, -0.0026, 0.0087, -0.0354, -0.0273, 0.0010, -0.0277, -0.0072, -0.0175, 0.0425, 0.0277, -0.0251, -0.0381, 0.0166, 0.0238, -0.0160, -0.0420, -0.0336, 0.0361, -0.0094, 0.0287, -0.0403, -0.0330, -0.0348, 0.0216, 0.0424, -0.0200, -0.0133],[-0.0291, 0.0054, 0.0128, -0.0078, -0.0365, -0.0120, -0.0365, 0.0272, 0.0213, -0.0008, 0.0126, -0.0184, -0.0056, -0.0334, 0.0038, 0.0471, -0.0269, -0.0439, -0.0146, -0.0170, -0.0061, 0.0461, -0.0204, -0.0312, 0.0215, -0.0134, -0.0480, 0.0182, 0.0300, 0.0104, -0.0160, -0.0124, -0.0009, -0.0172, -0.0361, -0.0312, -0.0375, -0.0429, 0.0096, -0.0433, 0.0399, -0.0339, 0.0379, -0.0374, -0.0464, 0.0037, -0.0494, -0.0426, -0.0370, 0.0078, -0.0391, -0.0189, -0.0477, -0.0339, 0.0411, 0.0389, -0.0476, 0.0103, 0.0046, -0.0058, 0.0484, 0.0051, -0.0490, 0.0421],[0.0354, 0.0218, 0.0236, -0.0282, -0.0287, -0.0365, 0.0236, -0.0364, -0.0022, 0.0150, 0.0158, -0.0069, -0.0441, 0.0266, -0.0073, -0.0375, -0.0353, -0.0276, -0.0422, -0.0412, -0.0037, -0.0470, 0.0061, -0.0454, -0.0083, -0.0034, 0.0499, -0.0365, -0.0422, -0.0096, -0.0064, 0.0329, 0.0133, -0.0426, -0.0127, -0.0179, 0.0213, 0.0447, 0.0231, -0.0047, -0.0200, -0.0285, 0.0130, 0.0166, -0.0114, -0.0029, 0.0139, 0.0497, -0.0032, 0.0199, 0.0275, 0.0417, -0.0006, 0.0302, 0.0392, -0.0390, 0.0381, -0.0488, 0.0201, 0.0278, -0.0114, 0.0381, 0.0335, -0.0020],[-0.0455, -0.0238, 0.0405, 0.0482, 0.0488, -0.0263, 0.0234, 0.0029, -0.0020, 0.0086, 0.0356, -0.0414, -0.0330, -0.0094, 0.0149, -0.0466, 0.0451, 0.0277, 0.0422, 0.0493, 0.0449, 0.0128, -0.0331, -0.0495, 0.0423, 0.0470, 0.0307, 0.0225, -0.0352, 0.0238, 0.0202, -0.0064, -0.0009, -0.0317, 0.0133, 0.0329, 0.0445, -0.0141, -0.0241, -0.0260, -0.0167, -0.0402, -0.0453, -0.0256, -0.0422, -0.0098, -0.0184, -0.0341, -0.0366, 0.0122, -0.0253, 0.0349, 0.0010, 0.0164, 0.0163, -0.0172, 0.0188, -0.0316, 0.0382, 0.0082, -0.0203, 0.0143, -0.0354, 0.0220],[0.0298, -0.0279, 0.0450, 0.0090, -0.0305, 0.0277, -0.0332, -0.0292, -0.0395, 0.0322, 0.0375, -0.0003, -0.0093, 0.0128, 0.0110, 0.0320, 0.0310, 0.0020, 0.0353, -0.0456, -0.0211, -0.0308, 0.0309, 0.0252, -0.0127, -0.0478, 0.0115, 0.0067, 0.0425, -0.0320, -0.0096, 0.0257, -0.0095, -0.0330, -0.0401, 0.0299, 0.0007, -0.0188, 0.0321, 0.0014, 0.0090, -0.0090, 0.0469, 0.0382, 0.0274, -0.0230, -0.0337, -0.0245, -0.0167, -0.0485, 0.0153, 0.0187, -0.0397, 0.0397, -0.0284, 0.0000, 0.0410, -0.0210, 0.0421, 0.0049, -0.0213, 0.0407, -0.0014, 0.0332],[-0.0130, 0.0439, 0.0329, 0.0206, -0.0468, -0.0242, -0.0446, -0.0116, 0.0470, 0.0397, -0.0013, 0.0014, 0.0283, 0.0269, 0.0265, 0.0244, -0.0264, -0.0012, -0.0127, -0.0298, -0.0108, 0.0052, 0.0094, -0.0360, 0.0176, -0.0041, -0.0069, 0.0218, 0.0129, 0.0093, 0.0110, 0.0189, 0.0015, -0.0387, 0.0080, -0.0090, 0.0292, -0.0229, -0.0312, 0.0420, 0.0286, 0.0266, -0.0387, 0.0334, -0.0309, -0.0360, 0.0466, 0.0138, 0.0043, -0.0016, 0.0353, -0.0329, 0.0296, 0.0400, -0.0191, 0.0496, 0.0118, -0.0009, -0.0052, -0.0124, -0.0293, 0.0115, -0.0264, -0.0020],[-0.0036, -0.0069, -0.0416, 0.0128, 0.0164, -0.0035, -0.0261, 0.0163, 0.0173, -0.0350, 0.0135, 0.0318, -0.0301, 0.0180, -0.0267, 0.0347, -0.0227, -0.0277, 0.0210, -0.0472, -0.0473, 0.0072, -0.0307, 0.0125, 0.0006, 0.0124, 0.0305, 0.0249, 0.0183, -0.0441, -0.0028, 0.0204, 0.0461, 0.0496, 0.0432, 0.0389, -0.0249, 0.0018, -0.0187, -0.0055, -0.0083, 0.0147, 0.0426, -0.0460, -0.0028, 0.0281, 0.0420, 0.0345, -0.0167, -0.0117, 0.0274, -0.0219, -0.0072, 0.0449, -0.0495, -0.0299, 0.0267, 0.0351, 0.0368, 0.0474, -0.0046, 0.0310, -0.0054, 0.0141],[-0.0046, -0.0083, -0.0157, 0.0219, 0.0000, -0.0422, -0.0126, 0.0385, 0.0128, -0.0027, -0.0012, 0.0228, -0.0348, -0.0309, -0.0204, -0.0234, 0.0155, 0.0478, -0.0428, 0.0049, 0.0153, -0.0002, 0.0005, 0.0079, -0.0381, -0.0176, 0.0119, -0.0364, -0.0328, -0.0495, -0.0233, -0.0376, 0.0340, -0.0430, 0.0356, 0.0047, -0.0410, 0.0387, 0.0191, -0.0207, -0.0270, -0.0156, -0.0424, -0.0482, 0.0428, -0.0458, -0.0213, 0.0470, 0.0417, 0.0291, 0.0214, 0.0060, 0.0437, 0.0465, 0.0141, 0.0045, 0.0071, -0.0493, -0.0053, -0.0064, 0.0298, -0.0484, -0.0107, -0.0406],[-0.0421, 0.0051, -0.0031, 0.0451, -0.0249, 0.0178, -0.0202, -0.0402, 0.0406, -0.0261, -0.0307, 0.0285, 0.0081, 0.0248, 0.0405, 0.0130, 0.0490, -0.0320, 0.0341, -0.0081, 0.0445, 0.0239, -0.0384, 0.0025, 0.0455, 0.0366, -0.0406, -0.0071, 0.0185, 0.0179, -0.0331, 0.0331, 0.0110, 0.0213, 0.0395, -0.0333, -0.0394, -0.0081, -0.0452, 0.0172, 0.0081, -0.0138, -0.0362, 0.0336, -0.0052, -0.0457, 0.0043, 0.0099, 0.0232, -0.0058, -0.0022, 0.0038, -0.0104, 0.0101, -0.0061, -0.0268, -0.0296, -0.0458, 0.0481, 0.0456, 0.0229, -0.0218, 0.0227, -0.0030],[-0.0031, -0.0180, 0.0239, -0.0365, -0.0098, 0.0063, -0.0195, 0.0364, 0.0256, 0.0251, 0.0425, -0.0284, -0.0191, -0.0205, 0.0272, 0.0468, 0.0231, 0.0035, -0.0293, 0.0348, 0.0206, 0.0385, 0.0212, -0.0170, -0.0028, 0.0332, 0.0032, -0.0086, -0.0470, 0.0110, -0.0001, 0.0474, 0.0457, 0.0392, 0.0112, -0.0139, 0.0417, 0.0208, -0.0114, 0.0459, 0.0377, -0.0292, -0.0368, 0.0062, 0.0325, -0.0315, -0.0092, 0.0423, 0.0362, 0.0320, -0.0068, 0.0259, -0.0190, -0.0423, -0.0102, 0.0163, -0.0184, 0.0441, 0.0067, -0.0014, 0.0002, 0.0019, 0.0089, 0.0138],[0.0112, -0.0259, -0.0377, -0.0355, -0.0215, -0.0280, 0.0373, -0.0145, -0.0163, -0.0252, 0.0131, 0.0371, 0.0307, 0.0028, 0.0439, -0.0264, 0.0386, -0.0283, 0.0132, 0.0045, 0.0156, 0.0482, -0.0098, 0.0302, 0.0451, 0.0488, 0.0182, -0.0360, 0.0407, -0.0158, 0.0136, 0.0048, 0.0236, 0.0281, -0.0323, -0.0475, 0.0073, -0.0427, -0.0491, -0.0147, 0.0492, -0.0431, 0.0210, -0.0070, 0.0473, 0.0078, -0.0206, 0.0414, 0.0218, -0.0425, 0.0057, -0.0197, 0.0358, -0.0111, 0.0222, 0.0184, 0.0228, 0.0221, -0.0148, 0.0419, 0.0219, -0.0347, 0.0426, -0.0479],[0.0436, 0.0274, -0.0205, -0.0302, 0.0383, 0.0188, 0.0278, -0.0412, -0.0441, 0.0380, -0.0159, 0.0004, -0.0200, -0.0074, -0.0427, 0.0235, -0.0099, -0.0112, 0.0096, 0.0009, 0.0263, -0.0400, -0.0063, 0.0253, 0.0157, 0.0257, 0.0492, -0.0108, 0.0232, -0.0433, -0.0126, -0.0426, 0.0459, 0.0056, -0.0293, 0.0083, -0.0155, 0.0461, 0.0411, 0.0312, 0.0438, 0.0236, -0.0192, 0.0341, 0.0143, -0.0208, -0.0231, 0.0244, -0.0172, -0.0218, -0.0106, 0.0055, 0.0268, 0.0241, -0.0466, 0.0152, -0.0430, -0.0052, -0.0379, -0.0421, -0.0321, -0.0491, -0.0096, -0.0307],[0.0043, -0.0400, 0.0288, 0.0295, 0.0248, 0.0054, 0.0152, -0.0376, 0.0057, -0.0485, -0.0301, -0.0055, -0.0147, -0.0457, 0.0027, -0.0324, 0.0495, 0.0275, -0.0192, 0.0024, -0.0131, -0.0495, 0.0460, -0.0357, 0.0016, 0.0393, 0.0248, 0.0251, 0.0400, -0.0478, 0.0475, 0.0087, -0.0257, 0.0026, -0.0246, 0.0404, -0.0432, 0.0269, 0.0247, 0.0014, -0.0463, 0.0310, -0.0332, -0.0019, -0.0286, 0.0461, 0.0203, -0.0261, -0.0317, 0.0059, 0.0355, -0.0372, -0.0436, 0.0070, -0.0325, 0.0028, 0.0301, -0.0461, 0.0050, 0.0102, -0.0003, -0.0128, -0.0352, 0.0098],[-0.0481, -0.0109, -0.0003, 0.0242, -0.0258, -0.0250, -0.0425, -0.0260, -0.0191, -0.0064, -0.0254, -0.0433, -0.0431, 0.0178, -0.0171, 0.0419, 0.0062, -0.0449, 0.0007, 0.0186, 0.0018, 0.0322, -0.0246, -0.0493, 0.0169, -0.0169, -0.0206, 0.0293, -0.0307, 0.0306, 0.0326, -0.0459, 0.0059, 0.0324, 0.0157, -0.0298, 0.0194, -0.0332, 0.0277, 0.0024, 0.0237, -0.0367, -0.0313, -0.0332, 0.0007, -0.0041, -0.0048, -0.0464, -0.0062, 0.0216, 0.0326, -0.0472, -0.0262, -0.0439, -0.0058, -0.0012, -0.0274, 0.0007, -0.0463, 0.0322, -0.0306, -0.0261, 0.0147, 0.0048],[0.0470, 0.0071, -0.0455, 0.0390, 0.0334, 0.0171, 0.0053, -0.0237, -0.0046, -0.0240, 0.0446, -0.0306, 0.0168, -0.0170, 0.0265, -0.0369, 0.0443, 0.0153, 0.0081, 0.0065, 0.0046, 0.0281, -0.0079, -0.0356, -0.0080, -0.0375, -0.0334, -0.0138, -0.0369, -0.0422, 0.0187, -0.0352, 0.0359, 0.0375, -0.0055, 0.0390, -0.0386, 0.0064, 0.0332, 0.0246, -0.0348, -0.0154, 0.0294, 0.0411, -0.0431, -0.0445, -0.0286, 0.0249, 0.0472, 0.0175, -0.0135, -0.0427, -0.0442, 0.0437, -0.0323, 0.0228, 0.0110, 0.0398, -0.0157, -0.0004, -0.0211, -0.0422, 0.0038, 0.0221],[0.0427, 0.0478, -0.0095, -0.0290, 0.0110, 0.0379, 0.0269, 0.0020, -0.0375, -0.0260, 0.0453, -0.0356, -0.0496, -0.0472, 0.0140, -0.0420, 0.0284, -0.0064, -0.0341, -0.0185, 0.0111, 0.0217, 0.0119, -0.0461, -0.0208, -0.0285, 0.0279, -0.0391, -0.0441, -0.0480, -0.0109, 0.0207, 0.0206, -0.0099, 0.0261, -0.0120, 0.0327, 0.0082, 0.0275, 0.0004, 0.0285, -0.0132, 0.0369, -0.0003, -0.0212, 0.0495, 0.0485, 0.0264, -0.0498, -0.0300, -0.0222, 0.0380, 0.0448, 0.0123, -0.0149, -0.0179, 0.0252, 0.0410, -0.0470, 0.0471, -0.0496, -0.0067, 0.0022, 0.0471],[0.0266, -0.0065, 0.0449, -0.0034, 0.0236, 0.0480, 0.0181, -0.0345, -0.0100, -0.0187, 0.0085, -0.0107, 0.0402, -0.0371, -0.0383, -0.0090, 0.0034, -0.0259, 0.0457, 0.0408, -0.0005, 0.0443, 0.0455, -0.0282, 0.0182, -0.0113, -0.0154, 0.0049, -0.0427, -0.0239, 0.0007, 0.0004, 0.0382, -0.0192, 0.0036, 0.0378, -0.0331, -0.0033, 0.0321, -0.0492, -0.0171, 0.0262, 0.0170, 0.0037, 0.0439, -0.0433, -0.0240, 0.0192, 0.0355, -0.0153, 0.0090, 0.0392, 0.0009, 0.0385, -0.0149, 0.0133, -0.0227, 0.0339, 0.0404, 0.0354, -0.0099, 0.0341, 0.0058, 0.0105],[0.0484, -0.0442, -0.0467, 0.0239, -0.0323, 0.0027, 0.0436, -0.0149, 0.0033, 0.0402, -0.0251, -0.0212, -0.0248, 0.0262, -0.0491, -0.0408, -0.0288, 0.0462, 0.0439, 0.0411, -0.0020, -0.0035, 0.0070, -0.0119, 0.0468, -0.0355, 0.0198, 0.0053, -0.0326, 0.0120, -0.0386, -0.0347, -0.0269, 0.0360, 0.0185, 0.0350, 0.0017, 0.0411, -0.0178, 0.0456, 0.0117, -0.0239, -0.0009, 0.0080, -0.0345, -0.0489, -0.0171, -0.0383, 0.0179, -0.0272, 0.0471, 0.0262, -0.0319, 0.0119, -0.0098, -0.0304, -0.0028, 0.0464, -0.0046, 0.0367, -0.0207, 0.0375, 0.0022, -0.0252],[-0.0419, 0.0463, -0.0390, 0.0445, 0.0301, -0.0171, -0.0255, 0.0170, -0.0338, -0.0492, 0.0119, 0.0499, -0.0441, -0.0390, -0.0302, 0.0160, -0.0191, -0.0290, 0.0070, 0.0047, 0.0324, -0.0251, 0.0210, 0.0385, -0.0099, 0.0378, 0.0372, -0.0330, -0.0444, -0.0067, -0.0383, -0.0448, 0.0396, -0.0315, -0.0466, 0.0413, -0.0036, -0.0048, 0.0492, -0.0183, -0.0324, 0.0270, -0.0374, 0.0070, 0.0423, 0.0077, -0.0290, -0.0225, 0.0184, 0.0446, -0.0204, -0.0238, 0.0157, 0.0224, 0.0104, 0.0424, -0.0470, 0.0443, -0.0383, -0.0354, -0.0237, 0.0338, -0.0447, -0.0162],[0.0014, 0.0179, -0.0484, 0.0050, -0.0453, -0.0334, 0.0263, 0.0048, 0.0407, -0.0361, 0.0098, -0.0449, 0.0165, -0.0207, 0.0171, 0.0159, 0.0016, -0.0428, 0.0259, -0.0316, 0.0466, 0.0215, -0.0457, 0.0257, -0.0266, 0.0400, 0.0256, 0.0195, 0.0325, -0.0258, -0.0032, -0.0307, 0.0321, -0.0232, 0.0410, -0.0053, -0.0180, 0.0216, -0.0171, 0.0419, 0.0276, 0.0077, -0.0064, 0.0255, -0.0434, 0.0210, 0.0273, 0.0320, 0.0442, 0.0210, 0.0241, 0.0332, 0.0105, 0.0178, -0.0463, -0.0262, -0.0471, -0.0472, 0.0451, -0.0194, 0.0002, -0.0148, -0.0236, 0.0098],[0.0232, 0.0126, -0.0491, 0.0298, 0.0156, -0.0016, -0.0367, -0.0239, 0.0107, 0.0445, 0.0295, 0.0410, 0.0358, 0.0176, 0.0408, 0.0436, -0.0290, -0.0340, 0.0348, -0.0375, 0.0333, 0.0433, -0.0334, 0.0289, -0.0168, -0.0473, -0.0318, 0.0414, 0.0487, 0.0029, -0.0418, -0.0124, -0.0386, -0.0396, 0.0197, -0.0214, -0.0375, 0.0174, -0.0250, -0.0250, -0.0048, 0.0256, 0.0478, -0.0057, -0.0371, 0.0009, 0.0131, 0.0297, 0.0315, -0.0390, 0.0428, 0.0353, -0.0301, 0.0440, 0.0203, 0.0136, 0.0377, -0.0149, 0.0204, -0.0263, -0.0189, 0.0141, -0.0159, 0.0354],[0.0413, 0.0487, -0.0369, 0.0485, 0.0308, 0.0223, 0.0279, 0.0421, -0.0013, 0.0208, 0.0124, 0.0104, 0.0297, 0.0321, -0.0194, -0.0380, -0.0326, 0.0283, 0.0480, -0.0266, 0.0463, 0.0408, 0.0157, 0.0462, -0.0265, 0.0333, 0.0080, -0.0161, 0.0484, 0.0195, 0.0068, 0.0271, -0.0148, -0.0216, -0.0399, -0.0223, 0.0209, 0.0303, 0.0403, 0.0303, 0.0296, -0.0321, 0.0313, 0.0331, -0.0472, -0.0121, -0.0326, 0.0404, -0.0009, 0.0054, 0.0225, -0.0393, -0.0009, 0.0102, 0.0116, 0.0430, 0.0051, 0.0123, 0.0348, 0.0004, 0.0228, -0.0458, -0.0228, -0.0050],[-0.0090, -0.0477, 0.0462, 0.0040, -0.0348, 0.0361, 0.0291, 0.0238, 0.0005, -0.0226, -0.0054, -0.0201, 0.0069, -0.0178, -0.0078, -0.0390, 0.0358, -0.0344, 0.0459, 0.0164, -0.0348, 0.0363, -0.0282, -0.0436, -0.0118, 0.0477, 0.0245, 0.0152, 0.0188, 0.0494, 0.0115, 0.0270, -0.0288, -0.0298, 0.0022, -0.0057, 0.0375, -0.0276, -0.0166, -0.0352, 0.0352, -0.0128, -0.0143, -0.0014, -0.0191, 0.0051, -0.0180, -0.0373, 0.0019, 0.0292, -0.0433, -0.0107, -0.0349, 0.0411, -0.0470, -0.0337, -0.0109, -0.0198, 0.0178, 0.0305, 0.0143, -0.0242, 0.0078, -0.0256],[-0.0031, -0.0246, 0.0145, -0.0422, 0.0347, 0.0453, 0.0228, -0.0444, -0.0369, -0.0493, -0.0263, -0.0210, 0.0352, -0.0371, -0.0017, 0.0106, -0.0148, -0.0452, 0.0071, 0.0031, -0.0223, 0.0487, 0.0459, -0.0036, 0.0166, -0.0360, -0.0453, 0.0046, 0.0006, -0.0215, -0.0123, -0.0413, 0.0101, 0.0283, 0.0432, 0.0433, 0.0012, 0.0230, 0.0217, 0.0244, 0.0443, 0.0375, -0.0297, 0.0282, -0.0373, 0.0244, -0.0154, -0.0269, -0.0366, 0.0035, 0.0025, -0.0409, 0.0274, 0.0312, -0.0393, -0.0199, 0.0157, -0.0227, 0.0455, 0.0281, 0.0279, 0.0141, -0.0204, -0.0335],[-0.0220, -0.0475, 0.0159, 0.0044, -0.0451, 0.0063, -0.0312, -0.0307, 0.0045, -0.0461, 0.0056, 0.0400, 0.0316, 0.0139, -0.0493, -0.0128, 0.0117, 0.0426, 0.0127, -0.0221, 0.0017, -0.0222, -0.0137, -0.0440, -0.0368, -0.0368, 0.0193, 0.0081, 0.0299, 0.0116, 0.0414, -0.0248, -0.0419, 0.0268, -0.0096, -0.0305, -0.0003, 0.0174, 0.0310, -0.0108, 0.0059, -0.0450, -0.0197, -0.0093, -0.0087, -0.0391, 0.0191, -0.0436, -0.0182, -0.0463, 0.0397, 0.0357, 0.0218, -0.0495, 0.0164, -0.0136, -0.0086, 0.0251, -0.0193, 0.0179, 0.0459, -0.0033, -0.0315, 0.0384],[0.0333, -0.0356, 0.0472, 0.0466, 0.0328, 0.0249, 0.0024, -0.0280, -0.0158, -0.0496, -0.0364, -0.0336, -0.0107, 0.0326, -0.0357, -0.0096, -0.0216, -0.0434, 0.0310, 0.0050, -0.0054, -0.0417, -0.0499, -0.0086, -0.0246, -0.0026, -0.0382, -0.0393, 0.0377, 0.0485, -0.0091, -0.0255, 0.0415, 0.0141, -0.0212, -0.0073, 0.0471, -0.0384, -0.0218, -0.0147, -0.0128, -0.0255, -0.0334, -0.0010, 0.0201, 0.0135, 0.0212, -0.0120, -0.0459, -0.0383, -0.0301, 0.0270, -0.0388, -0.0291, -0.0190, -0.0285, -0.0341, 0.0146, 0.0257, 0.0075, 0.0273, -0.0160, -0.0023, 0.0286],[-0.0478, 0.0454, 0.0385, -0.0258, 0.0007, 0.0085, -0.0125, 0.0125, -0.0105, 0.0459, -0.0020, 0.0073, 0.0124, 0.0142, -0.0273, -0.0266, -0.0058, -0.0239, 0.0147, 0.0448, -0.0199, -0.0071, -0.0113, -0.0233, 0.0284, -0.0417, 0.0303, 0.0415, 0.0079, -0.0072, 0.0157, 0.0492, 0.0272, 0.0365, -0.0017, -0.0125, 0.0041, -0.0038, 0.0481, -0.0053, -0.0435, 0.0434, 0.0427, 0.0056, 0.0229, 0.0083, -0.0137, -0.0469, -0.0212, 0.0059, -0.0353, 0.0338, -0.0329, -0.0180, 0.0053, -0.0069, 0.0113, 0.0001, -0.0063, 0.0488, -0.0028, -0.0457, 0.0358, 0.0208],[-0.0391, -0.0323, 0.0417, 0.0286, -0.0413, -0.0054, 0.0429, 0.0056, -0.0131, -0.0335, 0.0437, -0.0146, 0.0187, 0.0307, 0.0392, 0.0184, 0.0326, 0.0478, -0.0177, 0.0468, 0.0007, 0.0088, 0.0040, -0.0410, -0.0012, 0.0220, -0.0430, -0.0335, 0.0298, 0.0113, 0.0450, 0.0125, -0.0481, -0.0475, 0.0197, -0.0213, 0.0128, -0.0134, 0.0090, 0.0121, 0.0304, 0.0473, 0.0428, -0.0328, 0.0375, 0.0445, 0.0462, 0.0283, -0.0229, 0.0168, -0.0009, 0.0419, 0.0455, -0.0230, -0.0478, 0.0075, 0.0498, 0.0314, -0.0227, 0.0026, 0.0322, 0.0099, -0.0366, 0.0194],[-0.0326, -0.0397, -0.0056, -0.0025, 0.0083, -0.0228, -0.0081, -0.0492, 0.0487, 0.0324, -0.0480, 0.0239, 0.0355, 0.0251, 0.0439, 0.0430, -0.0489, -0.0312, -0.0436, 0.0030, -0.0466, -0.0302, -0.0138, 0.0044, 0.0060, -0.0143, -0.0375, -0.0022, 0.0185, 0.0221, -0.0182, -0.0327, -0.0082, 0.0438, -0.0342, -0.0099, 0.0273, -0.0000, 0.0429, 0.0487, -0.0434, 0.0109, -0.0192, 0.0379, -0.0494, -0.0044, 0.0076, 0.0410, 0.0171, -0.0344, -0.0212, -0.0414, 0.0321, -0.0055, 0.0336, 0.0234, 0.0238, -0.0261, -0.0295, 0.0172, 0.0248, -0.0084, 0.0378, 0.0301],[0.0381, -0.0350, -0.0355, -0.0333, 0.0075, 0.0330, 0.0269, -0.0240, -0.0079, -0.0496, -0.0202, 0.0495, -0.0001, -0.0402, 0.0092, -0.0468, 0.0250, -0.0209, 0.0368, -0.0113, 0.0474, 0.0228, 0.0242, 0.0013, -0.0350, -0.0177, -0.0267, -0.0328, 0.0036, 0.0290, 0.0207, 0.0435, 0.0264, -0.0290, 0.0064, 0.0329, 0.0422, -0.0315, 0.0248, -0.0333, 0.0146, 0.0117, -0.0499, -0.0111, -0.0310, 0.0245, -0.0373, 0.0113, -0.0447, -0.0280, 0.0277, 0.0272, 0.0108, -0.0024, 0.0276, -0.0068, 0.0315, -0.0440, 0.0351, -0.0169, -0.0218, -0.0243, 0.0037, 0.0186],[-0.0457, 0.0415, 0.0417, 0.0113, -0.0007, -0.0315, -0.0193, -0.0285, 0.0148, 0.0243, -0.0236, -0.0022, 0.0362, 0.0151, 0.0443, -0.0315, -0.0266, -0.0020, 0.0087, 0.0270, -0.0254, 0.0167, 0.0481, -0.0464, -0.0329, 0.0475, 0.0285, 0.0391, 0.0299, -0.0331, 0.0194, 0.0266, -0.0399, -0.0469, -0.0143, 0.0254, 0.0196, 0.0421, -0.0256, 0.0412, 0.0185, 0.0004, -0.0045, 0.0207, 0.0480, -0.0223, 0.0129, -0.0241, -0.0459, -0.0284, 0.0369, -0.0093, 0.0122, -0.0097, 0.0062, 0.0144, 0.0284, -0.0033, -0.0142, 0.0138, -0.0302, -0.0466, 0.0432, -0.0473],[-0.0198, 0.0069, 0.0270, 0.0313, -0.0088, -0.0322, -0.0384, -0.0345, 0.0031, 0.0205, -0.0180, -0.0226, 0.0211, -0.0036, 0.0392, 0.0425, 0.0209, 0.0081, 0.0314, -0.0162, -0.0219, 0.0132, -0.0395, 0.0393, -0.0160, 0.0486, 0.0086, 0.0461, -0.0335, -0.0336, 0.0378, -0.0257, 0.0098, 0.0413, -0.0289, -0.0498, 0.0400, 0.0113, 0.0240, 0.0017, 0.0263, -0.0053, 0.0302, -0.0358, -0.0002, 0.0065, -0.0489, -0.0369, 0.0275, -0.0105, 0.0152, 0.0466, -0.0122, 0.0171, -0.0171, 0.0081, 0.0231, 0.0450, 0.0112, -0.0082, 0.0339, 0.0217, 0.0175, 0.0395],[-0.0369, 0.0113, -0.0130, -0.0255, -0.0433, 0.0016, 0.0304, 0.0161, 0.0437, 0.0235, -0.0057, 0.0488, -0.0323, 0.0041, 0.0253, 0.0270, -0.0277, -0.0152, -0.0042, 0.0222, 0.0186, -0.0255, 0.0244, -0.0192, 0.0269, -0.0470, 0.0015, 0.0014, -0.0244, -0.0001, -0.0096, 0.0102, -0.0109, -0.0135, 0.0154, -0.0019, 0.0411, -0.0139, 0.0291, 0.0017, 0.0094, -0.0341, -0.0055, -0.0464, -0.0471, 0.0451, 0.0068, 0.0164, -0.0384, -0.0455, -0.0128, -0.0246, -0.0263, 0.0243, 0.0353, -0.0360, 0.0254, 0.0171, 0.0480, -0.0374, 0.0183, -0.0080, 0.0176, 0.0259],[0.0228, 0.0024, 0.0100, 0.0234, -0.0212, -0.0247, -0.0317, 0.0011, -0.0457, -0.0325, 0.0039, 0.0307, -0.0470, -0.0482, 0.0479, -0.0395, 0.0221, -0.0043, 0.0258, 0.0230, -0.0337, -0.0312, -0.0153, -0.0156, -0.0119, -0.0064, 0.0131, 0.0313, -0.0002, 0.0082, -0.0447, 0.0283, 0.0241, -0.0420, -0.0469, 0.0308, -0.0350, -0.0428, -0.0112, 0.0224, 0.0380, -0.0142, 0.0452, -0.0315, -0.0138, 0.0444, 0.0328, -0.0259, 0.0352, -0.0412, -0.0017, -0.0378, -0.0236, -0.0448, 0.0452, -0.0478, 0.0317, 0.0045, 0.0498, 0.0285, 0.0171, 0.0435, 0.0131, 0.0034],[-0.0331, -0.0359, -0.0454, -0.0010, -0.0399, 0.0478, -0.0182, 0.0478, -0.0037, -0.0118, -0.0496, -0.0481, 0.0194, -0.0100, -0.0041, 0.0041, -0.0397, -0.0373, -0.0494, 0.0319, 0.0029, 0.0103, -0.0225, -0.0143, -0.0094, -0.0259, 0.0414, -0.0260, -0.0370, 0.0245, 0.0062, -0.0463, 0.0290, 0.0284, -0.0057, 0.0247, 0.0270, -0.0051, 0.0082, 0.0377, -0.0191, 0.0004, -0.0157, -0.0411, 0.0399, -0.0368, -0.0468, -0.0381, 0.0247, -0.0229, -0.0417, 0.0357, -0.0495, -0.0098, 0.0307, 0.0190, -0.0323, 0.0073, -0.0093, -0.0133, 0.0376, 0.0019, -0.0209, -0.0260],[0.0453, -0.0476, 0.0486, -0.0062, -0.0184, -0.0269, -0.0217, 0.0429, -0.0137, 0.0358, 0.0279, 0.0423, 0.0261, -0.0190, -0.0093, 0.0354, 0.0476, -0.0412, 0.0239, -0.0499, 0.0390, -0.0310, 0.0331, 0.0238, 0.0173, -0.0384, -0.0103, -0.0457, -0.0001, -0.0420, 0.0280, -0.0279, -0.0493, 0.0125, 0.0021, -0.0087, 0.0400, -0.0215, -0.0296, -0.0368, 0.0481, -0.0100, 0.0320, -0.0386, 0.0029, 0.0470, -0.0399, 0.0057, 0.0178, 0.0189, -0.0090, 0.0139, -0.0391, 0.0069, -0.0205, 0.0392, -0.0311, 0.0011, -0.0388, 0.0150, 0.0475, -0.0149, 0.0076, 0.0040],[-0.0052, 0.0444, 0.0387, 0.0217, -0.0346, -0.0084, -0.0176, -0.0296, -0.0133, 0.0157, 0.0217, 0.0071, 0.0185, 0.0370, -0.0259, 0.0458, 0.0305, 0.0215, 0.0500, 0.0241, 0.0420, 0.0413, -0.0338, 0.0401, 0.0210, -0.0044, 0.0046, 0.0391, 0.0352, -0.0076, -0.0344, -0.0153, 0.0199, 0.0472, 0.0291, 0.0017, 0.0473, 0.0120, 0.0467, 0.0102, -0.0412, 0.0140, 0.0266, 0.0412, 0.0235, -0.0457, 0.0134, 0.0147, 0.0479, -0.0361, -0.0163, 0.0161, -0.0181, -0.0306, -0.0305, 0.0366, 0.0449, -0.0448, -0.0002, -0.0366, -0.0153, 0.0230, 0.0365, -0.0263],[-0.0101, -0.0374, -0.0058, 0.0245, -0.0330, -0.0367, -0.0145, -0.0304, 0.0129, -0.0360, -0.0419, 0.0345, 0.0178, -0.0209, 0.0287, 0.0272, -0.0408, -0.0206, -0.0161, 0.0261, 0.0048, -0.0259, -0.0477, -0.0344, -0.0132, -0.0335, -0.0390, 0.0494, 0.0201, 0.0161, -0.0352, -0.0108, 0.0337, 0.0135, -0.0337, -0.0453, -0.0050, -0.0201, -0.0433, -0.0224, -0.0456, -0.0443, 0.0004, -0.0392, -0.0223, 0.0162, -0.0163, -0.0161, -0.0001, -0.0467, 0.0269, -0.0111, 0.0360, 0.0410, -0.0029, -0.0366, 0.0465, 0.0298, -0.0202, 0.0247, -0.0314, 0.0318, -0.0154, 0.0112],[0.0166, 0.0048, -0.0071, 0.0422, -0.0466, 0.0343, -0.0004, -0.0041, -0.0372, 0.0143, 0.0061, -0.0188, -0.0434, 0.0252, 0.0392, 0.0237, -0.0105, 0.0345, 0.0268, 0.0169, 0.0101, -0.0492, 0.0097, 0.0230, 0.0049, 0.0231, -0.0124, -0.0213, 0.0116, -0.0314, 0.0352, -0.0268, 0.0302, -0.0415, 0.0325, 0.0175, 0.0198, 0.0015, 0.0318, 0.0438, 0.0432, 0.0474, 0.0146, -0.0048, -0.0268, 0.0077, 0.0006, -0.0101, 0.0485, -0.0074, 0.0081, -0.0109, -0.0366, 0.0487, 0.0490, -0.0132, -0.0072, 0.0326, 0.0447, -0.0140, -0.0474, 0.0350, 0.0428, 0.0444],[-0.0323, 0.0412, -0.0383, -0.0032, 0.0299, -0.0402, -0.0237, 0.0172, -0.0167, -0.0270, -0.0178, 0.0137, -0.0356, 0.0488, 0.0147, 0.0021, -0.0032, 0.0146, -0.0480, 0.0072, -0.0337, 0.0228, -0.0365, 0.0256, 0.0438, -0.0409, 0.0024, -0.0344, 0.0284, 0.0369, 0.0483, 0.0349, 0.0384, 0.0056, 0.0015, -0.0195, 0.0305, -0.0498, -0.0381, 0.0343, 0.0092, -0.0444, 0.0430, 0.0196, -0.0165, 0.0093, -0.0329, -0.0225, -0.0437, -0.0445, 0.0254, -0.0123, 0.0308, -0.0303, -0.0222, -0.0050, -0.0303, 0.0344, 0.0190, -0.0186, -0.0262, -0.0178, -0.0451, -0.0403],[0.0112, -0.0022, 0.0113, -0.0059, 0.0200, 0.0298, 0.0373, -0.0191, 0.0017, -0.0296, 0.0120, -0.0460, 0.0370, -0.0417, -0.0158, 0.0348, -0.0160, 0.0445, -0.0492, 0.0320, -0.0342, 0.0097, -0.0428, -0.0009, 0.0402, 0.0262, 0.0029, 0.0186, -0.0484, 0.0188, 0.0049, 0.0429, 0.0471, 0.0233, -0.0212, 0.0473, -0.0104, -0.0479, 0.0417, -0.0378, -0.0044, -0.0071, -0.0079, 0.0486, -0.0342, -0.0256, 0.0258, -0.0047, 0.0286, -0.0280, 0.0357, -0.0080, 0.0248, -0.0291, 0.0430, -0.0089, 0.0082, -0.0278, -0.0370, 0.0314, 0.0488, -0.0353, -0.0042, 0.0244],[-0.0271, 0.0274, 0.0084, 0.0249, -0.0435, 0.0349, 0.0173, -0.0264, -0.0007, 0.0223, 0.0256, -0.0482, 0.0250, 0.0102, 0.0312, 0.0183, 0.0434, -0.0058, 0.0253, 0.0357, 0.0202, -0.0223, 0.0057, 0.0243, -0.0430, -0.0147, 0.0453, -0.0033, 0.0151, -0.0061, 0.0083, 0.0318, 0.0373, 0.0346, -0.0487, 0.0384, -0.0094, 0.0323, -0.0353, 0.0254, -0.0025, 0.0212, -0.0322, -0.0497, -0.0494, 0.0295, -0.0118, -0.0391, -0.0255, -0.0318, -0.0041, 0.0412, 0.0137, 0.0111, 0.0400, -0.0370, 0.0316, -0.0394, 0.0014, -0.0126, -0.0403, 0.0311, -0.0096, 0.0337],[-0.0314, 0.0389, 0.0135, 0.0123, -0.0207, -0.0330, -0.0467, 0.0356, 0.0046, -0.0454, -0.0336, 0.0444, -0.0151, -0.0113, 0.0152, 0.0223, 0.0358, 0.0322, 0.0194, 0.0403, 0.0026, -0.0107, -0.0371, -0.0252, 0.0250, -0.0446, -0.0471, 0.0188, 0.0422, -0.0443, 0.0211, 0.0335, 0.0388, 0.0122, 0.0239, -0.0153, -0.0408, -0.0048, -0.0029, 0.0458, -0.0126, 0.0024, 0.0076, -0.0217, 0.0275, -0.0152, 0.0135, 0.0016, 0.0073, 0.0219, -0.0382, -0.0070, 0.0092, -0.0305, 0.0172, -0.0040, 0.0108, 0.0209, -0.0179, 0.0467, -0.0056, 0.0327, -0.0252, 0.0350],[0.0315, -0.0178, -0.0377, -0.0007, 0.0345, 0.0272, -0.0338, -0.0305, 0.0332, 0.0130, 0.0377, 0.0377, 0.0497, -0.0121, 0.0310, 0.0472, 0.0245, -0.0466, -0.0216, 0.0250, 0.0163, 0.0281, 0.0392, -0.0276, -0.0217, 0.0412, 0.0406, -0.0193, 0.0295, 0.0414, 0.0436, -0.0165, -0.0495, 0.0285, 0.0262, 0.0327, -0.0485, -0.0448, -0.0439, -0.0393, -0.0475, 0.0108, -0.0243, -0.0026, -0.0456, 0.0253, 0.0051, 0.0444, -0.0031, 0.0041, 0.0017, 0.0158, -0.0383, 0.0488, -0.0485, -0.0358, 0.0010, 0.0286, -0.0125, 0.0435, -0.0348, 0.0254, -0.0482, -0.0129],[0.0430, -0.0053, 0.0182, 0.0052, 0.0168, 0.0132, 0.0205, 0.0469, -0.0113, 0.0254, -0.0407, 0.0003, 0.0123, 0.0075, 0.0218, -0.0491, 0.0014, 0.0337, 0.0237, -0.0292, 0.0409, 0.0133, -0.0108, 0.0392, -0.0300, -0.0425, -0.0243, 0.0446, 0.0221, 0.0221, 0.0143, 0.0260, 0.0345, -0.0493, 0.0141, -0.0233, -0.0464, 0.0219, 0.0463, 0.0339, 0.0229, 0.0050, -0.0317, -0.0080, -0.0414, 0.0153, 0.0142, -0.0475, 0.0095, -0.0113, -0.0123, 0.0234, -0.0107, -0.0024, -0.0094, 0.0402, 0.0433, 0.0117, 0.0066, -0.0325, -0.0200, 0.0326, -0.0381, -0.0269],[0.0086, -0.0160, 0.0124, -0.0462, 0.0373, 0.0330, 0.0075, -0.0452, -0.0443, 0.0484, -0.0269, -0.0478, 0.0218, -0.0100, 0.0454, 0.0159, 0.0107, -0.0200, 0.0069, 0.0484, 0.0050, 0.0281, 0.0016, 0.0131, -0.0010, 0.0366, -0.0322, 0.0433, 0.0209, -0.0461, 0.0119, 0.0137, -0.0319, -0.0062, 0.0136, -0.0355, 0.0389, 0.0444, 0.0393, 0.0395, -0.0476, -0.0124, 0.0162, -0.0285, -0.0063, -0.0012, -0.0271, 0.0006, 0.0142, -0.0281, -0.0059, 0.0042, -0.0120, -0.0288, -0.0207, -0.0178, -0.0026, 0.0127, -0.0453, -0.0196, 0.0178, -0.0085, -0.0445, 0.0392],[0.0489, 0.0330, -0.0075, -0.0377, -0.0000, -0.0272, 0.0053, -0.0166, 0.0008, 0.0265, -0.0140, 0.0101, 0.0120, 0.0376, 0.0333, -0.0243, -0.0002, 0.0216, -0.0305, 0.0160, 0.0130, -0.0291, 0.0176, -0.0424, -0.0475, -0.0462, 0.0097, 0.0094, -0.0182, -0.0286, 0.0349, 0.0370, 0.0346, 0.0499, -0.0073, 0.0272, -0.0482, 0.0390, -0.0047, -0.0065, -0.0179, 0.0059, 0.0176, -0.0008, -0.0366, -0.0220, 0.0173, -0.0000, -0.0240, -0.0140, 0.0262, 0.0247, -0.0149, 0.0293, -0.0219, 0.0482, -0.0445, 0.0383, -0.0160, 0.0492, -0.0374, -0.0481, -0.0141, 0.0433],[0.0116, 0.0387, 0.0452, -0.0098, -0.0028, -0.0416, 0.0119, -0.0110, -0.0071, 0.0378, 0.0405, -0.0357, 0.0435, -0.0372, 0.0422, -0.0086, 0.0316, 0.0345, 0.0442, 0.0397, 0.0402, 0.0101, 0.0491, -0.0053, -0.0006, 0.0235, -0.0368, -0.0187, -0.0363, -0.0077, -0.0132, -0.0492, -0.0303, 0.0404, -0.0349, 0.0151, -0.0219, -0.0261, -0.0295, -0.0129, -0.0083, 0.0396, 0.0336, -0.0015, 0.0060, 0.0051, 0.0267, 0.0304, 0.0322, -0.0021, -0.0118, 0.0280, -0.0265, -0.0285, 0.0162, 0.0040, 0.0261, -0.0354, 0.0253, 0.0254, -0.0167, -0.0269, 0.0328, 0.0327],[-0.0264, 0.0103, 0.0204, 0.0027, 0.0346, 0.0449, -0.0075, -0.0195, 0.0281, -0.0097, 0.0219, -0.0489, 0.0444, -0.0308, -0.0400, 0.0131, 0.0413, 0.0162, -0.0451, -0.0173, 0.0313, -0.0190, -0.0099, 0.0170, -0.0273, -0.0406, 0.0015, 0.0062, -0.0286, 0.0067, -0.0042, 0.0378, -0.0402, 0.0035, -0.0292, -0.0303, -0.0490, -0.0042, 0.0039, -0.0422, -0.0444, -0.0177, -0.0136, -0.0277, -0.0119, -0.0194, -0.0357, 0.0338, 0.0048, 0.0436, 0.0465, 0.0452, 0.0059, 0.0354, 0.0399, -0.0422, -0.0206, -0.0189, -0.0470, 0.0352, 0.0094, -0.0284, -0.0224, 0.0236],[-0.0440, 0.0193, -0.0226, 0.0202, 0.0339, 0.0145, -0.0135, -0.0155, -0.0345, 0.0438, 0.0243, -0.0305, -0.0378, -0.0472, -0.0252, -0.0220, 0.0212, 0.0038, 0.0462, -0.0115, 0.0405, 0.0321, -0.0209, 0.0108, 0.0474, 0.0200, -0.0260, 0.0037, -0.0454, 0.0229, 0.0491, -0.0212, 0.0470, 0.0107, -0.0085, 0.0172, -0.0113, -0.0203, 0.0060, 0.0054, 0.0032, -0.0250, -0.0288, 0.0018, -0.0121, -0.0326, -0.0390, -0.0081, 0.0189, 0.0207, -0.0133, 0.0032, -0.0392, 0.0419, -0.0148, 0.0322, -0.0382, -0.0396, -0.0418, -0.0168, -0.0437, -0.0103, -0.0299, 0.0349],[-0.0304, -0.0405, -0.0362, 0.0229, -0.0022, 0.0326, -0.0113, -0.0157, -0.0457, -0.0054, -0.0458, 0.0193, -0.0427, 0.0300, 0.0018, 0.0207, -0.0109, 0.0005, 0.0391, -0.0335, -0.0487, 0.0209, 0.0091, 0.0308, -0.0496, 0.0173, 0.0261, 0.0469, 0.0148, -0.0194, 0.0250, 0.0273, 0.0080, -0.0432, 0.0424, -0.0275, 0.0040, -0.0453, 0.0082, -0.0027, 0.0117, 0.0096, 0.0347, -0.0029, -0.0015, -0.0358, 0.0474, -0.0028, 0.0321, -0.0388, -0.0086, -0.0431, -0.0225, 0.0239, 0.0343, 0.0449, 0.0499, -0.0407, 0.0103, -0.0443, -0.0286, 0.0303, -0.0247, -0.0401],[0.0140, -0.0108, -0.0440, -0.0258, 0.0243, 0.0274, 0.0469, -0.0375, -0.0071, 0.0268, 0.0056, 0.0492, 0.0137, -0.0472, 0.0428, 0.0484, -0.0159, -0.0187, 0.0064, 0.0126, 0.0235, -0.0435, -0.0369, -0.0196, -0.0152, 0.0120, -0.0137, 0.0007, -0.0154, -0.0349, 0.0061, -0.0340, -0.0018, 0.0353, -0.0338, 0.0406, -0.0332, 0.0264, 0.0186, 0.0396, -0.0009, -0.0228, 0.0383, 0.0174, 0.0039, -0.0120, 0.0066, -0.0228, 0.0196, -0.0140, -0.0453, 0.0034, -0.0422, -0.0495, -0.0172, 0.0463, -0.0222, -0.0025, -0.0311, -0.0082, 0.0090, 0.0303, 0.0340, -0.0209],[-0.0039, 0.0039, -0.0490, -0.0243, 0.0093, 0.0083, -0.0329, -0.0365, -0.0092, -0.0487, -0.0394, 0.0493, -0.0099, 0.0108, -0.0032, -0.0439, -0.0121, 0.0045, -0.0247, -0.0259, 0.0252, 0.0089, -0.0356, 0.0171, -0.0144, -0.0410, 0.0306, -0.0446, 0.0457, -0.0219, 0.0107, 0.0237, -0.0383, -0.0333, 0.0349, -0.0489, 0.0285, -0.0231, -0.0187, 0.0059, 0.0216, 0.0431, -0.0090, -0.0009, -0.0326, 0.0248, 0.0177, -0.0317, 0.0208, -0.0065, 0.0154, 0.0341, -0.0396, -0.0405, 0.0470, 0.0014, -0.0326, -0.0348, 0.0289, 0.0368, -0.0230, 0.0001, 0.0484, 0.0265],[-0.0340, -0.0120, -0.0273, 0.0397, 0.0159, 0.0096, -0.0019, -0.0027, 0.0055, -0.0441, 0.0059, 0.0500, -0.0410, 0.0473, -0.0228, 0.0352, 0.0010, -0.0163, -0.0008, 0.0282, 0.0117, -0.0224, 0.0347, -0.0267, -0.0045, -0.0332, 0.0421, 0.0128, 0.0248, 0.0496, -0.0243, -0.0297, 0.0494, 0.0141, -0.0454, -0.0010, -0.0446, -0.0350, 0.0038, 0.0332, 0.0392, 0.0237, -0.0487, -0.0001, 0.0262, -0.0204, -0.0373, -0.0379, -0.0118, 0.0445, 0.0272, -0.0122, 0.0226, -0.0176, 0.0189, -0.0322, 0.0275, 0.0123, 0.0357, -0.0401, 0.0155, 0.0311, 0.0259, 0.0304],[0.0420, 0.0387, -0.0212, -0.0401, 0.0282, -0.0341, -0.0328, -0.0146, 0.0224, 0.0144, 0.0289, -0.0288, 0.0439, 0.0256, 0.0122, 0.0183, -0.0026, 0.0079, -0.0178, -0.0155, -0.0263, 0.0409, -0.0228, -0.0323, -0.0361, -0.0488, 0.0147, 0.0367, 0.0332, -0.0219, 0.0367, 0.0488, -0.0078, -0.0450, -0.0216, 0.0233, 0.0117, -0.0246, -0.0011, 0.0351, 0.0233, -0.0028, -0.0487, -0.0099, -0.0454, 0.0286, -0.0384, 0.0313, -0.0259, 0.0428, 0.0292, 0.0198, -0.0211, 0.0147, 0.0169, -0.0307, -0.0245, 0.0359, 0.0146, 0.0282, 0.0287, -0.0179, 0.0302, -0.0336],[0.0128, -0.0334, 0.0442, 0.0420, -0.0044, 0.0327, 0.0214, -0.0231, 0.0271, 0.0454, -0.0276, -0.0300, -0.0004, 0.0065, -0.0066, 0.0023, 0.0358, 0.0320, 0.0370, 0.0224, 0.0164, 0.0239, 0.0119, 0.0319, -0.0455, -0.0334, -0.0166, 0.0173, -0.0251, 0.0186, -0.0122, 0.0414, 0.0006, -0.0253, -0.0335, -0.0341, 0.0305, 0.0322, 0.0459, 0.0455, 0.0191, 0.0231, -0.0122, 0.0016, -0.0321, 0.0014, -0.0145, -0.0438, -0.0065, -0.0136, 0.0156, 0.0376, 0.0262, -0.0280, 0.0182, 0.0417, -0.0426, -0.0188, 0.0464, -0.0223, -0.0117, 0.0314, 0.0081, 0.0183],[-0.0280, 0.0144, -0.0260, -0.0346, 0.0209, -0.0477, 0.0439, -0.0500, 0.0435, -0.0337, -0.0145, -0.0133, -0.0001, 0.0108, -0.0304, 0.0112, 0.0132, -0.0192, -0.0332, 0.0264, -0.0500, 0.0441, 0.0296, 0.0400, -0.0440, 0.0030, -0.0354, 0.0299, -0.0420, 0.0205, 0.0383, -0.0089, 0.0224, 0.0024, 0.0330, -0.0438, -0.0084, 0.0175, 0.0443, -0.0402, 0.0181, -0.0272, 0.0078, 0.0281, -0.0159, -0.0252, 0.0019, -0.0457, 0.0059, -0.0475, 0.0298, 0.0298, -0.0134, 0.0313, 0.0058, 0.0468, -0.0321, 0.0186, 0.0256, -0.0389, -0.0455, -0.0151, 0.0172, 0.0410],[0.0394, 0.0407, 0.0447, -0.0027, 0.0297, 0.0276, -0.0470, 0.0120, -0.0364, -0.0416, 0.0031, -0.0115, -0.0302, 0.0092, -0.0067, 0.0353, 0.0208, 0.0300, -0.0129, 0.0142, -0.0009, 0.0470, -0.0235, 0.0265, 0.0353, -0.0446, -0.0414, 0.0204, -0.0027, 0.0458, 0.0293, 0.0119, 0.0052, 0.0103, -0.0076, 0.0153, 0.0083, -0.0130, 0.0463, -0.0326, -0.0296, -0.0126, -0.0461, 0.0484, -0.0277, -0.0345, 0.0272, 0.0395, 0.0238, -0.0067, -0.0286, -0.0320, 0.0129, -0.0205, -0.0473, -0.0293, -0.0026, -0.0057, -0.0092, -0.0079, 0.0154, -0.0018, 0.0453, -0.0024],[0.0272, 0.0067, 0.0470, -0.0262, -0.0217, -0.0255, -0.0390, -0.0310, -0.0332, -0.0009, 0.0016, -0.0423, -0.0206, -0.0128, 0.0012, -0.0266, -0.0216, -0.0211, 0.0237, 0.0315, 0.0261, -0.0464, -0.0099, 0.0408, -0.0037, -0.0237, 0.0011, 0.0458, 0.0435, 0.0329, 0.0107, -0.0140, 0.0380, 0.0299, 0.0296, -0.0500, -0.0227, -0.0046, -0.0425, -0.0223, 0.0167, -0.0162, 0.0411, -0.0354, 0.0284, 0.0139, 0.0333, 0.0297, -0.0145, -0.0133, -0.0421, 0.0042, 0.0342, -0.0025, 0.0366, 0.0295, 0.0407, -0.0333, 0.0402, 0.0334, 0.0314, -0.0057, -0.0285, -0.0295],[-0.0367, 0.0425, 0.0477, -0.0483, -0.0248, -0.0081, 0.0434, -0.0433, 0.0033, -0.0222, 0.0041, -0.0374, -0.0247, -0.0391, 0.0202, 0.0282, 0.0014, 0.0125, 0.0028, 0.0147, 0.0115, -0.0350, 0.0302, 0.0172, 0.0409, 0.0465, 0.0114, -0.0309, 0.0470, 0.0051, 0.0490, -0.0386, 0.0294, 0.0334, 0.0346, -0.0037, 0.0339, -0.0436, 0.0288, 0.0259, 0.0094, 0.0309, 0.0409, -0.0034, 0.0222, -0.0186, 0.0425, 0.0222, 0.0278, 0.0399, -0.0422, -0.0150, -0.0466, 0.0286, 0.0076, 0.0131, -0.0199, 0.0104, 0.0356, -0.0141, 0.0488, -0.0426, -0.0084, 0.0240],[0.0247, 0.0438, 0.0149, 0.0009, -0.0092, 0.0448, -0.0346, 0.0090, 0.0497, 0.0168, 0.0140, -0.0186, 0.0491, 0.0271, -0.0144, -0.0152, 0.0468, -0.0111, -0.0242, -0.0206, 0.0400, 0.0312, -0.0167, -0.0369, 0.0035, 0.0375, -0.0205, -0.0324, -0.0259, -0.0412, 0.0274, 0.0307, 0.0132, -0.0138, -0.0324, 0.0147, -0.0050, 0.0184, -0.0188, 0.0187, 0.0489, 0.0371, -0.0360, 0.0275, 0.0273, -0.0341, 0.0398, -0.0211, -0.0349, 0.0010, -0.0297, -0.0449, 0.0478, 0.0196, -0.0087, 0.0106, 0.0188, -0.0120, 0.0036, 0.0250, 0.0018, 0.0459, -0.0356, 0.0107],[0.0128, -0.0412, 0.0326, 0.0208, 0.0221, -0.0484, -0.0480, -0.0491, -0.0499, -0.0409, -0.0112, -0.0045, 0.0151, -0.0264, 0.0058, -0.0469, 0.0145, 0.0337, 0.0298, 0.0246, -0.0419, -0.0057, 0.0227, 0.0212, 0.0066, -0.0361, 0.0231, -0.0119, -0.0003, 0.0440, 0.0336, -0.0138, -0.0122, -0.0139, -0.0407, 0.0315, 0.0400, 0.0166, -0.0375, 0.0449, 0.0424, -0.0035, 0.0420, -0.0265, -0.0441, 0.0330, -0.0400, 0.0074, -0.0479, -0.0027, -0.0082, 0.0485, -0.0398, 0.0473, 0.0001, -0.0266, 0.0477, -0.0153, -0.0038, 0.0486, 0.0499, 0.0053, -0.0278, 0.0330],[0.0239, 0.0194, -0.0459, 0.0133, -0.0226, -0.0086, 0.0011, -0.0360, -0.0358, -0.0487, 0.0052, -0.0403, 0.0025, -0.0264, -0.0124, 0.0212, 0.0148, -0.0406, -0.0421, 0.0223, -0.0432, 0.0149, -0.0344, -0.0192, 0.0191, -0.0228, 0.0393, 0.0456, -0.0300, 0.0286, -0.0480, 0.0047, 0.0088, 0.0337, -0.0336, -0.0062, -0.0008, -0.0134, -0.0004, 0.0045, -0.0426, 0.0499, -0.0099, -0.0079, -0.0061, 0.0270, 0.0146, -0.0230, -0.0234, 0.0159, 0.0493, -0.0087, -0.0407, 0.0409, -0.0050, -0.0374, 0.0467, -0.0032, 0.0039, 0.0277, 0.0282, -0.0045, 0.0412, -0.0489],[-0.0247, 0.0125, 0.0489, -0.0137, -0.0364, -0.0058, 0.0482, -0.0227, -0.0034, -0.0380, 0.0211, -0.0201, 0.0185, 0.0103, -0.0448, -0.0500, -0.0091, 0.0444, -0.0343, -0.0218, -0.0385, -0.0030, 0.0175, 0.0038, -0.0154, 0.0189, 0.0391, 0.0299, 0.0433, 0.0153, -0.0010, 0.0444, -0.0262, -0.0008, 0.0155, -0.0141, 0.0483, 0.0363, -0.0259, 0.0182, 0.0201, -0.0231, -0.0232, 0.0123, -0.0159, -0.0277, 0.0167, -0.0037, 0.0493, -0.0262, -0.0371, -0.0280, 0.0008, 0.0447, -0.0383, 0.0230, -0.0155, -0.0113, -0.0146, -0.0263, -0.0459, 0.0176, -0.0162, 0.0220],[0.0113, 0.0171, 0.0364, 0.0240, -0.0449, -0.0237, -0.0296, 0.0366, 0.0254, -0.0428, -0.0177, -0.0194, -0.0316, -0.0489, 0.0009, -0.0236, -0.0329, 0.0250, -0.0288, -0.0151, -0.0288, 0.0345, -0.0078, -0.0397, 0.0151, 0.0469, -0.0113, -0.0070, 0.0352, 0.0394, -0.0264, -0.0100, -0.0352, -0.0163, -0.0012, 0.0409, 0.0273, -0.0138, -0.0132, -0.0349, -0.0188, 0.0125, 0.0271, 0.0444, 0.0425, 0.0375, 0.0164, -0.0295, 0.0140, -0.0428, -0.0480, 0.0456, -0.0328, 0.0007, -0.0183, -0.0153, -0.0045, -0.0309, 0.0443, -0.0097, 0.0303, 0.0385, -0.0164, 0.0108],[0.0265, -0.0296, 0.0089, 0.0263, 0.0405, -0.0395, 0.0076, -0.0103, 0.0241, 0.0228, 0.0371, 0.0116, -0.0495, 0.0102, -0.0093, 0.0487, 0.0176, -0.0434, -0.0161, -0.0208, -0.0306, 0.0395, 0.0375, 0.0322, 0.0141, 0.0326, 0.0252, 0.0073, 0.0080, -0.0161, -0.0104, -0.0124, -0.0114, -0.0246, -0.0113, -0.0005, 0.0403, -0.0407, -0.0240, 0.0491, 0.0428, -0.0135, -0.0283, 0.0339, -0.0262, 0.0039, -0.0317, -0.0352, -0.0167, -0.0103, 0.0136, 0.0291, -0.0011, 0.0025, -0.0019, -0.0287, 0.0139, 0.0002, 0.0006, -0.0480, -0.0122, 0.0197, -0.0061, 0.0144],[0.0233, 0.0144, -0.0251, -0.0388, -0.0076, 0.0254, 0.0040, -0.0127, -0.0221, -0.0447, -0.0281, 0.0471, 0.0389, -0.0119, 0.0020, -0.0453, -0.0481, -0.0284, -0.0127, 0.0282, 0.0363, 0.0440, -0.0376, -0.0264, -0.0183, 0.0298, 0.0443, -0.0229, 0.0490, -0.0454, 0.0103, -0.0385, -0.0351, -0.0488, -0.0232, 0.0484, -0.0385, 0.0326, -0.0185, 0.0066, -0.0402, 0.0260, -0.0030, 0.0253, 0.0064, -0.0053, 0.0442, 0.0411, 0.0481, -0.0104, -0.0397, 0.0204, 0.0311, -0.0055, -0.0164, 0.0395, 0.0042, -0.0055, -0.0330, 0.0051, -0.0345, 0.0378, 0.0368, 0.0023],[-0.0227, -0.0232, 0.0090, 0.0386, 0.0306, -0.0243, 0.0142, -0.0450, -0.0465, -0.0267, 0.0231, -0.0152, -0.0163, 0.0465, 0.0084, 0.0497, -0.0065, 0.0430, -0.0305, -0.0150, -0.0016, 0.0260, 0.0068, -0.0370, 0.0111, -0.0367, -0.0079, 0.0385, 0.0078, 0.0103, -0.0336, -0.0086, 0.0281, 0.0011, 0.0419, 0.0204, -0.0266, 0.0237, 0.0406, -0.0040, -0.0042, 0.0089, 0.0454, -0.0098, -0.0189, -0.0030, -0.0013, -0.0109, 0.0059, -0.0482, 0.0125, -0.0026, 0.0136, 0.0077, 0.0054, 0.0351, 0.0413, -0.0070, 0.0346, 0.0410, 0.0183, -0.0068, -0.0019, -0.0427],[-0.0345, 0.0295, -0.0057, -0.0350, -0.0123, 0.0151, -0.0354, -0.0275, 0.0295, -0.0365, -0.0320, -0.0334, -0.0175, -0.0396, 0.0419, -0.0492, 0.0333, 0.0221, 0.0110, -0.0019, -0.0463, -0.0468, -0.0017, -0.0022, -0.0496, 0.0349, -0.0408, -0.0171, -0.0176, -0.0052, -0.0199, -0.0179, -0.0054, 0.0109, 0.0254, -0.0229, 0.0117, 0.0129, 0.0071, 0.0378, 0.0160, 0.0297, 0.0467, 0.0453, 0.0392, 0.0230, 0.0293, 0.0373, 0.0284, 0.0163, 0.0218, 0.0341, 0.0322, -0.0299, -0.0443, -0.0136, 0.0069, 0.0163, -0.0262, -0.0311, -0.0428, 0.0436, -0.0385, -0.0348],[-0.0354, 0.0413, -0.0077, 0.0472, 0.0104, -0.0190, 0.0078, 0.0389, 0.0173, -0.0020, -0.0448, -0.0323, -0.0062, -0.0286, -0.0112, -0.0147, 0.0120, -0.0335, -0.0210, 0.0152, -0.0011, -0.0266, 0.0111, 0.0050, -0.0359, 0.0187, -0.0391, 0.0300, 0.0138, 0.0100, 0.0379, -0.0170, 0.0223, 0.0235, -0.0425, -0.0166, 0.0379, -0.0320, 0.0251, -0.0028, 0.0414, -0.0281, -0.0255, -0.0327, 0.0116, 0.0021, -0.0493, -0.0353, -0.0222, 0.0071, -0.0112, 0.0304, -0.0242, -0.0269, -0.0258, -0.0120, 0.0438, 0.0365, -0.0042, -0.0010, -0.0472, -0.0035, 0.0185, 0.0491],[0.0122, 0.0089, -0.0375, 0.0215, 0.0171, -0.0179, 0.0287, 0.0354, -0.0404, 0.0352, -0.0431, 0.0424, -0.0343, 0.0139, 0.0093, -0.0477, -0.0347, -0.0100, -0.0073, 0.0053, -0.0028, -0.0049, 0.0397, -0.0159, 0.0099, -0.0387, 0.0153, 0.0467, 0.0006, -0.0154, -0.0067, -0.0241, -0.0185, -0.0255, 0.0320, 0.0377, 0.0245, -0.0066, -0.0034, -0.0092, -0.0485, 0.0444, 0.0209, 0.0092, -0.0326, 0.0071, -0.0024, 0.0494, -0.0062, -0.0221, -0.0174, 0.0370, 0.0272, -0.0349, 0.0047, 0.0275, -0.0489, 0.0328, -0.0402, -0.0042, 0.0303, -0.0256, 0.0101, -0.0333],[0.0329, -0.0279, -0.0279, 0.0387, -0.0202, 0.0349, 0.0038, 0.0150, 0.0156, -0.0033, 0.0441, -0.0370, -0.0372, -0.0322, 0.0210, 0.0016, -0.0115, 0.0470, -0.0448, -0.0474, -0.0339, 0.0368, -0.0456, -0.0013, 0.0169, -0.0004, -0.0336, -0.0280, 0.0158, 0.0270, 0.0128, 0.0369, 0.0127, 0.0221, 0.0432, 0.0401, 0.0070, 0.0426, -0.0357, -0.0327, 0.0280, -0.0110, -0.0454, 0.0397, 0.0085, -0.0371, 0.0398, 0.0316, -0.0418, -0.0456, 0.0425, 0.0270, -0.0150, 0.0280, -0.0151, -0.0259, -0.0406, 0.0413, -0.0281, 0.0301, -0.0487, 0.0243, -0.0131, 0.0123],[0.0281, 0.0389, 0.0143, -0.0288, -0.0222, -0.0498, 0.0123, -0.0224, -0.0158, -0.0299, -0.0085, -0.0155, 0.0029, 0.0146, -0.0356, -0.0372, -0.0171, -0.0116, 0.0034, 0.0143, -0.0085, -0.0156, 0.0332, -0.0267, -0.0455, 0.0316, 0.0007, -0.0477, -0.0355, 0.0143, -0.0012, -0.0043, -0.0162, 0.0053, -0.0366, -0.0398, -0.0441, -0.0366, -0.0115, 0.0149, 0.0072, 0.0112, -0.0460, 0.0019, -0.0130, 0.0252, -0.0045, -0.0422, -0.0310, -0.0246, 0.0419, -0.0037, 0.0223, -0.0321, -0.0411, 0.0430, 0.0315, -0.0181, -0.0174, 0.0112, 0.0136, -0.0262, -0.0183, 0.0288],[-0.0102, -0.0023, 0.0415, 0.0400, -0.0054, 0.0362, -0.0091, -0.0473, -0.0189, 0.0310, -0.0337, 0.0444, 0.0008, 0.0047, 0.0473, -0.0244, 0.0138, -0.0139, -0.0376, -0.0074, 0.0144, 0.0152, -0.0037, -0.0187, 0.0280, 0.0396, 0.0258, 0.0419, 0.0381, -0.0038, 0.0209, 0.0216, -0.0028, -0.0340, -0.0319, 0.0190, -0.0319, -0.0015, 0.0026, 0.0255, 0.0031, 0.0287, -0.0471, -0.0117, -0.0418, 0.0173, 0.0281, 0.0300, -0.0215, -0.0179, 0.0229, -0.0320, -0.0440, 0.0152, 0.0123, 0.0255, -0.0154, -0.0405, 0.0246, -0.0360, 0.0245, 0.0385, 0.0105, -0.0037],[0.0234, -0.0369, 0.0018, -0.0410, -0.0134, 0.0463, 0.0062, -0.0050, -0.0379, 0.0133, -0.0035, -0.0154, -0.0303, 0.0375, -0.0239, 0.0279, 0.0421, 0.0444, 0.0217, -0.0450, 0.0184, 0.0483, 0.0335, 0.0496, 0.0317, -0.0412, 0.0354, 0.0433, -0.0052, -0.0080, 0.0467, 0.0290, -0.0057, -0.0126, -0.0026, -0.0465, -0.0468, 0.0284, 0.0246, -0.0355, 0.0435, 0.0443, -0.0271, -0.0086, -0.0296, -0.0265, 0.0158, 0.0480, 0.0309, 0.0333, 0.0168, 0.0442, 0.0284, -0.0341, -0.0460, -0.0381, 0.0098, 0.0167, 0.0141, -0.0303, -0.0420, -0.0261, 0.0096, 0.0295],[-0.0453, 0.0422, -0.0011, -0.0230, -0.0049, -0.0290, -0.0158, -0.0105, -0.0092, -0.0115, 0.0278, -0.0042, -0.0050, 0.0056, -0.0130, -0.0025, 0.0208, 0.0299, -0.0209, -0.0141, 0.0009, -0.0041, 0.0082, -0.0398, -0.0496, 0.0388, 0.0305, -0.0317, 0.0393, 0.0317, -0.0263, -0.0385, 0.0259, -0.0385, 0.0452, 0.0446, -0.0110, 0.0472, 0.0104, -0.0444, -0.0288, -0.0278, 0.0250, -0.0051, 0.0096, -0.0046, -0.0032, 0.0018, -0.0164, -0.0269, 0.0126, -0.0051, 0.0373, -0.0062, -0.0204, -0.0281, 0.0310, -0.0377, -0.0238, -0.0328, -0.0369, -0.0162, -0.0332, -0.0452],[-0.0076, -0.0106, 0.0226, -0.0192, -0.0180, 0.0170, 0.0460, 0.0371, -0.0335, -0.0101, 0.0382, -0.0337, 0.0303, -0.0139, 0.0418, -0.0361, -0.0456, 0.0229, -0.0162, -0.0121, 0.0410, 0.0108, 0.0367, -0.0448, -0.0047, 0.0171, 0.0022, -0.0458, -0.0260, -0.0172, 0.0036, 0.0104, -0.0297, -0.0322, 0.0205, -0.0420, 0.0479, 0.0326, 0.0233, -0.0461, 0.0243, -0.0454, -0.0018, -0.0237, -0.0441, 0.0197, 0.0174, 0.0228, 0.0478, 0.0458, -0.0428, 0.0170, 0.0206, -0.0162, -0.0068, -0.0488, 0.0418, -0.0325, -0.0113, -0.0351, 0.0134, 0.0119, 0.0358, 0.0458],[-0.0048, -0.0423, -0.0159, 0.0128, -0.0075, 0.0387, -0.0250, 0.0130, -0.0265, 0.0375, 0.0388, -0.0101, 0.0420, 0.0386, 0.0360, 0.0035, 0.0276, 0.0378, 0.0088, 0.0480, 0.0363, 0.0181, -0.0265, 0.0148, -0.0009, -0.0428, -0.0367, 0.0152, -0.0339, -0.0165, 0.0289, 0.0267, -0.0196, 0.0319, -0.0373, 0.0443, -0.0167, -0.0188, -0.0449, -0.0195, 0.0450, 0.0018, -0.0362, 0.0196, -0.0308, 0.0450, -0.0360, 0.0073, 0.0472, -0.0462, -0.0233, -0.0246, 0.0397, 0.0085, 0.0371, 0.0062, -0.0097, -0.0287, 0.0356, 0.0066, 0.0335, -0.0437, 0.0271, 0.0311],[0.0327, 0.0071, -0.0052, -0.0434, -0.0452, 0.0443, 0.0315, 0.0286, 0.0051, 0.0114, 0.0193, 0.0183, -0.0011, -0.0316, -0.0319, -0.0036, 0.0155, 0.0198, -0.0062, -0.0481, -0.0491, 0.0283, 0.0493, -0.0456, -0.0473, 0.0386, -0.0380, 0.0328, -0.0496, -0.0311, -0.0396, -0.0316, -0.0329, 0.0306, 0.0238, 0.0313, -0.0196, 0.0188, -0.0067, -0.0119, -0.0366, 0.0045, 0.0340, -0.0430, 0.0248, 0.0275, 0.0472, -0.0289, 0.0080, 0.0432, 0.0249, -0.0319, -0.0239, 0.0285, -0.0263, 0.0253, 0.0035, 0.0430, -0.0343, 0.0204, -0.0112, -0.0051, 0.0284, -0.0456],[-0.0130, -0.0025, -0.0231, 0.0352, -0.0279, -0.0279, -0.0061, 0.0384, 0.0080, -0.0125, -0.0064, 0.0449, -0.0371, 0.0393, 0.0052, 0.0093, 0.0127, -0.0421, 0.0477, -0.0011, 0.0202, 0.0252, 0.0042, 0.0131, -0.0342, 0.0014, 0.0482, 0.0177, -0.0069, 0.0168, -0.0039, -0.0196, 0.0037, -0.0489, -0.0056, -0.0273, -0.0318, -0.0075, 0.0086, -0.0090, 0.0209, -0.0262, 0.0199, -0.0207, -0.0094, 0.0042, -0.0025, 0.0010, -0.0385, -0.0140, 0.0002, 0.0059, -0.0295, 0.0054, -0.0071, -0.0242, 0.0314, 0.0441, -0.0158, 0.0310, -0.0363, -0.0452, -0.0278, 0.0057],[0.0347, 0.0020, 0.0167, -0.0180, 0.0222, -0.0409, 0.0461, 0.0085, 0.0013, 0.0444, -0.0040, -0.0409, 0.0426, 0.0111, 0.0406, -0.0269, 0.0222, 0.0497, 0.0182, 0.0423, 0.0232, -0.0423, -0.0332, 0.0332, 0.0247, 0.0011, -0.0185, 0.0306, -0.0216, -0.0327, 0.0457, 0.0095, -0.0198, -0.0187, -0.0169, -0.0085, 0.0256, 0.0371, 0.0474, 0.0084, -0.0152, -0.0022, -0.0074, -0.0355, 0.0389, 0.0492, -0.0361, 0.0285, -0.0103, -0.0296, -0.0364, 0.0351, -0.0256, 0.0376, -0.0210, 0.0400, 0.0191, 0.0443, -0.0376, 0.0123, -0.0491, -0.0222, 0.0098, -0.0455],[-0.0207, -0.0251, 0.0060, 0.0337, 0.0419, -0.0333, 0.0360, -0.0426, -0.0374, 0.0267, -0.0491, -0.0376, 0.0476, -0.0349, -0.0053, -0.0299, -0.0182, 0.0199, -0.0306, 0.0462, -0.0161, 0.0025, 0.0317, -0.0083, 0.0233, 0.0432, -0.0041, 0.0302, 0.0076, 0.0002, -0.0209, 0.0185, 0.0494, -0.0218, 0.0036, -0.0223, -0.0062, 0.0362, 0.0468, 0.0336, -0.0119, 0.0386, -0.0332, -0.0361, 0.0088, 0.0064, -0.0342, 0.0092, -0.0335, 0.0348, -0.0437, 0.0059, -0.0193, 0.0266, 0.0482, -0.0474, 0.0170, -0.0346, -0.0035, -0.0434, -0.0307, -0.0410, -0.0353, 0.0235],[0.0461, 0.0467, -0.0241, 0.0212, -0.0480, 0.0135, -0.0336, -0.0038, -0.0493, -0.0215, -0.0497, -0.0436, 0.0037, -0.0170, -0.0341, -0.0065, 0.0005, 0.0411, 0.0222, -0.0465, 0.0225, -0.0386, -0.0273, -0.0384, -0.0015, 0.0162, -0.0463, 0.0116, 0.0103, -0.0174, 0.0111, 0.0213, -0.0303, 0.0415, -0.0418, 0.0299, -0.0006, -0.0067, -0.0302, -0.0379, 0.0385, 0.0250, 0.0227, -0.0475, -0.0050, -0.0232, -0.0023, -0.0482, 0.0495, 0.0237, 0.0368, 0.0499, 0.0065, 0.0350, -0.0059, -0.0192, 0.0160, 0.0350, -0.0050, -0.0364, -0.0313, -0.0498, -0.0121, 0.0261],[-0.0283, 0.0480, -0.0209, -0.0080, 0.0361, -0.0378, 0.0039, 0.0038, 0.0489, 0.0269, -0.0304, 0.0222, 0.0224, 0.0057, -0.0109, -0.0442, 0.0339, -0.0145, -0.0213, -0.0166, -0.0096, -0.0066, -0.0228, -0.0045, -0.0148, -0.0438, -0.0266, 0.0211, -0.0448, 0.0121, 0.0151, 0.0156, 0.0364, -0.0496, 0.0179, 0.0438, -0.0314, -0.0018, 0.0279, -0.0108, -0.0164, -0.0107, 0.0020, 0.0185, 0.0458, -0.0413, -0.0420, -0.0201, 0.0261, 0.0007, -0.0348, 0.0203, -0.0176, -0.0003, -0.0042, 0.0269, -0.0355, 0.0478, -0.0465, 0.0431, -0.0099, -0.0376, -0.0136, 0.0429],[-0.0480, -0.0152, 0.0065, 0.0145, -0.0394, -0.0496, 0.0463, -0.0385, 0.0247, -0.0398, 0.0423, -0.0154, 0.0338, -0.0418, -0.0210, -0.0464, 0.0086, -0.0271, 0.0039, 0.0010, 0.0147, -0.0156, -0.0328, 0.0304, 0.0207, -0.0221, -0.0013, -0.0061, -0.0139, -0.0184, -0.0013, 0.0034, 0.0342, 0.0002, 0.0047, 0.0374, 0.0041, 0.0492, 0.0344, -0.0298, -0.0284, 0.0275, 0.0500, 0.0037, 0.0400, 0.0243, 0.0338, -0.0439, -0.0311, -0.0416, 0.0339, -0.0021, 0.0137, -0.0309, -0.0115, -0.0336, -0.0225, -0.0401, 0.0197, 0.0161, -0.0229, -0.0353, -0.0154, -0.0496],[-0.0408, 0.0423, -0.0404, 0.0005, 0.0384, 0.0285, 0.0374, -0.0295, 0.0046, 0.0223, -0.0389, 0.0498, -0.0135, -0.0166, -0.0477, 0.0057, 0.0258, 0.0008, 0.0425, 0.0019, 0.0320, -0.0165, -0.0475, 0.0372, -0.0183, 0.0321, -0.0350, -0.0329, 0.0344, -0.0136, 0.0271, 0.0105, 0.0324, 0.0196, -0.0071, -0.0104, 0.0261, 0.0442, 0.0349, 0.0177, -0.0016, -0.0322, -0.0041, 0.0197, 0.0327, -0.0403, -0.0469, -0.0173, -0.0176, 0.0231, 0.0384, -0.0443, 0.0073, -0.0049, 0.0390, 0.0243, -0.0347, 0.0460, -0.0087, 0.0314, 0.0465, -0.0115, 0.0472, -0.0224],[0.0108, 0.0363, 0.0095, -0.0008, 0.0432, 0.0298, 0.0024, 0.0376, -0.0358, 0.0345, -0.0109, 0.0251, -0.0002, -0.0198, -0.0054, -0.0094, -0.0187, 0.0102, 0.0431, 0.0045, -0.0402, -0.0427, -0.0414, 0.0159, -0.0438, -0.0144, 0.0250, 0.0353, -0.0262, -0.0419, 0.0329, -0.0114, 0.0032, -0.0150, 0.0150, -0.0076, -0.0095, -0.0151, 0.0027, 0.0371, -0.0111, 0.0145, 0.0308, 0.0008, -0.0101, 0.0254, 0.0221, -0.0369, 0.0275, 0.0106, -0.0411, -0.0125, -0.0429, -0.0396, 0.0025, 0.0303, 0.0323, 0.0030, 0.0192, 0.0336, 0.0013, -0.0296, -0.0085, -0.0041],[0.0471, 0.0250, -0.0123, -0.0088, -0.0285, -0.0480, 0.0110, 0.0500, 0.0276, -0.0257, 0.0123, 0.0349, -0.0351, 0.0065, 0.0435, -0.0010, -0.0325, 0.0403, 0.0415, 0.0410, 0.0037, -0.0193, 0.0252, -0.0110, 0.0290, -0.0332, 0.0082, -0.0031, -0.0040, -0.0457, 0.0339, -0.0361, -0.0025, 0.0429, -0.0103, -0.0019, 0.0261, -0.0221, -0.0461, -0.0418, -0.0494, -0.0182, -0.0148, 0.0412, -0.0452, -0.0038, -0.0457, -0.0492, 0.0482, -0.0112, -0.0305, 0.0325, 0.0445, -0.0346, 0.0423, -0.0407, -0.0047, 0.0453, -0.0464, 0.0271, -0.0356, 0.0005, -0.0165, 0.0300],[0.0323, -0.0217, 0.0004, -0.0063, -0.0134, 0.0051, -0.0017, -0.0055, -0.0375, 0.0480, -0.0004, -0.0283, -0.0346, 0.0369, -0.0457, 0.0060, -0.0141, -0.0239, -0.0175, -0.0070, -0.0088, -0.0371, -0.0320, 0.0476, 0.0161, 0.0124, -0.0396, 0.0007, 0.0226, 0.0001, 0.0432, 0.0403, 0.0021, -0.0491, -0.0203, 0.0117, -0.0183, 0.0292, 0.0266, 0.0423, 0.0383, 0.0349, 0.0458, -0.0099, -0.0100, 0.0297, 0.0213, 0.0153, -0.0340, 0.0232, 0.0224, 0.0255, -0.0205, -0.0099, 0.0265, -0.0483, -0.0117, 0.0318, -0.0098, -0.0375, 0.0196, 0.0419, -0.0485, -0.0142],[-0.0136, -0.0189, 0.0085, -0.0393, 0.0222, 0.0181, 0.0074, -0.0265, 0.0163, -0.0422, 0.0035, 0.0468, -0.0284, 0.0170, 0.0112, 0.0160, -0.0178, -0.0100, -0.0145, 0.0001, -0.0448, 0.0255, -0.0132, -0.0402, 0.0084, 0.0387, 0.0020, 0.0470, 0.0410, 0.0344, 0.0426, -0.0359, 0.0033, -0.0209, -0.0109, -0.0183, 0.0285, 0.0107, -0.0106, 0.0276, -0.0122, 0.0481, 0.0228, -0.0177, 0.0310, 0.0237, 0.0096, 0.0403, -0.0380, 0.0014, -0.0191, 0.0138, 0.0203, 0.0442, -0.0042, 0.0294, 0.0267, -0.0010, 0.0450, -0.0117, 0.0121, -0.0156, -0.0105, -0.0344],[0.0406, -0.0181, -0.0028, 0.0186, -0.0369, -0.0426, 0.0249, -0.0456, 0.0287, 0.0181, 0.0244, 0.0368, -0.0201, -0.0500, -0.0198, 0.0295, -0.0213, -0.0045, 0.0476, 0.0300, 0.0267, -0.0391, -0.0096, -0.0310, -0.0233, -0.0182, 0.0390, 0.0007, 0.0314, 0.0032, -0.0318, 0.0296, 0.0436, 0.0028, -0.0019, 0.0308, 0.0454, 0.0465, -0.0493, -0.0337, -0.0373, -0.0121, 0.0487, -0.0283, -0.0492, -0.0318, 0.0252, -0.0330, 0.0268, 0.0382, -0.0252, -0.0115, 0.0389, -0.0005, -0.0107, 0.0388, -0.0456, 0.0220, -0.0049, 0.0082, -0.0094, -0.0084, -0.0444, -0.0396]], b2: [-0.0350, 0.0433, -0.0234, -0.0428, -0.0189, -0.0307, 0.0032, -0.0096, -0.0016, -0.0290, -0.0171, -0.0175, -0.0118, -0.0238, -0.0368, 0.0016, -0.0008, -0.0213, 0.0253, -0.0290, -0.0270, -0.0171, -0.0368, -0.0080, 0.0254, 0.0352, -0.0313, -0.0268, 0.0414, 0.0202, 0.0036, -0.0047, -0.0072, -0.0036, -0.0145, -0.0082, -0.0084, -0.0331, -0.0441, 0.0037, 0.0471, 0.0059, -0.0476, -0.0295, -0.0388, 0.0294, 0.0115, 0.0269, 0.0214, -0.0383, -0.0382, 0.0196, -0.0212, 0.0102, -0.0337, -0.0076, -0.0477, -0.0089, -0.0218, 0.0228, 0.0496, 0.0238, -0.0051, -0.0138],
        w3: [[-0.0125, 0.0434, -0.0249, -0.0023, -0.0411, -0.0069, -0.0123, -0.0201, -0.0426, -0.0257, 0.0375, 0.0122, 0.0209, 0.0260, -0.0197, -0.0370, -0.0170, 0.0153, -0.0187, -0.0238, -0.0411, -0.0120, 0.0156, -0.0135, -0.0459, -0.0214, 0.0234, -0.0164, -0.0482, -0.0276, -0.0164, 0.0136],[0.0394, -0.0026, -0.0006, 0.0379, -0.0304, 0.0290, 0.0030, 0.0060, 0.0160, 0.0304, 0.0463, 0.0385, 0.0309, -0.0176, 0.0238, 0.0435, 0.0192, -0.0039, 0.0245, -0.0216, -0.0069, 0.0222, -0.0333, 0.0258, -0.0439, 0.0192, -0.0372, 0.0320, -0.0408, -0.0491, 0.0188, 0.0444],[-0.0098, 0.0305, -0.0407, -0.0383, 0.0152, 0.0190, -0.0040, 0.0128, 0.0413, 0.0463, 0.0046, -0.0089, 0.0258, -0.0389, 0.0468, 0.0123, -0.0103, -0.0163, -0.0342, -0.0394, -0.0476, 0.0029, -0.0330, 0.0314, 0.0354, -0.0225, -0.0480, -0.0096, -0.0229, 0.0162, -0.0204, 0.0334],[0.0096, -0.0260, 0.0025, -0.0101, -0.0202, 0.0247, 0.0427, 0.0275, 0.0384, 0.0345, -0.0473, -0.0381, -0.0294, 0.0367, -0.0022, 0.0381, -0.0441, -0.0388, 0.0068, 0.0077, 0.0340, -0.0356, 0.0027, 0.0095, -0.0474, -0.0420, -0.0329, -0.0106, 0.0242, 0.0036, 0.0193, -0.0048],[-0.0144, -0.0304, 0.0004, 0.0051, 0.0364, 0.0148, 0.0267, -0.0045, 0.0280, 0.0076, -0.0382, 0.0240, 0.0243, 0.0048, -0.0204, 0.0433, -0.0376, 0.0264, -0.0130, 0.0470, -0.0129, 0.0103, 0.0055, -0.0451, -0.0390, -0.0094, -0.0171, -0.0452, 0.0406, 0.0177, -0.0426, 0.0212],[0.0218, -0.0236, -0.0426, -0.0170, -0.0314, 0.0229, 0.0071, 0.0469, -0.0104, 0.0058, -0.0424, 0.0339, -0.0193, 0.0086, -0.0152, 0.0325, -0.0397, -0.0163, -0.0347, 0.0355, -0.0316, -0.0355, 0.0340, -0.0367, -0.0372, 0.0305, -0.0486, -0.0452, 0.0264, 0.0472, 0.0463, -0.0275],[-0.0387, 0.0059, 0.0240, -0.0078, 0.0022, 0.0421, 0.0312, -0.0442, -0.0324, 0.0466, -0.0073, 0.0050, -0.0378, 0.0207, -0.0178, -0.0187, -0.0257, 0.0315, -0.0115, 0.0177, -0.0359, -0.0275, 0.0475, -0.0415, 0.0239, -0.0371, 0.0181, -0.0045, 0.0314, 0.0344, 0.0427, 0.0172],[-0.0293, -0.0281, -0.0200, 0.0063, 0.0436, -0.0456, 0.0103, 0.0051, 0.0397, -0.0298, 0.0447, -0.0197, -0.0476, 0.0196, 0.0065, 0.0128, -0.0500, 0.0224, 0.0220, 0.0304, 0.0325, -0.0341, -0.0276, -0.0263, 0.0130, 0.0127, -0.0088, -0.0364, -0.0461, -0.0363, -0.0414, -0.0073],[0.0335, -0.0133, -0.0323, -0.0434, -0.0022, 0.0345, -0.0271, 0.0339, 0.0289, -0.0149, 0.0217, 0.0434, 0.0221, 0.0368, -0.0409, 0.0043, -0.0492, 0.0344, 0.0478, -0.0171, 0.0392, 0.0130, -0.0304, 0.0330, -0.0177, 0.0419, 0.0281, -0.0095, 0.0031, -0.0125, -0.0407, 0.0213],[-0.0474, 0.0030, -0.0400, 0.0404, 0.0180, 0.0145, -0.0078, 0.0025, -0.0015, 0.0193, 0.0099, 0.0318, 0.0382, 0.0030, -0.0375, 0.0390, 0.0166, 0.0272, -0.0136, -0.0067, -0.0458, -0.0444, 0.0477, -0.0454, 0.0014, 0.0012, -0.0277, -0.0075, -0.0383, -0.0284, -0.0490, 0.0258],[-0.0418, -0.0234, 0.0481, 0.0490, 0.0241, -0.0085, -0.0084, -0.0396, 0.0150, 0.0172, -0.0174, -0.0434, -0.0467, -0.0363, -0.0157, 0.0123, -0.0216, 0.0279, -0.0462, -0.0471, 0.0061, -0.0254, 0.0276, -0.0289, -0.0152, -0.0405, -0.0215, 0.0208, -0.0172, -0.0410, -0.0207, -0.0332],[-0.0436, -0.0181, -0.0054, 0.0271, -0.0006, 0.0422, -0.0083, 0.0158, -0.0097, 0.0452, -0.0431, -0.0289, -0.0458, 0.0025, 0.0054, -0.0466, 0.0379, -0.0222, -0.0406, -0.0308, -0.0011, -0.0238, 0.0448, 0.0162, 0.0227, 0.0332, -0.0148, 0.0169, 0.0113, 0.0232, -0.0496, -0.0305],[-0.0396, -0.0319, -0.0442, -0.0497, 0.0246, -0.0427, -0.0102, 0.0083, -0.0121, -0.0190, -0.0158, 0.0389, 0.0367, -0.0392, -0.0185, -0.0281, 0.0401, -0.0255, 0.0340, -0.0100, 0.0415, 0.0230, -0.0389, 0.0281, 0.0220, -0.0172, -0.0280, -0.0279, -0.0411, -0.0400, 0.0379, 0.0411],[0.0395, -0.0132, 0.0158, -0.0441, -0.0227, -0.0226, -0.0106, 0.0144, 0.0373, 0.0499, 0.0106, 0.0019, 0.0406, 0.0470, -0.0096, -0.0434, 0.0478, -0.0209, 0.0346, 0.0454, 0.0447, 0.0137, 0.0306, 0.0090, 0.0468, 0.0098, -0.0418, -0.0145, -0.0068, -0.0282, 0.0363, -0.0139],[0.0332, -0.0067, 0.0034, 0.0434, -0.0165, 0.0372, -0.0496, -0.0064, -0.0104, 0.0398, -0.0330, 0.0134, -0.0498, 0.0356, 0.0121, -0.0270, 0.0469, -0.0227, -0.0024, 0.0454, -0.0298, -0.0107, 0.0067, -0.0484, 0.0005, 0.0389, 0.0100, -0.0465, -0.0357, -0.0298, 0.0241, -0.0373],[-0.0191, -0.0019, -0.0444, -0.0094, -0.0342, -0.0444, 0.0029, 0.0332, -0.0009, 0.0409, 0.0487, -0.0254, 0.0374, 0.0427, -0.0366, 0.0189, -0.0118, -0.0085, -0.0047, -0.0062, 0.0375, 0.0364, -0.0341, -0.0200, -0.0238, -0.0299, -0.0314, -0.0107, -0.0174, -0.0096, 0.0256, -0.0059],[-0.0409, -0.0457, 0.0472, 0.0025, -0.0101, 0.0382, 0.0458, -0.0265, 0.0210, 0.0208, -0.0372, 0.0024, -0.0214, -0.0486, -0.0168, 0.0238, 0.0250, -0.0491, 0.0315, -0.0417, 0.0178, -0.0010, -0.0336, 0.0054, -0.0374, -0.0402, -0.0392, 0.0423, 0.0207, -0.0042, -0.0270, -0.0368],[-0.0017, 0.0017, 0.0364, -0.0077, -0.0246, 0.0381, 0.0311, -0.0231, 0.0345, -0.0110, 0.0048, -0.0346, -0.0125, -0.0102, -0.0253, -0.0186, 0.0009, -0.0068, 0.0155, 0.0061, -0.0099, -0.0147, 0.0108, -0.0198, 0.0499, 0.0003, 0.0115, -0.0472, -0.0141, -0.0000, 0.0252, 0.0038],[0.0130, 0.0418, 0.0297, -0.0372, -0.0441, -0.0247, 0.0155, 0.0146, -0.0041, 0.0479, 0.0003, -0.0107, -0.0326, -0.0407, 0.0330, 0.0494, 0.0498, -0.0108, 0.0489, 0.0261, -0.0007, -0.0420, 0.0061, 0.0367, 0.0136, 0.0444, 0.0076, -0.0046, 0.0139, 0.0478, -0.0387, -0.0298],[0.0440, -0.0126, 0.0372, -0.0186, 0.0073, 0.0117, -0.0421, -0.0167, 0.0352, 0.0482, 0.0332, -0.0054, 0.0032, 0.0413, -0.0057, -0.0038, -0.0206, 0.0339, 0.0378, 0.0387, 0.0125, 0.0284, -0.0487, -0.0009, 0.0218, -0.0493, 0.0488, -0.0108, -0.0051, 0.0141, 0.0280, 0.0452],[0.0283, -0.0223, -0.0409, 0.0488, -0.0143, -0.0242, -0.0363, 0.0440, 0.0339, -0.0392, -0.0326, 0.0396, -0.0127, -0.0383, -0.0359, 0.0351, 0.0177, -0.0149, 0.0145, -0.0174, -0.0312, 0.0446, 0.0318, -0.0138, -0.0329, 0.0482, 0.0146, -0.0475, 0.0329, 0.0370, -0.0081, 0.0408],[0.0033, -0.0373, -0.0074, -0.0168, -0.0224, 0.0208, -0.0363, 0.0487, -0.0293, 0.0071, 0.0449, -0.0149, 0.0262, -0.0382, -0.0473, 0.0195, 0.0058, 0.0194, -0.0281, 0.0235, 0.0185, -0.0238, 0.0132, -0.0224, 0.0166, -0.0321, -0.0264, 0.0371, 0.0028, -0.0247, 0.0293, -0.0325],[-0.0304, -0.0284, 0.0279, 0.0128, -0.0212, 0.0097, 0.0411, -0.0147, -0.0153, 0.0015, -0.0470, 0.0271, -0.0071, -0.0365, -0.0349, -0.0287, 0.0496, 0.0361, 0.0126, 0.0385, 0.0288, 0.0067, -0.0181, 0.0469, 0.0393, -0.0235, 0.0310, 0.0188, 0.0035, 0.0197, 0.0067, 0.0494],[-0.0399, -0.0389, 0.0329, 0.0397, 0.0120, -0.0421, 0.0276, 0.0325, -0.0244, -0.0221, -0.0342, -0.0020, 0.0097, 0.0081, 0.0040, -0.0124, -0.0267, -0.0064, -0.0245, 0.0035, -0.0291, -0.0006, -0.0104, 0.0283, -0.0384, 0.0136, 0.0480, 0.0414, 0.0430, -0.0281, -0.0191, 0.0169],[-0.0302, 0.0364, -0.0056, -0.0157, -0.0408, 0.0219, -0.0094, 0.0412, 0.0221, -0.0190, 0.0065, -0.0155, -0.0246, 0.0085, -0.0083, -0.0479, 0.0121, 0.0065, -0.0091, -0.0221, 0.0037, -0.0488, 0.0119, 0.0228, 0.0429, 0.0482, -0.0397, 0.0240, 0.0430, 0.0212, -0.0403, -0.0491],[0.0370, -0.0227, 0.0174, 0.0158, 0.0322, 0.0331, 0.0067, -0.0366, -0.0160, -0.0319, 0.0015, -0.0419, 0.0311, 0.0369, 0.0178, -0.0238, 0.0265, -0.0120, 0.0481, -0.0243, -0.0422, 0.0365, 0.0294, -0.0106, 0.0418, 0.0271, -0.0355, -0.0377, 0.0286, -0.0451, -0.0375, 0.0291],[-0.0451, -0.0157, -0.0033, 0.0195, -0.0262, 0.0366, -0.0468, -0.0143, -0.0314, 0.0147, 0.0454, 0.0473, -0.0244, -0.0112, -0.0290, 0.0222, 0.0348, -0.0058, 0.0378, -0.0448, 0.0391, 0.0228, 0.0091, 0.0232, 0.0237, 0.0310, 0.0266, 0.0108, -0.0296, 0.0440, 0.0090, 0.0458],[-0.0418, -0.0082, 0.0199, -0.0247, 0.0328, -0.0058, 0.0408, 0.0094, 0.0393, 0.0167, -0.0387, 0.0328, 0.0447, 0.0374, -0.0153, -0.0061, 0.0286, -0.0067, 0.0215, -0.0294, 0.0269, 0.0174, 0.0012, 0.0040, 0.0218, 0.0296, 0.0072, -0.0217, 0.0378, 0.0403, 0.0330, 0.0198],[-0.0448, 0.0165, 0.0113, -0.0073, -0.0233, -0.0203, 0.0335, -0.0094, 0.0202, -0.0039, -0.0105, 0.0399, 0.0485, -0.0160, 0.0125, -0.0148, -0.0479, 0.0235, -0.0111, 0.0456, -0.0211, -0.0224, 0.0497, 0.0090, 0.0153, 0.0459, 0.0413, -0.0296, 0.0354, 0.0114, 0.0010, -0.0113],[0.0382, -0.0200, -0.0392, 0.0331, -0.0492, -0.0170, 0.0143, 0.0213, -0.0246, -0.0195, 0.0467, 0.0469, 0.0237, 0.0379, -0.0420, -0.0194, -0.0115, -0.0341, 0.0210, 0.0134, 0.0251, 0.0025, 0.0128, 0.0104, 0.0294, -0.0061, -0.0313, 0.0068, -0.0466, -0.0274, 0.0086, 0.0132],[-0.0187, -0.0178, 0.0306, -0.0290, -0.0354, -0.0488, 0.0415, -0.0377, 0.0407, 0.0221, -0.0075, 0.0178, 0.0196, 0.0369, -0.0383, -0.0000, 0.0436, -0.0116, 0.0008, -0.0082, -0.0367, 0.0347, -0.0264, -0.0500, 0.0158, -0.0357, 0.0214, 0.0142, 0.0118, 0.0414, 0.0321, -0.0215],[-0.0302, 0.0241, -0.0223, -0.0229, -0.0151, 0.0483, 0.0197, 0.0128, 0.0234, 0.0051, -0.0009, -0.0396, -0.0231, 0.0216, -0.0341, 0.0045, 0.0190, 0.0474, -0.0308, -0.0394, -0.0398, -0.0442, 0.0451, 0.0375, -0.0273, -0.0334, -0.0042, -0.0386, -0.0007, -0.0135, -0.0139, 0.0158],[-0.0106, -0.0078, -0.0452, -0.0062, -0.0416, 0.0289, -0.0380, 0.0078, -0.0452, -0.0105, 0.0343, 0.0473, 0.0294, 0.0289, -0.0336, 0.0419, -0.0118, 0.0086, -0.0162, -0.0468, 0.0204, -0.0302, 0.0245, 0.0067, -0.0340, 0.0450, -0.0410, -0.0419, 0.0087, 0.0351, -0.0236, 0.0018],[-0.0373, -0.0059, -0.0389, 0.0191, -0.0399, -0.0148, -0.0196, 0.0146, 0.0492, 0.0223, 0.0323, 0.0298, -0.0423, -0.0226, -0.0254, -0.0283, 0.0357, 0.0371, -0.0047, -0.0494, -0.0221, -0.0473, 0.0097, 0.0196, -0.0467, -0.0116, -0.0036, -0.0468, -0.0339, 0.0441, 0.0066, 0.0039],[0.0180, 0.0110, 0.0113, 0.0261, -0.0345, 0.0335, -0.0200, 0.0221, -0.0066, 0.0118, -0.0389, 0.0184, -0.0119, -0.0090, 0.0099, -0.0183, -0.0320, -0.0468, 0.0088, 0.0015, 0.0239, -0.0235, -0.0044, 0.0490, 0.0475, -0.0242, -0.0103, -0.0158, 0.0146, 0.0471, 0.0361, -0.0245],[-0.0076, 0.0024, -0.0163, -0.0207, -0.0217, -0.0447, 0.0114, 0.0338, 0.0174, -0.0205, -0.0073, -0.0403, -0.0214, -0.0090, -0.0363, -0.0418, 0.0227, 0.0357, 0.0088, 0.0378, 0.0487, 0.0398, 0.0265, 0.0306, 0.0425, -0.0123, -0.0120, 0.0037, 0.0407, -0.0358, 0.0293, 0.0194],[-0.0429, 0.0048, -0.0299, -0.0208, 0.0328, 0.0320, -0.0278, 0.0403, 0.0030, 0.0134, 0.0407, -0.0284, 0.0287, 0.0051, 0.0134, -0.0461, -0.0168, -0.0414, 0.0151, 0.0115, -0.0203, 0.0450, 0.0025, 0.0097, 0.0017, 0.0085, 0.0220, -0.0290, 0.0024, 0.0032, -0.0227, 0.0284],[-0.0117, 0.0464, 0.0384, -0.0229, -0.0185, -0.0077, -0.0331, -0.0292, 0.0347, 0.0112, -0.0222, -0.0297, 0.0056, 0.0022, -0.0305, -0.0454, -0.0024, 0.0203, -0.0037, -0.0427, 0.0215, -0.0233, -0.0119, 0.0487, -0.0416, -0.0235, 0.0084, -0.0292, 0.0431, 0.0401, 0.0005, -0.0481],[0.0229, -0.0200, -0.0032, 0.0365, 0.0190, 0.0352, 0.0004, 0.0212, -0.0133, 0.0199, -0.0033, 0.0416, -0.0051, 0.0472, 0.0269, -0.0058, 0.0459, 0.0383, -0.0460, 0.0054, -0.0266, -0.0218, -0.0379, -0.0071, 0.0340, -0.0352, -0.0302, 0.0093, 0.0201, 0.0368, 0.0255, 0.0099],[0.0183, 0.0422, -0.0286, -0.0383, 0.0201, -0.0109, 0.0122, 0.0062, -0.0452, 0.0448, 0.0140, 0.0205, 0.0142, 0.0325, -0.0109, -0.0023, -0.0373, -0.0004, -0.0044, 0.0207, -0.0478, 0.0141, -0.0062, 0.0365, -0.0389, 0.0291, -0.0276, 0.0408, -0.0140, 0.0294, 0.0005, -0.0400],[0.0241, -0.0275, 0.0078, 0.0181, -0.0393, -0.0350, 0.0237, 0.0475, -0.0018, 0.0160, -0.0122, 0.0174, 0.0014, -0.0090, 0.0099, 0.0419, -0.0410, 0.0462, 0.0408, 0.0454, -0.0430, -0.0260, -0.0074, 0.0397, -0.0302, -0.0128, 0.0362, -0.0272, -0.0407, 0.0250, 0.0320, -0.0496],[0.0392, 0.0258, -0.0269, -0.0250, 0.0415, -0.0414, 0.0237, 0.0237, 0.0444, 0.0430, -0.0158, 0.0350, -0.0419, 0.0009, -0.0037, -0.0387, 0.0238, -0.0338, 0.0173, -0.0363, -0.0317, -0.0265, -0.0057, -0.0321, -0.0115, 0.0194, -0.0280, 0.0256, 0.0458, 0.0072, 0.0226, 0.0085],[-0.0382, -0.0377, -0.0038, -0.0422, 0.0236, 0.0456, -0.0424, 0.0265, -0.0368, 0.0067, -0.0044, 0.0122, -0.0022, 0.0360, 0.0070, -0.0008, -0.0215, -0.0135, 0.0278, 0.0033, -0.0051, 0.0337, -0.0387, -0.0216, 0.0032, 0.0457, 0.0492, -0.0429, -0.0467, -0.0023, -0.0406, -0.0244],[0.0372, -0.0274, -0.0393, 0.0444, 0.0221, 0.0303, 0.0105, -0.0285, -0.0295, 0.0090, -0.0392, -0.0168, 0.0284, -0.0420, -0.0124, -0.0496, 0.0062, 0.0377, -0.0198, 0.0466, -0.0096, 0.0184, -0.0120, -0.0066, -0.0181, -0.0297, -0.0064, -0.0070, 0.0359, 0.0418, 0.0328, 0.0051],[-0.0228, -0.0329, -0.0423, 0.0392, -0.0056, 0.0295, -0.0205, -0.0107, -0.0109, -0.0119, 0.0335, 0.0099, 0.0475, -0.0399, 0.0221, -0.0136, 0.0325, 0.0082, 0.0312, -0.0100, 0.0127, -0.0207, -0.0124, 0.0344, -0.0002, -0.0345, -0.0330, -0.0215, 0.0079, -0.0127, 0.0385, -0.0086],[-0.0133, -0.0207, -0.0484, -0.0296, 0.0448, -0.0287, -0.0040, 0.0270, -0.0335, -0.0317, 0.0350, -0.0314, -0.0180, -0.0214, -0.0244, 0.0346, -0.0205, -0.0287, -0.0209, -0.0460, -0.0278, 0.0132, 0.0037, -0.0282, 0.0023, -0.0311, 0.0397, -0.0428, 0.0152, 0.0099, 0.0299, 0.0331],[0.0046, -0.0291, 0.0376, -0.0189, -0.0332, 0.0167, 0.0050, 0.0240, -0.0295, 0.0040, -0.0140, -0.0049, -0.0023, -0.0211, -0.0074, 0.0292, 0.0003, 0.0066, 0.0089, -0.0207, -0.0308, -0.0317, 0.0050, 0.0124, 0.0435, 0.0277, 0.0282, 0.0398, 0.0282, -0.0109, -0.0195, 0.0310],[-0.0080, -0.0348, 0.0265, -0.0364, -0.0385, -0.0499, 0.0003, 0.0138, -0.0468, 0.0159, 0.0384, -0.0312, 0.0217, -0.0092, 0.0046, 0.0326, -0.0007, -0.0132, -0.0498, 0.0456, 0.0223, -0.0245, -0.0220, -0.0284, 0.0168, 0.0006, -0.0440, 0.0161, -0.0034, 0.0232, 0.0278, 0.0277],[0.0108, -0.0357, -0.0469, 0.0143, -0.0315, 0.0071, -0.0292, -0.0477, -0.0271, -0.0291, 0.0043, 0.0265, 0.0393, 0.0147, 0.0279, 0.0150, -0.0062, 0.0400, 0.0495, -0.0265, -0.0343, -0.0223, 0.0245, -0.0187, 0.0061, 0.0119, -0.0048, 0.0460, -0.0037, -0.0258, 0.0456, 0.0309],[-0.0435, 0.0107, -0.0422, -0.0495, -0.0445, -0.0310, -0.0107, -0.0330, -0.0205, 0.0428, 0.0066, 0.0380, -0.0182, 0.0055, -0.0091, -0.0100, 0.0037, -0.0411, 0.0104, -0.0337, -0.0095, -0.0131, -0.0148, -0.0033, 0.0277, -0.0274, 0.0103, 0.0356, 0.0275, -0.0443, 0.0044, 0.0426],[0.0268, -0.0381, 0.0079, -0.0183, 0.0169, -0.0482, 0.0391, 0.0470, 0.0164, -0.0286, 0.0070, -0.0352, 0.0281, 0.0329, -0.0401, 0.0058, 0.0318, 0.0051, 0.0345, 0.0101, -0.0353, 0.0139, -0.0011, -0.0080, 0.0075, -0.0233, -0.0232, -0.0196, -0.0138, 0.0379, 0.0105, -0.0299],[0.0393, 0.0290, 0.0280, -0.0112, 0.0350, 0.0118, -0.0412, -0.0205, 0.0198, 0.0251, -0.0316, 0.0447, 0.0192, -0.0450, 0.0034, -0.0171, 0.0392, -0.0413, -0.0341, -0.0276, -0.0106, 0.0286, -0.0092, 0.0257, 0.0100, -0.0115, -0.0381, 0.0098, 0.0020, 0.0396, -0.0299, -0.0165],[0.0076, -0.0283, 0.0148, 0.0053, -0.0309, -0.0321, -0.0238, 0.0414, -0.0328, 0.0130, -0.0414, 0.0045, 0.0184, -0.0269, -0.0418, -0.0115, 0.0222, 0.0189, -0.0179, -0.0231, 0.0327, 0.0453, -0.0179, -0.0142, -0.0384, -0.0292, 0.0360, -0.0290, -0.0042, 0.0490, 0.0298, 0.0267],[0.0104, -0.0335, 0.0060, -0.0073, -0.0380, 0.0154, 0.0167, -0.0173, 0.0292, -0.0280, -0.0314, 0.0174, 0.0379, 0.0483, -0.0454, 0.0380, 0.0077, -0.0041, 0.0417, -0.0154, -0.0437, -0.0390, -0.0420, -0.0021, -0.0241, -0.0092, -0.0425, 0.0295, 0.0477, -0.0473, -0.0102, 0.0332],[-0.0300, -0.0099, 0.0397, -0.0388, -0.0119, -0.0185, 0.0431, -0.0487, -0.0131, -0.0008, 0.0440, 0.0416, 0.0235, -0.0428, 0.0392, 0.0455, 0.0099, 0.0256, -0.0245, 0.0483, -0.0158, -0.0078, -0.0385, 0.0132, 0.0469, -0.0396, -0.0092, -0.0073, 0.0442, -0.0434, -0.0118, 0.0397],[-0.0316, 0.0192, -0.0462, -0.0278, -0.0342, -0.0094, 0.0169, -0.0170, 0.0237, 0.0347, -0.0016, 0.0487, 0.0240, 0.0013, 0.0030, 0.0424, 0.0304, -0.0018, 0.0101, 0.0189, 0.0126, 0.0474, -0.0439, 0.0101, 0.0417, -0.0025, 0.0461, -0.0166, 0.0409, 0.0223, 0.0116, 0.0416],[0.0488, 0.0140, 0.0151, 0.0361, 0.0053, -0.0036, -0.0417, 0.0032, -0.0425, -0.0418, -0.0450, -0.0340, 0.0155, 0.0263, 0.0360, -0.0219, -0.0409, 0.0180, -0.0102, 0.0198, 0.0497, -0.0010, -0.0208, 0.0389, -0.0270, -0.0219, -0.0089, 0.0447, 0.0129, 0.0407, -0.0408, -0.0285],[0.0372, -0.0009, 0.0291, 0.0089, -0.0305, -0.0133, 0.0276, 0.0269, -0.0086, -0.0487, 0.0043, 0.0320, -0.0451, -0.0295, -0.0340, -0.0158, -0.0045, 0.0397, 0.0179, -0.0257, 0.0367, 0.0299, -0.0255, -0.0478, 0.0345, 0.0184, -0.0334, 0.0101, -0.0374, 0.0211, -0.0006, -0.0404],[-0.0110, -0.0185, -0.0304, -0.0487, 0.0322, 0.0025, 0.0240, 0.0190, -0.0342, 0.0171, 0.0228, 0.0192, 0.0444, 0.0101, 0.0248, -0.0300, -0.0379, -0.0493, 0.0193, -0.0397, -0.0290, 0.0215, 0.0261, 0.0151, -0.0181, -0.0033, -0.0436, 0.0487, -0.0475, 0.0312, 0.0031, -0.0085],[0.0070, 0.0489, -0.0306, -0.0043, 0.0491, -0.0162, 0.0152, -0.0229, -0.0144, 0.0309, -0.0175, 0.0207, -0.0315, -0.0198, -0.0177, 0.0029, 0.0269, 0.0098, -0.0267, -0.0007, -0.0373, 0.0034, 0.0198, -0.0466, -0.0204, -0.0188, -0.0205, 0.0449, 0.0303, -0.0276, 0.0400, 0.0002],[0.0046, -0.0188, -0.0024, -0.0415, 0.0040, 0.0355, -0.0214, -0.0130, 0.0151, -0.0286, 0.0489, -0.0149, 0.0039, -0.0086, 0.0142, -0.0442, -0.0318, -0.0001, -0.0410, -0.0170, 0.0418, -0.0412, -0.0104, -0.0296, 0.0316, 0.0421, 0.0111, -0.0330, -0.0481, -0.0272, 0.0103, -0.0496],[-0.0011, -0.0419, -0.0172, 0.0237, -0.0236, 0.0420, -0.0102, 0.0472, -0.0029, -0.0243, -0.0030, 0.0155, 0.0396, 0.0462, -0.0065, 0.0296, -0.0440, -0.0274, -0.0079, -0.0157, -0.0289, -0.0045, -0.0164, -0.0144, -0.0436, -0.0096, 0.0358, 0.0164, -0.0485, 0.0208, 0.0040, 0.0182],[0.0425, 0.0056, 0.0234, -0.0256, -0.0079, -0.0108, -0.0312, 0.0486, 0.0193, -0.0316, -0.0461, -0.0213, -0.0051, 0.0323, 0.0210, 0.0393, -0.0061, 0.0424, 0.0212, 0.0450, -0.0073, 0.0336, 0.0273, 0.0332, 0.0417, -0.0473, 0.0005, -0.0403, 0.0162, -0.0084, 0.0146, -0.0401],[0.0226, 0.0225, -0.0231, -0.0339, -0.0291, -0.0009, -0.0048, -0.0157, 0.0049, 0.0031, -0.0166, 0.0433, 0.0147, 0.0395, -0.0283, -0.0480, -0.0214, 0.0310, 0.0246, 0.0049, -0.0008, -0.0230, -0.0056, 0.0369, -0.0112, -0.0131, -0.0108, -0.0350, -0.0006, -0.0218, 0.0428, -0.0207]], b3: [0.0145, 0.0479, -0.0394, -0.0428, -0.0285, 0.0186, 0.0271, -0.0368, 0.0131, 0.0275, -0.0122, -0.0388, 0.0207, -0.0315, -0.0436, -0.0472, -0.0487, 0.0086, 0.0116, -0.0364, -0.0078, 0.0411, -0.0385, -0.0244, -0.0449, -0.0064, 0.0065, 0.0410, 0.0027, 0.0435, 0.0112, -0.0149],
        w4: [0.0219, 0.0249, -0.0498, 0.0224, 0.0156, -0.0405, -0.0414, 0.0149, -0.0306, -0.0433, 0.0368, 0.0152, -0.0331, 0.0470, 0.0228, 0.0126, -0.0099, -0.0233, 0.0421, 0.0071, 0.0232, 0.0192, 0.0000, 0.0452, -0.0146, 0.0444, -0.0135, 0.0019, 0.0384, 0.0316, 0.0387, -0.0481], b4: 0.0204
    };

    const sigmoid = (z) => 1 / (1 + Math.exp(-z));
    const dSigmoid = (y) => y * (1 - y);
    const relu = (z) => Math.max(0, z);
    const dRelu = (z) => z > 0 ? 1 : 0;

    const extractFeatures = (el) => {
        let x1 = 0.0, x2 = 0.0, x3 = 0.0, x4 = 0.0, x5 = 0.0, x6 = 0.0, x7 = 0.0, x8 = 0.0, x9 = 0.0, x10 = 0.0, x11 = 0.0, x12 = 0.0, x13 = 0.0, x14 = 0.0, x15 = 0.0;
        const rect = el.getBoundingClientRect();
        const w = rect.width, h = rect.height;
        
        if (w > 0 && h > 0) {
            const ratio = w / h;
            if ((ratio > 7.0 && ratio < 9.0) || (ratio > 1.0 && ratio < 1.4) || (ratio > 0.2 && ratio < 0.4)) {
                x1 = 0.8;
                if ([728, 300, 160, 970].includes(Math.round(w))) x1 = 1.0; 
            } else if (w < 50 && h < 50) x1 = 0.0; 
            else x1 = 0.2; 
        }
        
        const keywords = ['ad', 'ads', 'reklam', 'sponsor', 'promoted', 'banner', 'ad-container', 'advertisement', 'reklam_alani', 'sponsorlu', 'sponsored', 'önerilen', 'taboola', 'outbrain', 'advert'];
        const elText = (el.className + ' ' + el.id + ' ' + (el.alt || '') + ' ' + (el.src || '')).toLowerCase();
        let keywordMatches = 0;
        keywords.forEach(kw => { if (elText.includes(kw)) keywordMatches++; });
        x2 = Math.min(1.0, keywordMatches * 0.3);
        
        const textLen = (el.textContent || '').trim().length;
        const imgCount = el.querySelectorAll ? el.querySelectorAll('img, iframe').length : 0;
        if (imgCount > 0 && textLen < 50) x3 = 1.0; 
        else if (imgCount === 0 && textLen > 100) x3 = 0.0; 
        else x3 = 0.5; 
        
        const winW = window.innerWidth, winH = window.innerHeight;
        if (rect.top < winH * 0.2) { x4 += 0.3; x15 += 0.5; }
        if (rect.left > winW * 0.7) x4 += 0.3; 
        if (rect.top > winH * 0.8) { x4 += 0.4; x15 += 0.5; }
        x4 = Math.min(1.0, x4);
        x15 = Math.min(1.0, x15);
        
        const style = window.getComputedStyle(el);
        const zIndex = parseInt(style.zIndex);
        if (!isNaN(zIndex) && zIndex > 999) x5 = 1.0;
        else if (!isNaN(zIndex) && zIndex > 99) x5 = 0.5;
        
        if (el.tagName === 'IFRAME') {
            try { if (new URL(el.src).hostname !== location.hostname) x6 = 1.0; } 
            catch(e) { x6 = 0.5; }
        }
        
        if (el.shadowRoot) x7 = 1.0;
        
        if (style.position === 'fixed' || style.position === 'sticky') { x8 = 0.8; x10 = 1.0; }
        else if (style.position === 'absolute') { x8 = 0.4; x10 = 0.8; }
        
        if (style.opacity < 0.1 || style.visibility === 'hidden') x9 = 1.0;
        
        if (el.querySelectorAll) {
            const childCount = el.querySelectorAll('*').length;
            if (childCount > 10 && textLen < 20) x11 = 1.0;
            else if (childCount > 5 && textLen < 50) x11 = 0.5;
        }

        const aria = el.getAttribute('aria-label');
        if (aria && keywords.some(k => aria.toLowerCase().includes(k))) x12 = 1.0;
        
        const inlineStyle = el.getAttribute('style') || '';
        if (inlineStyle.includes('display: block !important') || inlineStyle.includes('visibility: visible !important')) x13 = 1.0;
        
        if (el.querySelector && el.querySelector('script[src^="http"]')) x14 = 1.0;
        
        return [x1, x2, x3, x4, x5, x6, x7, x8, x9, x10, x11, x12, x13, x14, x15];
    };

    const forwardPass = (el) => {
        if (el.nodeType !== 1 || el.tagName === 'BODY' || el.tagName === 'HTML' || el.tagName === 'SCRIPT') return { score: 0 };
        const inputs = extractFeatures(el);
        let hidden = [];
        let hiddenPre = [];
        for (let i = 0; i < 12; i++) {
            let sum = aiConfig.b_h[i];
            for (let j = 0; j < 15; j++) sum += inputs[j] * aiConfig.w_ih[i][j];
            hiddenPre.push(sum);
            hidden.push(relu(sum));
        }
        let outputSum = aiConfig.b_o;
        for (let i = 0; i < 12; i++) outputSum += hidden[i] * aiConfig.w_ho[i];
        return { score: sigmoid(outputSum), inputs, hidden, hiddenPre };
    };

    const predictAI = (el) => forwardPass(el).score;

    const trainAI = (el, targetLabel) => {
        const result = forwardPass(el);
        if (result.score === 0 && targetLabel === 0) return; 
        
        const { inputs, hidden, hiddenPre, score } = result;
        const outputError = targetLabel - score;
        const deltaOutput = outputError * dSigmoid(score);
        
        let hiddenErrors = [];
        for (let i = 0; i < 12; i++) {
            hiddenErrors[i] = deltaOutput * aiConfig.w_ho[i];
            aiConfig.w_ho[i] += aiConfig.learningRate * deltaOutput * hidden[i];
        }
        aiConfig.b_o += aiConfig.learningRate * deltaOutput;
        
        for (let i = 0; i < 12; i++) {
            const deltaHidden = hiddenErrors[i] * dRelu(hiddenPre[i]);
            for (let j = 0; j < 15; j++) {
                aiConfig.w_ih[i][j] += aiConfig.learningRate * deltaHidden * inputs[j];
            }
            aiConfig.b_h[i] += aiConfig.learningRate * deltaHidden;
        }
        
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ aae_ai_mlp: aiConfig });
            }
        } catch(e) {}
        
        logToHud(`[MLP-AI] Model Eğitildi! Sapma: ${outputError.toFixed(3)}`);
        // Firebase Cloud Push kaldırıldı, Background script halledecek.
    };

    // Ağırlıkları arkaplandan (chrome.storage) dinle ve al
    try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get(['aae_ai_mlp', 'aae_mlp_weights'], (result) => {
                if (result.aae_ai_mlp) Object.assign(aiConfig, result.aae_ai_mlp);
                if (result.aae_mlp_weights) Object.assign(aiConfig, result.aae_mlp_weights);
            });
            chrome.storage.onChanged.addListener((changes, areaName) => {
                if (areaName === 'local' && changes.aae_mlp_weights && changes.aae_mlp_weights.newValue) {
                    Object.assign(aiConfig, changes.aae_mlp_weights.newValue);
                    console.log("[AAEBlocker] AI ağırlıkları arkaplandan (Background) başarıyla senkronize edildi.");
                }
            });
        }
    } catch(e) {}

    const perceptualAdBlock = (nodes) => {
        let aiDestroyed = 0;
        
        // Inject Laser CSS if not present
        if (!document.getElementById('aae-laser-anim')) {
            const style = document.createElement('style');
            style.id = 'aae-laser-anim';
            style.textContent = `
                .aae-destroyed {
                    animation: aaeLaserDestroy 0.8s ease-out forwards !important;
                    pointer-events: none !important;
                    z-index: 999999 !important;
                    outline: 2px solid red !important;
                }
                @keyframes aaeLaserDestroy {
                    0% { filter: drop-shadow(0 0 10px red) drop-shadow(0 0 20px red) sepia(1) hue-rotate(-50deg) saturate(5); transform: scale(1); opacity: 1; }
                    50% { filter: drop-shadow(0 0 50px red) sepia(1) hue-rotate(-50deg) saturate(10); transform: scale(0.9) skewX(5deg); opacity: 0.8; background: rgba(255,0,0,0.3); }
                    100% { filter: drop-shadow(0 0 100px red); transform: scale(0) skewX(-10deg) translateY(-20px); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        nodes.forEach(el => {
            if (el.nodeType !== 1) return;
            if (aaeScannedNodes.has(el) || el.hasAttribute('data-aae-ai-scanned') || el.style.display === 'none' || el.style.opacity === '0' || el.classList.contains('aae-destroyed')) return;
            el.setAttribute('data-aae-ai-scanned', 'true');
            aaeScannedNodes.add(el);

            // Model Prediction (Neural Net)
            const score = predictAI(el);

            // False-Positive Heuristics (Güvenlik Kalkanı)
            let isSafe = false;
            if (['ARTICLE', 'MAIN', 'P', 'H1', 'H2'].includes(el.tagName)) {
                isSafe = true;
            } else if (el.textContent) {
                const textLen = el.textContent.trim().length;
                const imgCount = el.querySelectorAll ? el.querySelectorAll('img, iframe').length : 0;
                if (textLen > 400 && imgCount <= 1) {
                    isSafe = true;
                }
            }

            if (score >= aiConfig.threshold && !isSafe) {
                // Instead of instantly hiding, apply the destruction animation
                el.classList.add('aae-destroyed');
                aiDestroyed++;
                
                // Completely remove the element after the animation finishes
                setTimeout(() => {
                    try { el.remove(); } catch(e) {
                        el.style.setProperty('display', 'none', 'important');
                    }
                }, 800);
            }
        });

        if (aiDestroyed > 0) {
            logToHud(`[Yapay Zeka - Ortak Beyin]: ${aiDestroyed} Kurnaz Reklam Keşfedildi ve İMHA Edildi!`);
            updateHudCount(aiDestroyed);
        }
    };
    
    // 10. VİDEO REKLAM ATLAYICI (Event-Based Zero-Delay Ad-Skipper)
    const processVideoAd = (video) => {
        if (!video || video.tagName !== 'VIDEO') return;
        let isAd = false;
        const isYouTube = window.location.hostname.includes('youtube.com');
        
        if (isYouTube) {
            const adOverlay = document.querySelector('.ad-showing, .ad-interrupting');
            const adBadge = document.querySelector('.ytp-ad-image, .ytp-ad-text');
            if (adOverlay || adBadge) {
                isAd = true;
            }
        } else {
            let parent = video.parentElement;
            let depth = 0;
            while(parent && depth < 5) {
                if (parent.className && typeof parent.className === 'string' && parent.className.toLowerCase().includes('ad')) {
                    isAd = true;
                    break;
                }
                if (parent.id && parent.id.toLowerCase().includes('ad')) {
                    isAd = true;
                    break;
                }
                parent = parent.parentElement;
                depth++;
            }
        }
        
        if (isAd) {
            if (!video.muted) video.muted = true;
            if (video.playbackRate !== 16) video.playbackRate = 16;
            if (video.duration && video.currentTime < video.duration - 1) {
                video.currentTime = video.duration - 0.5;
            }
            const skipButtons = document.querySelectorAll('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .videoAdUiSkipButton');
            if (skipButtons && skipButtons.length > 0) {
                skipButtons.forEach(btn => btn.click());
            }
            logToHud("[Video Reklam Atlayıcı] Reklam videosu anında (event-based) atlandı.");
        }
    };

    // Dinamik Event Dinleyicileri (Capture fazında)
    document.addEventListener('play', (e) => processVideoAd(e.target), true);
    document.addEventListener('loadeddata', (e) => processVideoAd(e.target), true);
    document.addEventListener('timeupdate', (e) => processVideoAd(e.target), true);

    // DOM'u Milisaniyelik Gözlemleme (Zero-Delay Mutation Observer) + IdleCallback + WeakSet
    const aaeScannedNodes = new WeakSet();
    let pendingNodes = new Set();
    let isIdleScheduled = false;

    const processPendingNodes = (deadline) => {
        isIdleScheduled = false;
        if (pendingNodes.size === 0) return;
        
        const nodesArray = [];
        let count = 0;
        
        for (const node of pendingNodes) {
            nodesArray.push(node);
            count++;
            // Çok fazla düğüm gelirse ve zaman daralırsa break atıp sonrakine bırak (Idle optimizasyonu)
            if (count > 50 && deadline && deadline.timeRemaining() < 5) break; 
        }
        
        nodesArray.forEach(n => pendingNodes.delete(n));
        
        if (nodesArray.length > 0) {
            perceptualAdBlock(nodesArray);
            killOverlays();
            destroyKnownAdblockDetectors();
        }
        
        if (pendingNodes.size > 0) {
            scheduleIdleProcess();
        }
    };

    const scheduleIdleProcess = () => {
        if (isIdleScheduled) return;
        isIdleScheduled = true;
        if (window.requestIdleCallback) {
            window.requestIdleCallback(processPendingNodes, { timeout: 1000 });
        } else {
            setTimeout(() => processPendingNodes(null), 50);
        }
    };

    const masterObserver = new MutationObserver((mutations) => {
        let addedCount = 0;
        mutations.forEach(m => {
            if (m.addedNodes.length > 0) {
                m.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && !aaeScannedNodes.has(node) && ['DIV', 'IFRAME', 'IMG', 'A', 'SPAN', 'ASIDE', 'SECTION', 'VIDEO'].includes(node.tagName)) {
                        pendingNodes.add(node);
                        addedCount++;
                    }
                });
            }
        });
        if (addedCount > 0) {
            scheduleIdleProcess();
        }
    });

    // Sayfa yüklenir yüklenmez gözlemciyi başlat
    masterObserver.observe(document.documentElement, { childList: true, subtree: true });

    // Mevcut elementleri ilk taramadan geçir (Sayfa ilk açılışında hepsi işlensin)
    const initialNodes = document.querySelectorAll('div, iframe, img, a, span, aside, section');
    initialNodes.forEach(n => pendingNodes.add(n));
    scheduleIdleProcess();

    // Öğrenilen seçicileri kalıcı olarak uygula (Adblock Filtresi gibi)
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['aae_learned_selectors'], (res) => {
            if (res.aae_learned_selectors && res.aae_learned_selectors.length > 0) {
                const style = document.createElement('style');
                style.id = "aae-ai-learned-memory";
                style.textContent = res.aae_learned_selectors.join(', ') + ' { display: none !important; pointer-events: none !important; opacity: 0 !important; }';
                if(document.head) {
                    document.head.appendChild(style);
                } else {
                    document.documentElement.appendChild(style);
                }
                logToHud("AI Kalıcı Hafıza (Auto-Zapper) Yüklendi: " + res.aae_learned_selectors.length + " Kural");
            }
        });
    }

    window.predictAI = predictAI;
    window.trainAI = trainAI;
    
    let lastRightClickedElement = null;
    document.addEventListener('contextmenu', (e) => {
        lastRightClickedElement = e.target;
    }, true);

    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener((msg) => {
            if (msg.type === "AAE_TRAIN_AD" && lastRightClickedElement) {
                trainAI(lastRightClickedElement, 1.0);
                lastRightClickedElement.style.setProperty('display', 'none', 'important');
            } else if (msg.type === "AAE_PICKER_MODE") {
                activateElementPicker();
            }
        });
    }

    const activateElementPicker = () => {
        logToHud("Eğitim Modu Aktif. Kapatmak istediğiniz bir reklama tıklayın.");
        const overlayer = document.createElement('div');
        overlayer.id = "aae-ai-picker";
        Object.assign(overlayer.style, {
            position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
            background: 'rgba(0, 255, 0, 0.1)', cursor: 'crosshair', zIndex: '99999999'
        });
        document.body.appendChild(overlayer);
        
        let hoveredEl = null;
        
        const moveHandler = (e) => {
            overlayer.style.pointerEvents = 'none'; 
            const el = document.elementFromPoint(e.clientX, e.clientY);
            overlayer.style.pointerEvents = 'auto'; 
            
            if (el && el !== hoveredEl) {
                if (hoveredEl) hoveredEl.style.outline = '';
                if (el !== document.body && el !== document.documentElement && el !== overlayer) {
                    el.style.outline = '3px solid #0f0';
                    hoveredEl = el;
                }
            }
        };
        
        const clickHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (hoveredEl) {
                hoveredEl.style.outline = '';
                
                // Geleneksel AI eğitimi
                trainAI(hoveredEl, 1.0);
                
                // 100% Kesinlik için CSS seçici öğrenimi
                let selector = hoveredEl.tagName.toLowerCase();
                if (hoveredEl.id) {
                    selector = '#' + hoveredEl.id;
                } else if (hoveredEl.className && typeof hoveredEl.className === 'string') {
                    const classes = hoveredEl.className.trim().split(/\\s+/).join('.');
                    if (classes) selector += '.' + classes;
                }
                
                chrome.storage.local.get(['aae_learned_selectors'], (res) => {
                    const learned = res.aae_learned_selectors || [];
                    if (!learned.includes(selector)) {
                        learned.push(selector);
                        chrome.storage.local.set({ aae_learned_selectors: learned });
                        logToHud(`AI Öğrendi (Kalıcı): ${selector}`);
                    }
                });
                
                // Laser Burn Efekti
                if (!document.getElementById('aae-laser-anim')) {
                    const style = document.createElement('style');
                    style.id = 'aae-laser-anim';
                    style.textContent = `
                        @keyframes aaeLaserBurn {
                            0% { filter: drop-shadow(0 0 10px red); transform: scale(1); }
                            50% { filter: drop-shadow(0 0 30px red); transform: scale(1.05) skewX(10deg); background-color: rgba(255,0,0,0.5); }
                            100% { filter: blur(10px); transform: scale(0.1); opacity: 0; }
                        }
                        .aae-burning {
                            animation: aaeLaserBurn 0.8s ease-out forwards !important;
                            pointer-events: none !important;
                        }
                    `;
                    (document.head || document.documentElement).appendChild(style);
                }
                
                hoveredEl.classList.add('aae-burning');
                setTimeout(() => hoveredEl.style.setProperty('display', 'none', 'important'), 800);
            }
            document.removeEventListener('mousemove', moveHandler, true);
            document.removeEventListener('click', clickHandler, true);
            overlayer.remove();
        };
        
        document.addEventListener('mousemove', moveHandler, true);
        document.addEventListener('click', clickHandler, true);
    };

});
