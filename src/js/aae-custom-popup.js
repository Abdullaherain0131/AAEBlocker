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
    let lastSiteStat = "0";
    let lastTotalStat = "0";
    
    // Animate counting numbers
    function animateValue(obj, start, end, duration) {
        if (!obj) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = end;
            }
        };
        window.requestAnimationFrame(step);
    }
    
    let bootedSite = false;
    let bootedTotal = false;

    setInterval(() => {
        // Read original stats
        const statContainers = document.querySelectorAll('#basicStats span');
        if (statContainers.length > 3) {
            const newSite = statContainers[0].textContent;
            const newTotal = statContainers[2].textContent;
            
            // Clean strings (remove non-digits like commas/dots for counting)
            const getNum = (str) => {
                let n = parseInt(str.replace(/[^0-9]/g, ''));
                return isNaN(n) ? 0 : n;
            };
            
            if (newSite !== lastSiteStat) {
                if (!bootedSite) {
                    animateValue(blockSite, 0, getNum(newSite), 1500);
                    bootedSite = true;
                } else {
                    blockSite.textContent = newSite;
                }
                lastSiteStat = newSite;
            }
            if (newTotal !== lastTotalStat) {
                if (!bootedTotal) {
                    animateValue(blockTotal, 0, getNum(newTotal), 2000);
                    bootedTotal = true;
                } else {
                    blockTotal.textContent = newTotal;
                }
                lastTotalStat = newTotal;
            }
        }
        
        // Update power button state based on document.body class
        const coreText = powerBtn.querySelector('.aae-core-text') || powerBtn;
        if (document.body.classList.contains('off')) {
            coreText.textContent = 'PASİF';
            powerBtn.style.background = 'radial-gradient(circle, #ff0000 0%, #4a0000 70%, #020617 100%)';
            powerBtn.style.borderColor = '#ff0000';
            powerBtn.style.color = '#fff';
            powerBtn.style.boxShadow = '0 0 40px #ff0000, inset 0 0 20px #fff';
        } else {
            coreText.textContent = 'AKTİF';
            powerBtn.style.background = 'radial-gradient(circle, #00ffcc 0%, #064e3b 70%, #020617 100%)';
            powerBtn.style.borderColor = '#00ffcc';
            powerBtn.style.color = '#020617';
            powerBtn.style.boxShadow = '0 0 40px #00ffcc, inset 0 0 20px #fff';
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
        const nativeBtn = document.querySelector('a[href="dashboard.html"]');
        if (nativeBtn) {
            nativeBtn.click();
        } else {
            chrome.runtime.openOptionsPage ? chrome.runtime.openOptionsPage() : window.open('dashboard.html');
        }
    });

    logBtn.addEventListener('click', () => {
        const nativeBtn = document.querySelector('a[href="logger-ui.html#_"]');
        if (nativeBtn) {
            nativeBtn.click();
        } else {
            window.open('logger-ui.html#_');
        }
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
    const btnAiTrain = document.getElementById('aae-btn-ai-train');
    const mainPanel = document.getElementById('aae-custom-ui');
    const aiPanel = document.getElementById('aae-ai-panel');
    const btnAiBack = document.getElementById('aae-ai-back');
    const aiInput = document.getElementById('aae-ai-input');
    const aiSend = document.getElementById('aae-ai-send');
    const aiChat = document.getElementById('aae-ai-chat');
    
    if (btnAiTrain) addHover(btnAiTrain, '#f39c12');
    

    
    btnAi.addEventListener('click', () => {
        mainPanel.style.display = 'none';
        aiPanel.style.display = 'flex';
    });

    if (btnAiTrain) {
        btnAiTrain.addEventListener('click', () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const tabId = tabs[0].id;
                chrome.tabs.sendMessage(tabId, { type: "AAE_PICKER_MODE" }, (res) => {
                    if (chrome.runtime.lastError) {
                        alert("HATA: Sayfaya ulaşılamıyor (Özel Mozilla sayfalarında çalışmaz).");
                    } else {
                        window.close(); // Popup'ı kapat ki sayfadaki elementi seçebilsin
                    }
                });
            });
        });
    }
    
    btnAiBack.addEventListener('click', () => {
        aiPanel.style.display = 'none';
        mainPanel.style.display = 'block';
    });
    
    function addMessage(sender, text) {
        const msg = document.createElement('div');
        msg.style.marginTop = '5px';
        msg.style.paddingLeft = '5px';
        
        if (sender === 'USER') {
            msg.style.color = '#00ffcc';
            msg.style.borderLeft = '2px solid #00ffcc';
            msg.textContent = `> SEN: ${text}`;
            aiChat.appendChild(msg);
            aiChat.scrollTop = aiChat.scrollHeight;
        } else {
            msg.style.color = '#00c853';
            msg.style.borderLeft = '2px solid #00c853';
            msg.textContent = '> AAE_CORE: ';
            aiChat.appendChild(msg);
            
            let i = 0;
            const textSpan = document.createElement('span');
            msg.appendChild(textSpan);
            const interval = setInterval(() => {
                textSpan.textContent += text.charAt(i);
                i++;
                aiChat.scrollTop = aiChat.scrollHeight;
                if (i >= text.length) clearInterval(interval);
            }, 10);
        }
    }

    const processCommand = (cmd) => {
        addMessage('USER', cmd);
        aiInput.value = '';
        
        const c = cmd.toLowerCase().trim();
        
        if (c === 'yardım' || c === 'help') {
            addMessage('CORE', "KULLANILABİLİR KOMUTLAR:<br>- <span style='color:#fff'>/tara</span> : Riskli elementleri analiz et.<br>- <span style='color:#imha'>/imha</span> : Görünmez/reklam kodları yok et.<br>- <span style='color:#fff'>/kalkan</span> : Gelişmiş Anti-Adblock koruması.<br>- <span style='color:#fff'>/nojs</span> : Aktif sayfadaki JavaScript'leri dondur.<br>- <span style='color:#fff'>/ghost</span> : Arama motoru botu (Googlebot) kılığına gir.<br>- <span style='color:#fff'>/speed</span> : Videoları 16x hızlandır.<br>- <span style='color:#fff'>/freeze</span> : Sayfanın DOM ağacını dondur.<br>- <span style='color:#fff'>/ogren</span> : Yapay zekayı eğitmek için reklama tıkla.<br>- <span style='color:#fff'>/matrix</span> : Canlı Ağ Trafiği Matrisi.<br>- <span style='color:#fff'>/burn</span> : Sayfadaki tüm izleri ve çerezleri yak.<br>- <span style='color:#fff'>/analiz</span> : Oltalamaları (Phishing) puanla.<br>- <span style='color:#0f0'>/xray</span> : Görünmez elementleri neon renklerle ifşa et.<br>- <span style='color:#0f0'>/deface</span> : Reklamları hackleyip imza bırak.<br>- <span style='color:#0f0'>/dark</span> : Tüm siteyi karanlık moda zorla.<br>- <span style='color:#f00'>/panic</span> : Sayfayı gizle ve sesi kes (Patron Tuşu).<br>- <span style='color:#f00'>/nuke</span> : Tüm sekmeleri ve verileri nükleer silin.<br>- <span style='color:#0f0'>/stealth</span> : İzleyici fare kameralarını zehirle.<br>- <span style='color:#0f0'>/sniper</span> : Yapışkan (sticky) üst/alt barları vur.<br>- <span style='color:#0f0'>/focus</span> : Saf okuma moduna (sadece metin) geç.<br>- <span style='color:#ff00ff'>/cloak</span> : Görünmezlik kalkanı. Sayfa yazılarını şifreler.<br>- <span style='color:#ff00ff'>/bypass</span> : Gizlenmiş (Paywall) metinleri zorla görünür yapar.<br>- <span style='color:#ff00ff'>/rewind</span> : Erişilmeyen sayfanın Wayback Machine arşivine ışınlar.<br>- <span style='color:#fff'>/clear</span> : Terminali temizle.");
            return;
        }
        
        if (c === '/clear') {
            aiChat.textContent = '';
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
                    addMessage('CORE', "BRUTAL İMHA PROTOKOLÜ BAŞLATILDI (LAZER AKTİF)...");
                    chrome.tabs.executeScript(tabId, {
                        code: `
                            (function() {
                                let c = 0;
                                if (!document.getElementById('aae-laser-anim')) {
                                    const style = document.createElement('style');
                                    style.id = 'aae-laser-anim';
                                    style.textContent = \`
                                        @keyframes aaeLaserBurn {
                                            0% { filter: drop-shadow(0 0 10px red); transform: scale(1); }
                                            50% { filter: drop-shadow(0 0 30px red); transform: scale(1.05) skewX(10deg); background-color: rgba(255,0,0,0.5); }
                                            100% { filter: blur(10px); transform: scale(0.1); opacity: 0; }
                                        }
                                        .aae-burning {
                                            animation: aaeLaserBurn 0.8s ease-out forwards !important;
                                            pointer-events: none !important;
                                        }
                                    \`;
                                    (document.head || document.documentElement).appendChild(style);
                                }
                                document.querySelectorAll('iframe, .ad, [id*="ad"], [class*="ad"], ins').forEach(el => {
                                    el.classList.add('aae-burning');
                                    setTimeout(() => el.style.setProperty('display', 'none', 'important'), 800);
                                    c++;
                                });
                                return c;
                            })();
                        `
                    }, (res) => {
                        if (chrome.runtime.lastError) addMessage('CORE', "HATA: Yetki kısıtlaması.");
                        else addMessage('CORE', "BAŞARILI! " + (res[0] || 0) + " adet şüpheli element yakılarak parçalandı.");
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
                else if (c === '/matrix' || c === 'matrix') {
                    addMessage('CORE', "Matrix Canlı Veri Akışı Başlatılıyor...");
                    chrome.runtime.sendMessage({ type: "GET_RECENT_BLOCKS" }, (response) => {
                        if (response && response.blocks && response.blocks.length > 0) {
                            let i = 0;
                            const stream = setInterval(() => {
                                if(i >= response.blocks.length) {
                                    clearInterval(stream);
                                    addMessage('CORE', "Veri akışı tamamlandı.");
                                    return;
                                }
                                addMessage('CORE', `<span style="color:#0f0; font-family:monospace;">BLOKLANDI: ${response.blocks[i]}</span>`);
                                i++;
                            }, 300);
                        } else {
                            addMessage('CORE', "Şu an arka planda bekleyen engellenmiş istek yok.");
                        }
                    });
                }
                else if (c === '/burn' || c === 'burn') {
                    addMessage('CORE', "İz Yakıcı Protokol Başlatılıyor...");
                    chrome.tabs.executeScript(tabId, {
                        code: `
                            (function() {
                                document.cookie.split(";").forEach(function(c) { 
                                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
                                });
                                localStorage.clear();
                                sessionStorage.clear();
                                return "Çerezler ve Yerel Depolama (LocalStorage) tamamen yok edildi. Sayfa yeniden yükleniyor...";
                            })();
                        `
                    }, (res) => {
                        if (chrome.runtime.lastError) addMessage('CORE', "HATA: Veriler silinemedi. Yetki reddedildi.");
                        else {
                            addMessage('CORE', res[0] || "İşlem Tamam.");
                            setTimeout(() => { chrome.tabs.reload(tabId); }, 2500);
                        }
                    });
                }
                else if (c === '/analiz' || c === 'analiz') {
                    addMessage('CORE', "Sayfa Tehdit Analizi Başlatılıyor...");
                    chrome.tabs.executeScript(tabId, {
                        code: `
                            (function() {
                                let score = 0;
                                let reasons = [];
                                
                                const iframes = document.querySelectorAll('iframe');
                                let hiddenIframes = 0;
                                iframes.forEach(f => {
                                    if(f.style.display === 'none' || f.style.opacity === '0' || f.width === '0' || f.height === '0') {
                                        hiddenIframes++;
                                        score += 25;
                                    }
                                });
                                if(hiddenIframes > 0) reasons.push(hiddenIframes + " adet görünmez iFrame (Çok riskli)");
                                
                                const scripts = document.querySelectorAll('script');
                                let crossScripts = 0;
                                scripts.forEach(s => {
                                    if(s.src && !s.src.includes(window.location.hostname)) {
                                        crossScripts++;
                                    }
                                });
                                if(crossScripts > 5) {
                                    score += 15;
                                    reasons.push(crossScripts + " adet dış kaynaklı script (İzleyici şüphesi)");
                                }
                                
                                const forms = document.querySelectorAll('form');
                                forms.forEach(f => {
                                    if(f.action && !f.action.startsWith('https')) {
                                        score += 40;
                                        reasons.push("Güvenli olmayan (HTTP) veri gönderim formu tespit edildi!");
                                    }
                                });
                                
                                let riskLevel = "DÜŞÜK";
                                if (score > 30) riskLevel = "ORTA";
                                if (score > 60) riskLevel = "YÜKSEK (DİKKAT!)";
                                if (score > 90) riskLevel = "KRİTİK (KİRLİ SİTE)";
                                
                                return "TEHDİT SKORU: " + score + " / 100\\nRİSK SEVİYESİ: " + riskLevel + "\\n\\nBulgular:\\n- " + (reasons.length > 0 ? reasons.join("\\n- ") : "Temiz, olağandışı bir durum yok.");
                            })();
                        `
                    }, (res) => {
                        if (chrome.runtime.lastError) addMessage('CORE', "HATA: Analiz başarısız.");
                        else addMessage('CORE', (res[0] || "Analiz Tamam.").replace(/\\n/g, '<br>'));
                    });
                }
                else if (c === '/xray' || c === 'xray') {
                    addMessage('CORE', "RÖNTGEN MODU AKTİF! Gizli elementler ifşa ediliyor...");
                    chrome.tabs.executeScript(tabId, {
                        code: `
                            (function() {
                                let c = 0;
                                if (!document.getElementById('aae-xray-anim')) {
                                    const style = document.createElement('style');
                                    style.id = 'aae-xray-anim';
                                    style.textContent = \`
                                        .aae-xray-exposed {
                                            outline: 3px solid #ff00ff !important;
                                            background-color: rgba(255, 0, 255, 0.3) !important;
                                            box-shadow: 0 0 15px #ff00ff !important;
                                            display: block !important;
                                            visibility: visible !important;
                                            opacity: 1 !important;
                                            z-index: 999999 !important;
                                        }
                                        .aae-xray-exposed::after {
                                            content: 'GİZLİ ELEMENT';
                                            position: absolute;
                                            top: 0; left: 0;
                                            background: #ff00ff; color: #fff;
                                            font-size: 10px; font-weight: bold; padding: 2px;
                                            z-index: 9999999;
                                        }
                                    \`;
                                    (document.head || document.documentElement).appendChild(style);
                                }
                                document.querySelectorAll('iframe, .ad, [id*="ad"], [class*="ad"], ins').forEach(el => {
                                    el.classList.add('aae-xray-exposed');
                                    c++;
                                });
                                return c;
                            })();
                        `
                    }, (res) => {
                        if (chrome.runtime.lastError) addMessage('CORE', "HATA: Yetki kısıtlaması.");
                        else addMessage('CORE', "RÖNTGEN TAMAMLANDI! " + (res[0] || 0) + " adet şüpheli/gizli element neon pembe ile işaretlendi.");
                    });
                }
                else if (c === '/deface' || c === 'deface') {
                    addMessage('CORE', "SİBER İMZA (DEFACE) BAŞLATILDI...");
                    chrome.tabs.executeScript(tabId, {
                        code: `
                            (function() {
                                let c = 0;
                                document.querySelectorAll('iframe, .ad, [id*="ad"], [class*="ad"], ins').forEach(el => {
                                    el.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:#000;color:#0f0;font-family:monospace;font-size:14px;font-weight:bold;text-align:center;border:2px dashed #0f0;box-sizing:border-box;">[DESTROYED BY AAE_LOCAL_CORE]</div>';
                                    el.style.display = 'block';
                                    el.style.visibility = 'visible';
                                    el.style.opacity = '1';
                                    c++;
                                });
                                return c;
                            })();
                        `
                    }, (res) => {
                        if (chrome.runtime.lastError) addMessage('CORE', "HATA: Yetki kısıtlaması.");
                        else addMessage('CORE', "DEFACE TAMAMLANDI! " + (res[0] || 0) + " adet reklama imza bırakıldı.");
                    });
                }
                else if (c === '/dark' || c === 'dark') {
                    addMessage('CORE', "KARANLIK MADDE AKTİF! Site dark moda zorlanıyor...");
                    chrome.tabs.executeScript(tabId, {
                        code: `
                            (function() {
                                if (!document.getElementById('aae-dark-mode')) {
                                    const style = document.createElement('style');
                                    style.id = 'aae-dark-mode';
                                    style.textContent = \`
                                        html { filter: invert(1) hue-rotate(180deg) !important; background: #000 !important; }
                                        img, video, iframe, canvas { filter: invert(1) hue-rotate(180deg) !important; }
                                    \`;
                                    (document.head || document.documentElement).appendChild(style);
                                    return true;
                                }
                                return false;
                            })();
                        `
                    }, (res) => {
                        if (chrome.runtime.lastError) addMessage('CORE', "HATA: Yetki kısıtlaması.");
                        else addMessage('CORE', res[0] ? "KARANLIK MOD AKTİF!" : "Karanlık mod zaten aktif.");
                    });
                }
                else if (c === '/panic' || c === 'panic' || c === '/p' || c === 'p') {
                    addMessage('CORE', "PANİK PROTOKOLÜ: Sayfa gizleniyor...");
                    chrome.tabs.executeScript(tabId, {
                        code: `
                            (function() {
                                // Mute all audio/video
                                document.querySelectorAll('audio, video').forEach(media => media.muted = true);
                                // Replace entire body
                                document.body.innerHTML = '<div style="font-family: Arial, sans-serif; padding: 20px;"><div style="text-align: center; margin-top: 50px;"><h1 style="font-size: 50px; color: #4285F4; display: inline;">G</h1><h1 style="font-size: 50px; color: #EA4335; display: inline;">o</h1><h1 style="font-size: 50px; color: #FBBC05; display: inline;">o</h1><h1 style="font-size: 50px; color: #4285F4; display: inline;">g</h1><h1 style="font-size: 50px; color: #34A853; display: inline;">l</h1><h1 style="font-size: 50px; color: #EA4335; display: inline;">e</h1></div><div style="text-align: center; margin-top: 20px;"><input type="text" style="width: 50%; padding: 10px; border-radius: 20px; border: 1px solid #ccc;" placeholder="Google\\'da Ara"></div></div>';
                                document.body.style.background = "#fff";
                                document.title = "Google";
                                
                                // Swap favicon
                                let link = document.querySelector("link[rel~='icon']");
                                if (!link) {
                                    link = document.createElement('link');
                                    link.rel = 'icon';
                                    document.head.appendChild(link);
                                }
                                link.href = 'https://www.google.com/favicon.ico';
                            })();
                        `
                    }, (res) => {
                        if (chrome.runtime.lastError) addMessage('CORE', "HATA: Sayfa gizlenemedi.");
                        else addMessage('CORE', "PANİK AKTİF: İzler örtbas edildi.");
                    });
                }
                else if (c === '/nuke' || c === 'nuke') {
                    addMessage('CORE', "KIYAMET PROTOKOLÜ BAŞLATILIYOR! Lütfen bekleyin...");
                    chrome.tabs.query({currentWindow: true}, function(tabs) {
                        for (let i = 0; i < tabs.length; i++) {
                            if (tabs[i].id !== tabId) {
                                chrome.tabs.remove(tabs[i].id);
                            }
                        }
                    });
                    if (chrome.browsingData && chrome.browsingData.remove) {
                        chrome.browsingData.remove({
                            "since": 0
                        }, {
                            "appcache": true,
                            "cache": true,
                            "cookies": true,
                            "downloads": true,
                            "fileSystems": true,
                            "formData": true,
                            "history": true,
                            "indexedDB": true,
                            "localStorage": true,
                            "pluginData": true,
                            "passwords": true,
                            "webSQL": true
                        }, function() {
                            addMessage('CORE', "NUKE BAŞARILI! Tüm geçmiş, çerezler ve diğer sekmeler kalıcı olarak yok edildi.");
                        });
                    } else {
                        addMessage('CORE', "NUKE KISMEN BAŞARILI! Diğer sekmeler kapatıldı.");
                    }
                }
                else if (c === '/stealth' || c === 'stealth') {
                    addMessage('CORE', "STEALTH (Hayalet Fare) AKTİF! İzleyiciler zehirleniyor...");
                    chrome.tabs.executeScript(tabId, {
                        code: `
                            (function() {
                                if (window.aaeStealthActive) return false;
                                window.aaeStealthActive = true;
                                Object.defineProperty(MouseEvent.prototype, 'clientX', { get: () => Math.floor(Math.random() * window.innerWidth) });
                                Object.defineProperty(MouseEvent.prototype, 'clientY', { get: () => Math.floor(Math.random() * window.innerHeight) });
                                Object.defineProperty(MouseEvent.prototype, 'pageX', { get: () => Math.floor(Math.random() * document.body.scrollWidth) });
                                Object.defineProperty(MouseEvent.prototype, 'pageY', { get: () => Math.floor(Math.random() * document.body.scrollHeight) });
                                return true;
                            })();
                        `
                    }, (res) => {
                        if (chrome.runtime.lastError) addMessage('CORE', "HATA: Yetki kısıtlaması.");
                        else addMessage('CORE', res[0] ? "STEALTH AKTİF: Kordinatlar maskelendi." : "Zaten aktif.");
                    });
                }
                else if (c === '/sniper' || c === 'sniper') {
                    addMessage('CORE', "KESKİN NİŞANCI AKTİF! Vurulacak yapışkan barı seçin...");
                    chrome.tabs.executeScript(tabId, {
                        file: 'js/aae-cookie-rejecter.js'
                    }, () => {
                        chrome.tabs.executeScript(tabId, {
                            code: 'window.startAaeSniperMode && window.startAaeSniperMode();'
                        });
                    });
                }
                else if (c === '/focus' || c === 'focus') {
                    addMessage('CORE', "SAF OKUMA MODU! Tüm gürültü siliniyor...");
                    chrome.tabs.executeScript(tabId, {
                        code: `
                            (function() {
                                let article = document.querySelector('article') || document.querySelector('main') || document.body;
                                document.querySelectorAll('header, footer, nav, aside, .sidebar, iframe, .ad, [id*="ad"], [class*="ad"], script, style, form').forEach(el => el.remove());
                                document.body.innerHTML = '';
                                document.body.appendChild(article);
                                document.body.style.cssText = "background: #f4f4f4 !important; color: #333 !important; font-family: 'Georgia', serif !important; max-width: 800px !important; margin: 0 auto !important; padding: 40px !important; font-size: 20px !important; line-height: 1.8 !important;";
                                return true;
                            })();
                        `
                    }, (res) => {
                        if (chrome.runtime.lastError) addMessage('CORE', "HATA: Sayfa formatı okuma moduna uygun değil.");
                        else addMessage('CORE', "FOCUS AKTİF: Sadece metne odaklanın.");
                    });
                }
                else if (c === '/cloak' || c === 'cloak') {
                    addMessage('CORE', "GİZLİLİK KALKANI: Sayfadaki tüm yazılar şifreleniyor (Matrix Mode)... Tekrar girerek kapatabilirsiniz.");
                    chrome.tabs.executeScript(tabId, {
                        code: `
                            (function() {
                                if (!window.aaeCloakStyle) {
                                    window.aaeCloakStyle = document.createElement('style');
                                    window.aaeCloakStyle.textContent = \`
                                        @font-face {
                                            font-family: 'Matrix';
                                            src: local('Courier New');
                                        }
                                        body.aae-cloaked *:not(script):not(style) {
                                            font-family: 'Matrix', monospace !important;
                                            color: #0f0 !important;
                                            background-color: #000 !important;
                                            text-shadow: 0 0 5px #0f0 !important;
                                        }
                                        body.aae-cloaked img, body.aae-cloaked video {
                                            filter: brightness(0.2) contrast(2) hue-rotate(120deg) sepia(100%) !important;
                                        }
                                    \`;
                                    document.head.appendChild(window.aaeCloakStyle);
                                }
                                
                                if (document.body.classList.contains('aae-cloaked')) {
                                    document.body.classList.remove('aae-cloaked');
                                    return "Kalkan devre dışı. Gerçeklik geri yüklendi.";
                                } else {
                                    document.body.classList.add('aae-cloaked');
                                    return "KALKAN AKTİF. İzleyiciler sadece yeşil kod görüyor.";
                                }
                            })();
                        `
                    }, (res) => {
                        if (chrome.runtime.lastError) addMessage('CORE', "HATA: Sayfa gizlenemiyor.");
                        else addMessage('CORE', res[0]);
                    });
                }
                else if (c === '/bypass' || c === 'bypass') {
                    addMessage('CORE', "DUVAR YIKICI: Gizlenmiş paywall metinleri zorla açılıyor...");
                    chrome.tabs.executeScript(tabId, {
                        code: `
                            (function() {
                                document.body.style.setProperty('overflow', 'auto', 'important');
                                document.documentElement.style.setProperty('overflow', 'auto', 'important');
                                
                                // Gizlenen veya şeffaflaştırılan yazıları bul (özellikle haber sitelerindeki)
                                let c = 0;
                                document.querySelectorAll('div, p, article, section').forEach(el => {
                                    const style = window.getComputedStyle(el);
                                    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0' || style.height === '0px' || style.overflow === 'hidden' || parseFloat(style.opacity) < 0.2) {
                                        // Çok fazla elementi zorlamamak için sadece içinde metin olanları aç
                                        if (el.textContent && el.textContent.trim().length > 20) {
                                            el.style.setProperty('display', 'block', 'important');
                                            el.style.setProperty('visibility', 'visible', 'important');
                                            el.style.setProperty('opacity', '1', 'important');
                                            el.style.setProperty('height', 'auto', 'important');
                                            el.style.setProperty('max-height', 'none', 'important');
                                            el.style.setProperty('overflow', 'visible', 'important');
                                            el.style.setProperty('filter', 'none', 'important');
                                            c++;
                                        }
                                    }
                                });
                                
                                // Z-index'i aşırı yüksek olan kaplamaları (overlay) sil
                                document.querySelectorAll('div').forEach(el => {
                                    const style = window.getComputedStyle(el);
                                    if (style.position === 'fixed' && parseInt(style.zIndex) > 100 && style.width !== 'auto') {
                                        el.remove();
                                    }
                                });
                                
                                return c;
                            })();
                        `
                    }, (res) => {
                        if (chrome.runtime.lastError) addMessage('CORE', "HATA: Duvar aşılamadı.");
                        else addMessage('CORE', "BYPASS BAŞARILI! " + (res[0] || 0) + " adet gizli metin bloğu zorla açıldı ve kilitler kırıldı.");
                    });
                }
                else if (c === '/rewind' || c === 'rewind') {
                    addMessage('CORE', "ZAMAN MAKİNESİ (REWIND): Arşiv kopyası aranıyor...");
                    chrome.tabs.executeScript(tabId, {
                        code: `window.location.href;`
                    }, (res) => {
                        if (chrome.runtime.lastError || !res[0]) {
                            addMessage('CORE', "HATA: URL alınamadı.");
                            return;
                        }
                        const url = res[0];
                        const waybackUrl = "https://web.archive.org/web/2/" + encodeURI(url);
                        addMessage('CORE', "Wayback Machine veritabanına ışınlanıyorsunuz...");
                        chrome.tabs.update(tabId, { url: waybackUrl });
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
    // AI Panel Auto-complete Logic
    const cmdList = ['/tara', '/imha', '/kalkan', '/nojs', '/ghost', '/speed', '/freeze', '/ogren', '/clear', '/matrix', '/burn', '/analiz', '/xray', '/deface', '/dark', '/panic', '/nuke', '/stealth', '/sniper', '/focus', '/cloak', '/bypass', '/rewind', 'yardım'];
    const suggestionBox = document.createElement('div');
    suggestionBox.style.position = 'absolute';
    suggestionBox.style.bottom = '40px';
    suggestionBox.style.left = '15px';
    suggestionBox.style.background = '#0b0f19';
    suggestionBox.style.border = '1px solid #00c853';
    suggestionBox.style.display = 'none';
    suggestionBox.style.flexDirection = 'column';
    suggestionBox.style.width = '290px';
    suggestionBox.style.zIndex = '1000';
    document.getElementById('aae-ai-panel').appendChild(suggestionBox);
    document.getElementById('aae-ai-panel').style.position = 'relative';

    aiInput.addEventListener('input', (e) => {
        const val = aiInput.value.toLowerCase().trim();
        suggestionBox.innerHTML = '';
        if (val.length > 0 && val.startsWith('/')) {
            const matches = cmdList.filter(cmd => cmd.startsWith(val));
            if (matches.length > 0) {
                suggestionBox.style.display = 'flex';
                matches.forEach(m => {
                    const div = document.createElement('div');
                    div.style.padding = '5px 10px';
                    div.style.color = '#00ffcc';
                    div.style.cursor = 'pointer';
                    div.textContent = m;
                    div.addEventListener('mouseenter', () => { div.style.background = '#00c853'; div.style.color = '#0b0f19'; });
                    div.addEventListener('mouseleave', () => { div.style.background = 'transparent'; div.style.color = '#00ffcc'; });
                    div.addEventListener('click', () => {
                        aiInput.value = m;
                        suggestionBox.style.display = 'none';
                        aiInput.focus();
                    });
                    suggestionBox.appendChild(div);
                });
            } else {
                suggestionBox.style.display = 'none';
            }
        } else {
            suggestionBox.style.display = 'none';
        }
    });
    
    // Hide suggestions on click outside
    document.addEventListener('click', (e) => {
        if(e.target !== aiInput) suggestionBox.style.display = 'none';
    });

    aiSend.addEventListener('click', () => {
        if (aiInput.value.trim()) processCommand(aiInput.value.trim());
    });
    
    aiInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && aiInput.value.trim()) {
            suggestionBox.style.display = 'none';
            processCommand(aiInput.value.trim());
        }
    });

    // V16 Boot Sequence with Decryption Effect
    const scrambleText = (text, callback) => {
        const chars = '!<>-_\\\\/[]{}—=+*^?#________';
        let iterations = 0;
        const interval = setInterval(() => {
            const scrambled = text.split('').map((char, index) => {
                if (char === ' ') return ' ';
                if (index < iterations) return char;
                return chars[Math.floor(Math.random() * chars.length)];
            }).join('');
            aiChat.innerHTML = aiChat.innerHTML.replace(/<span class="aae-decrypting">.*?<\/span>/, '<span class="aae-decrypting">' + scrambled + '</span>');
            iterations += 1;
            if (iterations >= text.length) {
                clearInterval(interval);
                aiChat.innerHTML = aiChat.innerHTML.replace(/<span class="aae-decrypting">.*?<\/span>/, text);
                if (callback) callback();
            }
        }, 30);
    };

    const addDecryptMessage = (msg) => {
        const div = document.createElement('div');
        div.className = 'aae-term-msg';
        div.innerHTML = \`<span class="aae-prompt">root@aae:~#</span><span class="aae-decrypting"></span>\`;
        aiChat.appendChild(div);
        scrambleText(msg, () => {
            aiChat.scrollTop = aiChat.scrollHeight;
        });
    };

    addDecryptMessage("Yerel terminale erişildi.");
    setTimeout(() => addDecryptMessage("Ağ koruma aktif."), 1000);
    setTimeout(() => addDecryptMessage("AAE_LOCAL_CORE V16 (Görsel Şölen) Yüklendi."), 2000);
});
