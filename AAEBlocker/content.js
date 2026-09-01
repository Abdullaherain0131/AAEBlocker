// AAEBlocker Content Script V3 - The Ultimate Toolkit

let settings = {
  aaeBlockerEnabled: true,
  adReplacer: true,
  cookieRejecter: true,
  youtubeSkipper: true,
  wordBlocker: true,
  blockedWords: "spoiler, bahis, kumar",
  darkMode: false
};

chrome.storage.local.get(null, function(result) {
  settings = { ...settings, ...result };
  
  if (settings.aaeBlockerEnabled) {
    runModules();
  }
});

chrome.storage.onChanged.addListener(function(changes) {
  let needsReload = false;
  for (let key in changes) {
    settings[key] = changes[key].newValue;
    if (key === 'aaeBlockerEnabled' || key === 'darkMode') needsReload = true;
  }
  if (needsReload) window.location.reload();
});

function runModules() {
  
  // 1. CSS-Based Ad Replacer (Guaranteed to show logo on empty ads without freezing)
  if (settings.adReplacer) {
    const logoUrl = chrome.runtime.getURL('icons/logo.png');
    const style = document.createElement('style');
    style.id = "aae-ad-replacer-css";
    style.textContent = `
      ins.adsbygoogle, 
      iframe[id^="google_ads_iframe"], 
      iframe[src*="doubleclick"], 
      iframe[src*="amazon-adsystem"],
      .ad-container, .ad-slot, .ad-wrapper, .banner-ad, [id*="banner-ad"] {
          background-image: url('${logoUrl}') !important;
          background-size: 80% !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
          background-color: #1a1b26 !important;
          border: 1px dashed #00ffcc !important;
          min-width: 100px !important;
          min-height: 50px !important;
          display: flex !important;
      }
      /* Hide the inner text like "ADVERTISEMENT" if it's a direct child */
      .ad-container::before { content: "BLOCKED BY AAEBlocker"; color: #00ffcc; font-size: 10px; position: absolute; top: 2px; left: 2px; font-family: monospace; }
    `;
    document.head.appendChild(style);
  }

  // 2. Cookie Rejecter
  if (settings.cookieRejecter) {
    const rejectKeywords = ["reject all", "tümünü reddet", "decline all", "tout refuser", "alles ablehnen", "kabul etme"];
    let attempts = 0;
    const interval = setInterval(() => {
        const buttons = document.querySelectorAll('button, a, [role="button"]');
        let clicked = false;
        for (let btn of buttons) {
            const text = (btn.textContent || "").toLowerCase().trim();
            if (rejectKeywords.includes(text) && btn.offsetHeight > 0) {
                btn.click();
                clicked = true;
                break;
            }
        }
        if (clicked || attempts > 15) clearInterval(interval);
        attempts++;
    }, 800);
  }

  // 3. YouTube Ad Skipper
  if (settings.youtubeSkipper && window.location.hostname.includes("youtube.com")) {
    setInterval(() => {
      const skipBtn = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button');
      if (skipBtn) {
        skipBtn.click();
        console.log("[AAEBlocker] YouTube Ad Skipped!");
      }
      const adVideo = document.querySelector('.ad-showing video');
      if (adVideo) {
        adVideo.playbackRate = 16.0; // Fast forward unskippable ads
        adVideo.muted = true;
      }
    }, 500);
  }

  // 4. Word Blocker (Removes element completely)
  if (settings.wordBlocker && settings.blockedWords.trim().length > 0) {
    const wordsToBlock = settings.blockedWords.split(',').map(w => w.trim().toLowerCase()).filter(w => w.length > 2);
    
    if (wordsToBlock.length > 0) {
        const hideBlockedWords = () => {
          const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div.tweet, div[data-testid="tweet"]');
          elements.forEach(el => {
            if (el.children.length > 3) return; // Skip large containers
            if (el.style.display === 'none') return;
            
            const text = (el.textContent || "").toLowerCase();
            for (let word of wordsToBlock) {
                if (text.includes(word)) {
                    el.style.display = 'none'; // Completely hide it
                    console.log("[AAEBlocker] Removed content containing:", word);
                    break;
                }
            }
          });
        };
        
        hideBlockedWords();
        setInterval(hideBlockedWords, 2000); // Check dynamically loaded content occasionally
    }
  }

  // 5. Dark Mode Enforcer
  if (settings.darkMode) {
    const darkStyle = document.createElement('style');
    darkStyle.textContent = `
      html { filter: invert(90%) hue-rotate(180deg) !important; background: #fff !important; }
      img, video, iframe { filter: invert(100%) hue-rotate(180deg) !important; }
    `;
    document.head.appendChild(darkStyle);
  }
}
