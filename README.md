# Assessment Center

İK ekipleri için aday değerlendirme ve takip platformu.

## Hızlı Başlangıç (UAT)

### Gereksinimler

- Node.js 20+
- Docker Desktop

### 1. PostgreSQL'i Başlat

```bash
docker compose -f docker-compose.dev.yml up -d
```

### 2. Veritabanını Hazırla

```bash
npx prisma migrate dev
npx prisma db seed
```

### 3. Uygulamayı Başlat

```bash
npm run dev
```

Tarayıcıda http://localhost:3000 adresini açın.

### Giriş Bilgileri

| Kullanıcı | E-posta | Şifre |
|-----------|---------|-------|
| Admin | admin@param.com | admin123 |
| İK Uzmanı | ik@param.com | ik1234 |

### Demo Veriler

Seed ile otomatik oluşturulan veriler:
- 2 ilan (Frontend Developer, Backend Developer)
- 3 aday (Ali, Ayşe, Mehmet - farklı pipeline aşamalarında)
- 1 test (10 sorulu JavaScript testi)
- 3 e-posta şablonu (olumlu, olumsuz, test daveti)
- 2 mülakat notu

---

## UAT Test Senaryoları

### 1. Giriş ve Dashboard

1. http://localhost:3000/login adresine gidin
2. `admin@param.com` / `admin123` ile giriş yapın
3. Dashboard'da 6 KPI kartını, pipeline dağılımını ve son başvuruları görün

### 2. Aday Listesi ve Filtreleme

1. Sol menüden "Adaylar" sayfasına gidin
2. 3 aday listelenmiş olmalı (Ali, Ayşe, Mehmet)
3. Arama kutusuna "Ali" yazın - sadece Ali görünsün
4. Aşama filtresinden "Mülakat" seçin
5. "Temizle" ile filtreleri kaldırın

### 3. Aday Detayı

1. Aday listesinde "Ali Yılmaz" ismine tıklayın
2. "Genel Bakış" sekmesinde başvuru bilgilerini görün
3. "CV Bilgileri" sekmesinde eğitim/deneyim/yetenek bilgilerini kontrol edin
4. "Notlar" sekmesinde mülakat notunu görün
5. Not ekleme formuna yeni bir not yazıp ekleyin
6. "360° Karne" butonuna tıklayın - karne sayfasını kontrol edin

### 4. Pipeline (Kanban)

1. Sol menüden "Pipeline" sayfasına gidin
2. 7 kolon ve 4 aday kartı görünsün
3. Bir kartı sürükleyerek farklı bir aşamaya bırakın
4. Aday detay sayfasına dönüp aşamanın değiştiğini doğrulayın

### 5. İlan Yönetimi

1. Sol menüden "İlanlar" sayfasına gidin
2. 2 ilan listelenmiş olmalı
3. "Yeni İlan" butonuna tıklayıp yeni bir ilan oluşturun
4. İlan detayına girip "Karşılaştır / Shortlist" butonuna tıklayın
5. Shortlist tablosunda adayların sıralanmış olduğunu görün

### 6. Test Oluşturma ve Soru Yönetimi

1. Sol menüden "Testler" sayfasına gidin
2. "JavaScript Temel Bilgi Testi" kartına tıklayın
3. 10 sorunun listelendiğini, doğru cevapların yeşil ile işaretlendiğini görün
4. "Soru Ekle" butonuna tıklayıp yeni bir soru ekleyin
5. Bir sorunun "Düzenle" butonuna tıklayıp metni değiştirin
6. "Davet Gönder" sekmesinde sınav linkini kopyalayın

### 7. Sınav Çözme (Aday Tarafı)

1. Yeni bir tarayıcı sekmesi açın (veya incognito)
2. http://localhost:3000/exam/test-javascript adresine gidin
3. Sınav kurallarını okuyun ve "Sınavı Başlat"a tıklayın
4. Tam ekran moduna geçildiğini doğrulayın
5. Zamanlayıcının geri saydığını kontrol edin
6. Soruları cevaplayın (çoktan seçmeli, doğru/yanlış, açık uçlu)
7. Soru navigasyon butonlarını kullanın (cevaplanmış sorular yeşil olmalı)
8. "Sınavı Tamamla"ya tıklayın
9. Sonuç ekranında puanı görün

### 8. Aday Portalı

1. http://localhost:3000/jobs adresine gidin (aday portalı)
2. Yayınlanmış ilanları görün
3. Bir ilana tıklayıp detayını okuyun
4. "Başvur" butonuyla başvuru formunu doldurun
5. Dashboard'a dönüp yeni başvurunun göründüğünü doğrulayın

### 9. İletişim Merkezi

1. Sol menüden "İletişim" sayfasına gidin
2. 3 şablon kartının göründüğünü doğrulayın
3. Bir şablona tıklayıp düzenleyin
4. "E-posta Gönder" sayfasına gidin
5. Adayları seçin, şablon uygulayın (SMTP olmadan log kaydedilir)
6. "Gönderim Logları" sayfasından geçmişi kontrol edin

### 10. Sistem Ayarları

1. Sol menüden "Ayarlar" sayfasına gidin
2. Kullanıcı listesinde admin ve İK kullanıcısını görün
3. KVKK panelinde aktif/arşiv sayılarını kontrol edin
4. "Kullanıcı Ekle" ile yeni bir kullanıcı oluşturun

---

## Teknoloji

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL + Prisma 7
- **Auth:** NextAuth.js
- **UI:** Tailwind CSS + shadcn/ui
- **Drag & Drop:** dnd-kit
- **E-posta:** Nodemailer (SMTP)
- **Mimari:** Modular Monolith

## Production Deploy

```bash
cp .env.example .env
# .env dosyasını düzenleyin (AUTH_SECRET, SMTP, DB_PASSWORD)
docker compose up -d
```

## Faydalı Komutlar

```bash
npm run dev              # Geliştirme sunucusu
npm run build            # Production build
npx prisma studio        # Veritabanı görüntüleyici
npx prisma db seed       # Demo verileri yükle
npx prisma migrate reset # DB sıfırla + seed
```
