/**
 * Database Restore Script for BookEase
 * Verifies SHA-256 checksum and restores database tables.
 * Usage: node scripts/restore-database.cjs <path-to-backup.json>
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/bookease?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function runRestore() {
  const targetFile = process.argv[2];

  if (!targetFile) {
    console.error("Usage: node scripts/restore-database.cjs <path-to-backup.json>");
    process.exit(1);
  }

  const backupFilePath = path.resolve(targetFile);
  if (!fs.existsSync(backupFilePath)) {
    console.error(`❌ Backup file not found: ${backupFilePath}`);
    process.exit(1);
  }

  console.log("=========================================");
  console.log("   BookEase Database Restore Utility     ");
  console.log("=========================================");

  console.log(`[1/3] Verifying SHA-256 checksum...`);
  const content = fs.readFileSync(backupFilePath, "utf8");
  const computedChecksum = crypto.createHash("sha256").update(content).digest("hex");
  const checksumFilePath = `${backupFilePath}.sha256`;

  if (fs.existsSync(checksumFilePath)) {
    const expectedChecksum = fs.readFileSync(checksumFilePath, "utf8").trim();
    if (computedChecksum !== expectedChecksum) {
      console.error("❌ CHECKSUM MISMATCH! File may be corrupted or tampered.");
      process.exit(1);
    }
    console.log("   Checksum verified successfully.");
  } else {
    console.warn("⚠️ Warning: No checksum file found. Proceeding with caution.");
  }

  console.log(`[2/3] Parsing backup payload...`);
  const parsed = JSON.parse(content);
  const { metadata, tables } = parsed;

  console.log(`   Backup Date: ${metadata.timestamp}`);
  console.log(`   Counts:`, metadata.counts);

  console.log(`[3/3] Restoring records inside atomic transaction...`);
  await prisma.$transaction(async (tx) => {
    // Clear dependent tables first
    await tx.invoice.deleteMany();
    await tx.booking.deleteMany();
    await tx.operatingHour.deleteMany();
    await tx.staffService.deleteMany();
    await tx.staff.deleteMany();
    await tx.service.deleteMany();
    await tx.business.deleteMany();
    await tx.user.deleteMany();

    // Insert in topological order
    for (const u of tables.users) await tx.user.create({ data: u });
    for (const b of tables.businesses) await tx.business.create({ data: b });
    for (const s of tables.services) await tx.service.create({ data: s });
    for (const st of tables.staff) await tx.staff.create({ data: st });
    for (const ss of tables.staffServices) await tx.staffService.create({ data: ss });
    for (const oh of tables.operatingHours) await tx.operatingHour.create({ data: oh });
    for (const bk of tables.bookings) await tx.booking.create({ data: bk });
    for (const inv of tables.invoices) await tx.invoice.create({ data: inv });
  });

  console.log("=========================================");
  console.log("   Database Restored Successfully!       ");
  console.log("=========================================");
}

runRestore()
  .catch((err) => {
    console.error("❌ Restore failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
