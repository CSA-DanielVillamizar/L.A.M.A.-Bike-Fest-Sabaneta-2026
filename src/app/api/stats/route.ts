import { NextResponse } from "next/server";

function parseSqlServerUrl(rawUrl: string | undefined) {
    if (!rawUrl) throw new Error("DATABASE_URL no esta configurada.");

    const [basePart, ...segments] = rawUrl.split(";").filter(Boolean);

    if (!basePart.startsWith("sqlserver://")) {
        throw new Error("DATABASE_URL tiene un formato no soportado.");
    }

    const hostPart = basePart.replace("sqlserver://", "");
    const [server, portText] = hostPart.split(":");
    const settings = new Map<string, string>();

    for (const segment of segments) {
        const [key, ...rest] = segment.split("=");
        if (!key || rest.length === 0) continue;
        settings.set(key.toLowerCase(), rest.join("="));
    }

    return {
        server,
        port: Number(portText || 1433),
        database: settings.get("database") || "",
        user: settings.get("user") || "",
        password: settings.get("password") || "",
        options: {
            encrypt: (settings.get("encrypt") ?? "true").toLowerCase() === "true",
            trustServerCertificate: (settings.get("trustservercertificate") ?? "false").toLowerCase() === "true",
            loginTimeout: Number(settings.get("logintimeout") || 30),
        },
    };
}

export async function GET() {
    try {
        const databaseUrl = process.env.DATABASE_URL;

        if (!databaseUrl || databaseUrl.includes("<nombre-servidor>") || databaseUrl.includes("<nombre-db>")) {
            return NextResponse.json(
                { error: "La base de datos aun no esta configurada." },
                { status: 503 },
            );
        }

        const config = parseSqlServerUrl(databaseUrl);
        const { default: sql } = await import("mssql");
        const pool = await sql.connect(config);

        const [officialResult, companionsResult, clubsResult] = await Promise.all([
            pool.request().query("SELECT COUNT(*) AS total FROM OfficialRegistration"),
            pool.request().query("SELECT COUNT(*) AS total FROM Companion"),
            pool.request().query("SELECT COUNT(*) AS total FROM ClubRegistration"),
        ]);

        await pool.close();

        const officialCount = Number(officialResult.recordset[0]?.total || 0);
        const companionsCount = Number(companionsResult.recordset[0]?.total || 0);
        const totalClubs = Number(clubsResult.recordset[0]?.total || 0);

        const totalLama = officialCount + companionsCount;

        return NextResponse.json(
            {
                totalLama,
                totalClubs,
                countries: 26,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error obteniendo estadisticas:", error);
        return NextResponse.json(
            { error: "No fue posible obtener las estadisticas." },
            { status: 500 },
        );
    }
}
