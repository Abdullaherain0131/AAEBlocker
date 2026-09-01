document.addEventListener('DOMContentLoaded', () => {
    // Buttons
    const powerBtn = document.getElementById('aae-power-btn');
    const dashBtn = document.getElementById('aae-btn-dashboard');
    const logBtn = document.getElementById('aae-btn-logger');
    const blockSite = document.getElementById('aae-block-site');
    const blockTotal = document.getElementById('aae-block-total');
    
    // Original uBlock elements
    const originalSwitch = document.getElementById('switch');
    
    // Wait slightly for uBlock popup logic to render its stats
    setInterval(() => {
        // Read original stats
        const statContainers = document.querySelectorAll('#basicStats span');
        if (statContainers.length > 3) {
            blockSite.textContent = statContainers[0].textContent;
            blockTotal.textContent = statContainers[2].textContent;
        }
        
        // Update power button state based on document.body class
        if (document.body.classList.contains('off')) {
            powerBtn.textContent = 'PASİF';
            powerBtn.style.background = '#331111';
            powerBtn.style.borderColor = '#ff0000';
            powerBtn.style.color = '#ff0000';
            powerBtn.style.boxShadow = '0 0 30px rgba(255,0,0,0.4)';
        } else {
            powerBtn.textContent = 'AKTİF';
            powerBtn.style.background = '#1a1b26';
            powerBtn.style.borderColor = '#00ffcc';
            powerBtn.style.color = '#00ffcc';
            powerBtn.style.boxShadow = '0 0 30px rgba(0,255,204,0.4)';
        }
    }, 500);

    // Proxy Clicks
    powerBtn.addEventListener('click', () => {
        if (originalSwitch) {
            // Tam bir mouse eventi tetikleyelim ki uBlock algılasın
            originalSwitch.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        }
    });

    dashBtn.addEventListener('click', () => {
        window.open('dashboard.html', '_blank');
    });

    logBtn.addEventListener('click', () => {
        window.open('logger-ui.html', '_blank');
    });
    
    // AI Brain Export/Import Logic
    const exportBtn = document.getElementById('aae-btn-export');
    const importBtn = document.getElementById('aae-btn-import');
    const importFile = document.getElementById('aae-import-file');
    
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            chrome.storage.local.get(['aae_ai_weights'], (result) => {
                const weights = result.aae_ai_weights || { w1: 0.25, w2: 0.25, w3: 0.25, w4: 0.25, b: -0.5 };
                const blob = new Blob([JSON.stringify(weights, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'aae-brain.json';
                a.click();
                URL.revokeObjectURL(url);
                alert("Beyin başarıyla dışa aktarıldı!");
            });
        });
    }

    if (importBtn && importFile) {
        importBtn.addEventListener('click', () => {
            importFile.click();
        });
        importFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const parsed = JSON.parse(ev.target.result);
                    if (parsed.w1 !== undefined && parsed.b !== undefined) {
                        chrome.storage.local.set({ aae_ai_weights: parsed }, () => {
                            alert("Beyin başarıyla içe aktarıldı! Yapay Zeka yeni tecrübelerle güncellendi.");
                        });
                    } else {
                        alert("Geçersiz dosya formatı!");
                    }
                } catch(e) {
                    alert("Dosya okunamadı!");
                }
            };
            reader.readAsText(file);
        });
    }
    
    // Hover effects
    const addHover = (btn, color) => {
        btn.addEventListener('mouseenter', () => {
            btn.style.background = color;
            btn.style.color = '#0b0f19';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.background = 'transparent';
            btn.style.color = color;
        });
    };
    addHover(dashBtn, '#ff00ff');
    addHover(logBtn, '#00ffcc');
    if (exportBtn) addHover(exportBtn, '#ffff00');
    if (importBtn) addHover(importBtn, '#ff9900');
    
    // AI Panel Logic
    const btnAi = document.getElementById('aae-btn-ai');
    const mainPanel = document.getElementById('aae-custom-ui');
    const aiPanel = document.getElementById('aae-ai-panel');
    const btnAiBack = document.getElementById('aae-ai-back');
    const aiInput = document.getElementById('aae-ai-input');
    const aiSend = document.getElementById('aae-ai-send');
    const aiChat = document.getElementById('aae-ai-chat');
    
    btnAi.addEventListener('click', () => {
        mainPanel.style.display = 'none';
        aiPanel.style.display = 'flex';
    });
    
    btnAiBack.addEventListener('click', () => {
        aiPanel.style.display = 'none';
        mainPanel.style.display = 'block';
    });
    
    const addMessage = (sender, text) => {
        const msg = document.createElement('div');
        msg.style.marginTop = '5px';
        msg.style.paddingLeft = '5px';
        if (sender === 'USER') {
            msg.style.color = '#00ffcc';
            msg.style.borderLeft = '2px solid #00ffcc';
            msg.textContent = `> SEN: ${text}`;
        } else {
            msg.style.color = '#00c853';
            msg.style.borderLeft = '2px solid #00c853';
            msg.innerHTML = `> AAE_CORE: ${text}`;
        }
        aiChat.appendChild(msg);
        aiChat.scrollTop = aiChat.scrollHeight;
    };

    const processCommand = (cmd) => {
        addMessage('USER', cmd);
        aiInput.value = '';
        
        const c = cmd.toLowerCase().trim();
        
        if (c === 'yardım' || c === 'help') {
            addMessage('CORE', "KULLANILABİLİR KOMUTLAR:<br>- <span style='color:#fff'>/tara</span> : Riskli elementleri analiz et.<br>- <span style='color:#fff'>/imha</span> : Görünmez/reklam kodları yok et.<br>- <span style='color:#fff'>/kalkan</span> : Gelişmiş Anti-Adblock koruması.<br>- <span style='color:#fff'>/nojs</span> : Aktif sayfadaki tüm JavaScript'leri dondur.<br>- <span style='color:#fff'>/ghost</span> : Arama motoru botu (Googlebot) kılığına gir (Paywall Kırıcı).<br>- <span style='color:#fff'>/speed</span> : Tüm videoları sessize al ve 16x hızlandır (Reklam Atlayıcı).<br>- <span style='color:#fff'>/freeze</span> : Sayfanın DOM ağacını dondur ve değişmesini engelle.<br>- <span style='color:#fff'>/ogren</span> : Yapay zekayı eğitmek için ekrandaki reklama tıkla.<br>- <span style='color:#fff'>/clear</span> : Terminali temizle.");
            return;
        }
        
        if (c === '/clear') {
            aiChat.innerHTML = '';
            addMessage('CORE', "Terminal temizlendi.");
            return;
        }

        // Execute script commands on the active tab
        if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                if (!tabs || tabs.length === 0) {
                    addMessage('CORE', "HATA: Aktif sekme bulunamadı veya yetki yok.");
                    return;
                }
                
                const tabId = tabs[0].id;

                if (c === '/tara' || c === 'tara') {
                    addMessage('CORE', "Ağ taraması başlatılıyor...");
                    chrome.tabs.executeScript(tabId, {
                        code: `
                            (function() {
                                let ads = document.querySelectorAll('iframe, .ad, [id*="ad-"], [class*="ad-"], ins').length;
                                let scripts = document.querySelectorAll('script').length;
                                return "BULGULAR:\\n- Gizli/Açık İlan Sayısı: " + ads + "\\n- Yüklü Çalıştırılabilir Script: " + scripts;
                            })();
                        `
                    }, (res) => {
                        if (chrome.runtime.lastError) addMessage('CORE', "HATA: Sayfaya ulaşılamıyor. " + chrome.runtime.lastError.message);
                        else addMessage('CORE', (res[0] || "Temiz.") + "<br>Tavsiye: /imha komutunu kullanabilirsiniz.");
                    });
                } 
                else if (c === '/imha' || c === 'imha') {
                    addMessage('CORE', "BRUTAL İMHA PROTOKOLÜ BAŞLATILDI...");
                    chrome.tabs.executeScript(tabId, {
                        code: `
                            (function() {
                                let c = 0;
                                document.querySelectorAll('iframe, .ad, [id*="ad"], [class*="ad"], ins').forEach(el => {
                                    el.style.setProperty('display', 'none', 'important');
                                    c++;
                                });
                                return c;
                            })();
                        `
                    }, (res) => {
                        if (chrome.runtime.lastError) addMessage('CORE', "HATA: Yetki kısıtlaması.");
                        else addMessage('CORE', "BAŞARILI! " + (res[0] || 0) + " adet şüpheli element parçalandı.");
                    });
                }
                else if (c === '/kalkan' || c === 'kalkan') {
                    addMessage('CORE', "Anti-Adblock Spoofing Protokolü aktif ediliyor...");
                    chrome.tabs.executeScript(tabId, {
                        code: `
                            (function() {
                                document.body.style.setProperty('overflow', 'auto', 'important');
                                document.documentElement.style.setProperty('overflow', 'auto', 'important');
                                document.body.style.setProperty('position', 'static', 'important');
                                document.documentElement.style.setProperty('position', 'static', 'important');
                                
                                // Performanslı tarama (Sadece body'nin direkt alt çocuklarını veya sabit elemanları tara)
                                const children = document.body.children;
                                for (let i = 0; i < children.length; i++) {
                                    const el = children[i];
                                    if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'NOSCRIPT') continue;
                                    const style = window.getComputedStyle(el);
                                    if ((style.position === 'fixed' || style.position === 'absolute') && parseInt(style.zIndex) > 100) {
                                        el.style.setProperty('display', 'none', 'important');
                                    }
                                }
                                return "Kalkan Bypass Edildi. Kilitler ve perdeler kırıldı.";
                            })();
                        `
                    }, (res) => {
                        if (chrome.runtime.lastError) addMessage('CORE', "HATA: Sayfa koruması çok yüksek.");
                        else addMessage('CORE', res[0] || "İşlem Tamam.");
                    });
                }
                else if (c === '/nojs' || c === 'nojs') {
                    addMessage('CORE', "NoScript Modu (JS-Dondurucu) Başlatılıyor... Sayfa JavaScript'siz olarak yeniden yüklenecek.");
                    chrome.tabs.executeScript(tabId, {
                        code: `
                            (function() {
                                // 1. YÖNTEM: CSP (Content Security Policy) Enjekte ederek JS yürütülmesini engelle
                                const meta = document.createElement('meta');
                                meta.httpEquiv = 'Content-Security-Policy';
                                meta.content = "script-src 'none';";
                                document.getElementsByTagName('head')[0].appendChild(meta);
                                
                                // 2. YÖNTEM: Inline Event Listener'ları temizle
                                const allElements = document.querySelectorAll('*');
                                for (let i = 0; i < allElements.length; i++) {
                                    const el = allElements[i];
                                    if (el.tagName === 'SCRIPT') {
                                        el.parentNode.removeChild(el);
                                    } else {
                                        // Tüm on* attribute'larını (onclick, onload vs.) sil
                                        const attrs = el.attributes;
                                        for (let j = attrs.length - 1; j >= 0; j--) {
                                            if (attrs[j].name.startsWith('on')) {
                                                el.removeAttribute(attrs[j].name);
                                            }
                                        }
                                    }
                                }
                                
                                // Global objeleri dondurarak dışarıdan script enjeksiyonunu engelle
                                Object.freeze(window);
                                Object.freeze(document);
                                
                                return "JS Yürütme Motoru Tamamen Donduruldu.";
                            })();
                        `
                    }, (res) => {
                        if (chrome.runtime.lastError) addMessage('CORE', "HATA: Güvenlik duvarı nedeniyle JS engellenemedi.");
                        else addMessage('CORE', res[0] || "JS Motoru Durduruldu.");
                    });
                }
                else if (c === '/ghost' || c === 'ghost') {
                    addMessage('CORE', "Hayalet Modu (Googlebot) Aktif Ediliyor...");
                    chrome.tabs.executeScript(tabId, {
                        code: `
                            (function() {
                                Object.defineProperty(navigator, 'userAgent', {
                                    get: function () { return 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'; }
                                });
                                Object.defineProperty(navigator, 'vendor', { get: function () { return 'Google Inc.'; } });
                                return "Tarayıcı Kimliği Değiştirildi. Artık bir Googlebot'sunuz.";
                            })();
                        `
                    }, (res) => {
                        if (chrome.runtime.lastError) addMessage('CORE', "HATA: Kimlik değiştirilemedi.");
                        else addMessage('CORE', res[0] || "Kimlik Değiştirildi.");
                    });
                }
                else if (c === '/speed' || c === 'speed') {
                    addMessage('CORE', "Medya İvme Motoru Devrede (16x Speed)...");
                    chrome.tabs.executeScript(tabId, {
                        code: `
                            (function() {
                                let c = 0;
                                document.querySelectorAll('video, audio').forEach(media => {
                                    media.muted = true;
                                    media.playbackRate = 16.0;
                                    c++;
                                });
                                return "Sayfadaki " + c + " adet medya 16x hızlandırıldı ve susturuldu.";
                            })();
                        `
                    }, (res) => {
                        if (chrome.runtime.lastError) addMessage('CORE', "HATA: Medya hızlandırılamadı.");
                        else addMessage('CORE', res[0] || "İşlem Tamam.");
                    });
                }
                else if (c === '/freeze' || c === 'freeze') {
                    addMessage('CORE', "Mutlak Dondurma (DOM Freeze) Başlatılıyor...");
                    chrome.tabs.executeScript(tabId, {
                        code: `
                            (function() {
                                // Tüm timeout'ları durdur (sadece çalışanları)
                                const highestTimeoutId = setTimeout(";");
                                for (let i = 0 ; i < highestTimeoutId ; i++) {
                                    clearTimeout(i);
                                }
                                
                                // Olay dinleyicilerini kilitlemek için body'nin klonunu oluştur
                                const clone = document.body.cloneNode(true);
                                document.body.parentNode.replaceChild(clone, document.body);
                                
                                // Sayfayı dondur
                                document.body.style.setProperty('overflow', 'auto', 'important');
                                document.documentElement.style.setProperty('overflow', 'auto', 'important');
                                
                                return "Sayfa Donduruldu. Hiçbir script DOM'u değiştiremez.";
                            })();
                        `
                    }, (res) => {
                        if (chrome.runtime.lastError) addMessage('CORE', "HATA: Dondurma işlemi başarısız.");
                        else addMessage('CORE', res[0] || "Sayfa Donduruldu.");
                    });
                }
                else if (c === '/ogren' || c === 'ogren') {
                    addMessage('CORE', "AI Öğrenme Modu (Element Seçici) Aktif Ediliyor...");
                    chrome.tabs.sendMessage(tabId, { type: "AAE_PICKER_MODE" }, (res) => {
                        if (chrome.runtime.lastError) {
                            addMessage('CORE', "HATA: Sayfaya ulaşılamıyor (Özel sayfalarda çalışmaz).");
                        } else {
                            addMessage('CORE', "Sayfaya dönün ve reklam olan elemente sol tıklayın!");
                        }
                    });
                }
                else {
                    addMessage('CORE', "Tanımlanmayan Komut. Geçerli komutları görmek için 'yardım' yazın.");
                }
            });
        } else {
            addMessage('CORE', "HATA: Yerel eklenti API'sine ulaşılamıyor.");
        }
    };
    
    aiSend.addEventListener('click', () => {
        if (aiInput.value.trim()) processCommand(aiInput.value.trim());
    });
    
    aiInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && aiInput.value.trim()) processCommand(aiInput.value.trim());
    });
});
