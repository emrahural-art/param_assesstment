import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const passwordHash = await hash("Param2026!", 12);

  const adminEmrah = await prisma.user.upsert({
    where: { email: "emrah.ural@param.com.tr" },
    update: { role: "SYSTEM_ADMIN" },
    create: {
      name: "Emrah Ural",
      email: "emrah.ural@param.com.tr",
      passwordHash,
      role: "SYSTEM_ADMIN",
    },
  });
  console.log("  System Admin:", adminEmrah.email);

  const adminAysenur = await prisma.user.upsert({
    where: { email: "aysenur.ors@param.com.tr" },
    update: {},
    create: {
      name: "Ayşenur Örs",
      email: "aysenur.ors@param.com.tr",
      passwordHash: await hash("Param2026!", 12),
      role: "ADMIN",
    },
  });
  console.log("  Admin user:", adminAysenur.email);

  const adminGizem = await prisma.user.upsert({
    where: { email: "gizem.ertanure@param.com.tr" },
    update: {},
    create: {
      name: "Gizem Ertanure",
      email: "gizem.ertanure@param.com.tr",
      passwordHash: await hash("Param2026!", 12),
      role: "ADMIN",
    },
  });
  console.log("  Admin user:", adminGizem.email);

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
      company: "PARAM",
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
      company: "FINROTA",
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
      company: "KREDIM",
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

  // --- Delete old test QUESTIONS only (preserve results & invites) ---
  const testIds = ["test-javascript", "test-personality", "test-genel-yetenek", "test-ingilizce", "test-finansal-okuryazarlik"];
  await prisma.question.deleteMany({ where: { assessmentId: { in: testIds } } });
  // Assessment'ları sil ama önce result/invite varsa silme
  const hasResults = await prisma.assessmentResult.count({ where: { assessmentId: { in: testIds } } });
  const hasInvites = await prisma.examInvite.count({ where: { assessmentId: { in: testIds } } });
  if (hasResults === 0 && hasInvites === 0) {
    await prisma.assessment.deleteMany({ where: { id: { in: testIds } } });
    console.log("  Eski testler silindi (sonuç/davet yok)");
  } else {
    console.log(`  Sorular yenilendi (${hasResults} sonuç, ${hasInvites} davet korundu)`);
  }

  // ==========================================
  // 1) GENEL YETENEK SINAVI (32 soru, 4 bölüm)
  // ==========================================
  const genelYetenek = await prisma.assessment.upsert({
    where: { id: "test-genel-yetenek" },
    update: {},
    create: {
      id: "test-genel-yetenek",
      title: "Genel Yetenek Sınavı",
      description: "Sayısal, sözel, soyutsal yetenek ve grafik/veri yorumlama becerilerini ölçen kapsamlı genel yetenek değerlendirmesi.",
      durationMinutes: 45,
      difficulty: "MEDIUM",
      isActive: true,
      scoringConfig: {
        categories: ["Sayısal", "Sözel", "Soyutsal", "Grafik/Veri"],
        levels: [
          { name: "Çok Yüksek", minScore: 28 },
          { name: "Yüksek", minScore: 22 },
          { name: "Orta", minScore: 16 },
          { name: "Düşük", minScore: 8 },
          { name: "Çok Düşük", minScore: 0 },
        ],
        jobFitRules: [
          {
            role: "Yazılım / Teknik Roller",
            conditions: [
              { category: "Sayısal", minScore: 5 },
              { category: "Soyutsal", minScore: 5 },
              { category: "Grafik/Veri", minScore: 4 },
            ],
          },
          {
            role: "Finans / Muhasebe / Satış",
            conditions: [
              { category: "Sayısal", minScore: 6 },
              { category: "Grafik/Veri", minScore: 5 },
            ],
          },
          {
            role: "Analist / Raporlama",
            conditions: [
              { category: "Sayısal", minScore: 5 },
              { category: "Grafik/Veri", minScore: 6 },
              { category: "Soyutsal", minScore: 4 },
            ],
          },
          {
            role: "İdari İşler / İnsan Kaynakları",
            conditions: [
              { category: "Sözel", minScore: 6 },
              { category: "Grafik/Veri", minScore: 4 },
            ],
          },
          {
            role: "Ürün Yönetimi",
            conditions: [
              { category: "Soyutsal", minScore: 5 },
              { category: "Sözel", minScore: 5 },
              { category: "Grafik/Veri", minScore: 5 },
            ],
          },
          {
            role: "Müşteri Hizmetleri",
            conditions: [
              { category: "Sözel", minScore: 5 },
              { category: "Sayısal", minScore: 3 },
            ],
          },
        ],
      },
    },
  });

  type SeedQuestion = {
    text: string;
    options: string[];
    correctAnswer: string;
    category: string;
    imageUrl?: string;
  };

  const gyQuestions: SeedQuestion[] = [
    // ========== BÖLÜM 1: SAYISAL YETENEK (8 soru) ==========
    {
      text: "Bir bilişim firması, birim fiyatı 800 TL olan bir yazılım lisansını 5'li paket halinde alan kurumlara toplamda 3.200 TL fatura kesmektedir. Buna göre, 5'li paket alımında uygulanan indirim oranı yüzde kaçtır?",
      options: ["10", "15", "20", "25", "30"],
      correctAnswer: "20",
      category: "Sayısal",
    },
    {
      text: "Aşağıdaki sayı dizisinde mantıksal akışa göre soru işareti yerine hangi sayı gelmelidir?\n\n10  18  34  66  130  ?",
      options: ["250", "254", "262", "258", "260"],
      correctAnswer: "258",
      category: "Sayısal",
    },
    {
      text: "Finansal bir veri olan ABCDE sayısında; on binler basamağı (A) 3 artırılır, binler basamağı (B) 1 azaltılır ve yüzler basamağı (C) 5 artırılırsa sayının değerindeki net değişim ne olur?",
      options: ["31.500 artar", "29.000 artar", "29.500 artar", "28.500 artar", "30.500 artar"],
      correctAnswer: "29.500 artar",
      category: "Sayısal",
    },
    {
      text: "Bir ofisin aylık kira gideri 25.000 TL'dir. Şirket yeni bir binaya taşındığında kira gideri %15 artmış, ancak yakıt giderleri aylık 2.000 TL azalmıştır. Net bütçe değişimi kaç TL'dir?",
      options: ["1.500 artar", "1.750 artar", "2.000 artar", "2.250 azalır", "Değişmez"],
      correctAnswer: "1.750 artar",
      category: "Sayısal",
    },
    {
      text: "Bir imalathane, bir siparişin %60'ını 18 saatte üretmiştir. Geriye kalan üretimi hızlandırmak için çalışma temposu %50 artırılırsa, kalan iş kaç saatte biter?",
      options: ["8", "6", "9", "10", "12"],
      correctAnswer: "8",
      category: "Sayısal",
    },
    {
      text: "{−3, 4, 6} sayılarını ve {×, −} işlemlerini birer kez kullanarak elde edilebilecek en büyük tam sayı kaçtır?",
      options: ["21", "24", "30", "33", "27"],
      correctAnswer: "27",
      category: "Sayısal",
    },
    {
      text: "Bir hisse senedi portföyü ilk ay %25 değer kaybetmiş, ikinci ay ise %40 değer kazanmıştır. Başlangıca göre kâr/zarar durumu nedir?",
      options: ["%10 artış", "%15 artış", "%5 azalış", "%5 artış", "Değişmez"],
      correctAnswer: "%5 artış",
      category: "Sayısal",
    },
    {
      text: "Hammadde birim maliyeti her yıl %10 artmaktadır. 2.000 TL olan bir maliyet, 2 yıl sonra kaç TL olur?",
      options: ["2.200", "2.420", "2.400", "2.600", "2.662"],
      correctAnswer: "2.420",
      category: "Sayısal",
    },

    // ========== BÖLÜM 2: SÖZEL YETENEK (8 soru) ==========
    {
      text: "Aşağıdaki kelimeler belirli bir mantıksal kurala göre dönüştürülmüştür:\n\nYAZILIM → MİLİZAY  |  PROJE → EJORP\n\nSTRATEJİ → ?",
      options: ["İJERTATS", "İJETARTS", "İJETRTAS", "İJRETSAT", "İJETARST"],
      correctAnswer: "İJETARTS",
      category: "Sözel",
    },
    {
      text: "Hangi atasözü, \"yeterli sermaye ve ekipman olmadan büyük işlerin başarılamayacağını\" anlatır?",
      options: ["Boş çuval dik durmaz", "Akıl akıldan üstündür", "Damlaya damlaya göl olur", "Bakarsan bağ olur", "Demir tavında dövülür"],
      correctAnswer: "Boş çuval dik durmaz",
      category: "Sözel",
    },
    {
      text: "\"Ekibimizdeki her bireyin yetkinliği yüksek olsa da, koordinasyon eksikliği verimliliği %20 oranında baskılamaktadır.\" cümlesine göre temel sorun nedir?",
      options: ["Personel yetersizliği", "Teknik donanım", "Finansal kayıp", "Zaman yönetimi", "İletişim ve uyum sorunu"],
      correctAnswer: "İletişim ve uyum sorunu",
      category: "Sözel",
    },
    {
      text: "Aşağıdakilerden hangisinde kavramsal olarak \"genelden özele\" (kapsayıcıdan alt türe) doğru bir sıralama yapılmıştır?",
      options: ["Piksel → Monitör → Donanım", "Harf → Kelime → Cümle", "Şehir → Ülke → Kıta", "Sanat → Edebiyat → Roman", "Oda → Kat → Bina"],
      correctAnswer: "Sanat → Edebiyat → Roman",
      category: "Sözel",
    },
    {
      text: "Beş yönetici yan yana oturmaktadır. A masanın tam ortasındadır. B, C'nin hemen solundadır. E en sağdadır. D ise A'nın sağındadır. Soldan sağa sıralama hangisidir?",
      options: ["B, C, A, E, D", "A, B, C, D, E", "B, C, A, D, E", "D, E, A, B, C", "C, B, A, D, E"],
      correctAnswer: "B, C, A, D, E",
      category: "Sözel",
    },
    {
      text: "Aşağıdaki kelimeler belirli bir mantıksal şifreleme kuralına göre dönüştürülmüştür:\n\nREKABET → TEBAKER  |  ANALİZ → ZİLANA\n\nHEDEF → ?",
      options: ["FEHED", "FEDEH", "DEFEH", "FEDE", "HEDEFİ"],
      correctAnswer: "FEDEH",
      category: "Sözel",
    },
    {
      text: "\"Yapay zeka iş yükünü azaltsa da, yaratıcı süreçlerde insan denetimi hâlâ kritik önemini korumaktadır.\"\n\nBu cümleden çıkarılabilecek en kesin yargı nedir?",
      options: ["Teknoloji ve insan faktörü birbirini tamamlar", "AI insanı işsiz bırakır", "Yaratıcılık sadece insana özgüdür", "AI yetersizdir", "Denetim gereksizdir"],
      correctAnswer: "Teknoloji ve insan faktörü birbirini tamamlar",
      category: "Sözel",
    },
    {
      text: "\"Raporun son hali kağıt üstünde kaldı.\" deyimiyle anlatılmak istenen nedir?",
      options: ["Beğenilmesi", "Okunması", "Dijital kopyası yok", "Çıktı alınması", "Uygulamaya geçilememesi"],
      correctAnswer: "Uygulamaya geçilememesi",
      category: "Sözel",
    },

    // ========== BÖLÜM 3: SOYUTSAL YETENEK (8 soru) ==========
    {
      text: "Kare bir kağıt dikey ve yatay katlanıyor (4 katman). Kapalı köşeden üçgen, açık kenardan yarım daire kesiliyor. Kağıt açıldığında toplam kesik alanı nasıldır?",
      options: ["1 Merkez, 2 Kenar", "4 Merkez, 2 Kenar", "2 Merkez, 2 Kenar", "1 Merkez, 4 Kenar", "1 Merkez, 1 Kenar"],
      correctAnswer: "1 Merkez, 2 Kenar",
      category: "Soyutsal",
      imageUrl: "/images/exam/gy-q17-paper-fold.svg",
    },
    {
      text: "Aşağıdaki döngüsel ok hareketinde mantığı takip ederek 10. adımdaki yönü bulunuz.\n\nÖrüntü: Yukarı → Sağ → Aşağı → Sol → (tekrar)",
      options: ["Yukarı", "Aşağı", "Sağ", "Sol", "Çapraz"],
      correctAnswer: "Sağ",
      category: "Soyutsal",
      imageUrl: "/images/exam/gy-q18-arrow-rotation.svg",
    },
    {
      text: "Aşağıdaki sayı dizilerinden hangisi kuralsal yapısı (matematiksel dizi türü) bakımından diğerlerinden farklıdır?",
      options: ["2-4-6-8", "2-4-8-16", "5-10-15-20", "1-3-5-7", "10-20-30-40"],
      correctAnswer: "2-4-8-16",
      category: "Soyutsal",
    },
    {
      text: "Bir 3×3 matriste yıldız sembolü her hamlede bir kare sağa kaymakta, en sağa gelince bir alt satırın en soluna geçmektedir. (1. Satır, 1. Sütun) karesinden başlayan yıldızın 5. hamle sonundaki yeri neresidir?",
      options: ["2. Satır 3. Kare", "2. Satır 2. Kare", "3. Satır 1. Kare", "3. Satır 3. Kare", "1. Satır 3. Kare"],
      correctAnswer: "2. Satır 3. Kare",
      category: "Soyutsal",
      imageUrl: "/images/exam/gy-q20-matrix-star.svg",
    },
    {
      text: "Şekil-Sayı ilişkisine göre soru işareti yerine hangi geometrik form gelmelidir?\n\n△ → 3  |  □ → 4  |  ? → 6",
      options: ["Beşgen", "Daire", "Yıldız", "Kare", "Altıgen"],
      correctAnswer: "Altıgen",
      category: "Soyutsal",
      imageUrl: "/images/exam/gy-q21-shapes.svg",
    },
    {
      text: "Standart analog bir saat kadranında akrep ve yelkovan arasındaki açı tam 90 derece olduğunda saat kaç olabilir?",
      options: ["06:00", "12:00", "05:00", "08:30", "09:00"],
      correctAnswer: "09:00",
      category: "Soyutsal",
      imageUrl: "/images/exam/gy-q22-clock.svg",
    },
    {
      text: "Bir küpün yüzeyleri altı farklı renge boyanmıştır. Küpün iki farklı konumu gösterilmektedir:\n\nKONUM 1: Ön=MAVİ, Sağ=KIRMIZI, Üst=YEŞİL\nKONUM 2: Ön=TURUNCU, Sağ=MAVİ, Üst=SARI\n\nBuna göre MAVİ rengin tam karşısındaki (arka yüz) renk hangisidir?",
      options: ["Sarı", "Kırmızı", "Beyaz", "Yeşil", "Turuncu"],
      correctAnswer: "Beyaz",
      category: "Soyutsal",
      imageUrl: "/images/exam/gy-q23-cube.svg",
    },
    {
      text: "Daire içindeki ok her adımda saat yönünde 180 derece dönmektedir. Başlangıç konumu \"Yukarı\"yı gösteren bu ok, 4. adımın sonunda hangi yönü gösterir?",
      options: ["Yukarı", "Aşağı", "Sağ", "Sol", "Çapraz"],
      correctAnswer: "Yukarı",
      category: "Soyutsal",
      imageUrl: "/images/exam/gy-q24-circle-arrow.svg",
    },

    // ========== BÖLÜM 4: GRAFİK VE TABLO YETENEĞİ (8 soru) ==========
    {
      text: "Aşağıdaki verimlilik analizine göre en verimli (Üretim/Maliyet oranı en yüksek) ürün grubu hangisidir?\n\nHizmet: Maliyet 100k$, Üretim 150 Adet\nYazılım: Maliyet 200k$, Üretim 280 Adet\nDonanım: Maliyet 400k$, Üretim 580 Adet",
      options: ["Hizmet", "Yazılım", "Donanım", "Eşit", "Veri yok"],
      correctAnswer: "Hizmet",
      category: "Grafik/Veri",
      imageUrl: "/images/exam/gy-q25-table.svg",
    },
    {
      text: "Şirketin \"Aday Havuzu Büyümesi\" grafiğine göre; zamanla yatay eksende aylar ilerledikçe, büyüme ivmesi için ne söylenebilir?",
      options: ["Sabit", "Azalan", "Durmuş", "Belirsiz", "Artan (Hızlanan)"],
      correctAnswer: "Artan (Hızlanan)",
      category: "Grafik/Veri",
      imageUrl: "/images/exam/gy-q26-growth.svg",
    },
    {
      text: "Teknoloji yatırımları (%60) 4.5M TL olan bir holdingin yatırım bütçesinin geriye kalan %40'lık kısmı Lojistik yatırımlarına ayrılmıştır. Lojistik yatırımı kaç TL'dir?",
      options: ["4M", "2.5M", "3.5M", "3M", "2M"],
      correctAnswer: "3M",
      category: "Grafik/Veri",
      imageUrl: "/images/exam/gy-q27-pie.svg",
    },
    {
      text: "Sadece X ve Y markalarının rekabet ettiği bir pazarda, X markasının pazar payı bir önceki yıla göre %30'dan %35'e çıkmıştır. Bu veri kümesine göre aşağıdakilerden hangisi kesinlikle yanlıştır?",
      options: ["X markası pazar payını artırmıştır", "Y markası pazar payı kaybetmiştir", "Pazarda lider konumunda olan marka X'tir", "Y markasının güncel pazar payı %65 olmuştur", "Pazardaki rekabet dinamiklerinde değişim yaşanmıştır"],
      correctAnswer: "Pazarda lider konumunda olan marka X'tir",
      category: "Grafik/Veri",
    },
    {
      text: "Aşağıdaki tablo satırlarında uygulanan matematiksel kurala göre \"?\" yerine hangi sayı gelmelidir?\n\n12  36  24\n15  45  30\n10   ?   20",
      options: ["20", "25", "30", "35", "40"],
      correctAnswer: "30",
      category: "Grafik/Veri",
      imageUrl: "/images/exam/gy-q29-numgrid.svg",
    },
    {
      text: "En başarılı ve en düşük performans gösteren departmanlar arasındaki puan farkı kaçtır?\n\nSatış: 88\nPazarlama: 74\nMüşteri Hizmetleri: 82",
      options: ["14", "6", "10", "18", "22"],
      correctAnswer: "14",
      category: "Grafik/Veri",
      imageUrl: "/images/exam/gy-q30-dept-table.svg",
    },
    {
      text: "Bir departmandaki iş verimliliği her hafta bir önceki haftaya göre %20 artmaktadır. Sürecin başlangıcında (1. haftanın başında) verimlilik endeksi 100 olarak ölçülmüştür. Buna göre 2. haftanın sonundaki verimlilik endeksi kaçtır?",
      options: ["120", "140", "144", "150", "160"],
      correctAnswer: "144",
      category: "Grafik/Veri",
    },
    {
      text: "Şirketin 4 çeyrekteki gelirleri (Milyon TL) verilmiştir. Yıllık ortalama çeyrek geliri nedir?\n\nQ1: 400  |  Q2: 900  |  Q3: 700  |  Q4: 400",
      options: ["500", "700", "750", "600", "650"],
      correctAnswer: "600",
      category: "Grafik/Veri",
      imageUrl: "/images/exam/gy-q32-quarterly.svg",
    },
  ];

  for (let i = 0; i < gyQuestions.length; i++) {
    const q = gyQuestions[i];
    await prisma.question.upsert({
      where: { id: `q-gy-${i + 1}` },
      update: {},
      create: {
        id: `q-gy-${i + 1}`,
        assessmentId: genelYetenek.id,
        text: q.text,
        type: "MULTIPLE_CHOICE",
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: 1,
        order: i,
        category: q.category,
        imageUrl: q.imageUrl,
      },
    });
  }
  console.log("  Assessment: 32 sorulu Genel Yetenek Sınavı (Sayısal/Sözel/Soyutsal/Grafik-Veri)");

  // ==========================================
  // 2) İNGİLİZCE SEVİYE BELİRLEME TESTİ (20 soru)
  // ==========================================
  const ingilizceTesti = await prisma.assessment.upsert({
    where: { id: "test-ingilizce" },
    update: {},
    create: {
      id: "test-ingilizce",
      title: "İngilizce Seviye Belirleme Testi",
      description: "A1'den C1'e kadar İngilizce seviyesini belirleyen, ağırlıklı puanlama ve hata cezası sistemi ile çalışan profesyonel değerlendirme.",
      durationMinutes: 40,
      difficulty: "MEDIUM",
      isActive: true,
      scoringConfig: {
        categories: ["A1", "A2", "B1", "B2", "C1"],
        categoryWeights: { A1: 1, A2: 1, B1: 2, B2: 2, C1: 3 },
        penalties: [
          {
            categories: ["A1", "A2"],
            penaltyPerWrong: -2,
            label: "A1-A2 Hata Cezası",
          },
        ],
        levels: [
          { name: "C1 (Advanced) - İş Hayatında Üstün Yetkinlik", minScore: 36 },
          { name: "B2 (Upper-Intermediate) - Profesyonel Yeterlilik", minScore: 28 },
          { name: "B1 (Intermediate) - Fonksiyonel Seviye", minScore: 18 },
          { name: "A2 (Pre-Intermediate) - Sınırlı Kullanım", minScore: 8 },
          { name: "A1 (Elementary) - Yetersiz Seviye", minScore: 0 },
        ],
      },
    },
  });

  const engQuestions: SeedQuestion[] = [
    // A1 - Elementary (4 soru, 1 puan)
    {
      text: "Hello, my name is John. I ________ a manager in this company.",
      options: ["am", "is", "are", "be", "been"],
      correctAnswer: "am",
      category: "A1",
    },
    {
      text: "I need to send ________ email to the HR department right now.",
      options: ["a", "an", "the", "any", "some"],
      correctAnswer: "an",
      category: "A1",
    },
    {
      text: "If you have the documents, please give them to ________.",
      options: ["I", "my", "mine", "me", "myself"],
      correctAnswer: "me",
      category: "A1",
    },
    {
      text: "Our office ________ at 9:00 AM every morning.",
      options: ["open", "opens", "opening", "opened", "opens to"],
      correctAnswer: "opens",
      category: "A1",
    },

    // A2 - Pre-Intermediate (4 soru, 1 puan)
    {
      text: "We ________ the new office in London last month.",
      options: ["visit", "visiting", "visited", "was visit", "have visit"],
      correctAnswer: "visited",
      category: "A2",
    },
    {
      text: "This project is ________ than the previous one.",
      options: ["good", "better", "best", "more good", "the best"],
      correctAnswer: "better",
      category: "A2",
    },
    {
      text: "I have ________ questions about the new health insurance policy.",
      options: ["some", "any", "many", "few", "a few"],
      correctAnswer: "a few",
      category: "A2",
    },
    {
      text: "I was at my desk when the fire alarm ________.",
      options: ["ring", "rings", "ringing", "rang", "rung"],
      correctAnswer: "rang",
      category: "A2",
    },

    // B1 - Intermediate (4 soru, 2 puan)
    {
      text: "By the end of this month, I ________ in this specific industry for over five years.",
      options: ["work", "am working", "have worked", "worked", "have been work"],
      correctAnswer: "have worked",
      category: "B1",
    },
    {
      text: "Since our company follows a casual dress code, you ________ wear a formal suit to work.",
      options: ["mustn't", "don't have to", "should", "must", "can"],
      correctAnswer: "don't have to",
      category: "B1",
    },
    {
      text: "The final version of the report ________ by the General Manager tomorrow.",
      options: ["signs", "is signing", "will be signed", "was signed", "has been signed"],
      correctAnswer: "will be signed",
      category: "B1",
    },
    {
      text: "We are still deciding, but if the weather is good, we ________ the event outdoors.",
      options: ["hold", "will hold", "held", "would hold", "holding"],
      correctAnswer: "will hold",
      category: "B1",
    },

    // B2 - Upper-Intermediate (4 soru, 2 puan)
    {
      text: "Our CFO mentioned that if the company ________ a higher budget, we would hire more staff.",
      options: ["have", "has", "had", "will have", "would have"],
      correctAnswer: "had",
      category: "B2",
    },
    {
      text: "________ the serious budget constraints, the project was completed with great success.",
      options: ["Although", "Despite", "Even though", "However", "Nevertheless"],
      correctAnswer: "Despite",
      category: "B2",
    },
    {
      text: "Before we commit, we need to ________ the potential risks and long-term benefits.",
      options: ["assess", "ignore", "celebrate", "imitate", "forget"],
      correctAnswer: "assess",
      category: "B2",
    },
    {
      text: "The senior candidate ________ we interviewed yesterday showed an impressive understanding of our goals.",
      options: ["which", "whom", "whose", "where", "what"],
      correctAnswer: "whom",
      category: "B2",
    },

    // C1 - Advanced (4 soru, 3 puan)
    {
      text: "Under no circumstances ________ the confidential data be shared with third-party vendors without prior written consent from the legal department.",
      options: ["should", "we should", "should we", "are we", "we must"],
      correctAnswer: "should",
      category: "C1",
    },
    {
      text: "It is imperative that the Chief Financial Officer ________ a comprehensive audit of all offshore accounts before the fiscal year ends.",
      options: ["performs", "perform", "is performing", "will perform", "has performed"],
      correctAnswer: "perform",
      category: "C1",
    },
    {
      text: "The new regulations were specifically designed to ________ the risks associated with market volatility and preclude potential financial losses.",
      options: ["aggravate", "mitigate", "stipulate", "consolidate", "overlook"],
      correctAnswer: "mitigate",
      category: "C1",
    },
    {
      text: "The CEO mentioned in the meeting: 'We need to circle back on the marketing strategy by next Tuesday.' What is the CEO suggesting?",
      options: [
        "The strategy should be cancelled immediately",
        "The team should present a completely new brand name",
        "The strategy needs to be finalized and signed today",
        "The team should return to the topic and discuss it again later",
        "The marketing department should be restructured",
      ],
      correctAnswer: "The team should return to the topic and discuss it again later",
      category: "C1",
    },
  ];

  for (let i = 0; i < engQuestions.length; i++) {
    const q = engQuestions[i];
    await prisma.question.upsert({
      where: { id: `q-eng-${i + 1}` },
      update: {},
      create: {
        id: `q-eng-${i + 1}`,
        assessmentId: ingilizceTesti.id,
        text: q.text,
        type: "MULTIPLE_CHOICE",
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: 1,
        order: i,
        category: q.category,
      },
    });
  }
  console.log("  Assessment: 20 sorulu İngilizce Testi (A1-C1, ağırlıklı puanlama + ceza)");

  // ==========================================
  // 3) FİNANSAL OKURYAZARLIK TESTİ (10 soru)
  // ==========================================
  const finansalTest = await prisma.assessment.upsert({
    where: { id: "test-finansal-okuryazarlik" },
    update: {},
    create: {
      id: "test-finansal-okuryazarlik",
      title: "Finansal Okuryazarlık Testi",
      description: "Analitik beceri, piyasa bilinci ve finansal karakter boyutlarını ölçen temel finansal okuryazarlık değerlendirmesi.",
      durationMinutes: 20,
      difficulty: "MEDIUM",
      isActive: true,
      scoringConfig: {
        categories: ["Analitik Beceri", "Piyasa Bilinci", "Finansal Karakter"],
        levels: [
          { name: "Finansal Okuryazar", minScore: 8 },
          { name: "İyi Seviye", minScore: 6 },
          { name: "Gelişime Açık", minScore: 4 },
          { name: "Kritik Gelişim", minScore: 0 },
        ],
        dimensions: [
          {
            name: "Analitik Düşünme",
            rules: [
              { label: "Güçlü", categories: ["Analitik Beceri"], minCategoryScore: 3 },
              { label: "Orta", categories: ["Analitik Beceri"], minCategoryScore: 2 },
              { label: "Geliştirilmeli" },
            ],
          },
          {
            name: "Piyasa Bilgisi",
            rules: [
              { label: "Güçlü", categories: ["Piyasa Bilinci"], minCategoryScore: 3 },
              { label: "Orta", categories: ["Piyasa Bilinci"], minCategoryScore: 2 },
              { label: "Geliştirilmeli" },
            ],
          },
          {
            name: "Finansal Disiplin",
            rules: [
              { label: "Güçlü", categories: ["Finansal Karakter"], minCategoryScore: 4 },
              { label: "Orta", categories: ["Finansal Karakter"], minCategoryScore: 2 },
              { label: "Yüksek Risk (Yönetim Zafiyeti)" },
            ],
          },
        ],
        jobFitRules: [
          {
            role: "Finans / Muhasebe",
            conditions: [
              { category: "Analitik Beceri", minScore: 3 },
              { category: "Piyasa Bilinci", minScore: 2 },
              { category: "Finansal Karakter", minScore: 3 },
            ],
          },
          {
            role: "Satış / İş Geliştirme",
            conditions: [
              { category: "Piyasa Bilinci", minScore: 2 },
              { category: "Finansal Karakter", minScore: 2 },
            ],
          },
          {
            role: "Genel Pozisyon",
            conditions: [
              { category: "Finansal Karakter", minScore: 3 },
            ],
          },
        ],
      },
    },
  });

  const finQuestions: SeedQuestion[] = [
    // Analitik Beceri (Q1, Q3, Q9)
    {
      text: "Bir fintech uygulamasında 400 TL'ye satılan yıllık premium üyelik paketine %25 indirim yapılmıştır. Bu paketin indirimli fiyatı kaç TL'dir?",
      options: ["100 TL", "200 TL", "250 TL", "300 TL", "350 TL"],
      correctAnswer: "300 TL",
      category: "Analitik Beceri",
    },
    // Piyasa Bilinci (Q2)
    {
      text: "\"Enflasyon\" kavramı en basit haliyle aşağıdakilerden hangisini ifade eder?",
      options: [
        "Paranın alım gücünün istikrarlı bir şekilde artması",
        "Üretim maliyetlerinin teknolojik gelişmelere bağlı olarak azalması",
        "Bankaların kredi faiz oranlarını aşağı çekmesi",
        "Ülkedeki toplam döviz rezervlerinin artış hızı",
        "Mal ve hizmet fiyatlarının genel seviyesindeki sürekli artış",
      ],
      correctAnswer: "Mal ve hizmet fiyatlarının genel seviyesindeki sürekli artış",
      category: "Piyasa Bilinci",
    },
    // Analitik Beceri (Q3)
    {
      text: "Bir bankaya yıllık %20 basit faiz oranıyla 10.000 TL yatıran bir kişi, 1 yılın sonunda bankadan toplam kaç TL çeker?",
      options: ["12.000 TL", "11.500 TL", "11.000 TL", "10.200 TL", "20.000 TL"],
      correctAnswer: "12.000 TL",
      category: "Analitik Beceri",
    },
    // Piyasa Bilinci (Q4)
    {
      text: "\"Tüm yumurtaları aynı sepete koymamak\" deyimi finansal dünyada hangi kavramı temsil eder?",
      options: [
        "Düzenli olarak tasarruf (birikim) yapmayı",
        "Çeşitlendirme (Risk Yönetimi) yaparak kayıp riskini azaltmayı",
        "Kredi notunu en yüksek seviyede tutmayı",
        "Sadece altın ve döviz gibi güvenli limanlara yatırım yapmayı",
        "Harcamaları sadece nakit parayla gerçekleştirmeyi",
      ],
      correctAnswer: "Çeşitlendirme (Risk Yönetimi) yaparak kayıp riskini azaltmayı",
      category: "Piyasa Bilinci",
    },
    // Finansal Karakter (Q5)
    {
      text: "Kredi notunun yüksek olması bir bireye finansal sistemde ne gibi bir avantaj sağlar?",
      options: [
        "Maaşının her ay otomatik olarak artmasını sağlar",
        "Yapılan tüm alışverişlerde %10 nakit iade (cashback) kazandırır",
        "Gelir vergisi ödemelerinden muafiyet sağlar",
        "Kredi ve kredi kartı başvurularında onaylanma imkanı kolaylaşır",
        "Banka hesap işletim ücretlerinden tamamen muaf tutulur",
      ],
      correctAnswer: "Kredi ve kredi kartı başvurularında onaylanma imkanı kolaylaşır",
      category: "Finansal Karakter",
    },
    // Finansal Karakter (Q6)
    {
      text: "Aşağıdakilerden hangisi \"pasif gelir\" kavramına örnek olarak verilebilir?",
      options: [
        "Aylık alınan maaş",
        "Fazla mesai sonucu elde edilen ek ücret",
        "Satış başına alınan tek seferlik komisyon",
        "Bir mülkten düzenli olarak alınan kira geliri",
        "Serbest zamanlı (freelance) yapılan bir işin bedeli",
      ],
      correctAnswer: "Bir mülkten düzenli olarak alınan kira geliri",
      category: "Finansal Karakter",
    },
    // Finansal Karakter - KRİTİK (Q7)
    {
      text: "Kredi kartı borcunun her ay sadece \"asgari ödeme tutarını\" yatırmak, uzun vadede nasıl bir sonuç doğurur?",
      options: [
        "Borcun tamamı öngörülen süreden daha kısa sürede biter",
        "Kredi notu hızla en yüksek seviyeye ulaşır",
        "Banka, sadık müşteri olduğu için borcun kalan kısmını siler",
        "Sadece anapara ödemesi yapılmış olur ve borç sabit kalır",
        "Kalan borca faiz işletilir ve toplam borç yükü giderek artar",
      ],
      correctAnswer: "Kalan borca faiz işletilir ve toplam borç yükü giderek artar",
      category: "Finansal Karakter",
    },
    // Finansal Karakter - KRİTİK (Q8)
    {
      text: "Gelir ve giderlerin önceden planlanarak kontrol altında tutulmasına ne ad verilir?",
      options: ["Bütçe", "Envanter", "Tahvil", "Portföy", "Amortisman"],
      correctAnswer: "Bütçe",
      category: "Finansal Karakter",
    },
    // Analitik Beceri (Q9)
    {
      text: "Bir hisse senedinin fiyatı 100 TL'den 80 TL'ye düşerse, yüzde kaç değer kaybetmiş olur?",
      options: ["%10", "%20", "%25", "%40", "%80"],
      correctAnswer: "%20",
      category: "Analitik Beceri",
    },
    // Piyasa Bilinci (Q10)
    {
      text: "\"Likidite\" finansal açıdan ne anlama gelir?",
      options: [
        "Bir varlığın değer kaybetmeden hızla nakde dönüştürülebilme kolaylığı",
        "Şirketlerin yıllık net kâr oranı",
        "Bir ülkenin dış borç stoğunun milli gelire oranı",
        "Bireylerin emeklilik dönemindeki toplam birikimi",
        "Döviz kurlarındaki günlük dalgalanma miktarı",
      ],
      correctAnswer: "Bir varlığın değer kaybetmeden hızla nakde dönüştürülebilme kolaylığı",
      category: "Piyasa Bilinci",
    },
  ];

  for (let i = 0; i < finQuestions.length; i++) {
    const q = finQuestions[i];
    await prisma.question.upsert({
      where: { id: `q-fin-${i + 1}` },
      update: {},
      create: {
        id: `q-fin-${i + 1}`,
        assessmentId: finansalTest.id,
        text: q.text,
        type: "MULTIPLE_CHOICE",
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: 1,
        order: i,
        category: q.category,
      },
    });
  }
  console.log("  Assessment: 10 sorulu Finansal Okuryazarlık Testi (Analitik/Piyasa/Karakter)");

  // --- Candidate Notes ---
  await prisma.candidateNote.create({
    data: {
      candidateId: candidate1.id,
      userId: adminAysenur.id,
      content:
        "Teknik mülakatta React ve state management konularında güçlü performans gösterdi. Component tasarımı temiz.",
      rating: 8,
    },
  });

  await prisma.candidateNote.create({
    data: {
      candidateId: candidate2.id,
      userId: adminGizem.id,
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

  // --- Feature Flags ---
  const defaultFlags = [
    { key: "candidateJobs", label: "Aday İlanları", description: "Adayların ilanları görebilmesi" },
    { key: "candidateApply", label: "Aday Başvuru", description: "Adayların iş ilanlarına başvurabilmesi" },
    { key: "communication", label: "İletişim Modülü", description: "E-posta şablonları ve iletişim yönetimi" },
    { key: "pipeline", label: "Pipeline", description: "Aday takip süreci pipeline görünümü" },
    { key: "listings", label: "İlanlar", description: "İş ilanı oluşturma ve yönetimi" },
  ];
  for (const flag of defaultFlags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: {},
      create: { key: flag.key, label: flag.label, description: flag.description, enabled: true },
    });
  }
  console.log("  Feature flags: 5 varsayılan bayrak");

  console.log("\nSeed tamamlandı!");
  console.log("------------------------------");
  console.log("System Admin: emrah.ural@param.com.tr (Google OAuth)");
  console.log("Admin: aysenur.ors@param.com.tr (Google OAuth)");
  console.log("Admin: gizem.ertanure@param.com.tr (Google OAuth)");
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
