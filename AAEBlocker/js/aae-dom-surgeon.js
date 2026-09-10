/**
 * AAEBlocker DOM Surgeon (Akıllı Anti-Adblock & Paywall Kırıcı)
 * 
 * Özellikler:
 * - Sayfayı kilitleyen "Lütfen Reklam Engelleyiciyi Kapatın" overlay pencerelerini bulur ve siler.
 * - Kaydırması (scroll) engellenmiş sayfaları (overflow: hidden) çözer.
 * - Yapay Zeka tabanlı z-index ve backdrop-filter analizleri ile sahte katmanları ayıklar.
 */

(function() {
    console.log("[AAE-DOM-Surgeon] Aktif. Sayfa izleniyor...");

    // Şüpheli class veya ID isimleri (Geleneksel kurallar)
    const SUSPICIOUS_KEYWORDS = [
        'adblock', 'anti-ad', 'detect', 'paywall', 'subscribe-overlay', 'modal-backdrop', 
        'ad-blocker', 'blocker-notice', 'fc-ab-root'
    ];

    /**
     * Bir HTML elementinin reklam engelleyici uyarısı (Overlay) olup olmadığını analiz eder.
     */
    function isOverlaySuspicious(el) {
        const style = window.getComputedStyle(el);
        
        // Eğer tam ekranı kaplıyorsa (fixed/absolute ve büyük z-index)
        const isFullScreen = (style.position === 'fixed' || style.position === 'absolute') && 
                              parseInt(style.zIndex, 10) > 999;
        
        // Eğer arkası bulanıksa veya yarı saydamsa
        const isObscuring = style.backdropFilter !== 'none' || 
                            (style.backgroundColor.includes('rgba') && parseFloat(style.backgroundColor.split(',')[3]) > 0.4);

        if (!isFullScreen && !isObscuring) return false;

        // Kelime analizi
        const className = (el.className || '').toString().toLowerCase();
        const idName = (el.id || '').toLowerCase();
        
        for (let keyword of SUSPICIOUS_KEYWORDS) {
            if (className.includes(keyword) || idName.includes(keyword)) {
                return true;
            }
        }
        
        // Text analizi (Ekranda "reklam engelleyici", "adblock" geçiyor mu?)
        const text = el.innerText.toLowerCase();
        if (text.includes('adblock') || text.includes('reklam engelleyici') || text.includes('ad blocker')) {
            return true;
        }

        return false;
    }

    /**
     * Tespiti yapılan katmanları imha eder.
     */
    function performSurgery() {
        chrome.storage.local.get(['aae_settings'], function(data) {
            const settings = data.aae_settings || {};
            // Ayarlardan kapalıysa işlem yapma
            if (settings.enablePaywallCrack === false && settings.enableAntiAdblock === false) return;

            let surgeryPerformed = false;
            
            // Tüm div'leri ve dialog'ları tara
            const candidates = document.querySelectorAll('div, dialog, section');
            candidates.forEach(el => {
                if (isOverlaySuspicious(el)) {
                    console.log("[AAE-DOM-Surgeon] Zararlı katman tespit edildi ve yok ediliyor:", el);
                    el.remove();
                    surgeryPerformed = true;
                }
            });

            // Kaydırma (Scroll) engellendiyse serbest bırak
            if (surgeryPerformed) {
                freeTheScroll();
            }
        });
    }

    function freeTheScroll() {
        const bodyStyle = window.getComputedStyle(document.body);
        const htmlStyle = window.getComputedStyle(document.documentElement);

        if (bodyStyle.overflow === 'hidden' || bodyStyle.position === 'fixed') {
            document.body.style.setProperty('overflow', 'auto', 'important');
            document.body.style.setProperty('position', 'static', 'important');
            console.log("[AAE-DOM-Surgeon] Body kaydırma kilidi kırıldı.");
        }
        if (htmlStyle.overflow === 'hidden') {
            document.documentElement.style.setProperty('overflow', 'auto', 'important');
            console.log("[AAE-DOM-Surgeon] HTML kaydırma kilidi kırıldı.");
        }
    }

    // Sayfa tamamen yüklendiğinde bir tarama yap
    window.addEventListener('load', performSurgery);

    // Dinamik olarak sonradan eklenen pencereleri yakalamak için MutationObserver
    const observer = new MutationObserver((mutations) => {
        let shouldCheck = false;
        for (let mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                shouldCheck = true;
                break;
            }
        }
        if (shouldCheck) {
            performSurgery();
        }
    });

    observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true
    });

    // Sayfaya dışarıdan API açıyoruz
    window.AAEDOMSurgeon = {
        forceClean: performSurgery,
        freeScroll: freeTheScroll
    };
})();
