# Assessment Center — Detaylı Test Senaryoları

> Son güncelleme: Mart 2026
> Versiyon: 2.0 (System Admin, Feature Flags, Token-Based Exam, Answer Key dahil)

---

## Ön Hazırlık

### Ortam Kurulumu

```bash
# 1. PostgreSQL container başlat
docker compose -f docker-compose.dev.yml up -d

# 2. Prisma migration'larını uygula
npx prisma migrate dev

# 3. Demo verileri yükle
npx prisma db seed

# 4. Dev sunucusunu başlat
npm run dev
```

Uygulama: http://localhost:3000

### Kullanıcı Bilgileri

Giriş yöntemi: **Google OAuth** (`.env` dosyasında `GOOGLE_CLIENT_ID` ve `GOOGLE_CLIENT_SECRET` tanımlı olmalı)

| Kullanıcı | E-posta | Rol | Açıklama |
|-----------|---------|-----|----------|
| Emrah Ural | emrah.ural@param.com.tr | SYSTEM_ADMIN | Tüm yetkilere sahip sistem yöneticisi |
| Ayşenur Örs | aysenur.ors@param.com.tr | ADMIN | Kullanıcı yönetimi + İK işlemleri |
| Gizem Ertanure | gizem.ertanure@param.com.tr | ADMIN | Kullanıcı yönetimi + İK işlemleri |

**Not:** `ADMIN_EMAIL` ortam değişkeni (`emrah.ural@param.com.tr`) ile giriş yapan kullanıcı otomatik olarak `SYSTEM_ADMIN` rolü alır. Diğer kullanıcılar için DB'de kayıt veya `LoginInvite` kaydı gereklidir.

### Seed (Demo) Verileri

| Veri Tipi | İçerik |
|-----------|--------|
| Kullanıcılar | 3 kullanıcı (1 System Admin, 2 Admin) |
| İlanlar | 2 yayında (Senior Frontend Developer, Backend Developer Node.js) |
| Adaylar | 3 aday: Ali Yılmaz (Param), Ayşe Kaya (Finrota), Mehmet Demir (Kredim) |
| Başvurular | 4 başvuru (Mülakat, Değerlendirme, Yeni Başvuru, Ön Eleme aşamalarında) |
| Testler | 3 test: Genel Yetenek (32 soru), İngilizce Seviye (15 soru), Finansal Okuryazarlık (10 soru) |
| E-posta Şablonları | 3 şablon (Olumlu Dönüş, Olumsuz Dönüş, Test Daveti) |
| Mülakat Notları | 2 not (Ali ve Ayşe için) |
| Feature Flag'ler | 5 flag (candidateJobs, candidateApply, communication, pipeline, listings — hepsi açık) |

---

## TS-01: Kimlik Doğrulama ve Giriş

**Modül:** Authentication
**Önkoşul:** Uygulama çalışıyor, Google OAuth yapılandırılmış
**Kullanıcı:** Farklı roller

### TS-01.1: System Admin — Google OAuth Girişi

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | http://localhost:3000/login adresine gidin | Login sayfası görünür: sol panelde Param logosu ve görsel, sağda "Hoş geldiniz" başlığı |
| 2 | "Google ile devam et" butonuna tıklayın | Google hesap seçim ekranına yönlendirilir |
| 3 | `emrah.ural@param.com.tr` hesabını seçin | Dashboard'a yönlendirilir |
| 4 | Sağ üst köşedeki kullanıcı adını kontrol edin | "Emrah Ural" ve yanında "Sistem Yöneticisi" rol badge'i görünür |
| 5 | Sol menüdeki öğeleri kontrol edin | Dashboard, Adaylar, Pipeline, İlanlar, Testler, İletişim, Ayarlar ve Sistem Logları görünür |

### TS-01.2: Admin — Google OAuth Girişi

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Çıkış yapın, login sayfasına dönün | Login formu görünür |
| 2 | `aysenur.ors@param.com.tr` ile giriş yapın | Dashboard'a yönlendirilir |
| 3 | Header'daki rol badge'ini kontrol edin | "Yönetici" badge'i görünür |
| 4 | Sol menüyü kontrol edin | "Sistem Logları" menü öğesi **görünmez** |

### TS-01.3: Davetsiz Kullanıcı — Erişim Reddi

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Login sayfasına gidin | Login formu görünür |
| 2 | Sistemde kaydı ve daveti olmayan bir Google hesabıyla giriş deneyin | Login sayfasına geri yönlendirilir |
| 3 | Hata mesajını kontrol edin | "Bu e-posta ile giriş yetkiniz yok. Yöneticinizden davet isteyin." mesajı görünür |

### TS-01.4: Davetli Kullanıcı — İlk Giriş (LoginInvite)

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | System Admin ile giriş yapın | Dashboard açılır |
| 2 | Ayarlar > "Kullanıcı davet et" sayfasına gidin | Davet formu açılır |
| 3 | E-posta: `test.user@param.com.tr`, Rol: "İK Uzmanı" seçin, "Davet ekle" | Davet listesine eklenir |
| 4 | Çıkış yapın, `test.user@param.com.tr` Google hesabıyla giriş yapın | Dashboard'a yönlendirilir, kullanıcı "İK Uzmanı" rolüyle oluşturulur |
| 5 | Header'daki rol badge'ini kontrol edin | "İK Uzmanı" badge'i görünür |
| 6 | Tekrar Ayarlar sayfasına System Admin ile gidin | Bekleyen davetlerden `test.user@param.com.tr` silinmiş olmalı |

