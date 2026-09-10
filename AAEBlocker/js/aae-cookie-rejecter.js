/**
 * ═══════════════════════════════════════════════════════════════
 * AAE Content Script V9 — Anti-Adblock Defuser + Koruma Katmanı
 * AI motoru aae-skynet.js'de yaşar, bu dosya savunma araçlarıdır.
 * 1239 satırdan → ~420 satıra düşürüldü (performans odaklı)
 * ═══════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';
    const _DEBUG = false;
    const _log = (...args) => { if (_DEBUG) console.log('[AAE-CS]', ...args); };

    // ─── İstatistik Havuzu (5 saniyede bir flush) ──────────
    let _stats = { networkBlocks: 0, domBlocks: 0, overlayKills: 0, cookieRejects: 0, videoSkips: 0, lastThreat: '' };
    let _statsTimer = null;

    function incrementStat(key, val, threat) {
        if (typeof _stats[key] === 'number') _stats[key] += (val || 1);
        if (threat) _stats.lastThreat = threat.substring(0, 40);
        if (!_statsTimer) {
            _statsTimer = setTimeout(() => {
                try {
                    chrome.runtime.sendMessage({
                        type: 'BATCH_STATS',
                        updates: { ..._stats }
                    });
                } catch(e) {}
                _stats = { networkBlocks: 0, domBlocks: 0, overlayKills: 0, cookieRejects: 0, videoSkips: 0, lastThreat: '' };
                _statsTimer = null;
            }, 5000);
        }
    }

    // ═══════════════════════════════════════════════════════════
    // 1. PROXY ENJEKSIYONU (document_start, sayfa JS'i yüklenmeden)
    // ═══════════════════════════════════════════════════════════
    const proxyCode = `(function() {
        // a. Anti-Adblock Defuser: getComputedStyle, getBoundingClientRect spoofing
        const _gCS = window.getComputedStyle;
        window.getComputedStyle = function(el, pseudo) {
            const s = _gCS.call(window, el, pseudo);
            if (el && el.id && el.id.toLowerCase().includes('ad')) {
                return new Proxy(s, {
                    get(t, p) {
                        if (p === 'display') return 'block';
                        if (p === 'visibility') return 'visible';
                        return typeof t[p] === 'function' ? t[p].bind(t) : t[p];
                    }
                });
            }
            return s;
        };

        const _gBCR = Element.prototype.getBoundingClientRect;
        Element.prototype.getBoundingClientRect = function() {
            const r = _gBCR.call(this);
            if (this.id && this.id.toLowerCase().includes('ad') && (r.width === 0 || r.height === 0)) {
                return { x: 0, y: 0, width: 300, height: 250, top: 0, right: 300, bottom: 250, left: 0 };
            }
            return r;
        };

        // offsetHeight/Width spoofing
        const _oH = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
        const _oW = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
            get() { return (this.id && this.id.toLowerCase().includes('ad')) ? 250 : (_oH ? _oH.get.call(this) : this.clientHeight); }
        });
        Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
            get() { return (this.id && this.id.toLowerCase().includes('ad')) ? 300 : (_oW ? _oW.get.call(this) : this.clientWidth); }
        });

        // b. Shadow DOM Piercer
        const _attachShadow = Element.prototype.attachShadow;
        Element.prototype.attachShadow = function(init) {
            if (init && init.mode === 'closed') init.mode = 'open';
            return _attachShadow.call(this, init);
        };

        // c. IntersectionObserver Manipulation
        const _IO = window.IntersectionObserver;
        window.IntersectionObserver = class extends _IO {
            constructor(cb, opts) {
                super((entries, obs) => {
                    entries.forEach(e => {
                        if (e.target && e.target.id && e.target.id.toLowerCase().includes('ad')) {
                            Object.defineProperty(e, 'isIntersecting', { value: true, writable: true });
                        }
                    });
                    cb(entries, obs);
                }, opts);
            }
        };

        // d. Anti-Fingerprinting
        const _toDataURL = HTMLCanvasElement.prototype.toDataURL;
        HTMLCanvasElement.prototype.toDataURL = function() {
            try {
                const ctx = this.getContext('2d');
                if (ctx) { ctx.fillStyle = 'rgba(0,0,0,0.003)'; ctx.fillRect(0, 0, 1, 1); }
            } catch(e) {}
            return _toDataURL.apply(this, arguments);
        };
        try { Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 4 }); } catch(e) {}
        try { Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 }); } catch(e) {}

        // e. Telemetry Blocker
        const _sendBeacon = navigator.sendBeacon;
        navigator.sendBeacon = function(url) {
            if (typeof url === 'string' && /analytics|tracker|collect|telemetry/i.test(url)) return true;
            return _sendBeacon.apply(this, arguments);
        };

        // f. XHR/Fetch Proxy
        const _fetch = window.fetch;
        window.fetch = function() {
            const url = (arguments[0] instanceof Request) ? arguments[0].url : String(arguments[0] || '');
            if (/\\/ad[s\\/]|tracker|adserv/i.test(url)) return Promise.resolve(new Response('', { status: 200 }));
            return _fetch.apply(this, arguments);
        };

        // g. Timer Proxy (adblock detection killers)
        const _setInterval = window.setInterval;
        window.setInterval = function(cb, time) {
            if (typeof cb === 'function') {
                const src = cb.toString().toLowerCase();
                if (src.includes('adblock') || src.includes('blockadblock')) return 0;
            }
            return _setInterval.apply(this, arguments);
        };

        // Anti-adblock globals
        window.google_ad_status = 1;
        window.fuckAdBlock = { check: () => {}, onDetected: () => {}, onNotDetected: (f) => { try { f(); } catch(e) {} } };
        window.blockAdBlock = window.fuckAdBlock;
        window.isAdBlockActive = false;
    })();`;

    try {
        const s = document.createElement('script');
        s.textContent = proxyCode;
        (document.documentElement || document.head).appendChild(s);
        s.remove();
        _log('Proxy enjekte edildi.');
    } catch(e) {}

    // ═══════════════════════════════════════════════════════════
    // 2. CSS SEÇİCİ LİSTELERİ
    // ═══════════════════════════════════════════════════════════
    const AD_SELS = [
        '.ad', '.ads', '.ad-container', '#ad-banner', '[id^="div-gpt-ad"]',
        '.sponsored', '.taboola', '.outbrain', '[data-ad]',
        'iframe[src*="ads"]', 'ins.adsbygoogle'
    ];
    const OVERLAY_SELS = [
        '.adblock-modal', '#adblock-notice', '.fc-dialog-overlay',
        '.fc-ab-root', '[class*="adblock-detect"]', '[id*="adblock-modal"]'
    ];
    const COOKIE_SELS = [
        '#didomi-notice-agree-button', '#sp-cc-rejectall-link',
        'button[id*="reject"]', 'button[class*="reject"]',
        '[aria-label*="reject"]', '.cookie-reject', '#onetrust-reject-all-handler',
        '.cmp-reject', 'button[data-testid*="reject"]'
    ];

    // ═══════════════════════════════════════════════════════════
    // 3. İŞLEV KATMANLARI
    // ═══════════════════════════════════════════════════════════

    // t. Ad Annihilator
    function annihilateAds() {
        for (const sel of AD_SELS) {
            const els = document.querySelectorAll(sel);
            for (const el of els) {
                if (!el.hasAttribute('data-aae-killed')) {
                    el.style.setProperty('display', 'none', 'important');
                    el.setAttribute('data-aae-killed', '1');
                    incrementStat('domBlocks', 1, sel);
                }
            }
        }
    }

    // h. Anti-Adblock Overlay Killer
    function killOverlays() {
        for (const sel of OVERLAY_SELS) {
            document.querySelectorAll(sel).forEach(el => {
                el.remove();
                incrementStat('overlayKills', 1, 'Overlay: ' + sel);
            });
        }
        // Metin tabanlı tespit
        if (!document.body) return;
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const regex = /disable your ad\s?blocker|please allow ads|adblocker detected|turn off adblock|reklam engelleyici/i;
        let node;
        while (node = walker.nextNode()) {
            if (regex.test(node.nodeValue)) {
                let parent = node.parentElement;
                while (parent && parent !== document.body) {
                    const r = parent.getBoundingClientRect();
                    if (r.width > 200 && r.height > 100) break;
                    parent = parent.parentElement;
                }
                if (parent && parent !== document.body) {
                    parent.style.setProperty('display', 'none', 'important');
                    document.body.style.overflow = '';
                    incrementStat('overlayKills', 1, 'Anti-Adblock Text');
                }
            }
        }
    }

    // j. Cookie Auto-Rejecter (max 5 deneme)
    let _cookieTries = 0;
    function rejectCookies() {
        if (_cookieTries >= 5) return;
        for (const sel of COOKIE_SELS) {
            const btns = document.querySelectorAll(sel);
            for (const btn of btns) {
                if (btn.offsetParent !== null) {
                    btn.click();
                    incrementStat('cookieRejects', 1, 'Çerez: ' + sel);
                    _log('Çerez reddedildi:', sel);
                    _cookieTries = 5; // Başarılı, dur
                    return;
                }
            }
        }
        _cookieTries++;
    }

    // k. Video Ad Skipper
    function skipVideoAds() {
        const skipBtns = document.querySelectorAll('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .videoAdUiSkipButton');
        for (const btn of skipBtns) {
            btn.click();
            incrementStat('videoSkips', 1, 'Video Ad Skip');
        }
        if (document.querySelector('.ad-showing')) {
            document.querySelectorAll('video').forEach(v => {
                if (v.duration && !isNaN(v.duration)) v.currentTime = v.duration;
            });
        }
    }

    // p. Paywall Cracker (tek sefer)
    function crackPaywall() {
        document.querySelectorAll('.paywall, #paywall, .article-masked, [class*="premium-content"]')
            .forEach(el => el.style.setProperty('display', 'none', 'important'));
        if (document.body) {
            document.body.style.userSelect = 'auto';
            document.body.style.overflow = 'auto';
        }
        document.querySelectorAll('p, div, article, main, section').forEach(el => {
            const cs = window.getComputedStyle(el);
            if (cs.filter && cs.filter.includes('blur')) el.style.filter = 'none';
            if (cs.maxHeight && cs.maxHeight !== 'none' && cs.overflow === 'hidden') {
                el.style.maxHeight = 'none';
                el.style.overflow = 'visible';
            }
        });
    }

    // q. Link De-cloaker
    function decloakLinks() {
        const cloaks = ['bit.ly', 'adf.ly', 'ouo.io', 't.co', 'goo.gl'];
        document.querySelectorAll('a:not([data-aae-decloaked])').forEach(a => {
            if (a.href && cloaks.some(c => a.href.includes(c))) {
                a.style.border = '2px dashed #ff4444';
                a.title = '⚠️ Yönlendirilmiş Link!';
            }
            a.setAttribute('data-aae-decloaked', '1');
        });
    }

    // s. Media Hunter
    function huntMedia() {
        document.querySelectorAll('video:not([data-aae-hunted])').forEach(vid => {
            if (vid.src) {
                vid.setAttribute('data-aae-hunted', '1');
                _log('Video bulundu:', vid.src.substring(0, 60));
            }
        });
    }

    // m. Öğrenilmiş Seçiciler
    function applyLearnedSelectors() {
        chrome.storage.local.get(['aae_learned_selectors'], (res) => {
            if (res.aae_learned_selectors && res.aae_learned_selectors.length > 0) {
                const style = document.createElement('style');
                style.id = 'aae-learned-css';
                style.textContent = res.aae_learned_selectors.join(', ') + ' { display: none !important; }';
                (document.head || document.documentElement).appendChild(style);
                _log('Öğrenilmiş seçiciler yüklendi:', res.aae_learned_selectors.length);
            }
        });
    }

    // l. Kelime Sansürü
    function applyCensor() {
        chrome.storage.local.get(['censoredWords'], (res) => {
            if (!res.censoredWords || res.censoredWords.length === 0) return;
            const regex = new RegExp(res.censoredWords.join('|'), 'gi');
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            let node;
            while (node = walker.nextNode()) {
                if (regex.test(node.nodeValue)) {
                    node.nodeValue = node.nodeValue.replace(regex, '***');
                }
            }
        });
    }

    // ═══════════════════════════════════════════════════════════
    // 4. TEK MutationObserver + requestIdleCallback MİMARİSİ
    // ═══════════════════════════════════════════════════════════
    let _mutDebounce = null;

    function onMutations() {
        if (_mutDebounce) return;
        if ('requestIdleCallback' in window) {
            _mutDebounce = requestIdleCallback(() => {
                annihilateAds();
                killOverlays();
                rejectCookies();
                skipVideoAds();
                decloakLinks();
                huntMedia();
                _mutDebounce = null;
            }, { timeout: 1500 });
        } else {
            _mutDebounce = setTimeout(() => {
                annihilateAds();
                killOverlays();
                rejectCookies();
                skipVideoAds();
                decloakLinks();
                huntMedia();
                _mutDebounce = null;
            }, 200);
        }
    }

    // ═══════════════════════════════════════════════════════════
    // 5. BOOT SEKANS
    // ═══════════════════════════════════════════════════════════
    function onDOMReady() {
        crackPaywall();           // Tek sefer
        annihilateAds();          // İlk tarama
        killOverlays();
        rejectCookies();
        skipVideoAds();
        decloakLinks();
        huntMedia();
        applyLearnedSelectors();  // Öğrenilmiş CSS seçicileri
        applyCensor();            // Kelime sansürü

        // Tek MutationObserver
        if (document.body) {
            const obs = new MutationObserver(onMutations);
            obs.observe(document.body, { childList: true, subtree: true });
            _log('Observer başlatıldı.');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onDOMReady);
    } else {
        onDOMReady();
    }

    // ═══════════════════════════════════════════════════════════
    // 6. KULLANICI ARAÇLARI (Sniper, Zen, Picker)
    // ═══════════════════════════════════════════════════════════

    // n. Sniper Mode
    window.startAaeSniperMode = function() {
        document.body.style.cursor = 'crosshair';
        const handler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.target.style.setProperty('display', 'none', 'important');
            incrementStat('domBlocks', 1, 'Sniper');
            document.body.style.cursor = '';
            document.removeEventListener('click', handler, true);
        };
        document.addEventListener('click', handler, true);
    };

    // r. Zen Mode (Alt+Z)
    let _zenActive = false;
    document.addEventListener('keydown', (e) => {
        if (e.altKey && e.key.toLowerCase() === 'z') {
            _zenActive = !_zenActive;
            let zen = document.getElementById('aae-zen-mode');
            if (_zenActive && !zen) {
                zen = document.createElement('style');
                zen.id = 'aae-zen-mode';
                zen.textContent = `
                    body > *:not(article):not(main):not(.content):not(#content) {
                        opacity: 0.05 !important; transition: opacity 0.5s;
                    }
                    body > *:hover { opacity: 1 !important; }
                `;
                document.head.appendChild(zen);
            } else if (!_zenActive && zen) {
                zen.remove();
            }
        }
    });

    // o. Element Picker (Sağ tık menüsünden)
    let _lastRightClick = null;
    document.addEventListener('contextmenu', (e) => { _lastRightClick = e.target; }, true);

    try {
        chrome.runtime.onMessage.addListener((msg) => {
            if (msg.type === 'AAE_TRAIN_AD' && _lastRightClick) {
                _lastRightClick.style.setProperty('display', 'none', 'important');
                incrementStat('domBlocks', 1, 'Eğitim');

                // Seçici öğren
                let sel = _lastRightClick.tagName.toLowerCase();
                if (_lastRightClick.id) sel = '#' + _lastRightClick.id;
                else if (_lastRightClick.className && typeof _lastRightClick.className === 'string') {
                    const cls = _lastRightClick.className.trim().split(/\s+/).join('.');
                    if (cls) sel += '.' + cls;
                }
                chrome.storage.local.get(['aae_learned_selectors'], (res) => {
                    const arr = res.aae_learned_selectors || [];
                    if (!arr.includes(sel)) {
                        arr.push(sel);
                        chrome.storage.local.set({ aae_learned_selectors: arr });
                    }
                });
            }
            if (msg.type === 'AAE_SNIPER_MODE') {
                window.startAaeSniperMode();
            }
        });
    } catch(e) {}

    _log('AAE Content Script V9 hazır.');
})();
