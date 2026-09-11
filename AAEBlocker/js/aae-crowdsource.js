/**
 * AAEBlocker Federated Learning & Crowdsource Module
 * 
 * Özellikler:
 * - Son katman (Last-Layer) Fine-Tuning: Sadece 1024 ağırlığı güncelleyerek (4KB) internet tasarrufu sağlar.
 * - navigator.connection ile Sadece Wi-Fi kontrolü
 * - Sahte veriye karşı Delta/Gradient hesaplama
 */

(function() {
    // Sadece Wi-Fi üzerinden gönderim yapılıp yapılmayacağını kontrol eden yardımcı fonksiyon
    function isWifiConnected() {
        if (navigator.connection) {
            // connection.type genellikle 'wifi', 'cellular', vb. değerler alır.
            // Bazı tarayıcılarda desteklenmeyebilir, desteklenmiyorsa veya wifi ise true döneriz.
            if (navigator.connection.type) {
                return navigator.connection.type === 'wifi' || navigator.connection.type === 'ethernet';
            }
            // type yoksa saveData moduna bakabiliriz
            if (navigator.connection.saveData) {
                return false; // Tasarruf modu açıksa hücresel olabilir
            }
        }
        return true; // Bilinmiyorsa varsayılan olarak gönder (PC için)
    }

    // Sigmoid türevi: f'(x) = f(x) * (1 - f(x))
    function sigmoidDerivative(output) {
        return output * (1 - output);
    }

    /**
     * Kullanıcı bir reklamı "Yanlış" veya "Gözden kaçmış" olarak bildirdiğinde çalışır.
     * @param {Array} features - 512 elemanlı giriş vektörü
     * @param {Number} target - Olması gereken sonuç (1: Reklam, 0: Normal)
     * @param {Number} currentOutput - Yapay zekanın şu anki tahmini
     * @param {Array} lastLayerInputs - Son katmana giren 1024 elemanlı aktivasyon değerleri
     */
    async function calculateAndStoreGradient(features, target, currentOutput, lastLayerInputs) {
        // Öğrenme katsayısı (Çok küçük tutulur ki sahte veriler anında bozamasın)
        const LEARNING_RATE = 0.001;
        
        // Hata = Beklenen - Tahmin
        const error = target - currentOutput;
        
        // Delta = Hata * Sigmoid_Türevi(Tahmin)
        const delta = error * sigmoidDerivative(currentOutput);
        
        // Gradient = Sadece son katman ağırlıkları (1024 adet) için hesaplanır
        // Weight_Gradient_i = Delta * Input_i * LEARNING_RATE
        let gradients = new Float32Array(lastLayerInputs.length);
        for (let i = 0; i < lastLayerInputs.length; i++) {
            gradients[i] = delta * lastLayerInputs[i] * LEARNING_RATE;
        }

        // Bias Gradient
        const biasGradient = delta * LEARNING_RATE;

        // Yerel depolamaya (Local Storage) kaydet
        chrome.storage.local.get(['aae_pending_gradients'], function(data) {
            let pending = data.aae_pending_gradients || [];
            pending.push({
                gradients: Array.from(gradients),
                bias: biasGradient,
                timestamp: Date.now(),
                urlHash: btoa(location.hostname).substring(0, 10) // Sadece site hash'i (Anonim)
            });
            
            chrome.storage.local.set({ aae_pending_gradients: pending }, function() {
                console.log("[AAE-Crowdsource] Gradient başarıyla hesaplandı ve sıraya eklendi (4KB).");
                attemptUploadGradients();
            });
        });
    }

    /**
     * Birikmiş gradientleri (Farkları) Wi-Fi varsa sunucuya yükler.
     */
    function attemptUploadGradients() {
        chrome.storage.local.get(['aae_settings', 'aae_pending_gradients'], async function(data) {
            const settings = data.aae_settings || {};
            // Ayarlarda Topluluk Ağı kapalıysa işlem yapma
            if (settings.enableCrowdsource === false) return;

            const pending = data.aae_pending_gradients || [];
            if (pending.length === 0) return; // Gönderilecek bir şey yok

            if (!isWifiConnected()) {
                console.log("[AAE-Crowdsource] Wi-Fi bağlantısı yok. Gradientler bekletiliyor...");
                return;
            }

            console.log(`[AAE-Crowdsource] ${pending.length} adet gradient sunucuya gönderiliyor...`);

            try {
                // Firebase Realtime Database REST API (ÜCRETSİZ)
                const ENDPOINT = `https://aaeb-19471-default-rtdb.europe-west1.firebasedatabase.app/gradients.json`;
                
                // AAEBlocker Secret Network Token (Güvenlik)
                const SECRET_NETWORK_TOKEN = "AAE_CORE_SECURE_TOKEN_2026_X9";

                // Güvenli ve küçük boyutlu payload
                const payload = {
                    client_id: await getOrCreateClientId(),
                    updates: pending,
                    token: SECRET_NETWORK_TOKEN, // Doğrulama için payload içine ekledik
                    timestamp: { ".sv": "timestamp" } // Firebase sunucu saati
                };

                // Sunucuya POST isteği (Gerçek Ağ Entegrasyonu)
                const response = await fetch(ENDPOINT, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    console.log("[AAE-Crowdsource] Gradientler başarıyla Kolektif Ağ'a iletildi!");
                    chrome.storage.local.set({ aae_pending_gradients: [] });
                } else {
                    console.warn("[AAE-Crowdsource] Sunucu hatası veya token geçersiz!");
                }

            } catch (e) {
                console.warn("[AAE-Crowdsource] Sunucuya gönderim başarısız:", e);
            }
        });
    }

    // Anonim ve güvenli Client ID oluşturma (Güven Skoru için)
    function getOrCreateClientId() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['aae_client_id'], function(data) {
                if (data.aae_client_id) {
                    resolve(data.aae_client_id);
                } else {
                    const newId = 'client_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
                    chrome.storage.local.set({ aae_client_id: newId });
                    resolve(newId);
                }
            });
        });
    }

    // Periyodik kontrol (Örn: Her saat başı Wi-Fi var mı diye kontrol et)
    setInterval(attemptUploadGradients, 60 * 60 * 1000);

    // Dışarıya açılacak API
    window.AAECrowdsource = {
        reportMistake: calculateAndStoreGradient,
        syncNow: attemptUploadGradients,
        isWifiConnected: isWifiConnected
    };
})();
