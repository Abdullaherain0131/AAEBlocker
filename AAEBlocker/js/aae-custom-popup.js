// ═══════════════════════════════════════════════════════════════
// AAEBlocker V9 — Popup Kontrolcüsü (Ultra Hafif)
// Tüm istatistikler background script üzerinden gelir.
// ═══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ─── DOM Referansları (Tek seferlik) ────────────────────
    const $ = (id) => document.getElementById(id);
    const powerBtn      = $('aae-power-btn');
    const blockSite     = $('aae-block-site');
    const blockTotal    = $('aae-block-total');
    const aiDomBlocks   = $('aae-ai-dom-blocks');
    const aiNetBlocks   = $('aae-ai-net-blocks');
    const aiOverlayKills= $('aae-ai-overlay-kills');
    const aiCookieRej   = $('aae-ai-cookie-rejects');
    const aiVideoSkips  = $('aae-ai-video-skips');
    const aiScanned     = $('aae-ai-scanned');
    const aiLastThreat  = $('aae-ai-last-threat');
    const aiUptime      = $('aae-ai-uptime');
    const statusText    = $('aae-hud-status');
    const originalSwitch= $('switch');

    // ─── Yardımcılar ───────────────────────────────────────
    const formatNum = (n) => {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return String(n || 0);
    };

    const formatUptime = (seconds) => {
        if (!seconds) return '0s';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}sa ${m}dk`;
        if (m > 0) return `${m}dk ${s}sn`;
        return `${s}sn`;
    };

    // ─── İstatistik Güncelleme Döngüsü ─────────────────────
    const updateStats = () => {
        // uBlock Origin'in gizli istatistik alanlarını oku
        const statContainers = document.querySelectorAll('#basicStats span');
        if (statContainers.length > 3) {
            if (blockSite) blockSite.textContent = statContainers[0].textContent;
            if (blockTotal) blockTotal.textContent = statContainers[2].textContent;
        }

        // Yapay Zeka ve AAE istatistiklerini background'dan oku
        if (chrome?.storage?.local) {
            chrome.storage.local.get(['aiStats'], (result) => {
                if (!result.aiStats) return;
                const s = result.aiStats;
                
                if (aiDomBlocks)    aiDomBlocks.textContent    = formatNum(s.domBlocks);
                if (aiNetBlocks)    aiNetBlocks.textContent    = formatNum(s.networkBlocks);
                if (aiOverlayKills) aiOverlayKills.textContent = formatNum(s.overlayKills);
                if (aiCookieRej)    aiCookieRej.textContent    = formatNum(s.cookieRejects);
                if (aiVideoSkips)   aiVideoSkips.textContent   = formatNum(s.videoSkips);
                if (aiScanned)      aiScanned.textContent      = formatNum(s.totalScanned);
                if (aiLastThreat)   aiLastThreat.textContent   = s.lastThreat || '-';
                if (aiUptime)       aiUptime.textContent       = formatUptime(s.uptime);
            });
        }

        // Güç butonu durumu
        if (powerBtn) {
            const coreText = powerBtn.querySelector('.aae-core-text') || powerBtn;
            const isOff = document.body.classList.contains('off');
            coreText.textContent = isOff ? 'PASİF' : 'AKTİF';
            powerBtn.classList.toggle('aae-off', isOff);
            
            if (statusText) {
                statusText.textContent = isOff ? '⛔ KALKAN DEVRE DIŞI' : '🛡️ TÜM SİSTEMLER AKTİF';
                statusText.style.color = isOff ? '#ef4444' : '#00ffcc';
            }
        }
    };

    // 1 saniyede bir güncelle (500ms'den 1000ms'ye çıkarıldı — popup'ta yeterli)
    setInterval(updateStats, 1000);
    updateStats(); // İlk yükleme

    // ─── Buton Olayları ────────────────────────────────────
    if (powerBtn) {
        powerBtn.addEventListener('click', () => {
            if (originalSwitch) {
                originalSwitch.dispatchEvent(new MouseEvent('click', { 
                    bubbles: true, cancelable: true, view: window 
                }));
            }
        });
    }

    const bindNav = (btnId, selector, fallback) => {
        const btn = $(btnId);
        if (!btn) return;
        btn.addEventListener('click', () => {
            const native = document.querySelector(selector);
            if (native) { native.click(); return; }
            if (fallback) {
                if (chrome.runtime.openOptionsPage && fallback.includes('dashboard')) {
                    chrome.runtime.openOptionsPage();
                } else {
                    window.open(fallback);
                }
            }
        });
    };

    bindNav('aae-btn-dashboard', 'a[href="dashboard.html"]', 'dashboard.html');
    bindNav('aae-btn-logger',    'a[href="logger-ui.html#_"]', 'logger-ui.html#_');

    // ─── AI Beyin Dışa/İçe Aktarma ────────────────────────
    const exportBtn  = $('aae-btn-export');
    const importBtn  = $('aae-btn-import');
    const importFile = $('aae-import-file');

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            chrome.storage.local.get(['aae_ai_weights'], (result) => {
                const data = result.aae_ai_weights || {};
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'aae-brain-v9.json';
                a.click();
                URL.revokeObjectURL(url);
            });
        });
    }

    if (importBtn && importFile) {
        importBtn.addEventListener('click', () => importFile.click());
        importFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const parsed = JSON.parse(ev.target.result);
                    chrome.storage.local.set({ aae_ai_weights: parsed }, () => {
                        alert('Beyin başarıyla içe aktarıldı!');
                    });
                } catch {
                    alert('Geçersiz dosya formatı!');
                }
            };
            reader.readAsText(file);
        });
    }
});
