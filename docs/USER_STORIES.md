# User Stories

## US-01: Aday Başvuru ve Kayıt

### US-01.1: Aday Portalı
**Kullanıcı:** Aday
**Hikaye:** Bir aday olarak, açık pozisyonları görüntüleyebilmeli ve ilgilendiğim ilanlara başvurabilmeliyim.
**Kabul Kriterleri:**
- Yayınlanmış ilanlar `/jobs` sayfasında listelenir
- İlan detay sayfasında açıklama ve aranan nitelikler görüntülenir
- "Başvur" butonu ile başvuru formuna yönlendirilir

### US-01.2: Dinamik CV Formu
**Kullanıcı:** Aday
**Hikaye:** Bir aday olarak, eğitim ve iş deneyimi bilgilerimi dinamik olarak ekleyebilmeli ve CV'mi PDF olarak yükleyebilmeliyim.
**Kabul Kriterleri:**
- Ad, soyad, e-posta, telefon alanları mevcuttur
- "Eğitim Ekle" butonu ile birden fazla eğitim bilgisi girilebilir
- "Deneyim Ekle" butonu ile birden fazla iş deneyimi girilebilir
- PDF dosya yükleme alanı mevcuttur
- Başvuru gönderildiğinde başarı mesajı gösterilir

### US-01.3: Başvuru Eşleştirme
**Kullanıcı:** Sistem
**Hikaye:** Bir başvuru yapıldığında, aday otomatik olarak ilgili ilana eşleştirilmeli ve pipeline'a "Yeni Başvuru" olarak eklenmelidir.
**Kabul Kriterleri:**
- Aday daha önce kayıtlı değilse otomatik oluşturulur
- Aynı ilana tekrar başvuru engelenir
- Başvuru "Yeni Başvuru" aşamasında başlar

---

## US-02: Aday Takip Paneli (ATS)

### US-02.1: Aday Listesi
**Kullanıcı:** İK Ekibi
**Hikaye:** Bir İK uzmanı olarak, tüm adayları tablo görünümünde listeleyebilmeli ve arama/filtreleme yapabilmeliyim.
**Kabul Kriterleri:**
- Adaylar ad, e-posta, ilan, aşama, tarih ve durum sütunlarıyla listelenir
- İsim veya e-posta ile arama yapılabilir
- Aşamaya göre filtrelenebilir (Yeni Başvuru, Ön Eleme, Mülakat vb.)
- Duruma göre filtrelenebilir (Aktif, Arşiv)
- Filtreleme sonuçları anlık güncellenir

### US-02.2: Pipeline Kanban Board
**Kullanıcı:** İK Ekibi
**Hikaye:** Bir İK uzmanı olarak, adayları sürükle-bırak ile farklı aşamalara taşıyabilmeliyim.
**Kabul Kriterleri:**
- 7 kolonlu kanban board: Yeni Başvuru, Ön Eleme, Mülakat, Değerlendirme, Teklif, İşe Alındı, Reddedildi
- Kartlar sürüklenip farklı kolona bırakılabilir
- Aşama değişikliği anında DB'ye kaydedilir
- Her kolonda aday sayısı gösterilir
- Kart üzerinde aday adı, e-posta, ilan adı ve başvuru tarihi görünür

### US-02.3: Aday Detay Sayfası
**Kullanıcı:** İK Ekibi
**Hikaye:** Bir İK uzmanı olarak, bir adayın tüm bilgilerini tek sayfada görüntüleyebilmeliyim.
**Kabul Kriterleri:**
- 5 sekmeli görünüm: Genel Bakış, CV Bilgileri, Testler, Notlar, İletişim
- Başvurular ve mevcut aşamaları görüntülenir
- CV verileri (eğitim, deneyim, yetenekler) görüntülenir
- Test sonuçları ve puanları görüntülenir
- İletişim geçmişi görüntülenir

---

## US-03: Test ve İçerik Yönetimi