### TS-01.5: Oturum Rol Yenilemesi

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Admin ile giriş yapın | Dashboard açılır |
| 2 | DB'den kullanıcının rolünü değiştirin (ör. SQL ile HR_MANAGER yapın) | — |
| 3 | Herhangi bir sayfayı yenileyin | Header'daki rol badge'i "İK Müdürü" olarak güncellenir (JWT her istekte DB'den yenilenir) |

---

## TS-02: Dashboard

**Modül:** Dashboard
**Önkoşul:** Giriş yapılmış, seed verileri yüklü
**Kullanıcı:** System Admin veya Admin

### TS-02.1: KPI Kartları ve Navigasyon

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Dashboard'a gidin (/) | Dashboard sayfası yüklenir |
| 2 | KPI kartlarını sayın | 6 kart görünür: Aktif Adaylar, Başvurular, Açık İlanlar, Aktif Testler, Tamamlanan Testler, Gönderilen E-posta |
| 3 | "Aktif Adaylar" kartını kontrol edin | Değer ≥ 3 (seed verisindeki aday sayısı) |
| 4 | "Aktif Adaylar" kartına tıklayın | `/candidates` sayfasına yönlendirilir |
| 5 | Geri dönün, "Başvurular" kartına tıklayın | `/pipeline` sayfasına yönlendirilir |
| 6 | Geri dönün, "Aktif Testler" kartına tıklayın | `/assessments` sayfasına yönlendirilir |

### TS-02.2: Pipeline Dağılımı ve Son Başvurular

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Dashboard'daki "Pipeline Dağılımı" bölümünü kontrol edin | Bar chart ile 7 aşama listelenir (Yeni Başvuru, Ön Eleme, Mülakat, Değerlendirme, Teklif, İşe Alındı, Reddedildi) |
| 2 | Bar genişliklerini kontrol edin | En az 1 başvurusu olan aşamalar dolu bar gösterir |
| 3 | "Son Başvurular" bölümünü kontrol edin | Aday adı, ilan başlığı, aşama badge'i ve tarih görünür |
| 4 | "Tümünü gör →" linkine tıklayın | `/candidates` sayfasına yönlendirilir |

### TS-02.3: Feature Flag ile Dashboard Gizleme

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | System Admin ile Ayarlar > Modül Yönetimi'ne gidin | Feature flag toggle'ları görünür |
| 2 | "Pipeline" toggle'ını kapatın | Toggle kapalı konuma geçer |
| 3 | Dashboard'a dönün | "Başvurular" KPI kartı **gizlenir**, "Pipeline Dağılımı" ve "Son Başvurular" bölümleri **gizlenir** |
| 4 | "İlanlar" toggle'ını kapatın | — |
| 5 | Dashboard'ı yenileyin | "Açık İlanlar" KPI kartı da **gizlenir** |
| 6 | Toggle'ları tekrar açın | Tüm kartlar ve bölümler geri gelir |

---

## TS-03: Aday Yönetimi

**Modül:** Aday Yönetimi
**Önkoşul:** Giriş yapılmış
**Kullanıcı:** Admin veya üstü

### TS-03.1: Aday Listeleme ve Filtreleme

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Sol menüden "Adaylar"a tıklayın | Aday tablosu görünür, üstte aday sayısı badge'i |
| 2 | Aday sayısını doğrulayın | ≥ 3 aday (Ali Yılmaz, Ayşe Kaya, Mehmet Demir) |
| 3 | Tablo sütunlarını kontrol edin | İsim, e-posta, telefon, firma (logo), pozisyon, departman, tarih, durum |
| 4 | Arama kutusuna "Ali" yazın | Sadece "Ali Yılmaz" listelenir |
| 5 | Aramayı temizleyin | Tüm adaylar tekrar görünür |
| 6 | Firma filtresinden "Param" seçin | Sadece Param firmasındaki adaylar görünür |
| 7 | Firma filtresini temizleyin, durum filtresinden "Aktif" seçin | Aktif adaylar filtrelenir |
| 8 | Departman filtresini deneyin | Filtreleme departmana göre çalışır |
| 9 | Tüm filtreleri temizleyin | Tam liste geri gelir |

### TS-03.2: Manuel Aday Ekleme

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Aday listesinde "Aday Ekle" butonuna tıklayın | Aday ekleme dialog'u açılır |
| 2 | Ad: "Test", Soyad: "Adayı", E-posta: "test.aday@email.com" girin | Alanlar doldurulur |
| 3 | Telefon: "0555 123 4567" girin | — |
| 4 | Firma dropdown'ından "ParamTech" seçin | — |
| 5 | Pozisyon ve departman bilgilerini girin | — |
| 6 | "Kaydet" butonuna tıklayın | Dialog kapanır, liste yenilenir, yeni aday tabloda görünür |
| 7 | Aynı e-posta ile tekrar eklemeyi deneyin | Hata mesajı: e-posta zaten kayıtlı |

### TS-03.3: Aday Düzenleme

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Aday detay sayfasına gidin | Aday bilgileri görünür |
| 2 | "Düzenle" butonuna tıklayın | Düzenleme dialog'u açılır, mevcut bilgiler dolu |
| 3 | Telefon numarasını değiştirin | — |
| 4 | Firma'yı değiştirin | — |
| 5 | "Kaydet"e tıklayın | Dialog kapanır, güncellenen bilgiler sayfada görünür |

### TS-03.4: Google Sheets'ten Aday Import

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Aday listesinde "Import" butonuna tıklayın | Google Sheets import dialog'u açılır |
| 2 | Bir Google Sheets URL'si girin | Önizleme yüklenir: sütun eşleştirmeleri ve örnek veriler |
| 3 | Sütun eşleştirmelerini kontrol edin | firstName, lastName, email vb. alanlar otomatik eşleştirilir |
| 4 | "Import Et" butonuna tıklayın | İşlem sonucu: "X aday eklendi, Y atlandı" mesajı |
| 5 | Aday listesini kontrol edin | Yeni adaylar tabloya eklenmiş |
| 6 | Zaten var olan e-posta adresleriyle tekrar import deneyin | Bu adaylar "atlandı" olarak raporlanır |

### TS-03.5: Aday Detay — Test Yaşam Döngüsü

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Sınav daveti gönderilmiş bir adayın detay sayfasına gidin | Test yaşam döngüsü bölümü görünür |
| 2 | Davet durumunu kontrol edin | Badge: "Bekliyor" / "Başladı" / "Tamamlandı" / "Süresi Doldu" |
| 3 | Zaman çizelgesini kontrol edin | Davet gönderim, başlangıç ve tamamlanma tarihleri listelenir |
| 4 | Tamamlanmış bir sınav sonucunu kontrol edin | Puan (ör. 24/32), seviye (ör. "Yüksek"), kategori skorları görünür |
| 5 | İş uyumu badge'lerini kontrol edin | Roller için "Uygun" / "Yetersiz" etiketleri görünür |

### TS-03.6: Cevap Anahtarı

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Tamamlanmış sınav sonucu olan bir adayın detay sayfasına gidin | Cevap anahtarı butonu görünür |
| 2 | "Cevap Anahtarı" butonuna tıklayın | Tablo açılır: soru no, soru metni (kısaltılmış), kategori, adayın cevabı, doğru cevap, sonuç (✓/✗) |
| 3 | Doğru cevapları kontrol edin | Yeşil arka planlı ✓ işareti |
| 4 | Yanlış cevapları kontrol edin | Kırmızı arka planlı ✗ işareti, doğru cevap ayrı sütunda |
| 5 | Butona tekrar tıklayın | Tablo kapanır (toggle davranışı) |

### TS-03.7: 360° Karne

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Aday detay sayfasında "360° Karne" butonuna tıklayın | Karne sayfası açılır |
| 2 | Özet kartları kontrol edin | Test başarı %, değerlendirme puanı, not sayısı, ihlal sayısı |
| 3 | Test sonuçları bölümünü kontrol edin | Progress bar ile puan görselleştirilmiş |
| 4 | Mülakat notları bölümünü kontrol edin | Not metni, puan ve yazan kişi bilgisi |

---

## TS-04: Test / Değerlendirme Yönetimi

**Modül:** Test Motoru
**Önkoşul:** Giriş yapılmış
**Kullanıcı:** Admin veya üstü

### TS-04.1: Test Listeleme

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Sol menüden "Testler"e tıklayın | Test kartları grid görünümde listelenir |
| 2 | Kart sayısını doğrulayın | ≥ 3 test (Genel Yetenek, İngilizce Seviye, Finansal Okuryazarlık) |
| 3 | Kart içeriğini kontrol edin | Başlık, zorluk badge'i (Kolay/Orta/Zor), açıklama, soru sayısı, süre, aktif/pasif durumu |
| 4 | "Genel Yetenek Sınavı" kartına tıklayın | Test detay sayfası açılır |

### TS-04.2: Test Detay ve Soru Yönetimi

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Test detay sayfasındaki özet kartları kontrol edin | 4 kart: Soru sayısı (32), Toplam puan, Süre (45 dk), Zorluk (Orta) |
| 2 | "Sorular" sekmesini kontrol edin | Sorular sıralı listelenir; her soruda metin, seçenekler, doğru cevap, kategori, puan |
| 3 | Doğru cevabın vurgulandığını kontrol edin | Yeşil arka plan + ✓ işareti |
| 4 | Görsel içeren soruları kontrol edin (ör. soyutsal yetenek) | SVG görseli soru metninin altında render edilir |
| 5 | "Soru Ekle" butonuna tıklayın | Soru ekleme dialog'u açılır |
| 6 | Soru metni, 4 seçenek, doğru cevap, kategori ("Sayısal"), puan (1) girin | Form doldurulur |
| 7 | "Ekle"ye tıklayın | Soru listeye eklenir, soru sayısı güncellenir |
| 8 | Eklenen sorunun "Düzenle" butonuna tıklayın | Düzenleme dialog'u mevcut verilerle açılır |
| 9 | Soru metnini değiştirin, "Güncelle" | Soru güncellenir |
| 10 | Sorunun "Sil" butonuna tıklayın, onay verin | Soru listeden kaldırılır |

### TS-04.3: Soru Görseli Yükleme

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Soru ekleme dialog'unda "Görsel URL" alanını bulun | imageUrl input alanı mevcut |
| 2 | Bir SVG dosya yolu girin (ör. `/images/exam/gy-q17-paper-fold.svg`) | URL kaydedilir |
| 3 | Soruyu kaydedin, listeden kontrol edin | Görsel soru kartında render edilir |

### TS-04.4: Puanlama Konfigürasyonu

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | "Puanlama" sekmesine geçin | Puanlama editörü açılır |
| 2 | Kategorileri kontrol edin | Mevcut kategoriler listelenir (ör. Sayısal, Sözel, Soyutsal, Grafik/Veri) |
| 3 | Seviye eşiklerini kontrol edin | Çok Yüksek (28+), Yüksek (22+), Orta (16+), Düşük (8+), Çok Düşük (0+) |
| 4 | İş uyumu kurallarını kontrol edin | Roller ve kategori bazlı minimum puanlar tanımlı |
| 5 | Bir kuralı düzenleyin, kaydedin | Konfigürasyon güncellenir |

### TS-04.5: Test Ayarları

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | "Ayarlar" sekmesine geçin | Test ayar formu: başlık, açıklama, süre, zorluk, aktif/pasif |
| 2 | Süreyi 45'ten 60 dakikaya değiştirin | — |
| 3 | "Kaydet"e tıklayın | Başarılı kayıt mesajı, özet karttaki süre "60 dk" olur |
| 4 | Aktif/pasif toggle'ını değiştirin | Test durumu güncellenir |
| 5 | Süreyi geri 45 dakikaya alın ve kaydedin | — |

### TS-04.6: Yeni Test Oluşturma

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | "Yeni Test Oluştur" butonuna tıklayın | Test oluşturma sayfası açılır |
| 2 | Başlık: "Mantık Testi", Açıklama girin, Süre: 20, Zorluk: "Kolay" | Form doldurulur |
| 3 | "Oluştur"a tıklayın | Test detay sayfasına yönlendirilir |
| 4 | Test listesine dönün | Yeni test kartı listede görünür |

---

## TS-05: Sınav Davet Sistemi

**Modül:** Sınav Davetleri
**Önkoşul:** Aktif test ve kayıtlı aday mevcut
**Kullanıcı:** Admin (davet gönderme), Aday (sınav çözme)

### TS-05.1: Adaya Sınav Daveti Gönderme

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | "Genel Yetenek Sınavı" test detayına gidin | Test detay sayfası açılır |
| 2 | "Davet Gönder" sekmesine geçin | Davet gönderim paneli görünür |
| 3 | Aday listesinden "Ali Yılmaz"ı seçin | Aday seçilir, checkbox işaretli |
| 4 | "Davet Gönder" butonuna tıklayın | Davet oluşturulur, sınav linki üretilir |
| 5 | Oluşturulan davet linkini kontrol edin | `http://localhost:3000/exam/<token>` formatında bir link görünür |
| 6 | Link kopyalama butonuna tıklayın | Link panoya kopyalanır |
| 7 | Gönderilen davetler listesini kontrol edin | Ali Yılmaz — "Bekliyor" durumunda görünür |
| 8 | Aynı aday için tekrar davet göndermeyi deneyin | "Zaten davet gönderilmiş" uyarısı, mevcut token döner |

### TS-05.2: Davet E-postası

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | SMTP yapılandırılmışsa, davet gönderildiğinde | Adaya Türkçe HTML e-posta gönderilir |
| 2 | E-posta içeriğini kontrol edin | Aday adı, test adı ve sınav linki bulunur |
| 3 | SMTP yapılandırılmamışsa | Davet oluşturulur ama e-posta gönderilmez, link manuel paylaşılabilir |

### TS-05.3: Token ile Sınava Erişim

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Yeni incognito pencere açın (giriş gerekmez) | Temiz oturum |
| 2 | Sınav linkini tarayıcıya yapıştırın (http://localhost:3000/exam/TOKEN) | Sınav başlangıç ekranı: test adı, aday adı, soru sayısı, süre bilgisi, kurallar |
| 3 | Kuralları kontrol edin | Tam ekran modu, ihlal sayacı, süre bilgisi belirtilir |

### TS-05.4: Sınav Akışı — Başlatma ve Cevaplama

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | "Sınavı Başlat" butonuna tıklayın | Tam ekran moduna geçilir, zamanlayıcı başlar, 1. soru görünür |
| 2 | Zamanlayıcıyı kontrol edin | Geri sayım çalışır (ör. 45:00 → 44:59...) |
| 3 | Çoktan seçmeli sorudaki bir seçeneğe tıklayın | Seçenek vurgulanır, cevap kaydedilir |
| 4 | "Sonraki" butonuna tıklayın | 2. soru görünür |
| 5 | "Önceki" butonuna tıklayın | 1. soru görünür, seçilen cevap hala işaretli |
| 6 | Soru navigasyon butonlarını kontrol edin | Cevaplanmış sorular farklı renkte (yeşil), cevapsızlar gri |
| 7 | Birkaç soruyu atlayarak ilerleyin | Navigasyonda atlanan sorular gri kalır |
| 8 | Görsel içeren bir soruya gidin | SVG görseli soru metninin altında düzgün render edilir |

### TS-05.5: Zamanlayıcı ve Otomatik Gönderim

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Zamanlayıcının çalıştığını doğrulayın | Her saniye güncellenir |
| 2 | Son 1 dakikada zamanlayıcıyı kontrol edin | Kırmızıya döner (uyarı) |
| 3 | Süre dolduğunda | Sınav otomatik gönderilir, sonuç ekranı görünür |

### TS-05.6: Proctoring (Güvenlik Önlemleri)

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Sınav başladıktan sonra başka bir sekmeye geçin (Alt+Tab veya sekme tıklama) | İhlal kaydedilir: "tab_switch", uyarı mesajı görünür, ihlal sayacı 1 artar |
| 2 | Tam ekrandan çıkın (Escape) | İhlal kaydedilir: "fullscreen_exit", sayaç artar |
| 3 | Ctrl+C veya sağ tık deneyin | İhlal kaydedilir: "copy_attempt", sayaç artar |
| 4 | 3. ihlalde | Sınav otomatik sonlandırılır, sonuç "İhlal sınırı aşıldı" ile gönderilir |
| 5 | İhlal sayısını kontrol edin | Sonuç ekranında toplam ihlal sayısı görünür |

### TS-05.7: Sınav Sonuç Ekranı

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Sınavı normal şekilde tamamlayın: son soruya gidin, "Sınavı Tamamla" | Onay dialog'u görünür |
| 2 | "Evet, gönder" onaylayın | Sonuç ekranı: puan/toplam puan, seviye (ör. "Yüksek"), cevaplanmış soru sayısı |
| 3 | Admin panelinden aday detayına gidin | Sınav sonucu "Tamamlandı" olarak görünür, puan ve seviye bilgisi güncellenir |

### TS-05.8: Tamamlanmış Sınava Tekrar Erişim

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Daha önce tamamlanan sınav token'ıyla linke tekrar gidin | Sınav sonuç ekranı görünür (tekrar çözüm mümkün değil) |

---

## TS-06: Pipeline (Kanban Board)

**Modül:** ATS Pipeline
**Önkoşul:** Giriş yapılmış, pipeline feature flag açık
**Kullanıcı:** Admin veya İK

### TS-06.1: Kanban Görünümü

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Sol menüden "Pipeline" sayfasına gidin | Kanban board görünür |
| 2 | Kolonları kontrol edin | 7 kolon: Yeni Başvuru, Ön Eleme, Mülakat, Değerlendirme, Teklif, İşe Alındı, Reddedildi |
| 3 | Kart içeriğini kontrol edin | Aday adı, e-posta, ilan adı, başvuru tarihi |
| 4 | Her kolondaki kart sayısını doğrulayın | Toplam 4 kart, farklı kolonlarda |

### TS-06.2: Sürükle-Bırak ile Aşama Değişikliği

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | "Mülakat" kolonundaki bir kartı "Teklif" kolonuna sürükleyin | Kart yeni kolonda görünür, kolon sayıları güncellenir |
| 2 | Sayfayı yenileyin | Değişiklik kalıcı (DB'ye kaydedilmiş) |
| 3 | Kartı "Reddedildi" kolonuna sürükleyin | Kart "Reddedildi" kolonunda görünür |

### TS-06.3: Navigasyon

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Kart üzerindeki aday ismine tıklayın | Aday detay sayfasına yönlendirilir |
| 2 | "Tablo Görünümü" butonuna tıklayın | Adaylar sayfasına yönlendirilir |
| 3 | Adaylar sayfasında "Kanban Görünümü" butonuna tıklayın | Pipeline sayfasına geri dönülür |

---

## TS-07: İlan Yönetimi

**Modül:** İlan Yönetimi
**Önkoşul:** Giriş yapılmış, listings feature flag açık
**Kullanıcı:** Admin veya İK

### TS-07.1: İlan Listeleme

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Sol menüden "İlanlar"a tıklayın | İlan tablosu görünür |
| 2 | İlan sayısını doğrulayın | ≥ 2 ilan (Senior Frontend Developer, Backend Developer) |
| 3 | Tablo sütunlarını kontrol edin | Başlık, durum (Taslak/Yayında/Kapalı), başvuru sayısı, oluşturma tarihi |

### TS-07.2: Yeni İlan Oluşturma

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | "Yeni İlan Oluştur" butonuna tıklayın | İlan oluşturma formu açılır |
| 2 | Başlık: "QA Engineer", Açıklama ve Aranan Nitelikler girin | Form doldurulur |
| 3 | "Oluştur"a tıklayın | İlan oluşturulur, detay sayfasına yönlendirilir |
| 4 | İlan listesine dönün | Yeni ilan tabloda görünür |

### TS-07.3: İlan Düzenleme

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Bir ilanın detayına gidin | İlan bilgileri görünür |
| 2 | Başlığı değiştirin, "Kaydet"e tıklayın | İlan güncellenir |
| 3 | Durumu "Yayında"dan "Kapalı"ya değiştirin | Durum güncellenir |
| 4 | Aday portalında ilanlar sayfasını kontrol edin | Kapatılan ilan artık görünmez |

### TS-07.4: Shortlist / Karşılaştırma

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Başvuru içeren ilanın detayına gidin | Başvurular bölümü görünür |
| 2 | "Karşılaştır / Shortlist" butonuna tıklayın | Shortlist tablosu açılır |
| 3 | Sıralamayı kontrol edin | Adaylar kompozit skora göre sıralı (Test %60 + Değerlendirme %40) |
| 4 | Progress barları kontrol edin | Her aday için test puanı, değerlendirme puanı görselleştirilmiş |
| 5 | "Karne" butonuna tıklayın | Adayın 360° karne sayfası açılır |

---

## TS-08: İletişim Merkezi

**Modül:** İletişim
**Önkoşul:** Giriş yapılmış, communication feature flag açık
**Kullanıcı:** Admin veya İK (şablon izni olan)

### TS-08.1: Şablon Listeleme ve Oluşturma

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Sol menüden "İletişim"e tıklayın | Şablon kartları görünür |
| 2 | Mevcut şablonları kontrol edin | 3 şablon: Olumlu Dönüş, Olumsuz Dönüş, Test Daveti |
| 3 | Kart bilgilerini kontrol edin | Şablon adı, tip badge'i (positive/negative/test_invite), konu ve gövde önizlemesi |
| 4 | "Yeni Şablon" butonuna tıklayın | Şablon oluşturma sayfası açılır |
| 5 | Ad: "Mülakat Daveti", Tip: "Davet", Konu ve İçerik girin | — |
| 6 | İçeriğe `{{fullName}}` ve `{{position}}` değişkenlerini ekleyin | — |
| 7 | "Oluştur"a tıklayın | Şablon kaydedilir, listeye eklenir |

### TS-08.2: Şablon Düzenleme

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | "Olumlu Dönüş" şablonuna tıklayın | Düzenleme formu açılır, mevcut veriler dolu |
| 2 | Konu metnini değiştirin | — |
| 3 | "Kaydet"e tıklayın | "Kaydedildi" mesajı görünür |

### TS-08.3: Toplu E-posta Gönderimi

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | "E-posta Gönder" sayfasına gidin | İçerik editörü ve aday seçim paneli görünür |
| 2 | Şablon dropdown'ından "Olumlu Dönüş" seçin | Konu ve içerik otomatik dolar |
| 3 | Aday listesinden Ali Yılmaz ve Ayşe Kaya'yı seçin | 2 aday seçili, "2 Adaya Gönder" butonu aktif |
| 4 | "2 Adaya Gönder"e tıklayın | Sonuç: "2 başarılı" (SMTP yoksa log kaydedilir) |
| 5 | "Tümünü Seç" butonunu deneyin | Tüm adaylar seçilir |

### TS-08.4: Gönderim Logları

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | "Gönderim Logları" sayfasına gidin | Gönderim kayıtları tablo halinde listelenir |
| 2 | Tablo sütunlarını kontrol edin | Alıcı, konu, durum (Gönderildi/Başarısız/Teslim Edildi/Açıldı), tarih |
| 3 | Son gönderilen e-postaları doğrulayın | Az önce gönderilen e-postalar listede görünür |

---

## TS-09: Aday Portalı (Public)

**Modül:** Aday Portalı
**Önkoşul:** Yayında ilan var, candidateJobs ve candidateApply feature flag'leri açık
**Kullanıcı:** Aday (giriş gerekmez)

### TS-09.1: Açık Pozisyonları Görüntüleme

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | http://localhost:3000/jobs adresine gidin (giriş yapmadan) | "Açık Pozisyonlar" başlığı, yayındaki ilanlar kartlar halinde listelenir |
| 2 | Kart içeriğini kontrol edin | Başlık, tarih, "Açık" badge'i, açıklama kısmı, "Başvur" butonu |
| 3 | "Senior Frontend Developer" kartına tıklayın | İlan detay sayfası: açıklama, aranan nitelikler, "Başvur" butonu |
| 4 | "Başvur" butonuna tıklayın | Başvuru formuna yönlendirilir |

### TS-09.2: İş Başvuru Formu

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Başvuru formunu kontrol edin | Ad, Soyad, E-posta, Telefon alanları (hepsi zorunlu) |
| 2 | Ad: "Zeynep", Soyad: "Çelik" girin | — |
| 3 | E-posta: "zeynep.celik@email.com" girin | — |
| 4 | Telefon: "0535 999 8877" girin | — |
| 5 | Firma dropdown'ından şirket seçin (opsiyonel) | — |
| 6 | "Eğitim Ekle" butonuna tıklayın | Dinamik eğitim formu açılır (okul, derece, alan, yıl) |
| 7 | Eğitim bilgilerini girin | — |
| 8 | "Deneyim Ekle" butonuna tıklayın | Dinamik deneyim formu açılır (ünvan, şirket, başlangıç, bitiş, açıklama) |
| 9 | Deneyim bilgilerini girin | — |
| 10 | Yetenekler alanına "Python, SQL, Data Analysis" girin | Virgülle ayrılmış liste |
| 11 | CV dosyası seçin (PDF, max 5 MB) | Dosya seçilir |
| 12 | KVKK onay kutusunu **işaretlemeden** göndermeyi deneyin | Form gönderilmez, onay zorunlu |
| 13 | KVKK onayını işaretleyin | — |
| 14 | "Başvuruyu Gönder"e tıklayın | Başarı mesajı: "Başvurunuz alındı" |
| 15 | PDF yüklemesini doğrulayın | Dosya başarıyla yüklenir |

### TS-09.3: Başvuru Sonrası Doğrulama (Admin Tarafı)

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Admin ile giriş yapın, Dashboard'u kontrol edin | Yeni başvuru "Son Başvurular"da görünür |
| 2 | Adaylar sayfasını kontrol edin | "Zeynep Çelik" listede görünür |
| 3 | Pipeline'ı kontrol edin | "Yeni Başvuru" kolonunda yeni kart |

### TS-09.4: Tekrar Başvuru Engeli

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Aynı e-posta ve aynı ilan ile tekrar başvurun | Hata mesajı: aynı ilana tekrar başvuru yapılamaz |

---

## TS-10: Sistem Admin Özellikleri

**Modül:** Sistem Yönetimi
**Önkoşul:** System Admin ile giriş yapılmış
**Kullanıcı:** SYSTEM_ADMIN

### TS-10.1: Feature Flag Yönetimi

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Ayarlar sayfasına gidin | Sayfanın üstünde "Sistem Yöneticisi" rol badge'i görünür |
| 2 | "Modül Yönetimi" bölümünü bulun | 5 feature flag toggle'ı listelenir |
| 3 | Toggle'ları kontrol edin | Aday İlanları, Aday Başvuru, İletişim Modülü, Pipeline, İlanlar — hepsi açık |
| 4 | "Pipeline" toggle'ını kapatın | Toggle kapalı konuma geçer |
| 5 | Sol menüyü kontrol edin | "Pipeline" menü öğesi **kaybolur** |
| 6 | Dashboard'u kontrol edin | "Başvurular" kartı, "Pipeline Dağılımı" ve "Son Başvurular" **gizlenir** |
| 7 | /pipeline adresine doğrudan gidin | 404 sayfası görünür |
| 8 | Toggle'ı tekrar açın | Tüm öğeler geri gelir |
| 9 | "İletişim Modülü" toggle'ını kapatın | "İletişim" menü öğesi kaybolur, "Gönderilen E-posta" KPI kartı gizlenir |
| 10 | Toggle'ı tekrar açın | Normal duruma döner |

### TS-10.2: Denetim Logları (Audit Log)

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Sol menüden "Sistem Logları"na tıklayın | Log viewer sayfası açılır |
| 2 | "Kullanıcı İşlemleri" sekmesini seçin | Audit logları tablo halinde listelenir |
| 3 | Tablo sütunlarını kontrol edin | Tarih, kullanıcı, işlem, varlık, detay |
| 4 | Son giriş logunu bulun | "LOGIN" işlemi, kullanıcı adı ve "google" provider bilgisi |
| 5 | Feature flag değişiklik logunu bulun | "FEATURE_ENABLED" veya "FEATURE_DISABLED" işlemi |
| 6 | Arama kutusuna "LOGIN" yazın | Sadece giriş logları filtrelenir |
| 7 | "Daha fazla yükle" butonuna tıklayın (varsa) | Eski loglar yüklenir (cursor-based pagination) |

### TS-10.3: Uygulama Logları (App Log)

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | "Sistem Logları" sekmesine geçin | Uygulama logları listelenir |
| 2 | Log seviyelerini kontrol edin | "error" ve "warn" seviye etiketleri renkli görünür |
| 3 | Seviye filtresinden "error" seçin | Sadece error seviyesindeki loglar filtrelenir |
| 4 | Arama kutusuna bir anahtar kelime girin | Loglar filtrelenir |

### TS-10.4: Kullanıcı Davet Etme (ADMIN rolü dahil)

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Ayarlar > "Kullanıcı davet et" sayfasına gidin | Davet formu ve bekleyen davetler listesi |
| 2 | Rol seçeneklerini kontrol edin (System Admin olarak) | "Yönetici" (ADMIN) seçeneği **mevcut** |
| 3 | E-posta: "yeni.admin@param.com.tr", Rol: "Yönetici" seçin | — |
| 4 | "Davet ekle" butonuna tıklayın | Davet listeye eklenir |
| 5 | Bekleyen davetler listesini kontrol edin | Yeni davet görünür |
| 6 | "İptal" butonuna tıklayın, onaylayın | Davet listeden silinir |

### TS-10.5: Admin ile Davet — Rol Kısıtlaması

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | ADMIN rolüyle giriş yapın | Dashboard açılır |
| 2 | Ayarlar > "Kullanıcı davet et" sayfasına gidin | Davet formu açılır |
| 3 | Rol seçeneklerini kontrol edin | "Yönetici" (ADMIN) seçeneği **mevcut değil** — sadece İK rolleri |

---

## TS-11: Rol Bazlı Erişim Kontrolü (RBAC)

**Modül:** Yetkilendirme
**Önkoşul:** Farklı rollerde kullanıcılar mevcut
**Kullanıcı:** Çeşitli roller

### TS-11.1: SYSTEM_ADMIN Yetkileri

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | System Admin ile giriş yapın | Dashboard açılır |
| 2 | Tüm menü öğelerine erişin | Dashboard, Adaylar, Pipeline, İlanlar, Testler, İletişim, Ayarlar, Sistem Logları — hepsi erişilebilir |
| 3 | Ayarlar sayfasında Modül Yönetimi bölümü | Görünür ve düzenlenebilir |
| 4 | Sistem Logları sayfası | Erişilebilir |
| 5 | Kullanıcı davet sayfasında ADMIN rolü | Seçilebilir |
| 6 | Aday silme işlemi | Çalışır |

### TS-11.2: ADMIN Yetkileri

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Admin ile giriş yapın | Dashboard açılır |
| 2 | Menüyü kontrol edin | "Sistem Logları" **görünmez** |
| 3 | Ayarlar sayfasında Modül Yönetimi | Bölüm **görünmez**, sarı uyarı kartı görünür |
| 4 | /settings/logs adresine doğrudan gidin | `/settings` sayfasına yönlendirilir |
| 5 | Kullanıcı yönetimi | Erişilebilir (davet oluşturma, kullanıcı listesi) |
| 6 | Test, ilan, iletişim modülleri | Tam erişim |

### TS-11.3: HR_MANAGER Yetkileri

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | İK Müdürü ile giriş yapın | Dashboard açılır |
| 2 | Aday ekleme/düzenleme | Çalışır |
| 3 | Aday silme | Çalışır |
| 4 | Test oluşturma/düzenleme | Çalışır |
| 5 | Ayarlar > Kullanıcı davet et | Erişim **yok** |
| 6 | Ayarlar > Modül Yönetimi | Erişim **yok** |

### TS-11.4: HR_SPECIALIST Yetkileri

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | İK Uzmanı ile giriş yapın | Dashboard açılır |
| 2 | Aday ekleme/düzenleme | Çalışır |
| 3 | Aday silme | **Yetki hatası** |
| 4 | Test oluşturma/düzenleme | Çalışır |
| 5 | Test silme | **Yetki hatası** |
| 6 | İletişim şablonu oluşturma | **Yetki hatası** (templates izni yok) |
| 7 | E-posta gönderme | Çalışır |

### TS-11.5: HR_INTERN Yetkileri

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | İK Stajyeri ile giriş yapın | Dashboard açılır |
| 2 | Aday listesi | Görüntülenebilir (salt okunur) |
| 3 | Aday ekleme | **Yetki hatası** |
| 4 | Test listesi | Görüntülenebilir |
| 5 | Soru ekleme/düzenleme | **Yetki hatası** |
| 6 | İletişim logları | Görüntülenebilir |
| 7 | E-posta gönderme | **Yetki hatası** |
| 8 | Ayarlar > Kullanıcı yönetimi | Erişim **yok** |

---

## TS-12: Feature Flag Entegrasyonu

**Modül:** Feature Flag Sistemi
**Önkoşul:** System Admin ile giriş yapılmış
**Kullanıcı:** SYSTEM_ADMIN

### TS-12.1: Sidebar Dinamik Menü

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Tüm flag'ler açıkken sol menüyü kontrol edin | Pipeline, İlanlar, İletişim menü öğeleri görünür |
| 2 | "Pipeline" flag'ini kapatın | "Pipeline" menü öğesi kaybolur |
| 3 | "İlanlar" flag'ini kapatın | "İlanlar" menü öğesi kaybolur |
| 4 | "İletişim Modülü" flag'ini kapatın | "İletişim" menü öğesi kaybolur |
| 5 | Tüm flag'leri tekrar açın | Tüm öğeler geri gelir |

### TS-12.2: Dashboard Uyumu

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | "Pipeline" kapalıyken Dashboard'u kontrol edin | "Başvurular" KPI kartı gizli, Pipeline Dağılımı gizli, Son Başvurular gizli |
| 2 | "İlanlar" kapalıyken Dashboard'u kontrol edin | "Açık İlanlar" KPI kartı gizli |
| 3 | "İletişim" kapalıyken Dashboard'u kontrol edin | "Gönderilen E-posta" KPI kartı gizli |
| 4 | "Adaylar" ve "Testler" her zaman görünür | Feature flag'den bağımsız olarak görünür |

### TS-12.3: Middleware Koruma (404 / 403)

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | "Pipeline" kapalıyken /pipeline adresine gidin | 404 sayfası görünür |
| 2 | "İlanlar" kapalıyken /listings adresine gidin | 404 sayfası görünür |
| 3 | "İletişim" kapalıyken /communication adresine gidin | 404 sayfası görünür |
| 4 | "Aday İlanları" kapalıyken /jobs adresine gidin | 404 sayfası görünür |
| 5 | "Aday Başvuru" kapalıyken /apply/... adresine gidin | 404 sayfası görünür |

### TS-12.4: API Koruması

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | "Pipeline" kapalıyken `GET /api/pipeline/applications` isteği gönderin | 403 JSON: `{ "error": "Bu özellik devre dışı" }` |
| 2 | "İletişim" kapalıyken `POST /api/communication/send` isteği gönderin | 403 JSON döner |
| 3 | "İlanlar" kapalıyken `POST /api/listings` isteği gönderin | 403 JSON döner |
| 4 | "Aday Başvuru" kapalıyken `POST /api/applications` isteği gönderin | 403 JSON döner |

---

## TS-13: Hata Yönetimi ve Edge Case'ler

**Modül:** Genel
**Önkoşul:** Uygulama çalışıyor
**Kullanıcı:** Çeşitli

### TS-13.1: 404 Sayfası

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | http://localhost:3000/nonexistent adresine gidin | 404 sayfası: "Aradığınız sayfa bulunamadı" mesajı, ana sayfaya dönüş linki |

### TS-13.2: Error Boundary

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Sunucu tarafında hata oluştuğunda | Hata sayfası görünür: "Bir şeyler ters gitti" mesajı, "Tekrar dene" butonu |
| 2 | "Tekrar dene" butonuna tıklayın | Sayfa yeniden yüklenir |

### TS-13.3: Süresi Dolmuş Sınav Daveti

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Süresi dolmuş bir sınav davet token'ıyla sınav linkine gidin | Hata mesajı: sınav daveti bulunamadı veya süresi dolmuş |
| 2 | Sınav başlatılamaz | Başlat butonu görünmez veya devre dışı |

### TS-13.4: Geçersiz Token

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | http://localhost:3000/exam/gecersiz-token adresine gidin | Hata mesajı görünür |
| 2 | Sınav ekranı yüklenmez | "Davet bulunamadı" tarzı mesaj |

### TS-13.5: Aynı İlana Tekrar Başvuru

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Daha önce başvuru yapmış bir e-posta ile aynı ilana tekrar başvurun | Hata mesajı: bu ilana zaten başvurulmuş |

### TS-13.6: Zorunlu Alan Validasyonları

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Aday ekleme dialog'unda ad alanını boş bırakıp göndermeyi deneyin | HTML5 validation veya hata mesajı |
| 2 | Başvuru formunda e-posta alanını boş bırakıp göndermeyi deneyin | Form gönderilmez |
| 3 | Geçersiz e-posta formatı girin | Validation hatası |
| 4 | Test oluştururken başlık boş bırakın | Hata mesajı |

### TS-13.7: Yetki Kontrolü — Doğrudan URL Erişimi

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Giriş yapmadan /candidates adresine gidin | /login sayfasına yönlendirilir, callbackUrl korunur |
| 2 | Giriş yapmadan /api/candidates isteği gönderin | 401 JSON: `{ "error": "Oturum gerekli" }` |
| 3 | HR_INTERN ile /settings/users/new adresine gidin | /settings sayfasına yönlendirilir |
| 4 | ADMIN ile /settings/logs adresine gidin | /settings sayfasına yönlendirilir |

---

## Temizlik

Tüm verileri sıfırlayıp yeniden başlamak için:

```bash
npx prisma migrate reset
```

Bu komut veritabanını sıfırlar ve seed'i tekrar çalıştırır.

Sadece seed verilerini güncellemek için:

```bash
npx prisma db seed
```

> **Not:** Seed mevcut test sonuçları ve davetleri korur; sadece soruları günceller.
