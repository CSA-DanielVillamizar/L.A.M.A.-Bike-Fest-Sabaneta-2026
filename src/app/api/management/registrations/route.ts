import { prisma } from "@/lib/prisma";
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
            prisma.clubRegistration.findMany({
                orderBy: { createdAt: "desc" },
            }),
            prisma.sponsorRegistration.findMany({
                orderBy: { createdAt: "desc" },
            }),
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
            id: registration.id,
            clubName: registration.clubName,
            presidentName: registration.presidentName,
            motorcycleType: registration.motorcycleType,
            contactPhone: registration.contactPhone,
            country: (registration.country || "").trim() || "No registrado",
            originCity: registration.originCity,
            estimatedAttendees: registration.estimatedAttendees,
            isPaid: registration.isPaid,
            createdAt: registration.createdAt.toISOString(),
        }));

        const sponsorRegistrationsJson = sponsorRegistrations.map((registration) => ({
            id: registration.id,
            companyName: registration.companyName,
            category: registration.category,
            country: (registration.country || "").trim() || "No registrado",
            interests: registration.interests,
            contactEmail: registration.contactEmail,
            contactPhone: registration.contactPhone,
            isContacted: registration.isContacted,
            createdAt: registration.createdAt.toISOString(),
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
            id: registration.id,
            participantCategory: registration.participantCategory,
            name: registration.fullName,
            fullName: registration.fullName,
            documentId: registration.documentId,
            eps: registration.eps,
            emergencyName: registration.emergencyName,
            emergencyPhone: registration.emergencyPhone,
            chapter: registration.chapter,
            country: (registration.country || "").trim() || "No registrado",
            phone: registration.emergencyPhone,
            email: "No registrado",
            isDirective: registration.isDirective,
            directiveScope: registration.directiveScope,
            directiveRole: registration.directiveRole,
            arrivalDate: registration.arrivalDate,
            medicalCondition: registration.medicalCondition,
            hasCompanions: registration.hasCompanions,
            companions: registration.companionsCount > 0 ? `${registration.companionsCount} acompanante(s)` : "No",
            companionsCount: registration.companionsCount,
            wantsJersey: registration.wantsJersey,
            companionNames: (registration.companions ?? [])
                .map((c) => `${c.fullName} (${c.category})`)
                .join(" | ") || "-",
            pilotJersey: registration.wantsJersey ? (registration.jerseySize ?? "Sin talla") : "No",
            jerseySize: registration.jerseySize,
            companionJerseys: (registration.companions ?? [])
                .map((c) => `${c.fullName}: ${c.wantsJersey ? (c.jerseySize ?? "Sin talla") : "No"}`)
                .join(" | ") || "-",
            paymentStatus: registration.paymentStatus,
            isPaid: registration.isPaid,
            totalToPay: registration.totalToPay,
            createdAt: registration.createdAt,
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
