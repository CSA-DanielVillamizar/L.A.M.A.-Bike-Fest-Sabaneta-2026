import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

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

export async function POST(request: NextRequest) {
    try {
        const databaseUrl = process.env.DATABASE_URL;

        if (!databaseUrl || databaseUrl.includes("<nombre-servidor>") || databaseUrl.includes("<nombre-db>")) {
            return NextResponse.json(
                { error: "La base de datos aun no esta configurada. Actualiza DATABASE_URL para activar el registro de clubes." },
                { status: 503 },
            );
        }

        const body = await request.json();
        const { nombreClub, delegado, telefono, ciudad, country, asistentes, tipoMoto } = body;

        if (!nombreClub || !delegado || !telefono || !ciudad || !country || !asistentes || !tipoMoto) {
            return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
        }

        const config = parseSqlServerUrl(databaseUrl);
        const { default: sql } = await import("mssql");
        const pool = await sql.connect(config);
        const id = randomUUID().toUpperCase();

        await pool
            .request()
            .query(`IF COL_LENGTH('ClubRegistration', 'country') IS NULL ALTER TABLE ClubRegistration ADD country NVARCHAR(255) NULL;`);

        await pool
            .request()
            .input("id", sql.NVarChar(36), id)
            .input("clubName", sql.NVarChar(255), String(nombreClub).trim())
            .input("presidentName", sql.NVarChar(255), String(delegado).trim())
            .input("contactPhone", sql.NVarChar(50), String(telefono).trim())
            .input("originCity", sql.NVarChar(255), String(ciudad).trim())
            .input("country", sql.NVarChar(255), String(country).trim())
            .input("estimatedAttendees", sql.Int, parseInt(String(asistentes), 10))
            .input("motorcycleType", sql.NVarChar(255), String(tipoMoto).trim())
            .query(
                `INSERT INTO ClubRegistration (id, clubName, presidentName, contactPhone, originCity, country, estimatedAttendees, motorcycleType, createdAt)
                 VALUES (@id, @clubName, @presidentName, @contactPhone, @originCity, @country, @estimatedAttendees, @motorcycleType, GETUTCDATE())`,
            );

        await pool.close();

        return NextResponse.json(
            { success: true, message: "¡Club registrado correctamente!", id },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error en registro de club:", error);
        return NextResponse.json({ error: "Error al procesar el registro" }, { status: 500 });
    }
}
