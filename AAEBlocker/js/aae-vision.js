/**
 * AAEBlocker Vision AI Engine
 * Görselleri tarayarak pikseller üzerinden reklam/NSFW tespiti yapar.
 */

(function() {
    console.log("[AAE-Vision] Çekirdek başlatılıyor...");

    let visionEnabled = true;

    // Ayarları kontrol et
    chrome.storage.local.get(['aae_settings'], function(data) {
        if (data.aae_settings && data.aae_settings.enableVisionAI === false) {
            visionEnabled = false;
            console.log("[AAE-Vision] Görüntü İşleme kapalı.");
        }
    });

    const processedImages = new WeakSet();

    // Görseli canvas'a çizip piksel analizi yapma
    async function analyzeImage(imgElement) {
        if (!visionEnabled || processedImages.has(imgElement)) return;
        processedImages.add(imgElement);

        // Küçük ikonları veya önemsiz görselleri atla
        if (imgElement.width < 50 || imgElement.height < 50) return;

        try {
            // Offscreen canvas oluştur (performans için)
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            
            // Hızlı analiz için resmi küçült (örneğin 64x64)
            canvas.width = 64;
            canvas.height = 64;
            ctx.drawImage(imgElement, 0, 0, 64, 64);

            const imageData = ctx.getImageData(0, 0, 64, 64);
            const data = imageData.data;

            // 1. Piksellerden tensör çıkarma (Heuristic veya TF.js köprüsü)
            let skinToneCount = 0;
            let textContrastCount = 0;
            let totalPixels = 64 * 64;

            for (let i = 0; i < data.length; i += 4) {
                let r = data[i];
                let g = data[i+1];
                let b = data[i+2];

                // Çok basit ten rengi heuristiği (NSFW algısı için - Placeholder)
                if (r > 95 && g > 40 && b > 20 && r > g && r > b && (Math.max(r,g,b) - Math.min(r,g,b) > 15)) {
                    skinToneCount++;
                }

                // Yüksek kontrastlı grafikler (Reklam algısı için - Placeholder)
                if ((r > 200 && g < 50 && b < 50) || (b > 200 && r < 50 && g < 50)) {
                    textContrastCount++;
                }
            }

            const skinRatio = skinToneCount / totalPixels;
            const adRatio = textContrastCount / totalPixels;

            if (adRatio > 0.15) {
                // Şiddetli kontrast, muhtemelen banner reklamı
                console.log("[AAE-Vision] Görüntüde REKLAM profili tespit edildi, gizleniyor.", imgElement.src);
                imgElement.style.display = 'none';
                imgElement.setAttribute('data-aae-vision', 'ad-blocked');
            } else if (skinRatio > 0.45) {
                // Yüksek oranda ten rengi, NSFW riski
                console.log("[AAE-Vision] Görüntüde NSFW riski tespit edildi, sansürleniyor.", imgElement.src);
                applyNsfwFilter(imgElement);
            }

        } catch (e) {
            // CORS hatalarını veya çizilemeyen resimleri görmezden gel
        }
    }

    function applyNsfwFilter(imgElement) {
        // Zaten sarılmışsa atla
        if (imgElement.parentElement && imgElement.parentElement.classList.contains('aae-vision-nsfw-wrapper')) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'aae-vision-nsfw-wrapper';
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        
        // Görseli bulanıklaştır
        imgElement.style.filter = 'blur(20px) grayscale(50%)';
        imgElement.style.transition = 'filter 0.3s ease';
        imgElement.setAttribute('data-aae-vision', 'nsfw-blurred');

        const overlay = document.createElement('div');
        overlay.innerText = '⚠️ AAE Vision: Hassas İçerik\nGörmek için tıklayın';
        overlay.style.position = 'absolute';
        overlay.style.top = '50%';
        overlay.style.left = '50%';
        overlay.style.transform = 'translate(-50%, -50%)';
        overlay.style.color = '#fff';
        overlay.style.background = 'rgba(0,0,0,0.7)';
        overlay.style.padding = '8px 12px';
        overlay.style.borderRadius = '6px';
        overlay.style.fontFamily = 'sans-serif';
        overlay.style.fontSize = '12px';
        overlay.style.cursor = 'pointer';
        overlay.style.textAlign = 'center';
        overlay.style.zIndex = '10';

        // Tıklayınca göster
        overlay.addEventListener('click', function(e) {
            e.preventDefault();
            imgElement.style.filter = 'none';
            overlay.style.display = 'none';
        });

        // DOM içine yerleştir
        imgElement.parentNode.insertBefore(wrapper, imgElement);
        wrapper.appendChild(imgElement);
        wrapper.appendChild(overlay);
    }

    // Yeni resimleri yakalamak için MutationObserver
    const observer = new MutationObserver((mutations) => {
        if (!visionEnabled) return;
        for (let mutation of mutations) {
            for (let node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.tagName === 'IMG') {
                        // Resim yüklendiğinde analiz et
                        if (node.complete) {
                            analyzeImage(node);
                        } else {
                            node.addEventListener('load', () => analyzeImage(node), {once: true});
                        }
                    } else {
                        const imgs = node.querySelectorAll('img');
                        imgs.forEach(img => {
                            if (img.complete) {
                                analyzeImage(img);
                            } else {
                                img.addEventListener('load', () => analyzeImage(img), {once: true});
                            }
                        });
                    }
                }
            }
        }
    });

    // Başlangıçta var olan resimleri tara
    window.addEventListener('load', () => {
        if (!visionEnabled) return;
        document.querySelectorAll('img').forEach(img => {
            if (img.complete) {
                analyzeImage(img);
            } else {
                img.addEventListener('load', () => analyzeImage(img), {once: true});
            }
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    });

})();
