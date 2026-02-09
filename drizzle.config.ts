import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

import { getEnv } from '@/shared/lib/helpers/get-env.helper';

console.log(getEnv('DATABASE_URL'));
export default defineConfig({
  out: './drizzle',
  schema: './src/shared/infrastructure/db/schema/*.ts',
  dialect: 'postgresql',
  dbCredentials: {
    host: getEnv('DB_HOST'),
    port: parseInt(getEnv('DB_PORT')),
    user: getEnv('DB_USER'),
    password: getEnv('DB_PASSWORD'),
    database: getEnv('DB_NAME'),
  },
});
