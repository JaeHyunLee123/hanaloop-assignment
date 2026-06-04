// 데이터베이스 연결 싱글톤 및 Neon 클라이언트 인스턴스화
import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL 환경 변수가 설정되지 않았습니다.");
}

const globalForDb = globalThis as unknown as {
  conn: ReturnType<typeof neon> | undefined;
};

const conn = globalForDb.conn ?? neon(databaseUrl);
if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = conn;
}

export const db = drizzle(conn, { schema });
