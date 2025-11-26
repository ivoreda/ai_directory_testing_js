import postgres from "postgres";

export const sql = postgres(process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/ai_directory_demo");