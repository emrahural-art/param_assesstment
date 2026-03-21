import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // --- Admin User ---
  const passwordHash = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@param.com" },
    update: {},
    create: {
      name: "Admin Kullanıcı",
      email: "admin@param.com",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log("  Admin user:", admin.email);

  const hrUser = await prisma.user.upsert({
    where: { email: "ik@param.com" },
    update: {},
    create: {
      name: "İK Uzmanı",
      email: "ik@param.com",
      passwordHash: await hash("ik1234", 12),
      role: "HR_SPECIALIST",
    },
  });
  console.log("  HR user:", hrUser.email);

  // --- Listings ---
  const listing1 = await prisma.listing.upsert({
    where: { id: "listing-frontend" },
    update: {},
    create: {
      id: "listing-frontend",
      title: "Senior Frontend Developer",
      description:
        "React/Next.js ekosisteminde deneyimli, modern web teknolojilerine hakim bir frontend geliştirici arıyoruz.",
      requirements:
        "- 3+ yıl React deneyimi\n- TypeScript bilgisi\n- Responsive tasarım\n- Git kullanımı",
      status: "PUBLISHED",
    },
  });

  const listing2 = await prisma.listing.upsert({
    where: { id: "listing-backend" },
    update: {},
    create: {
      id: "listing-backend",
      title: "Backend Developer (Node.js)",
      description:
        "Node.js ve PostgreSQL ile ölçeklenebilir API'ler geliştirecek bir backend geliştirici arıyoruz.",
      requirements:
        "- 2+ yıl Node.js deneyimi\n- PostgreSQL / SQL bilgisi\n- REST API tasarımı\n- Docker tecrübesi",
      status: "PUBLISHED",
    },
  });
  console.log("  Listings:", listing1.title, ",", listing2.title);

  // --- Candidates ---
  const candidate1 = await prisma.candidate.upsert({
    where: { email: "ali.yilmaz@email.com" },
    update: {},
    create: {
      firstName: "Ali",
      lastName: "Yılmaz",
      email: "ali.yilmaz@email.com",
      phone: "0532 111 2233",
      status: "ACTIVE",
      consentAt: new Date(),
      cvData: {
        education: [
          {
            school: "İTÜ",
            degree: "Lisans",
            field: "Bilgisayar Mühendisliği",
            graduationYear: "2020",
          },
        ],
        experience: [
          {
            title: "Frontend Developer",
            company: "TechCorp",
            startDate: "2020-06",
            endDate: "2024-01",
            description: "React ve Next.js ile web uygulamaları geliştirdim.",
          },
        ],
        skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
      },
    },
  });

  const candidate2 = await prisma.candidate.upsert({
    where: { email: "ayse.kaya@email.com" },
    update: {},
    create: {
      firstName: "Ayşe",
      lastName: "Kaya",
      email: "ayse.kaya@email.com",
      phone: "0533 444 5566",
      status: "ACTIVE",
      consentAt: new Date(),
      cvData: {
        education: [
          {
            school: "ODTÜ",
            degree: "Yüksek Lisans",
            field: "Yazılım Mühendisliği",
            graduationYear: "2021",
          },
        ],
        experience: [
          {
            title: "Full Stack Developer",
            company: "StartupXYZ",
            startDate: "2021-03",
            endDate: "",
            description: "Node.js + React ile SaaS ürünleri geliştirdim.",
          },
        ],
        skills: ["Node.js", "React", "PostgreSQL", "Docker", "AWS"],
      },
    },
  });

  const candidate3 = await prisma.candidate.upsert({
    where: { email: "mehmet.demir@email.com" },
    update: {},
    create: {
      firstName: "Mehmet",
      lastName: "Demir",
      email: "mehmet.demir@email.com",
      phone: "0534 777 8899",
      status: "ACTIVE",
      consentAt: new Date(),
      cvData: {
        education: [
          {
            school: "Boğaziçi Üniversitesi",
            degree: "Lisans",
            field: "Bilgisayar Bilimleri",
            graduationYear: "2019",
          },
        ],
        experience: [
          {
            title: "Backend Developer",
            company: "BigCorp",
            startDate: "2019-09",
            endDate: "2025-12",
            description: "Mikroservis mimarisi ile API geliştirdim.",
          },
        ],
        skills: ["Node.js", "Go", "PostgreSQL", "Redis", "Kubernetes"],
      },
    },
  });
  console.log("  Candidates: Ali, Ayşe, Mehmet");

  // --- Applications (different stages) ---
  await prisma.application.upsert({
    where: {
      candidateId_listingId: {
        candidateId: candidate1.id,
        listingId: listing1.id,
      },
    },
    update: {},
    create: {
      candidateId: candidate1.id,
      listingId: listing1.id,
      stage: "INTERVIEW",
    },
  });

  await prisma.application.upsert({
    where: {
      candidateId_listingId: {
        candidateId: candidate2.id,
        listingId: listing1.id,
      },
    },
    update: {},
    create: {
      candidateId: candidate2.id,
      listingId: listing1.id,
      stage: "ASSESSMENT",
    },
  });

  await prisma.application.upsert({
    where: {
      candidateId_listingId: {
        candidateId: candidate3.id,
        listingId: listing2.id,
      },
    },
    update: {},
    create: {
      candidateId: candidate3.id,
      listingId: listing2.id,
      stage: "NEW_APPLICATION",
    },
  });

  await prisma.application.upsert({
    where: {
      candidateId_listingId: {
        candidateId: candidate2.id,
        listingId: listing2.id,
      },
    },
    update: {},
    create: {
      candidateId: candidate2.id,
      listingId: listing2.id,
      stage: "SCREENING",
    },
  });
  console.log("  Applications: 4 başvuru oluşturuldu");

  // --- Assessment (JS Test) ---
  const assessment = await prisma.assessment.upsert({
    where: { id: "test-javascript" },
    update: {},
    create: {
      id: "test-javascript",
      title: "JavaScript Temel Bilgi Testi",
      description: "JavaScript'in temel kavramlarını ölçen çoktan seçmeli test.",
      durationMinutes: 15,
      difficulty: "MEDIUM",
      isActive: true,
    },
  });

  const questions = [
    {
      text: "JavaScript'te 'let' ve 'const' arasındaki fark nedir?",
      type: "MULTIPLE_CHOICE" as const,
      options: [
        "let yeniden atanabilir, const atanamaz",
        "const yeniden atanabilir, let atanamaz",
        "İkisi de aynıdır",
        "let sadece fonksiyon içinde geçerlidir",
      ],
      correctAnswer: "let yeniden atanabilir, const atanamaz",
      points: 1,
    },
    {
      text: "typeof null ifadesinin sonucu nedir?",
      type: "MULTIPLE_CHOICE" as const,
      options: ['"null"', '"undefined"', '"object"', '"boolean"'],
      correctAnswer: '"object"',
      points: 1,
    },
    {
      text: "Arrow function (=>) ile normal function arasındaki temel fark nedir?",
      type: "MULTIPLE_CHOICE" as const,
      options: [
        "Arrow function kendi this bağlamını oluşturmaz",
        "Arrow function daha yavaş çalışır",
        "Arrow function sadece tek satırlık olabilir",
        "Hiçbir fark yoktur",
      ],
      correctAnswer: "Arrow function kendi this bağlamını oluşturmaz",
      points: 2,
    },
    {
      text: "Promise.all() ne işe yarar?",
      type: "MULTIPLE_CHOICE" as const,
      options: [
        "Tüm promise'ler tamamlanınca sonuç döndürür",
        "İlk tamamlanan promise'in sonucunu döndürür",
        "Promise'leri sırayla çalıştırır",
        "Sadece başarılı promise'leri döndürür",
      ],
      correctAnswer: "Tüm promise'ler tamamlanınca sonuç döndürür",
      points: 2,
    },
    {
      text: "JavaScript'te closure nedir?",
      type: "OPEN_ENDED" as const,
      options: [],
      correctAnswer: undefined,
      points: 3,
    },
    {
      text: "'==' ve '===' operatörleri aynı şekilde çalışır.",
      type: "TRUE_FALSE" as const,
      options: ["Doğru", "Yanlış"],
      correctAnswer: "Yanlış",
      points: 1,
    },
    {
      text: "Array.prototype.map() orijinal diziyi değiştirir.",
      type: "TRUE_FALSE" as const,
      options: ["Doğru", "Yanlış"],
      correctAnswer: "Yanlış",
      points: 1,
    },
    {
      text: "Aşağıdakilerden hangileri JavaScript veri tipleridir?",
      type: "MULTI_SELECT" as const,
      options: ["string", "integer", "boolean", "symbol", "float"],
      correctAnswer: "string,boolean,symbol",
      points: 2,
    },
    {
      text: "Event loop nasıl çalışır? Kısaca açıklayın.",
      type: "OPEN_ENDED" as const,
      options: [],
      correctAnswer: undefined,
      points: 3,
    },
    {
      text: "'use strict' direktifinin amacı nedir?",
      type: "MULTIPLE_CHOICE" as const,
      options: [
        "Daha katı hata kontrolü sağlar",
        "Kodu daha hızlı çalıştırır",
        "ES6 özelliklerini aktifleştirir",
        "TypeScript desteği ekler",
      ],
      correctAnswer: "Daha katı hata kontrolü sağlar",
      points: 1,
    },
  ];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    await prisma.question.upsert({
      where: { id: `q-js-${i + 1}` },
      update: {},
      create: {
        id: `q-js-${i + 1}`,
        assessmentId: assessment.id,
        text: q.text,
        type: q.type,
        options: q.options,
        correctAnswer: q.correctAnswer ?? null,
        points: q.points,
        order: i,
      },
    });
  }
  console.log("  Assessment: 10 sorulu JS testi");

  // --- Candidate Notes ---
  await prisma.candidateNote.create({
    data: {
      candidateId: candidate1.id,
      userId: admin.id,
      content:
        "Teknik mülakatta React ve state management konularında güçlü performans gösterdi. Component tasarımı temiz.",
      rating: 8,
    },
  });

  await prisma.candidateNote.create({
    data: {
      candidateId: candidate2.id,
      userId: hrUser.id,
      content:
        "Full-stack deneyimi etkileyici. İletişim becerileri çok iyi. Takım çalışmasına yatkın.",
      rating: 9,
    },
  });
  console.log("  Notes: 2 mülakat notu");

  // --- Email Template ---
  await prisma.emailTemplate.upsert({
    where: { id: "tpl-positive" },
    update: {},
    create: {
      id: "tpl-positive",
      name: "Olumlu Dönüş",
      type: "POSITIVE",
      subject: "Başvurunuz Hakkında - {{position}}",
      body: "Sayın {{fullName}},\n\n{{position}} pozisyonu için yaptığınız başvuruyu değerlendirdik.\n\nSizi bir sonraki aşamaya davet etmekten memnuniyet duyarız.\n\nSaygılarımızla,\nİK Ekibi",
    },
  });

  await prisma.emailTemplate.upsert({
    where: { id: "tpl-negative" },
    update: {},
    create: {
      id: "tpl-negative",
      name: "Olumsuz Dönüş",
      type: "NEGATIVE",
      subject: "Başvurunuz Hakkında",
      body: "Sayın {{fullName}},\n\nBaşvurunuz için teşekkür ederiz. Maalesef şu aşamada farklı bir aday ile ilerleme kararı aldık.\n\nGelecekteki pozisyonlarımız için başvurularınızı değerlendirmekten memnuniyet duyarız.\n\nSaygılarımızla,\nİK Ekibi",
    },
  });

  await prisma.emailTemplate.upsert({
    where: { id: "tpl-test-invite" },
    update: {},
    create: {
      id: "tpl-test-invite",
      name: "Test Daveti",
      type: "TEST_INVITE",
      subject: "Değerlendirme Testi Davetiniz",
      body: "Sayın {{fullName}},\n\nSizi değerlendirme testimize davet ediyoruz. Aşağıdaki linkten teste erişebilirsiniz.\n\nBaşarılar dileriz!\n\nİK Ekibi",
    },
  });
  console.log("  Templates: 3 e-posta şablonu");

  console.log("\nSeed tamamlandı!");
  console.log("------------------------------");
  console.log("Admin girişi: admin@param.com / admin123");
  console.log("İK girişi:    ik@param.com / ik1234");
  console.log("------------------------------");
}

main()
  .catch((e) => {
    console.error("Seed hatası:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
