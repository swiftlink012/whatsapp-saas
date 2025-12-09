import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const query = (text, params) => pool.query(text, params);
export const rawPool = pool;
