const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const connectionString =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL ||
  "postgresql://postgres:aljaffarsyah@localhost:5432/bookease?schema=public";

console.log("[SEED] Connecting to database:", connectionString.replace(/:[^:@]+@/, ":***@"));

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("[SEED] Starting database seed for BookEase...");

  // 1. Upsert Default Owner User
  const passwordHash = await bcrypt.hash("Password123", 12);
  const ownerEmail = "budi@glowstudio.id";

  let user = await prisma.user.findUnique({
    where: { email: ownerEmail },
    include: { business: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Budi Santoso",
        email: ownerEmail,
        passwordHash,
      },
      include: { business: true },
    });
    console.log(`[SEED] Created default owner: ${user.name} (${user.email})`);
  } else {
    console.log(`[SEED] Owner already exists: ${user.name} (${user.email})`);
  }

  // 2. Upsert Business
  const businessSlug = "glow-beauty-studio";
  let business = await prisma.business.findUnique({
    where: { slug: businessSlug },
  });

  if (!business) {
    business = await prisma.business.create({
      data: {
        ownerId: user.id,
        name: "Glow Beauty Studio",
        slug: businessSlug,
        category: "Beauty & Salon",
        description:
          "Studio perawatan kulit wajah, rambut, dan relaksasi profesional di pusat kota Jakarta dengan terapis berpengalaman.",
        address: "Jl. Jenderal Sudirman No. 45, Senayan, Jakarta Selatan",
        phone: "+6281234567890",
        timezone: "Asia/Jakarta",
        bufferTimeMinutes: 10,
      },
    });
    console.log(`[SEED] Created business: ${business.name} (/${business.slug})`);
  } else {
    console.log(`[SEED] Business already exists: ${business.name} (/${business.slug})`);
  }

  // 3. Operating Hours (7 Days)
  const defaultHours = [
    { dayOfWeek: 0, openTime: "09:00", closeTime: "17:00", isClosed: true }, // Minggu
    { dayOfWeek: 1, openTime: "09:00", closeTime: "18:00", isClosed: false }, // Senin
    { dayOfWeek: 2, openTime: "09:00", closeTime: "18:00", isClosed: false }, // Selasa
    { dayOfWeek: 3, openTime: "09:00", closeTime: "18:00", isClosed: false }, // Rabu
    { dayOfWeek: 4, openTime: "09:00", closeTime: "18:00", isClosed: false }, // Kamis
    { dayOfWeek: 5, openTime: "09:00", closeTime: "18:00", isClosed: false }, // Jumat
    { dayOfWeek: 6, openTime: "10:00", closeTime: "16:00", isClosed: false }, // Sabtu
  ];

  for (const h of defaultHours) {
    await prisma.operatingHour.upsert({
      where: {
        businessId_dayOfWeek: {
          businessId: business.id,
          dayOfWeek: h.dayOfWeek,
        },
      },
      update: {
        openTime: h.openTime,
        closeTime: h.closeTime,
        isClosed: h.isClosed,
      },
      create: {
        businessId: business.id,
        dayOfWeek: h.dayOfWeek,
        openTime: h.openTime,
        closeTime: h.closeTime,
        isClosed: h.isClosed,
      },
    });
  }
  console.log("[SEED] Operating hours (7 days) configured.");

  // 4. Staff
  const staffData = [
    {
      name: "Siti Rahma",
      roleOrTitle: "Senior Aesthetician",
      bio: "Spesialis perawatan kulit sensitif dan anti-aging dengan pengalaman 6 tahun.",
      isActive: true,
    },
    {
      name: "Nadia Putri",
      roleOrTitle: "Beauty & Hair Specialist",
      bio: "Ahli perawatan facial hidrasi dan terapi relaksasi rambut.",
      isActive: true,
    },
    {
      name: "Rina Wulandari",
      roleOrTitle: "Skin & Scalp Therapist",
      bio: "Berfokus pada brightening treatment dan perawatan kulit kepala sehat.",
      isActive: true,
    },
    {
      name: "Dewi Lestari",
      roleOrTitle: "Junior Therapist (Cuti)",
      bio: "Terapis perawatan wajah dasar.",
      isActive: false,
    },
  ];

  const createdStaff = [];
  for (const st of staffData) {
    let existing = await prisma.staff.findFirst({
      where: { businessId: business.id, name: st.name },
    });
    if (!existing) {
      existing = await prisma.staff.create({
        data: {
          businessId: business.id,
          name: st.name,
          roleOrTitle: st.roleOrTitle,
          bio: st.bio,
          isActive: st.isActive,
        },
      });
      console.log(`[SEED] Created staff: ${existing.name}`);
    }
    createdStaff.push(existing);
  }

  // 5. Services
  const servicesData = [
    {
      name: "Signature Hydrating Facial",
      description:
        "Pembersihan mendalam, ekstraksi komedo lembut, dan masker serum hyaluronic acid untuk kulit cerah lembap.",
      price: 250000,
      durationMinutes: 60,
      isActive: true,
      staffIndices: [0, 1], // Siti Rahma, Nadia Putri
    },
    {
      name: "Brightening Vitamin C Peel",
      description:
        "Perawatan eksfoliasi ringan dengan infus Vitamin C murni untuk menyamarkan noda hitam dan meratakan warna kulit.",
      price: 325000,
      durationMinutes: 45,
      isActive: true,
      staffIndices: [0, 2], // Siti Rahma, Rina Wulandari
    },
    {
      name: "Royal Hair Spa & Aromatherapy",
      description:
        "Creambath nutrisi keratin disertai pijat kepala, bahu, dan leher dengan minyak esensial lavender.",
      price: 185000,
      durationMinutes: 60,
      isActive: true,
      staffIndices: [1, 2], // Nadia Putri, Rina Wulandari
    },
    {
      name: "Express Glow Facial",
      description:
        "Perawatan wajah singkat 30 menit cocok untuk jadwal padat di sela jam istirahat.",
      price: 150000,
      durationMinutes: 30,
      isActive: false,
      staffIndices: [1], // Nadia Putri
    },
  ];

  const createdServices = [];
  for (const srv of servicesData) {
    let existing = await prisma.service.findFirst({
      where: { businessId: business.id, name: srv.name },
    });
    if (!existing) {
      existing = await prisma.service.create({
        data: {
          businessId: business.id,
          name: srv.name,
          description: srv.description,
          price: srv.price,
          durationMinutes: srv.durationMinutes,
          isActive: srv.isActive,
        },
      });
      console.log(`[SEED] Created service: ${existing.name}`);
    }

    // Link staff to service
    for (const idx of srv.staffIndices) {
      const st = createdStaff[idx];
      if (st) {
        await prisma.staffService.upsert({
          where: {
            staffId_serviceId: {
              staffId: st.id,
              serviceId: existing.id,
            },
          },
          update: {},
          create: {
            staffId: st.id,
            serviceId: existing.id,
          },
        });
      }
    }

    createdServices.push(existing);
  }

  // 6. Seed Sample Bookings
  const existingBookingsCount = await prisma.booking.count({
    where: { businessId: business.id },
  });

  if (existingBookingsCount === 0 && createdServices.length > 0 && createdStaff.length > 0) {
    const today = new Date();
    const todayDateStr = today.toISOString().slice(0, 10);

    const sampleBookings = [
      {
        reference: `BK-${todayDateStr.replace(/-/g, "")}-A1B2C3`,
        customerName: "Amanda Kusuma",
        customerEmail: "amanda.kusuma@example.com",
        customerPhone: "+6281199887766",
        customerNotes: "Kulit sensitif di pipi, mohon gunakan serum lembut.",
        service: createdServices[0],
        staff: createdStaff[0],
        time: "10:00",
        status: "CONFIRMED",
      },
      {
        reference: `BK-${todayDateStr.replace(/-/g, "")}-D4E5F6`,
        customerName: "Dinda Maharani",
        customerEmail: "dinda.m@example.com",
        customerPhone: "+6281233445566",
        customerNotes: "First time customer.",
        service: createdServices[1],
        staff: createdStaff[2],
        time: "13:30",
        status: "PENDING",
      },
      {
        reference: `BK-${todayDateStr.replace(/-/g, "")}-G7H8I9`,
        customerName: "Reza Firmansyah",
        customerEmail: "reza.f@example.com",
        customerPhone: "+6281788990011",
        customerNotes: "",
        service: createdServices[2],
        staff: createdStaff[1],
        time: "15:00",
        status: "COMPLETED",
      },
    ];

    for (const b of sampleBookings) {
      const [h, m] = b.time.split(":").map(Number);
      const startAtUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), h - 7, m));
      const endAtUTC = new Date(startAtUTC.getTime() + b.service.durationMinutes * 60000);
      const occupiedEndAtUTC = new Date(endAtUTC.getTime() + business.bufferTimeMinutes * 60000);

      await prisma.booking.create({
        data: {
          reference: b.reference,
          businessId: business.id,
          serviceId: b.service.id,
          staffId: b.staff.id,
          customerName: b.customerName,
          customerEmail: b.customerEmail,
          customerPhone: b.customerPhone,
          customerNotes: b.customerNotes || null,
          serviceNameSnapshot: b.service.name,
          servicePriceSnapshot: b.service.price,
          durationMinutesSnapshot: b.service.durationMinutes,
          bufferMinutesSnapshot: business.bufferTimeMinutes,
          startAt: startAtUTC,
          endAt: endAtUTC,
          occupiedEndAt: occupiedEndAtUTC,
          status: b.status,
        },
      });
      console.log(`[SEED] Created booking: ${b.reference} (${b.customerName})`);
    }
  }

  console.log("[SEED] Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("[SEED_ERROR]", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
