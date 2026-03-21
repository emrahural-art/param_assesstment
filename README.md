# Assessment Center

Param İK ekibi için Next.js App Router tabanlı, modüler monolit mimariye sahip bir Assessment Center uygulaması.

## Teknoloji Stack

- **Framework:** Next.js 14+ (App Router)
- **Dil:** TypeScript
- **UI:** Tailwind CSS + shadcn/ui
- **Veritabanı:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js (rol bazlı yetkilendirme)
- **Validasyon:** Zod

## Başlangıç

### Gereksinimler

- Node.js 18+
- PostgreSQL

### Kurulum

```bash
npm install
```

### Veritabanı

`.env` dosyasında `DATABASE_URL` değişkenini kendi PostgreSQL bağlantı adresinizle güncelleyin, ardından:

```bash
npx prisma migrate dev --name init
```

### Geliştirme Sunucusu

```bash
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## Proje Yapısı

```
src/
├── app/          # Next.js App Router (sayfalar ve API route'lar)
├── modules/      # İş mantığı (framework bağımsız)
├── components/   # UI bileşenleri
├── lib/          # Paylaşılan altyapı
├── jobs/         # Arka plan işleri
├── config/       # Konfigürasyon
└── tests/        # Testler
```
