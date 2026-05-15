import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const allowedSponsorCategories = [
    "Patrocinio DIAMANTE ($5.500.000 COP)",
    "Patrocinio ORO ($3.000.000 COP)",
    "Patrocinio PLATA ($1.500.000 COP)",
    "Mesa Fraterna ($850.000 COP)",
    "Donación en Especie / Experiencias",
];

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
                { error: "La base de datos aun no esta configurada. Actualiza DATABASE_URL para activar el registro de patrocinadores." },
                { status: 503 },
            );
        }

        const body = await request.json();
        const {
            empresa,
            email,
            telefono,
            categoria,
            country,
            intereses,
            sponsor_contribution_details,
        } = body;

        if (!empresa || !email || !telefono || !categoria || !country || !intereses) {
            return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
        }

        if (!allowedSponsorCategories.includes(String(categoria))) {
            return NextResponse.json({ error: "Categoria de vinculacion no valida" }, { status: 400 });
        }

        const interestsArray = Array.isArray(intereses) ? intereses.join(",") : String(intereses);
        const contributionDetails = sponsor_contribution_details
            ? String(sponsor_contribution_details).trim()
            : null;

        const config = parseSqlServerUrl(databaseUrl);
        const { default: sql } = await import("mssql");
        const pool = await sql.connect(config);
        const id = randomUUID().toUpperCase();

        await pool
            .request()
            .query(`IF COL_LENGTH('SponsorRegistration', 'country') IS NULL ALTER TABLE SponsorRegistration ADD country NVARCHAR(255) NULL;`);

        await pool
            .request()
            .query(`IF COL_LENGTH('SponsorRegistration', 'sponsorContributionDetails') IS NULL ALTER TABLE SponsorRegistration ADD sponsorContributionDetails NVARCHAR(2000) NULL;`);

        await pool
            .request()
            .input("id", sql.NVarChar(36), id)
            .input("companyName", sql.NVarChar(255), String(empresa).trim())
            .input("contactEmail", sql.NVarChar(255), String(email).trim())
            .input("contactPhone", sql.NVarChar(100), String(telefono).trim())
            .input("category", sql.NVarChar(100), String(categoria).trim())
            .input("country", sql.NVarChar(255), String(country).trim())
            .input("interests", sql.NVarChar(1000), interestsArray)
            .input("sponsorContributionDetails", sql.NVarChar(2000), contributionDetails)
            .query(
                `INSERT INTO SponsorRegistration (id, companyName, contactEmail, contactPhone, category, country, interests, sponsorContributionDetails, createdAt)
                 VALUES (@id, @companyName, @contactEmail, @contactPhone, @category, @country, @interests, @sponsorContributionDetails, GETUTCDATE())`,
            );

        await pool.close();

        return NextResponse.json(
            { success: true, message: "¡Solicitud de patrocinio registrada!", id },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error en registro de patrocinador:", error);
        return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 });
    }
}