### US-03.1: Test CRUD
**Kullanıcı:** İK Ekibi
**Hikaye:** Bir İK uzmanı olarak, farklı pozisyonlar için testler oluşturabilmeli, düzenleyebilmeli ve silebilmeliyim.
**Kabul Kriterleri:**
- Test oluşturma: başlık, açıklama, süre (dakika), zorluk seviyesi (Kolay/Orta/Zor)
- Test düzenleme: tüm alanlar güncellenebilir
- Test silme: onay ile kalıcı silme
- Test aktif/pasif durumu değiştirilebilir

### US-03.2: Soru Yönetimi
**Kullanıcı:** İK Ekibi
**Hikaye:** Bir İK uzmanı olarak, testlere farklı tiplerde sorular ekleyebilmeli, düzenleyebilmeli ve silebilmeliyim.
**Kabul Kriterleri:**
- 4 soru tipi: Çoktan Seçmeli, Çoklu Seçim, Doğru/Yanlış, Açık Uçlu
- Her soru için puan belirlenebilir
- Çoktan seçmeli sorularda seçenek ekleme/çıkarma
- Doğru cevap işaretleme
- Soru sıralaması korunur

### US-03.3: Sınav Zamanlayıcı
**Kullanıcı:** Aday
**Hikaye:** Bir aday olarak, sınav süresini görebilmeli ve süre dolduğunda sınavım otomatik gönderilmelidir.
**Kabul Kriterleri:**
- Sınav başladığında geri sayım zamanlayıcısı görünür
- Son 1 dakikada zamanlayıcı kırmızıya döner
- Süre dolduğunda sınav otomatik gönderilir
- Cevaplanan soru sayısı görüntülenir

### US-03.4: Proctoring (Güvenlik)
**Kullanıcı:** Sistem
**Hikaye:** Sınav güvenliğini sağlamak için çeşitli önlemler alınmalıdır.
**Kabul Kriterleri:**
- Sınav tam ekran modunda açılır
- Sekme değiştirme ihlal olarak kaydedilir
- Tam ekrandan çıkma ihlal olarak kaydedilir
- Metin kopyalama/yapıştırma engellenir (Ctrl+C/V/X)
- Sağ tık engellenir
- F12/DevTools engellenir
- 3 ihlalde sınav otomatik sonlandırılır
- İhlaller log olarak kaydedilir

### US-03.5: Soru Randomizasyonu
**Kullanıcı:** Sistem
**Hikaye:** Her adaya soruların farklı sırada sunulması gerekmektedir.
**Kabul Kriterleri:**
- Sorular aday ID + test ID bazlı seed ile karıştırılır
- Aynı aday aynı sırayı her zaman görür (deterministic shuffle)

---

## US-04: Değerlendirme ve Karar Desteği

### US-04.1: 360° Aday Karnesi
**Kullanıcı:** İK Ekibi
**Hikaye:** Bir İK uzmanı olarak, bir adayın tüm değerlendirme bilgilerini tek bir karnede görebilmeliyim.
**Kabul Kriterleri:**
- Özet kartlar: Test başarı %, ortalama değerlendirme puanı, mülakat notu sayısı, ihlal sayısı
- Test sonuçları progress bar ile görselleştirilir
- Mülakat notları ve puanları listelenir
- Başvuru geçmişi ve aşamaları gösterilir

### US-04.2: Karşılaştırma / Shortlist
**Kullanıcı:** İK Ekibi
**Hikaye:** Bir İK uzmanı olarak, aynı ilana başvuran adayları karşılaştırabilmeli ve en uygun adayları belirleyebilmeliyim.
**Kabul Kriterleri:**
- İlana başvuran tüm adaylar tek tabloda listelenir
- Kompozit skor: Test puanı (%60) + Değerlendirme puanı (%40)
- Adaylar skora göre sıralanır
- Her aday için test puanı, başarı yüzdesi, ortalama değerlendirme ve mevcut aşama görüntülenir
- Karne sayfasına tek tıkla erişim

### US-04.3: Mülakat Notları
**Kullanıcı:** İK Ekibi
**Hikaye:** Bir İK uzmanı olarak, aday hakkında mülakat notları ekleyebilmeli ve 1-10 arası puan verebilmeliyim.
**Kabul Kriterleri:**
- Not metni ve opsiyonel puan (1-10) girilebilir
- Notlar tarih sırasıyla listelenir
- Not yazan kişinin adı ve tarihi görüntülenir
- Notlar düzenlenebilir ve silinebilir

