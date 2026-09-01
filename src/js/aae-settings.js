document.addEventListener('DOMContentLoaded', () => {
    const ta = document.getElementById('aaeWordCensorList');
    const btn = document.getElementById('aaeWordCensorSave');
    const status = document.getElementById('aaeWordCensorStatus');
    
    if (ta && btn && status) {
        chrome.storage.local.get(['aaeWordCensor'], (res) => {
            if(res.aaeWordCensor) ta.value = res.aaeWordCensor;
        });
        
        btn.addEventListener('click', () => {
            chrome.storage.local.set({aaeWordCensor: ta.value}, () => {
                status.textContent = "Kaydedildi!";
                setTimeout(() => status.textContent = "", 2000);
            });
        });
    }
});
