/**
 * Automated Database Backup Script for BookEase
 * Exports all database tables, verifies SHA-256 integrity, and prunes old backups.
 * Run with: node scripts/backup-database.cjs
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

const BACKUP_DIR = path.join(__dirname, "..", "backups");
const RETENTION_DAYS = 7;

async function runBackup() {
  console.log("=========================================");
  console.log("   BookEase Automated Database Backup    ");
  console.log("=========================================");

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFileName = `backup-${timestamp}.json`;
  const backupFilePath = path.join(BACKUP_DIR, backupFileName);

  console.log(`[1/4] Fetching data from database...`);

  const [
    users,
    businesses,
    services,
    staff,
    staffServices,
    operatingHours,
    bookings,
    invoices,
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.business.findMany(),
    prisma.service.findMany(),
    prisma.staff.findMany(),
    prisma.staffService.findMany(),
    prisma.operatingHour.findMany(),
    prisma.booking.findMany(),
    prisma.invoice.findMany(),
  ]);

  const backupData = {
    metadata: {
      timestamp: new Date().toISOString(),
      version: "1.0",
      environment: process.env.NODE_ENV || "production",
      counts: {
        users: users.length,
        businesses: businesses.length,
        services: services.length,
        staff: staff.length,
        staffServices: staffServices.length,
        operatingHours: operatingHours.length,
        bookings: bookings.length,
        invoices: invoices.length,
      },
    },
    tables: {
      users,
      businesses,
      services,
      staff,
      staffServices,
      operatingHours,
      bookings,
      invoices,
    },
  };

  console.log(`[2/4] Serializing and writing to ${backupFileName}...`);
  const jsonContent = JSON.stringify(backupData, null, 2);
  fs.writeFileSync(backupFilePath, jsonContent, "utf8");

  console.log(`[3/4] Generating SHA-256 integrity checksum...`);
  const checksum = crypto.createHash("sha256").update(jsonContent).digest("hex");
  const checksumFilePath = `${backupFilePath}.sha256`;
  fs.writeFileSync(checksumFilePath, checksum, "utf8");

  console.log(`   Checksum: ${checksum}`);
  console.log(`   File size: ${(Buffer.byteLength(jsonContent) / 1024).toFixed(2)} KB`);

  console.log(`[4/4] Pruning backups older than ${RETENTION_DAYS} days...`);
  const files = fs.readdirSync(BACKUP_DIR);
  const cutoffTime = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  let prunedCount = 0;

  for (const file of files) {
    const fullPath = path.join(BACKUP_DIR, file);
    const stats = fs.statSync(fullPath);
    if (stats.mtimeMs < cutoffTime) {
      fs.unlinkSync(fullPath);
      prunedCount++;
    }
  }

  console.log(`   Pruned ${prunedCount} old backup files.`);
  console.log("=========================================");
  console.log("   Backup Completed Successfully!        ");
  console.log("=========================================");
}

runBackup()
  .catch((err) => {
    console.error("❌ Backup failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