---

## US-05: İletişim Merkezi

### US-05.1: E-posta Şablon Editörü
**Kullanıcı:** İK Ekibi
**Hikaye:** Bir İK uzmanı olarak, farklı durumlar için e-posta şablonları oluşturabilmeli ve düzenleyebilmeliyim.
**Kabul Kriterleri:**
- 5 şablon tipi: Olumlu Dönüş, Olumsuz Dönüş, Davet, Test Daveti, Özel
- Şablon adı, konu ve içerik alanları
- Değişken desteği: {{fullName}}, {{position}}, {{company}}
- Şablon düzenleme ve silme

### US-05.2: Toplu E-posta Gönderimi
**Kullanıcı:** İK Ekibi
**Hikaye:** Bir İK uzmanı olarak, birden fazla adaya aynı anda e-posta gönderebilmeliyim.
**Kabul Kriterleri:**
- Aday listesinden çoklu seçim yapılabilir
- "Tümünü Seç" butonu mevcuttur
- Aday arama/filtreleme ile seçimi daraltma
- Şablon uygulama (konu ve içerik otomatik dolar)
- Gönderim sonucu: başarılı/başarısız sayıları

### US-05.3: İletişim Logu
**Kullanıcı:** İK Ekibi
**Hikaye:** Bir İK uzmanı olarak, adaylara gönderilen tüm e-postaların durumunu takip edebilmeliyim.
**Kabul Kriterleri:**
- Tüm gönderimler tablo halinde listelenir
- Durum takibi: Kuyrukta, Gönderildi, Teslim Edildi, Açıldı, Başarısız
- Alıcı, konu, gönderim tarihi ve açılma tarihi görüntülenir

---

## US-06: Sistem Ayarları ve Güvenlik

### US-06.1: Kullanıcı ve Yetki Yönetimi
**Kullanıcı:** Admin
**Hikaye:** Bir admin olarak, İK ekibindeki kullanıcıları oluşturabilmeli ve rollerini atayabilmeliyim.
**Kabul Kriterleri:**
- 4 rol: Yönetici, İK Müdürü, İK Uzmanı, İK Stajyeri
- Kullanıcı oluşturma: ad, e-posta, şifre, rol
- Mevcut kullanıcılar listelenir
- Rol bazlı yetkilendirme (permission sistemi)

### US-06.2: KVKK Uyumu
**Kullanıcı:** Sistem / Admin
**Hikaye:** KVKK mevzuatına uyum sağlamak için kişisel verilerin yönetimi yapılmalıdır.
**Kabul Kriterleri:**
- Aktif/arşivlenmiş/anonimleştirilmiş kayıt sayıları dashboard'da görünür
- 730 gün (2 yıl) sonra otomatik anonimleştirme politikası tanımlı
- Aday başvuru sırasında KVKK onayı verir (consentAt alanı)
- Veri saklama politikası ayarlar sayfasında görüntülenir

### US-06.3: Dashboard ve Metrikler
**Kullanıcı:** İK Ekibi
**Hikaye:** Bir İK uzmanı olarak, işe alım sürecinin genel durumunu dashboard üzerinden takip edebilmeliyim.
**Kabul Kriterleri:**
- 6 KPI kartı: Aktif Adaylar, Başvurular, Açık İlanlar, Aktif Testler, Tamamlanan Testler, Gönderilen E-posta
- Pipeline dağılımı bar chart ile görselleştirilir
- Son 5 başvuru listelenir
- KPI kartlarına tıklayınca ilgili sayfaya yönlendirilir

---

## US-07: İlan Yönetimi

### US-07.1: İlan CRUD
**Kullanıcı:** İK Ekibi
**Hikaye:** Bir İK uzmanı olarak, iş ilanları oluşturabilmeli, düzenleyebilmeli ve durumlarını yönetebilmeliyim.
**Kabul Kriterleri:**
- İlan oluşturma: başlık, pozisyon açıklaması, aranan nitelikler
- İlan durumu: Taslak, Yayında, Kapalı
- İlan düzenleme ve silme
- Sadece "Yayında" ilanlar aday portalında görünür
- İlan detayında başvuru listesi görüntülenir
