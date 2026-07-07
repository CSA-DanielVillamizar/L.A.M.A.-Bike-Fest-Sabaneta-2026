import { prisma } from "@/lib/prisma";
import { CommunityDashboardClient, type CommunityChapterStat } from "./CommunityDashboardClient";

export const dynamic = "force-dynamic";

const CHAPTER_ALIASES: Record<string, string> = {
    "MIAMI 305": "Miami",
    "MIAMI": "Miami",
    "BOGOTA": "Bogotá",
    "MEDELLIN": "Medellín",
    "VALLE DEL ABURRA": "Valle de Aburrá",
    "VALLE DE ABURRA": "Valle de Aburrá",
    "VALLE DE ABURRA COLOMBIA": "Valle de Aburrá",
    "VALLE ABURRA": "Valle de Aburrá",
    "NEW YORK": "New York City",
    "NEW YORK CITY": "New York City",
    "OHARE": "O´Hare",
    "SAN JOSE": "San José",
    "SAINT AUGUSTINE": "Saint Augustine",
    "RIO GALLEGOS": "Río Gallegos",
    "SAN CRISTOBAL": "San Cristóbal",
};

function normalizeAliasKey(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[._'`´’]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase();
}

function toTitleCase(value: string): string {
    return value
        .toLocaleLowerCase("es")
        .split(" ")
        .filter(Boolean)
        .map((token) => token.charAt(0).toLocaleUpperCase("es") + token.slice(1))
        .join(" ");
}

function normalizeChapterName(rawChapter: string): string {
    const trimmed = String(rawChapter || "").trim();
    if (!trimmed) return "";

    const aliasKey = normalizeAliasKey(trimmed);
    const alias = CHAPTER_ALIASES[aliasKey];
    if (alias) return alias;

    return toTitleCase(trimmed);
}

export default async function ComunidadPage() {
    const registrations = await prisma.officialRegistration.findMany({
        select: {
            country: true,
            chapter: true,
            companionsCount: true,
        },
    });

    const groupedByCountryAndChapter = registrations.reduce<Record<string, CommunityChapterStat>>((acc, row) => {
        const country = String(row.country || "").trim();
        const chapter = normalizeChapterName(String(row.chapter || ""));

        // Keep only records with complete country/chapter data for reliable leaderboard stats.
        if (!country || !chapter) {
            return acc;
        }

        const key = `${country}::${chapter}`;
        const current = acc[key] || {
            country,
            chapter,
            riders: 0,
            companions: 0,
            total: 0,
        };

        current.riders += 1;
        current.companions += Number(row.companionsCount || 0);
        current.total = current.riders + current.companions;
        acc[key] = current;

        return acc;
    }, {});

    const chapterRanking: CommunityChapterStat[] = Object.values(groupedByCountryAndChapter)
        .sort((a, b) => b.total - a.total);

    const totalRiders = chapterRanking.reduce((sum, row) => sum + row.total, 0);
    const totalCountries = new Set(chapterRanking.map((row) => row.country)).size;

    return <CommunityDashboardClient chapterRanking={chapterRanking} totalRiders={totalRiders} totalCountries={totalCountries} />;
}
