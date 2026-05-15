import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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

function safeString(value: unknown, fallback = ""): string {
    if (value === null || value === undefined) return fallback;
    return String(value);
}

function safeDate(value: unknown): string {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === "string") return value;
    return "";
}

async function runQuery<T>(name: string, query: () => Promise<T>): Promise<T> {
    try {
        return await query();
    } catch (error) {
        console.error(`Error en consulta Prisma (${name}):`, error);
        throw new Error(`Fallo en consulta ${name}: ${error instanceof Error ? error.message : String(error)}`);
    }
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

        const [officialRegistrations, clubRegistrations, sponsorRegistrations] = await Promise.all([
            runQuery("officialRegistration.findMany", () =>
                prisma.officialRegistration.findMany({
                    orderBy: { createdAt: "desc" },
                    include: {
                        companions: {
                            select: {
                                fullName: true,
                                category: true,
                                wantsJersey: true,
                                jerseySize: true,
                            },
                        },
                    },
                }),
            ),
            runQuery("clubRegistration.findMany", () =>
                prisma.clubRegistration.findMany({
                    orderBy: { createdAt: "desc" },
                }),
            ),
            runQuery("sponsorRegistration.findMany", () =>
                prisma.sponsorRegistration.findMany({
                    orderBy: { createdAt: "desc" },
                }),
            ),
        ]);

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

        const clubRegistrationsJson = clubRegistrations.map((registration) => ({
            id: safeString(registration.id),
            clubName: safeString(registration.clubName),
            presidentName: safeString(registration.presidentName),
            motorcycleType: safeString(registration.motorcycleType),
            contactPhone: safeString(registration.contactPhone),
            country: (registration.country || "").trim() || "No registrado",
            originCity: safeString(registration.originCity),
            estimatedAttendees: Number(registration.estimatedAttendees || 0),
            isPaid: Boolean(registration.isPaid),
            createdAt: safeDate(registration.createdAt),
        }));

        const sponsorRegistrationsJson = sponsorRegistrations.map((registration) => ({
            id: safeString(registration.id),
            companyName: safeString(registration.companyName),
            category: safeString(registration.category),
            country: (registration.country || "").trim() || "No registrado",
            interests: safeString(registration.interests),
            contactEmail: safeString(registration.contactEmail),
            contactPhone: safeString(registration.contactPhone),
            isContacted: Boolean(registration.isContacted),
            createdAt: safeDate(registration.createdAt),
        }));

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
            id: safeString(registration.id),
            participantCategory: safeString(registration.participantCategory),
            name: safeString(registration.fullName),
            fullName: safeString(registration.fullName),
            documentId: safeString(registration.documentId),
            eps: safeString(registration.eps),
            emergencyName: safeString(registration.emergencyName),
            emergencyPhone: safeString(registration.emergencyPhone),
            chapter: safeString(registration.chapter),
            country: (registration.country || "").trim() || "No registrado",
            phone: safeString(registration.emergencyPhone),
            email: "No registrado",
            isDirective: Boolean(registration.isDirective),
            directiveScope: safeString(registration.directiveScope),
            directiveRole: safeString(registration.directiveRole),
            arrivalDate: safeString(registration.arrivalDate),
            medicalCondition: safeString(registration.medicalCondition),
            hasCompanions: Boolean(registration.hasCompanions),
            companions: registration.companionsCount > 0 ? `${registration.companionsCount} acompanante(s)` : "No",
            companionsCount: Number(registration.companionsCount || 0),
            wantsJersey: Boolean(registration.wantsJersey),
            companionNames: (registration.companions ?? [])
                .map((c) => `${c.fullName} (${c.category})`)
                .join(" | ") || "-",
            pilotJersey: registration.wantsJersey ? (registration.jerseySize ?? "Sin talla") : "No",
            jerseySize: safeString(registration.jerseySize),
            companionJerseys: (registration.companions ?? [])
                .map((c) => `${c.fullName}: ${c.wantsJersey ? (c.jerseySize ?? "Sin talla") : "No"}`)
                .join(" | ") || "-",
            paymentStatus: safeString(registration.paymentStatus),
            isPaid: Boolean(registration.isPaid),
            totalToPay: Number(registration.totalToPay || 0),
            createdAt: safeDate(registration.createdAt),
        }));

        return NextResponse.json(
            {
                officials,
                clubs: clubRegistrationsJson,
                sponsors: sponsorRegistrationsJson,
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
        console.error("ERROR CRÍTICO EN GET /registrations:", error);
        return NextResponse.json(
            {
                error: "Error interno del servidor",
                details: error instanceof Error ? error.message : String(error),
            },
            {
                status: 500,
            },
        );
    }
}
