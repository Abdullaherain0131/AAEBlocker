/**
 * AAEBlocker Premium Settings UI Controller
 * Siberpunk tasarımlı ayarlar sayfasının işlevlerini yönetir.
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elemanlarını Seçme
    const thresholdInput = document.getElementById('threshold');
    const thresholdValDisplay = document.getElementById('threshold-val');
    
    const enableSkynet = document.getElementById('enableSkynet');
    const enableWASM = document.getElementById('enableWASM');
    const enableAntiAdblock = document.getElementById('enableAntiAdblock');
    const enableCookieReject = document.getElementById('enableCookieReject');
    const enableVideoSkip = document.getElementById('enableVideoSkip');
    const enableAntiFingerprint = document.getElementById('enableAntiFingerprint');
    const enablePaywallCrack = document.getElementById('enablePaywallCrack');
    const enableLinkDecloaker = document.getElementById('enableLinkDecloaker');
    const enableCrowdsource = document.getElementById('enableCrowdsource');
    
    const censoredWordsInput = document.getElementById('censored-words');
    const saveWordsBtn = document.getElementById('save-words-btn');
    const saveWordsStatus = document.getElementById('save-words-status');

    const brainVersionDisplay = document.getElementById('brain-version-display');
    const lastUpdateDisplay = document.getElementById('last-update-display');
    const aiStatsDisplay = document.getElementById('ai-stats-display');

    const exportBrainBtn = document.getElementById('export-brain-btn');
    const importBrainBtn = document.getElementById('import-brain-btn');
    const importFile = document.getElementById('import-file');
    const resetSelectorsBtn = document.getElementById('reset-selectors-btn');
    const resetStatsBtn = document.getElementById('reset-stats-btn');

    // Varsayılan Ayarlar
    const defaultSettings = {
        threshold: 0.85,
        enableSkynet: true,
        enableWASM: true,
        enableAntiAdblock: true,
        enableCookieReject: true,
        enableVideoSkip: true,
        enableAntiFingerprint: true,
        enablePaywallCrack: true,
        enableLinkDecloaker: true,
        enableCrowdsource: false
    };

    // Tüm ayarları ve verileri yükle
    function loadData() {
        // Ana ayarlar
        chrome.storage.local.get(['aae_settings', 'censoredWords', 'aae_brain_version', 'aiStats'], (result) => {
            // Ayarları uygula (kayıtlı yoksa varsayılanları kullan)
            const settings = result.aae_settings || defaultSettings;
            
            thresholdInput.value = settings.threshold || defaultSettings.threshold;
            updateThresholdDisplay(thresholdInput.value);
            
            enableSkynet.checked = settings.enableSkynet ?? defaultSettings.enableSkynet;
            enableWASM.checked = settings.enableWASM ?? defaultSettings.enableWASM;
            enableAntiAdblock.checked = settings.enableAntiAdblock ?? defaultSettings.enableAntiAdblock;
            enableCookieReject.checked = settings.enableCookieReject ?? defaultSettings.enableCookieReject;
            enableVideoSkip.checked = settings.enableVideoSkip ?? defaultSettings.enableVideoSkip;
            enableAntiFingerprint.checked = settings.enableAntiFingerprint ?? defaultSettings.enableAntiFingerprint;
            enablePaywallCrack.checked = settings.enablePaywallCrack ?? defaultSettings.enablePaywallCrack;
            enableLinkDecloaker.checked = settings.enableLinkDecloaker ?? defaultSettings.enableLinkDecloaker;
            enableCrowdsource.checked = settings.enableCrowdsource ?? defaultSettings.enableCrowdsource;

            // Kelime sansürünü yükle
            if (result.censoredWords && Array.isArray(result.censoredWords)) {
                censoredWordsInput.value = result.censoredWords.join('\n');
            }

            // Bilgi kutusunu doldur
            brainVersionDisplay.textContent = result.aae_brain_version || 'v2.0.4-quantum';
            lastUpdateDisplay.textContent = new Date().toLocaleDateString('tr-TR');
            
            if (result.aiStats && result.aiStats.adsBlocked) {
                aiStatsDisplay.textContent = result.aiStats.adsBlocked.toLocaleString('tr-TR');
            }
        });
    }

    // Ayarları kaydet
    function saveSettings() {
        const settingsToSave = {
            threshold: parseFloat(thresholdInput.value),
            enableSkynet: enableSkynet.checked,
            enableWASM: enableWASM.checked,
            enableAntiAdblock: enableAntiAdblock.checked,
            enableCookieReject: enableCookieReject.checked,
            enableVideoSkip: enableVideoSkip.checked,
            enableAntiFingerprint: enableAntiFingerprint.checked,
            enablePaywallCrack: enablePaywallCrack.checked,
            enableLinkDecloaker: enableLinkDecloaker.checked,
            enableCrowdsource: enableCrowdsource.checked
        };

        chrome.storage.local.set({ aae_settings: settingsToSave }, () => {
            console.log('AAEBlocker: Ayarlar kaydedildi.', settingsToSave);
        });
    }

    // Slider göstergesini güncelle
    function updateThresholdDisplay(val) {
        const percentage = Math.round(val * 100);
        thresholdValDisplay.textContent = percentage + '%';
    }

    // Olay Dinleyicileri (Event Listeners)

    // Range slider gerçek zamanlı güncelleme
    thresholdInput.addEventListener('input', (e) => {
        updateThresholdDisplay(e.target.value);
    });

    // Herhangi bir input değiştiğinde otomatik kaydet
    const allInputs = [
        thresholdInput, enableSkynet, enableWASM, enableAntiAdblock, 
        enableCookieReject, enableVideoSkip, enableAntiFingerprint, 
        enablePaywallCrack, enableLinkDecloaker, enableCrowdsource
    ];

    allInputs.forEach(input => {
        input.addEventListener('change', saveSettings);
    });

    // Sansürlü kelimeleri kaydet
    saveWordsBtn.addEventListener('click', () => {
        const wordsStr = censoredWordsInput.value;
        const wordsArray = wordsStr.split('\n')
            .map(w => w.trim())
            .filter(w => w.length > 0);
        
        chrome.storage.local.set({ censoredWords: wordsArray }, () => {
            saveWordsStatus.textContent = 'Kelimeler kaydedildi!';
            setTimeout(() => { saveWordsStatus.textContent = ''; }, 2000);
        });
    });

    // Beyin Dışa Aktar (AI Weights)
    exportBrainBtn.addEventListener('click', () => {
        chrome.storage.local.get(['aae_ai_weights'], (result) => {
            const weights = result.aae_ai_weights || { info: "Default weights" };
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(weights));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "aae_brain_export.json");
            document.body.appendChild(downloadAnchorNode); // Firefox requires appending to DOM
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        });
    });

    // Beyin İçe Aktar (Dosya seçici tetikle)
    importBrainBtn.addEventListener('click', () => {
        importFile.click();
    });

    // Dosya seçildiğinde
    importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const jsonObj = JSON.parse(event.target.result);
                chrome.storage.local.set({ aae_ai_weights: jsonObj }, () => {
                    alert('Yapay zeka beyni başarıyla içe aktarıldı!');
                });
            } catch (err) {
                alert('Geçersiz beyin dosyası! Lütfen doğru bir JSON formatı seçin.');
                console.error(err);
            }
            // Reset input
            importFile.value = '';
        };
        reader.readAsText(file);
    });

    // Seçicileri Sıfırla
    resetSelectorsBtn.addEventListener('click', () => {
        if (confirm('Öğrenilmiş tüm reklam seçicilerini sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
            chrome.storage.local.remove('learnedSelectors', () => {
                alert('Öğrenilmiş seçiciler temizlendi. AI motoru yeniden öğrenmeye başlayacak.');
            });
        }
    });

    // İstatistikleri Sıfırla
    resetStatsBtn.addEventListener('click', () => {
        if (confirm('Tüm engelleme istatistiklerini sıfırlamak istediğinizden emin misiniz?')) {
            chrome.storage.local.set({ aiStats: { adsBlocked: 0, trackersBlocked: 0 } }, () => {
                aiStatsDisplay.textContent = '0';
                alert('İstatistikler sıfırlandı.');
            });
        }
    });

    // Başlangıç yüklemesi
    loadData();

    // ─── CANLI TERMİNAL GÜNCELLEMESİ ───
    const terminalOutput = document.getElementById('idle-terminal-output');
    if (terminalOutput) {
        setInterval(() => {
            chrome.storage.local.get(['aae_idle_stats'], (result) => {
                const stats = result.aae_idle_stats;
                if (stats) {
                    const timeStr = new Date(stats.lastUpdate).toLocaleTimeString('tr-TR');
                    terminalOutput.innerHTML = `
                        <div class="term-line">> BAĞLANTI KURULUYOR... [OK]</div>
                        <div class="term-line">> IDLE_TRAINER AKTİF (RAM: ${stats.memory}MB, CPU: <1%)</div>
                        <div class="term-line">> SON GÜNCELLEME: ${timeStr}</div>
                        <div class="term-line">> TOPLAM EĞİTİM DÖNGÜSÜ: <span style="color:var(--gold)">${stats.cycles}</span> EPOCH</div>
                        <div class="term-line">> WEIGHTS_SYNCED => BACKPROPAGATION_SUCCESS</div>
                        <div class="term-line blink">_</div>
                    `;
                }
            });
        }, 2000);
    }
});
