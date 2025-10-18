import postgres from 'postgres';

if (!process.env.DATABASE_URL2) {
  throw new Error("DATABASE_URL2 is not defined in environment variables!");
}
const db = postgres(process.env.DATABASE_URL2!);

export default db