import { NextResponse } from "next/server";

const COUNTRY_TO_ISO_A3: Record<string, string> = {
    argentina: "ARG",
    bolivia: "BOL",
    aruba: "ABW",
    brasil: "BRA",
    brazil: "BRA",
    canada: "CAN",
    chile: "CHL",
    colombia: "COL",
    "costa rica": "CRI",
    cuba: "CUB",
    curazao: "CUW",
    ecuador: "ECU",
    "el salvador": "SLV",
    espana: "ESP",
    spain: "ESP",
    "estados unidos": "USA",
    "estados unidos (usa)": "USA",
    guatemala: "GTM",
    honduras: "HND",
    usa: "USA",
    mexico: "MEX",
    nicaragua: "NIC",
    panama: "PAN",
    paraguay: "PRY",
    peru: "PER",
    "puerto rico": "PRI",
    "republica dominicana": "DOM",
    "trinidad y tobago": "TTO",
    uruguay: "URY",
    venezuela: "VEN",
};

const GLOBAL_COUNTRY_GOAL = 26;

function normalizeText(value: string | null | undefined) {
    return String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function countryToIsoA3(country: string) {
    return COUNTRY_TO_ISO_A3[normalizeText(country)] || null;
}

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

        await pool.request().query(`
            IF COL_LENGTH('OfficialRegistration', 'country') IS NULL ALTER TABLE OfficialRegistration ADD country NVARCHAR(255) NULL;
            IF COL_LENGTH('ClubRegistration', 'country') IS NULL ALTER TABLE ClubRegistration ADD country NVARCHAR(255) NULL;
        `);

        const [officialResult, companionResult, clubResult] = await Promise.all([
            pool.request().query(`
                SELECT
                    id,
                    fullName,
                    country,
                    chapter,
                    emergencyPhone,
                    companionsCount,
                    wantsJersey,
                    jerseySize,
                    isPaid,
                    totalToPay,
                    createdAt
                FROM OfficialRegistration
                ORDER BY createdAt DESC
            `),
            pool.request().query(`
                SELECT
                    registrationId,
                    fullName,
                    category,
                    wantsJersey,
                    jerseySize
                FROM Companion
            `),
            pool.request().query(`
                SELECT
                    id,
                    clubName,
                    presidentName,
                    contactPhone,
                    country,
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
            country: string | null;
            chapter: string;
            emergencyPhone: string;
            companionsCount: number;
            wantsJersey: boolean;
            jerseySize: string | null;
            isPaid: boolean;
            totalToPay: number;
            createdAt: string;
        }>;

        const companionRows = companionResult.recordset as Array<{
            registrationId: string;
            fullName: string;
            category: string;
            wantsJersey: boolean;
            jerseySize: string | null;
        }>;

        const companionsByReg = new Map<string, typeof companionRows>();
        for (const c of companionRows) {
            if (!companionsByReg.has(c.registrationId)) companionsByReg.set(c.registrationId, []);
            companionsByReg.get(c.registrationId)!.push(c);
        }

        const clubRegistrations = clubResult.recordset as Array<{
            id: string;
            clubName: string;
            presidentName: string;
            contactPhone: string;
            country: string | null;
            originCity: string;
            estimatedAttendees: number;
            isPaid: boolean;
            createdAt: string;
        }>;

        const countryTotals = new Map<string, number>();

        for (const registration of officialRegistrations) {
            const country = (registration.country || "").trim();
            if (!country) continue;
            const totalPeople = (Number(registration.companionsCount) || 0) + 1;
            countryTotals.set(country, (countryTotals.get(country) || 0) + totalPeople);
        }

        for (const registration of clubRegistrations) {
            const country = (registration.country || "").trim();
            if (!country) continue;
            const totalPeople = Number(registration.estimatedAttendees) || 0;
            countryTotals.set(country, (countryTotals.get(country) || 0) + totalPeople);
        }

        const registrationsByCountry = Array.from(countryTotals.entries())
            .map(([country, totalPeople]) => ({ country, totalPeople }))
            .sort((a, b) => b.totalPeople - a.totalPeople);

        const registrationsByCountryIso = registrationsByCountry
            .map((item) => ({
                country: item.country,
                isoA3: countryToIsoA3(item.country),
                totalPeople: item.totalPeople,
            }))
            .filter((item): item is { country: string; isoA3: string; totalPeople: number } => Boolean(item.isoA3));

        const chapterTotals = new Map<string, number>();

        for (const registration of officialRegistrations) {
            const chapter = (registration.chapter || "Sin capítulo").trim() || "Sin capítulo";
            const totalPeople = (Number(registration.companionsCount) || 0) + 1;
            chapterTotals.set(chapter, (chapterTotals.get(chapter) || 0) + totalPeople);
        }

        for (const registration of clubRegistrations) {
            const chapter = `Delegación ${(registration.clubName || "Sin nombre").trim() || "Sin nombre"}`;
            const totalPeople = Number(registration.estimatedAttendees) || 0;
            chapterTotals.set(chapter, (chapterTotals.get(chapter) || 0) + totalPeople);
        }

        const registrationsByChapter = Array.from(chapterTotals.entries())
            .map(([chapter, totalPeople]) => ({ chapter, totalPeople }))
            .sort((a, b) => b.totalPeople - a.totalPeople);

        const distinctCountries = Array.from(
            new Set(
                [...officialRegistrations, ...clubRegistrations]
                    .map((registration) => (registration.country || "").trim())
                    .filter((country) => Boolean(country)),
            ).values(),
        ).sort((a, b) => a.localeCompare(b, "es"));
        const activeCountries = distinctCountries.length;
        const percentage = Math.min(100, Math.round((activeCountries / GLOBAL_COUNTRY_GOAL) * 100));

        const officials = officialRegistrations.map((registration) => ({
            id: registration.id,
            name: registration.fullName,
            chapter: registration.chapter,
            country: (registration.country || "").trim() || "No registrado",
            phone: registration.emergencyPhone,
            email: "No registrado",
            companions: registration.companionsCount > 0 ? `${registration.companionsCount} acompanante(s)` : "No",
            companionNames: (companionsByReg.get(registration.id) ?? [])
                .map((c) => `${c.fullName} (${c.category})`)
                .join(" | ") || "-",
            pilotJersey: registration.wantsJersey ? (registration.jerseySize ?? "Sin talla") : "No",
            companionJerseys: (companionsByReg.get(registration.id) ?? [])
                .map((c) => `${c.fullName}: ${c.wantsJersey ? (c.jerseySize ?? "Sin talla") : "No"}`)
                .join(" | ") || "-",
            isPaid: registration.isPaid,
            totalToPay: registration.totalToPay,
            createdAt: registration.createdAt,
        }));

        const clubs = clubRegistrations.map((registration) => ({
            id: registration.id,
            name: registration.clubName,
            delegate: registration.presidentName,
            country: (registration.country || "").trim() || "No registrado",
            phone: registration.contactPhone,
            attendees: registration.estimatedAttendees,
            isPaid: registration.isPaid,
            createdAt: registration.createdAt,
        }));

        return NextResponse.json(
            {
                officials,
                clubs,
                analytics: {
                    registrationsByCountry,
                    registrationsByCountryIso,
                    registrationsByChapter,
                    globalCountryProgress: {
                        activeCountries,
                        goalCountries: GLOBAL_COUNTRY_GOAL,
                        percentage,
                        countries: distinctCountries,
                    },
                },
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
