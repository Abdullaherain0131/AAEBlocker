const blockedDomains = [
  "*://*.doubleclick.net/*", "*://*.googleadservices.com/*", "*://*.googlesyndication.com/*",
  "*://*.google-analytics.com/*", "*://*.googletagmanager.com/*", "*://*.facebook.com/tr*",
  "*://*.facebook.net/en_US/fbevents.js*", "*://connect.facebook.net/*", "*://*.amazon-adsystem.com/*",
  "*://*.taboola.com/*", "*://*.outbrain.com/*", "*://*.outbrainimg.com/*", "*://*.criteo.com/*",
  "*://*.adroll.com/*", "*://mc.yandex.ru/*", "*://*.bing.com/bat.js*", "*://*.clarity.ms/*",
  "*://*.media.net/*", "*://*.rubiconproject.com/*", "*://*.adform.net/*", "*://*.casalemedia.com/*",
  "*://*.hotjar.com/*", "*://*.scorecardresearch.com/*"
];

let settings = {
  aaeBlockerEnabled: true,
  ghostMode: false,
  paywallBypasser: false
};

chrome.storage.local.get(null, function(result) {
  settings = { ...settings, ...result };
});

chrome.storage.onChanged.addListener(function(changes) {
  for (let key in changes) {
    settings[key] = changes[key].newValue;
  }
});

// Ad Blocker
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    if (settings.aaeBlockerEnabled) return { cancel: true };
    return { cancel: false };
  },
  { urls: blockedDomains },
  ["blocking"]
);

// Ghost Mode (Spoof User Agent) & Paywall Bypass (Remove Referer/Cookies for News Sites)
const newsSites = ["*://*.wsj.com/*", "*://*.nytimes.com/*", "*://*.washingtonpost.com/*", "*://*.medium.com/*", "*://*.bloomberg.com/*"];

chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    if (!settings.aaeBlockerEnabled) return { requestHeaders: details.requestHeaders };
    
    let isNewsSite = newsSites.some(url => details.url.includes(url.replace('*://*.', '').replace('/*', '')));

    for (let i = 0; i < details.requestHeaders.length; ++i) {
      // Ghost Mode Spoof
      if (settings.ghostMode && details.requestHeaders[i].name === 'User-Agent') {
        details.requestHeaders[i].value = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36';
      }
      
      // Paywall Bypasser - Trick sites into thinking it's a search engine or new visitor
      if (settings.paywallBypasser && isNewsSite) {
        if (details.requestHeaders[i].name === 'Referer') {
          details.requestHeaders[i].value = 'https://www.google.com/';
        }
        if (details.requestHeaders[i].name === 'Cookie') {
          details.requestHeaders.splice(i, 1);
          i--;
        }
      }
    }
    
    // Add Google Referer if missing for Paywall
    if (settings.paywallBypasser && isNewsSite) {
        details.requestHeaders.push({name: 'Referer', value: 'https://www.google.com/'});
    }

    return { requestHeaders: details.requestHeaders };
  },
  { urls: ["<all_urls>"] },
  ["blocking", "requestHeaders"]
);

console.log("AAEBlocker Advanced Background Service Running.");
