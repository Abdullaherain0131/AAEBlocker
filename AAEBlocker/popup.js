document.addEventListener('DOMContentLoaded', function() {
    const powerToggle = document.getElementById('power-toggle');
    const statusLabel = document.getElementById('status-label');
    
    // Toggles
    const tAdReplacer = document.getElementById('t-adReplacer');
    const tCookieRejecter = document.getElementById('t-cookieRejecter');
    const tYoutubeSkipper = document.getElementById('t-youtubeSkipper');
    const tDarkMode = document.getElementById('t-darkMode');
    const tGhostMode = document.getElementById('t-ghostMode');
    const tPaywallBypasser = document.getElementById('t-paywallBypasser');
    const tWordBlocker = document.getElementById('t-wordBlocker');
    const blockedWordsInput = document.getElementById('blocked-words');

    const defaultSettings = {
        aaeBlockerEnabled: true,
        adReplacer: true,
        cookieRejecter: true,
        youtubeSkipper: true,
        darkMode: false,
        ghostMode: false,
        paywallBypasser: false,
        wordBlocker: true,
        blockedWords: "spoiler, bahis, kumar"
    };

    // Load state
    chrome.storage.local.get(null, function(result) {
        const settings = { ...defaultSettings, ...result };
        
        powerToggle.checked = settings.aaeBlockerEnabled;
        tAdReplacer.checked = settings.adReplacer;
        tCookieRejecter.checked = settings.cookieRejecter;
        tYoutubeSkipper.checked = settings.youtubeSkipper;
        tDarkMode.checked = settings.darkMode;
        tGhostMode.checked = settings.ghostMode;
        tPaywallBypasser.checked = settings.paywallBypasser;
        tWordBlocker.checked = settings.wordBlocker;
        blockedWordsInput.value = settings.blockedWords;
        
        updateUI(settings.aaeBlockerEnabled);
    });

    // Handle Power toggle
    powerToggle.addEventListener('change', function() {
        const newState = powerToggle.checked;
        chrome.storage.local.set({ aaeBlockerEnabled: newState });
        updateUI(newState);
    });

    // Handle mini toggles
    const saveSetting = (key, value) => {
        let obj = {}; obj[key] = value;
        chrome.storage.local.set(obj);
    };

    tAdReplacer.addEventListener('change', e => saveSetting('adReplacer', e.target.checked));
    tCookieRejecter.addEventListener('change', e => saveSetting('cookieRejecter', e.target.checked));
    tYoutubeSkipper.addEventListener('change', e => saveSetting('youtubeSkipper', e.target.checked));
    tDarkMode.addEventListener('change', e => saveSetting('darkMode', e.target.checked));
    tGhostMode.addEventListener('change', e => saveSetting('ghostMode', e.target.checked));
    tPaywallBypasser.addEventListener('change', e => saveSetting('paywallBypasser', e.target.checked));
    tWordBlocker.addEventListener('change', e => saveSetting('wordBlocker', e.target.checked));
    
    // Save words when typing stops
    let typingTimer;
    blockedWordsInput.addEventListener('keyup', () => {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => saveSetting('blockedWords', blockedWordsInput.value), 500);
    });

    function updateUI(isEnabled) {
        if (isEnabled) {
            statusLabel.textContent = "KORUMA AKTİF";
            statusLabel.style.color = "#00c853";
        } else {
            statusLabel.textContent = "KORUMA KAPALI";
            statusLabel.style.color = "#c62828";
        }
    }
});
