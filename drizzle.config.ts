import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load .env.local file
config({ path: '.env.local' });

/**
 * https://orm.drizzle.team/docs/get-started/neon-new#step-5---setup-drizzle-config-file
 */
export default defineConfig({
  out: './src/db/migrations',
  schema: './src/db/schema.ts',
  dialect: process.env.DATABASE_URL?.startsWith('file:') ? 'sqlite' : 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
