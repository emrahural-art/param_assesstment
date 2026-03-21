# UAT Test Senaryoları

## Ön Hazırlık

### Ortam Kurulumu

```bash
docker compose -f docker-compose.dev.yml up -d
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Giriş Bilgileri

| Kullanıcı | E-posta | Şifre |
|-----------|---------|-------|
| Admin | admin@param.com | admin123 |
| İK Uzmanı | ik@param.com | ik1234 |

### Demo Veriler

- 2 ilan (Frontend Developer, Backend Developer)
- 3 aday (Ali, Ayşe, Mehmet - farklı pipeline aşamalarında)
- 4 başvuru (farklı aşamalarda: Yeni Başvuru, Ön Eleme, Mülakat, Değerlendirme)
- 1 test (10 sorulu JavaScript testi)
- 3 e-posta şablonu (olumlu, olumsuz, test daveti)
- 2 mülakat notu

---

## Senaryo 1: Giriş ve Dashboard

**Modül:** Authentication, Dashboard
**Önkoşul:** Uygulama çalışıyor
**Kullanıcı:** Admin

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | http://localhost:3000/login adresine gidin | Login formu görünür |
| 2 | `admin@param.com` / `admin123` ile giriş yapın | Dashboard'a yönlendirilir |
| 3 | KPI kartlarını kontrol edin | 6 KPI kartı görünür (Aktif Adaylar, Başvurular, Açık İlanlar, Aktif Testler, Tamamlanan Testler, Gönderilen E-posta) |
| 4 | Pipeline dağılımını kontrol edin | Bar chart ile aşama bazlı dağılım görünür |
| 5 | Son başvuruları kontrol edin | Son 5 başvuru listelenir |
| 6 | KPI kartlarına tıklayın | İlgili sayfaya yönlendirilir |

---

## Senaryo 2: Aday Listesi ve Filtreleme

**Modül:** Aday Yönetimi
**Önkoşul:** Giriş yapılmış
**Kullanıcı:** Admin veya İK

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Sol menüden "Adaylar" sayfasına gidin | Aday tablosu görünür |
| 2 | Aday sayısını kontrol edin | 3 aday listelenir (Ali, Ayşe, Mehmet) |
| 3 | Arama kutusuna "Ali" yazın | Sadece Ali Yılmaz görünür |
| 4 | Aramayı temizleyin, aşama filtresinden "Mülakat" seçin | Sadece mülakat aşamasındaki aday(lar) görünür |
| 5 | Durum filtresinden "Aktif" seçin | Aktif adaylar filtrelenir |
| 6 | "Temizle" butonuna tıklayın | Tüm filtreler kaldırılır, 3 aday görünür |
| 7 | "Kanban Görünümü" butonuna tıklayın | Pipeline sayfasına yönlendirilir |

---

## Senaryo 3: Aday Detayı ve Not Ekleme

**Modül:** Aday Yönetimi, Değerlendirme
**Önkoşul:** Giriş yapılmış
**Kullanıcı:** Admin

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Aday listesinde "Ali Yılmaz" ismine tıklayın | Aday detay sayfası açılır |
| 2 | "Genel Bakış" sekmesini kontrol edin | Başvuru bilgileri, ilan adı, aşama görünür |
| 3 | "CV Bilgileri" sekmesine geçin | Eğitim (İTÜ), deneyim (TechCorp), yetenekler (React, TypeScript vb.) görünür |
| 4 | "Notlar" sekmesine geçin | Mevcut mülakat notu ve puan görünür |
| 5 | Not ekleme formuna "Test notu" yazın, puan 7 girin, "Ekle"ye tıklayın | Not listeye eklenir |
| 6 | "Testler" sekmesine geçin | Test sonuçları görünür (veya "Henüz test sonucu yok") |
| 7 | "360° Karne" butonuna tıklayın | Karne sayfası açılır, özet kartlar ve detaylar görünür |

---

## Senaryo 4: Pipeline (Kanban Board)

**Modül:** ATS Pipeline
**Önkoşul:** Giriş yapılmış
**Kullanıcı:** Admin veya İK

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Sol menüden "Pipeline" sayfasına gidin | Kanban board görünür |
| 2 | Kolonları kontrol edin | 7 kolon: Yeni Başvuru, Ön Eleme, Mülakat, Değerlendirme, Teklif, İşe Alındı, Reddedildi |
| 3 | Kart sayılarını kontrol edin | Toplam 4 kart, farklı kolonlarda |
| 4 | Bir kartı sürükleyerek "Teklif" kolonuna bırakın | Kart yeni kolonda görünür, kolon sayıları güncellenir |
| 5 | Sayfayı yenileyin | Değişiklik kalıcı (DB'ye kaydedilmiş) |
| 6 | Kart üzerindeki aday ismine tıklayın | Aday detay sayfasına yönlendirilir |
| 7 | "Tablo Görünümü" butonuna tıklayın | Adaylar sayfasına yönlendirilir |

---

## Senaryo 5: İlan Yönetimi ve Shortlist

**Modül:** İlan Yönetimi, Değerlendirme
**Önkoşul:** Giriş yapılmış
**Kullanıcı:** Admin

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Sol menüden "İlanlar" sayfasına gidin | 2 ilan listelenir |
| 2 | "Yeni İlan" butonuna tıklayın | İlan oluşturma formu açılır |
| 3 | Başlık: "QA Engineer", açıklama ve nitelikler girin, "Oluştur"a tıklayın | İlan oluşturulur, listeye eklenir |
| 4 | "Senior Frontend Developer" ilanına tıklayın | İlan detay sayfası açılır |
| 5 | Başvurular bölümünü kontrol edin | 2 başvuru görünür (Ali - Mülakat, Ayşe - Değerlendirme) |
| 6 | "Karşılaştır / Shortlist" butonuna tıklayın | Shortlist tablosu açılır |
| 7 | Sıralamayı kontrol edin | Adaylar kompozit skora göre sıralanmış, progress barlar görünür |
| 8 | "Karne" butonuna tıklayın | Aday karnesi açılır |

---

## Senaryo 6: Test Oluşturma ve Soru Yönetimi

**Modül:** Test Motoru
**Önkoşul:** Giriş yapılmış
**Kullanıcı:** Admin veya İK

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Sol menüden "Testler" sayfasına gidin | 1 test kartı görünür |
| 2 | "JavaScript Temel Bilgi Testi" kartına tıklayın | Test detay sayfası, 4 özet kart (10 soru, toplam puan, 15 dk, Orta) |
| 3 | Sorular listesini kontrol edin | 10 soru, farklı tipler (çoktan seçmeli, doğru/yanlış, açık uçlu, çoklu seçim) |
| 4 | Doğru cevapların yeşil işaretli olduğunu kontrol edin | Yeşil arka plan + ✓ işareti |
| 5 | "Soru Ekle"ye tıklayın, yeni çoktan seçmeli soru ekleyin | Dialog açılır, soru eklenir, liste 11'e çıkar |
| 6 | Bir sorunun "Düzenle" butonuna tıklayın, metni değiştirin, "Güncelle" | Soru metni güncellenir |
| 7 | Bir sorunun "Sil" butonuna tıklayın, onaylayın | Soru listeden kaldırılır |
| 8 | "Davet Gönder" sekmesine geçin | Sınav linki ve kopyalama butonu görünür |
| 9 | "Ayarlar" sekmesine geçin, süreyi 20 dk yapın, "Kaydet" | "Kaydedildi" mesajı |
| 10 | "Yeni Test Oluştur" sayfasına gidin, yeni test oluşturun | Test listesine eklenir |

---

## Senaryo 7: Sınav Çözme (Aday Tarafı)

**Modül:** Test Motoru - Proctoring
**Önkoşul:** Test aktif
**Kullanıcı:** Aday (giriş gerekmez)

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Yeni incognito sekme açın | Temiz oturum |
| 2 | http://localhost:3000/exam/test-javascript adresine gidin | Sınav başlangıç ekranı: kural listesi, soru sayısı, süre |
| 3 | "Sınavı Başlat"a tıklayın | Tam ekran moduna geçilir, zamanlayıcı başlar |
| 4 | Zamanlayıcıyı kontrol edin | Geri sayım çalışır (15:00 -> 14:59...) |
| 5 | Çoktan seçmeli soruyu cevaplayın | Seçenek vurgulanır |
| 6 | "Sonraki" butonuna tıklayın | 2. soru görünür |
| 7 | Soru navigasyon butonlarını kullanın | Cevaplanmış sorular yeşil, cevapsızlar gri |
| 8 | Açık uçlu soruya metin girin | Textarea'ya yazılır |
| 9 | Doğru/Yanlış sorusunu cevaplayın | Radio button seçilir |
| 10 | Ctrl+C deneyin | Engellenir, ihlal sayacı artar |
| 11 | Son soruya gidin, "Sınavı Tamamla"ya tıklayın, onaylayın | Sonuç ekranı: puan/toplam görünür |

---

## Senaryo 8: Aday Portalı ve Başvuru

**Modül:** Aday Portalı
**Önkoşul:** Yayınlanmış ilan var
**Kullanıcı:** Aday (giriş gerekmez)

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | http://localhost:3000/jobs adresine gidin | Yayınlanmış ilanlar listelenir |
| 2 | "Senior Frontend Developer" ilanına tıklayın | İlan detayı: açıklama, nitelikler, başvur butonu |
| 3 | "Başvur" butonuna tıklayın | Başvuru formu açılır |
| 4 | Ad, soyad, e-posta, telefon girin | Alanlar doldurulur |
| 5 | Eğitim bilgisi ekleyin (+ Eğitim Ekle) | Dinamik eğitim formu açılır |
| 6 | İş deneyimi ekleyin (+ Deneyim Ekle) | Dinamik deneyim formu açılır |
| 7 | "Başvuruyu Gönder"e tıklayın | Başarı mesajı görünür |
| 8 | Admin olarak dashboard'a dönün | Yeni başvuru "Son Başvurular"da görünür |
| 9 | Pipeline'da "Yeni Başvuru" kolonunda yeni kart | Kart görünür |

---

## Senaryo 9: İletişim Merkezi

**Modül:** İletişim
**Önkoşul:** Giriş yapılmış
**Kullanıcı:** Admin veya İK

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Sol menüden "İletişim" sayfasına gidin | 3 şablon kartı görünür (Olumlu Dönüş, Olumsuz Dönüş, Test Daveti) |
| 2 | "Olumlu Dönüş" şablonuna tıklayın | Şablon düzenleme formu açılır |
| 3 | Konu metnini değiştirin, "Kaydet"e tıklayın | "Kaydedildi" mesajı |
| 4 | "Yeni Şablon" butonuna tıklayın | Şablon oluşturma formu |
| 5 | "Mülakat Daveti" adında yeni şablon oluşturun | Şablon listeye eklenir |
| 6 | "E-posta Gönder" sayfasına gidin | İçerik + alıcı seçme paneli görünür |
| 7 | Şablon dropdown'ından "Olumlu Dönüş" seçin | Konu ve içerik otomatik dolar |
| 8 | Aday listesinden Ali ve Ayşe'yi seçin | 2 aday seçili, "2 Adaya Gönder" butonu aktif |
| 9 | "2 Adaya Gönder"e tıklayın | Sonuç: "2 başarılı" (SMTP yoksa log kaydedilir) |
| 10 | "Gönderim Logları" sayfasına gidin | Gönderim kayıtları tablo halinde görünür |

---

## Senaryo 10: Sistem Ayarları ve Kullanıcı Yönetimi

**Modül:** Sistem Ayarları, KVKK
**Önkoşul:** Giriş yapılmış
**Kullanıcı:** Admin

| Adım | İşlem | Beklenen Sonuç |
|------|-------|----------------|
| 1 | Sol menüden "Ayarlar" sayfasına gidin | Ayarlar sayfası görünür |
| 2 | Kullanıcı listesini kontrol edin | admin@param.com (Yönetici) ve ik@param.com (İK Uzmanı) listelenir |
| 3 | "Kullanıcı Ekle" butonuna tıklayın | Kullanıcı oluşturma formu |
| 4 | Ad: "Test Kullanıcı", e-posta: "test@param.com", şifre: "test123", rol: İK Stajyeri | Form doldurulur |
| 5 | "Kullanıcı Oluştur"a tıklayın | Ayarlar sayfasına döner, yeni kullanıcı listede |
| 6 | KVKK panelini kontrol edin | Aktif/Arşiv/Anonimleştirilmiş sayıları doğru |
| 7 | Veri saklama politikasını kontrol edin | Otomatik anonimleştirme (730 gün) ve onay yönetimi "Aktif" |
| 8 | "Sistem Durumu" kartına tıklayın | Health API yanıtı: status "ok", database "connected" |

---

## Senaryo Sonrası Temizlik

Tüm verileri sıfırlayıp yeniden başlamak için:

```bash
npx prisma migrate reset
```

Bu komut veritabanını sıfırlar ve seed'i tekrar çalıştırır.
