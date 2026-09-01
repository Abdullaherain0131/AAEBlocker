<div align="center">
  <img src="https://raw.githubusercontent.com/gorhill/uBlock/master/assets/icon_128.png" width="128" alt="AAEBlocker Logo">
  <h1>🛡️ AAEBlocker v9.0 🧠</h1>
  <p><strong>Yapay Zeka (AI) Destekli, Otonom ve Yenilmez Reklam Engelleyici</strong></p>
  <p><em>Geliştirici: Abdullah Asım Ersin (İnsanlara yardımcı olmak amacıyla açık kaynak geliştirilmiştir.)</em></p>
</div>

---

## 🌟 Neden AAEBlocker?
Standart reklam engelleyiciler statik (sabit) filtre listeleri kullanır ve sürekli güncellenmek zorundadır. **AAEBlocker ise farklıdır.** 
Tarayıcınızın içinde doğrudan çalışan, harici hiçbir API'ye veya sunucuya ihtiyaç duymayan **Lineer Sinir Ağı (Perceptron AI)** kullanır. 
Gördüğü her elementi analiz eder, öğrenir ve reklamları siz daha fark etmeden siler.

## 🚀 Öne Çıkan Özellikler

### 🧠 1. Tarayıcı İçi Yapay Zeka (Local AI Core)
- **Gradient Descent Öğrenme:** Sağ tıklayıp "Bu Bir Reklamdır" diyerek yapay zekayı eğitin. Hatalarından ders alır ve `chrome.storage` üzerinde kendi beynini oluşturur.
- **Sıfır Gecikmeli DOM Gözlemcisi (Zero-Delay Observer):** Sayfaya sonradan yüklenen reklamları saniyesinde tespit eder (Skor > %75 ise kör eder).
- **Gizlilik Odaklı:** Herhangi bir dış sunucuya (OpenAI vb.) veri göndermez. Kendi cihazınızda çalışır.

### 🌐 2. "Ortak Beyin" (Kolektif Zeka)
Kendi eğittiğiniz yapay zeka beynini eklenti arayüzünden **.json** formatında dışa aktarabilir ve arkadaşlarınızla paylaşabilirsiniz! Başkalarının beyin dosyalarını içe aktararak eklentinizi saniyeler içinde binlerce siteye karşı hazırlıklı hale getirin.

### 🎬 3. Video Reklam Atlayıcı (Video Ad-Skipper)
YouTube ve benzeri platformlardaki video içi reklamları otomatik olarak tespit eder.
- Sesi anında kapatır (Mute).
- Video oynatma hızını **16x**'e (tarayıcının maksimum sınırı) çıkarır.
- Varsa anında "Reklamı Geç" butonuna basar! 

### 🎭 4. Anti-Anti Adblock & Kalkan (Ghost & Kalkan Modu)
Haber sitelerindeki "Lütfen Reklam Engelleyiciyi Kapatın" uyarıları mı var?
- Terminale `/kalkan` yazdığınızda sitenin arka plan kilidini kırar.
- Terminale `/ghost` yazdığınızda tarayıcınızı Googlebot gibi göstererek ücretli içerikleri (Paywall) okumanızı sağlar.

---

## 💻 Siber Terminal (Komut Satırı)
Eklenti paneli aynı zamanda bir Hacker Terminali barındırır. Tüm gücü elinize alın:
- `/ogren` : Mobil/Dokunmatik cihazlarda yapay zekaya reklam öğreten element seçici.
- `/imha` : Mevcut bilinen reklam kodlarını patlatır.
- `/nojs` : Aktif sayfadaki tüm JavaScript'leri siler ve dondurur.
- `/speed` : Medya İvme motorunu devreye sokar.

## 📥 Kurulum

### PC (Masaüstü) - Firefox & Zen Browser
1. Bu projedeki **İndirilenler (Releases)** kısmından veya kendiniz derleyerek `AAEBlocker.xpi` dosyasını indirin.
2. Firefox/Zen Browser'ı açın ve eklentiyi dosya yöneticisinden sürükleyip tarayıcıya bırakın veya `about:debugging` üzerinden yükleyin.

### Mobil (Android) - Kiwi Browser
1. Play Store'dan **Kiwi Browser** indirin.
2. `AAEBlocker_Chromium.zip` dosyasını telefonunuza indirin.
3. Kiwi Browser'da Uzantılar sekmesine girip **Geliştirici Modunu** açın.
4. `+(from .zip)` seçeneği ile zip dosyasını seçip kurulumu tamamlayın.

---

<div align="center">
  <p><em>"İnsanlara yardımcı olmak için yazıldı. İnterneti daha temiz, daha hızlı ve daha adil yapmak için tasarlandı."</em></p>
  <p>🚀 <strong>MIT License | AAE_CORE v9.0</strong></p>
</div>
