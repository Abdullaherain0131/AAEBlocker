/**
 * AAEBlocker TensorFlow Lite (TFLite) / ONNX Bridge
 * 
 * Gelecekteki entegrasyonlar için tasarlanmıştır. Sinir ağı modelini standart
 * bir TFLite modeli olarak yükleyip çıkarım (inference) yapmayı sağlar.
 * 
 * TODO ENTEGRASYON ADIMLARI:
 * 1. tfjs-tflite kütüphanesini eklenti paketine dahil edin veya güvenli bir kaynaktan yükleyin.
 * 2. loadModel() fonksiyonunu eklenti başlatılırken (background script) çağırın.
 * 3. Model dosyasını 'models/aae-model.tflite' konumuna yerleştirin.
 */

(function() {
    'use strict';

    class TFLiteBridge {
        constructor() {
            this.modelPath = 'models/aae-model.tflite';
            this.model = null;
            this.isReady = false;
            
            // Performans için giriş/çıkış tensörlerini tekrar kullanmak üzere saklayabiliriz
            this._inputTensor = null;
        }

        /**
         * TFLite modelini IndexedDB'den yükler (Firebase'den indirilmiş model).
         */
        async loadModel() {
            try {
                if (typeof tflite === 'undefined') {
                    console.warn("TFLiteBridge: TFLite kütüphanesi (tfjs) bulunamadı. Lütfen entegrasyon adımlarını tamamlayın.");
                    return false;
                }

                // Eklenti klasöründeki WASM dosyalarının yolunu göster
                const wasmPath = chrome.runtime.getURL('js/lib/tfjs/');
                tflite.setWasmPath(wasmPath);

                // IndexedDB'den ArrayBuffer olarak çek
                const brainBuffer = await new Promise((resolve) => {
                    try {
                        const req = indexedDB.open('AAEBlocker', 1);
                        req.onsuccess = (e) => {
                            const db = e.target.result;
                            const tx = db.transaction('brain', 'readonly');
                            const get = tx.objectStore('brain').get('current');
                            get.onsuccess = () => resolve(get.result || null);
                            get.onerror = () => resolve(null);
                        };
                        req.onerror = () => resolve(null);
                    } catch(e) { resolve(null); }
                });

                if (!brainBuffer || !(brainBuffer instanceof ArrayBuffer)) {
                    console.warn("TFLiteBridge: IndexedDB'de geçerli TFLite modeli bulunamadı.");
                    return false;
                }
                
                // Modeli yükle (tflite-js loadTFLiteModel array buffer destekler)
                this.model = await tflite.loadTFLiteModel(brainBuffer);
                this.isReady = true;
                console.log("TFLiteBridge: TFLite modeli Firebase/IndexedDB üzerinden başarıyla yüklendi.");
                return true;
            } catch (error) {
                console.error("TFLiteBridge: Model yükleme hatası:", error);
                this.isReady = false;
                return false;
            }
        }

        /**
         * Çıkarım (Inference) yapar.
         * @param {Float32Array} features 512 boyutlu özellik vektörü
         * @returns {number|null} 0-1 arası olasılık değeri veya hata durumunda null
         */
        predict(features) {
            if (!this.isReady || !this.model) {
                // TFLite aktif değilse null döndür, skynet.js kendi motorunu (WASM/JS) kullansın
                return null;
            }

            try {
                // Giriş verisini Tensör'e dönüştür (1 batch, 512 özellik)
                // TODO: tf nesnesinin kullanıma hazır olduğundan emin olun
                const inputTensor = tf.tensor(features, [1, 512]);
                
                // Modeli çalıştır
                const outputTensor = this.model.predict(inputTensor);
                
                // Sonucu al (ilk değer)
                const result = outputTensor.dataSync()[0];
                
                // Bellek sızıntılarını önlemek için tensörleri serbest bırak
                inputTensor.dispose();
                outputTensor.dispose();
                
                return result;
            } catch (error) {
                console.error("TFLiteBridge: Tahmin (predict) sırasında hata oluştu:", error);
                return null;
            }
        }
    }

    // Arayüzü pencere objesine bağla
    window.AAETFLiteBridge = new TFLiteBridge();
})();
