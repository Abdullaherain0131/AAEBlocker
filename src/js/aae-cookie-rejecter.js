// AAEBlocker Core Content Script V8 - Anti-Fingerprinting & Ultimate Ad Blocker
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
            "support us by disabling", "lütfen reklam engelleyiciyi"
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
            "i understand", "kabul ediyorum", "anladım", "devam et"
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
            ".adblock-sticky",".adblock-banner","#adblock-bg","#adblock-popup",".ab-overlay",".ab-modal"
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
        try {
            document.querySelectorAll(selector).forEach(el => {
                if (window.getComputedStyle(el).display !== 'none') {
                    el.style.setProperty('display', 'none', 'important');
                    el.style.setProperty('pointer-events', 'none', 'important');
                    destroyed = true;
                }
            });
        } catch (e) {}
        
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
            const els = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div.tweet, div[data-testid="tweet"]');
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

    // 9. YAPAY ZEKA GÖRSEL ALGI VE ÖĞRENEN SİNİR AĞI MODÜLÜ
    const aiConfig = {
        learningRate: 0.1,
        threshold: 0.75,
        weights: { w1: 0.25, w2: 0.25, w3: 0.25, w4: 0.25 },
        bias: -0.5
    };

    try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get(['aae_ai_weights', 'aae_ai_bias'], (result) => {
                if (result.aae_ai_weights) aiConfig.weights = result.aae_ai_weights;
                if (result.aae_ai_bias !== undefined) aiConfig.bias = result.aae_ai_bias;
            });
        }
    } catch(e) {}

    const sigmoid = (z) => 1 / (1 + Math.exp(-z));

    const extractFeatures = (el) => {
        let x1 = 0.0, x2 = 0.0, x3 = 0.0, x4 = 0.0;
        
        const rect = el.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        if (w > 0 && h > 0) {
            const ratio = w / h;
            if ((ratio > 7.0 && ratio < 9.0) || (ratio > 1.0 && ratio < 1.4) || (ratio > 0.2 && ratio < 0.4)) {
                x1 = 0.8;
                if (w === 728 || w === 300 || w === 160 || w === 970) x1 = 1.0; 
            } else if (w < 50 && h < 50) {
                x1 = 0.0; 
            } else {
                x1 = 0.2; 
            }
        }
        
        const keywords = ['ad', 'ads', 'reklam', 'sponsor', 'promoted', 'banner', 'ad-container', 'advertisement', 'reklam_alani'];
        const elText = (el.className + ' ' + el.id + ' ' + (el.alt || '') + ' ' + (el.src || '')).toLowerCase();
        let keywordMatches = 0;
        keywords.forEach(kw => { if (elText.includes(kw)) keywordMatches++; });
        x2 = Math.min(1.0, keywordMatches * 0.4); 
        
        const textLen = (el.textContent || '').trim().length;
        const imgCount = el.querySelectorAll ? el.querySelectorAll('img, iframe').length : 0;
        if (imgCount > 0 && textLen < 50) {
            x3 = 1.0; 
        } else if (imgCount === 0 && textLen > 100) {
            x3 = 0.0; 
        } else {
            x3 = 0.5; 
        }
        
        const winWidth = window.innerWidth;
        const winHeight = window.innerHeight;
        if (rect.top < winHeight * 0.2) x4 += 0.3; 
        if (rect.left > winWidth * 0.7) x4 += 0.3; 
        if (rect.top > winHeight * 0.8) x4 += 0.4; 
        x4 = Math.min(1.0, x4);
        
        return { x1, x2, x3, x4 };
    };

    const predictAI = (el) => {
        if (el.nodeType !== 1 || el.tagName === 'BODY' || el.tagName === 'HTML' || el.tagName === 'SCRIPT') return 0;
        const f = extractFeatures(el);
        const z = (f.x1 * aiConfig.weights.w1) + 
                  (f.x2 * aiConfig.weights.w2) + 
                  (f.x3 * aiConfig.weights.w3) + 
                  (f.x4 * aiConfig.weights.w4) + 
                  aiConfig.bias;
        return sigmoid(z);
    };

    const trainAI = (el, targetLabel) => {
        const f = extractFeatures(el);
        const prediction = predictAI(el);
        const error = targetLabel - prediction;
        
        aiConfig.weights.w1 += aiConfig.learningRate * error * f.x1;
        aiConfig.weights.w2 += aiConfig.learningRate * error * f.x2;
        aiConfig.weights.w3 += aiConfig.learningRate * error * f.x3;
        aiConfig.weights.w4 += aiConfig.learningRate * error * f.x4;
        aiConfig.bias += aiConfig.learningRate * error;
        
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ aae_ai_weights: aiConfig.weights, aae_ai_bias: aiConfig.bias });
            }
        } catch(e) {}
        
        logToHud(`AI Öğrendi! Yeni Ağırlıklar Kaydedildi.`);
    };

    const perceptualAdBlock = (nodes) => {
        let aiDestroyed = 0;
        
        nodes.forEach(el => {
            if (el.nodeType !== 1) return;
            if (el.hasAttribute('data-aae-ai-scanned') || el.style.display === 'none' || el.style.opacity === '0') return;
            el.setAttribute('data-aae-ai-scanned', 'true');

            // Model Prediction (Neural Net)
            const score = predictAI(el);

            if (score >= aiConfig.threshold) {
                el.style.setProperty('visibility', 'hidden', 'important');
                el.style.setProperty('opacity', '0', 'important');
                el.style.setProperty('pointer-events', 'none', 'important');
                aiDestroyed++;
            }
        });

        if (aiDestroyed > 0) {
            logToHud(`[Yapay Zeka Algısı]: ${aiDestroyed} Reklam Keşfedildi ve Kör Edildi.`);
            updateHudCount(aiDestroyed);
        }
    };
    
    // 10. VİDEO REKLAM ATLAYICI (Auto Video Ad-Skipper)
    const autoVideoAdSkipper = () => {
        // YouTube ve genel video oynatıcılar için
        const isYouTube = window.location.hostname.includes('youtube.com');
        const videos = document.querySelectorAll('video');
        
        videos.forEach(video => {
            let isAd = false;
            
            // Eğer YouTube ise, 'ad-showing' veya 'ad-interrupting' class'ını kontrol et
            if (isYouTube) {
                const adOverlay = document.querySelector('.ad-showing, .ad-interrupting');
                const adBadge = document.querySelector('.ytp-ad-image, .ytp-ad-text');
                if (adOverlay || adBadge) {
                    isAd = true;
                }
            } else {
                // Genel sitelerde video'nun parent elementlerinde reklam ipuçları ara
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
                // Reklam videosunu sessize al ve 16x (maksimum) hızda oynat
                if (!video.muted) video.muted = true;
                if (video.playbackRate !== 16) video.playbackRate = 16;
                
                // YouTube 'Reklamı Geç' (Skip Ad) butonlarını bul ve tıkla
                const skipButtons = document.querySelectorAll('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .videoAdUiSkipButton');
                if (skipButtons && skipButtons.length > 0) {
                    skipButtons.forEach(btn => btn.click());
                }
                
                logToHud("[Video Reklam Atlayıcı] Reklam videosu sessize alındı ve hızlandırıldı (16x).");
            }
        });
    };

    // DOM'u Milisaniyelik Gözlemleme (Zero-Delay Mutation Observer)
    const masterObserver = new MutationObserver((mutations) => {
        let addedNodes = [];
        mutations.forEach(m => {
            if (m.addedNodes.length > 0) {
                m.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && ['DIV', 'IFRAME', 'IMG', 'A', 'SPAN', 'ASIDE', 'SECTION', 'VIDEO'].includes(node.tagName)) {
                        addedNodes.push(node);
                    }
                });
            }
        });
        if (addedNodes.length > 0) {
            requestAnimationFrame(() => {
                perceptualAdBlock(addedNodes);
                killOverlays();
                destroyKnownAdblockDetectors();
                autoVideoAdSkipper();
            });
        }
    });

    setInterval(autoVideoAdSkipper, 1000);

    // Sayfa yüklenir yüklenmez gözlemciyi başlat
    masterObserver.observe(document.documentElement, { childList: true, subtree: true });

    // Mevcut elementleri ilk taramadan geçir
    perceptualAdBlock(document.querySelectorAll('div, iframe, img, a, span, aside, section'));

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
                trainAI(hoveredEl, 1.0);
                hoveredEl.style.setProperty('display', 'none', 'important');
            }
            document.removeEventListener('mousemove', moveHandler, true);
            document.removeEventListener('click', clickHandler, true);
            overlayer.remove();
        };
        
        document.addEventListener('mousemove', moveHandler, true);
        document.addEventListener('click', clickHandler, true);
    };

});
