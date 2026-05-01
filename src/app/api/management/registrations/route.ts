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

export async function GET(request: Request) {
    try {
        const expectedPassword = process.env.NEXT_PUBLIC_ADMIN_ACCESS_PASSWORD?.trim();
        const providedPassword = request.headers.get("x-admin-access-password")?.trim();
        const databaseUrl = process.env.DATABASE_URL;

        if (!expectedPassword || providedPassword !== expectedPassword) {
            return NextResponse.json({ error: "Acceso no autorizado." }, { status: 401 });
        }

        if (!databaseUrl || databaseUrl.includes("<nombre-servidor>") || databaseUrl.includes("<nombre-db>")) {
            return NextResponse.json({ error: "La base de datos no esta configurada." }, { status: 503 });
        }

        const config = parseSqlServerUrl(databaseUrl);
        const { default: sql } = await import("mssql");
        const pool = await sql.connect(config);

        const [officialResult, clubResult] = await Promise.all([
            pool.request().query(`
                SELECT
                    id,
                    fullName,
                    chapter,
                    emergencyPhone,
                    companionsCount,
                    isPaid,
                    totalToPay,
                    createdAt
                FROM OfficialRegistration
                ORDER BY createdAt DESC
            `),
            pool.request().query(`
                SELECT
                    id,
                    clubName,
                    presidentName,
                    contactPhone,
                    originCity,
                    estimatedAttendees,
                    isPaid,
                    createdAt
                FROM ClubRegistration
                ORDER BY createdAt DESC
            `),
        ]);

        await pool.close();

        const officialRegistrations = officialResult.recordset as Array<{
            id: string;
            fullName: string;
            chapter: string;
            emergencyPhone: string;
            companionsCount: number;
            isPaid: boolean;
            totalToPay: number;
            createdAt: string;
        }>;

        const clubRegistrations = clubResult.recordset as Array<{
            id: string;
            clubName: string;
            presidentName: string;
            contactPhone: string;
            originCity: string;
            estimatedAttendees: number;
            isPaid: boolean;
            createdAt: string;
        }>;

        const officials = officialRegistrations.map((registration) => ({
            id: registration.id,
            name: registration.fullName,
            chapter: registration.chapter,
            country: registration.chapter === "Internacional" ? "Internacional" : "Colombia",
            phone: registration.emergencyPhone,
            email: "No registrado",
            companions: registration.companionsCount > 0 ? `${registration.companionsCount} acompanante(s)` : "No",
            isPaid: registration.isPaid,
            totalToPay: registration.totalToPay,
            createdAt: registration.createdAt,
        }));

        const clubs = clubRegistrations.map((registration) => ({
            id: registration.id,
            name: registration.clubName,
            delegate: registration.presidentName,
            country: registration.originCity,
            phone: registration.contactPhone,
            attendees: registration.estimatedAttendees,
            isPaid: registration.isPaid,
            createdAt: registration.createdAt,
        }));

        return NextResponse.json(
            {
                officials,
                clubs,
            },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, max-age=0',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                },
            },
        );
    } catch (error) {
        console.error("Error obteniendo registros administrativos:", error);
        return NextResponse.json(
            { error: "No fue posible obtener los registros administrativos." },
            {
                status: 500,
                headers: {
                    'Cache-Control': 'no-store, max-age=0',
                },
            },
        );
    }
}
