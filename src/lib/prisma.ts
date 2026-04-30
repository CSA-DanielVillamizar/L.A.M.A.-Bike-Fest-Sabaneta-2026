import { PrismaMssql } from "@prisma/adapter-mssql";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

function resolveDatabaseUrl(): string {
    const raw = process.env.DATABASE_URL || "";

    // Keep builds working when DATABASE_URL is still a template.
    if (!raw || raw.includes("<") || raw.includes(">")) {
        return "sqlserver://localhost:1433;database=tempdb;user=sa;password=TempP4ssword!;encrypt=false;trustServerCertificate=true;loginTimeout=5;";
    }

    return raw;
}

const adapter = new PrismaMssql(resolveDatabaseUrl());

export const prisma = globalForPrisma.prisma || new PrismaClient({
    adapter,
    log: ["error"],
});

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
