import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local (Next.js default) first, then fallback to .env
config({ path: ".env.local" });
config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url:
      process.env.DIRECT_URL ||
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5432/bookease?schema=public",
  },
});
