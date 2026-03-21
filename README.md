# Assessment Center

İK ekipleri için aday değerlendirme ve takip platformu.

## Hızlı Başlangıç

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

---

## Dokümantasyon

- [User Stories](docs/USER_STORIES.md) - Kullanıcı hikayeleri ve kabul kriterleri
- [UAT Senaryoları](docs/UAT_SCENARIOS.md) - Test senaryoları ve adımları

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
