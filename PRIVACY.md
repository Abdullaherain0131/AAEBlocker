# Privacy Policy for AAEBlocker

**Effective Date:** 2026-09-01

Thank you for choosing AAEBlocker. Your privacy is critically important to us. This Privacy Policy explains how our extension handles your data.

## 1. Data Collection
AAEBlocker is designed to block intrusive advertisements and pop-ups using a local, client-side artificial intelligence model. 
- **Personal Data:** We **do not** collect, store, or transmit any personal data, browsing history, IP addresses, or identifiable information.
- **AI Training Data (Cloud Sync):** When you manually train the AI by right-clicking and marking an element as an ad ("AAEBlocker: Bu Bir Reklamdır"), the extension extracts generic DOM features (e.g., element width, height, keyword density). It updates mathematical weights (e.g., `w1, w2, w3, w4`) and a `bias` value. 
These anonymous mathematical weights are synced to our Firebase Realtime Database to create a "Hive Mind" (Ortak Beyin) that improves ad-blocking for all users. **No URLs, text content, or personal identifiers are ever included in this data.**

## 2. Permissions Justification
To function correctly, AAEBlocker requires the following permissions:
- **`*://*/*` and `<all_urls>`:** Required to scan and block ad elements on any website you visit.
- **`contextMenus`:** Required to allow you to manually mark elements as ads via right-click to train the AI.
- **`storage`:** Required to save your personal AI weights and extension settings locally on your device.

## 3. Third-Party Services
We use Google Firebase Realtime Database exclusively for syncing the anonymous AI mathematical weights. Firebase is subject to Google's Privacy Policy.

## 4. Changes to this Policy
We may update this policy occasionally to reflect changes in our extension. All updates will be published on our GitHub repository.

## 5. Contact
If you have any questions about this Privacy Policy, please open an issue on our GitHub repository: [https://github.com/Abdullaherain0131/AAEBlocker](https://github.com/Abdullaherain0131/AAEBlocker)

---

# AAEBlocker Gizlilik Sözleşmesi (Türkçe)

**Geçerlilik Tarihi:** 01 Eylül 2026

AAEBlocker'ı seçtiğiniz için teşekkür ederiz. Gizliliğiniz bizim için son derece önemlidir.

## 1. Veri Toplama
AAEBlocker, yerel bir yapay zeka modeli kullanarak reklamları engeller.
- **Kişisel Veriler:** Tarama geçmişiniz, IP adresiniz veya herhangi bir kişisel veriniz **asla** toplanmaz, saklanmaz veya paylaşılmaz.
- **AI Eğitim Verisi (Ortak Beyin):** Sağ tıklayıp bir öğeyi reklam olarak işaretlediğinizde, sadece o öğenin matematiksel boyutları ve özellikleri (genişlik, yükseklik vb.) hesaplanır. Bu hesaplama sonucunda ortaya çıkan anonim ağırlıklar (`w1, w2, vb.`) Firebase veritabanımıza gönderilir. **Bu verilerin içinde asla girdiğiniz siteler, kişisel bilgileriniz veya metinler yer almaz.**

## 2. İzinlerin Açıklaması
- **`*://*/*`:** Girdiğiniz sitelerdeki reklamları tespit edip engellemek için gereklidir.
- **`contextMenus`:** Sağ tık menüsüne yapay zeka eğitim butonunu eklemek için gereklidir.
- **`storage`:** Yapay zekanın öğrendiği bilgileri kendi bilgisayarınıza kaydetmesi için gereklidir.

İletişim ve destek için GitHub sayfamızı ziyaret edebilirsiniz.
