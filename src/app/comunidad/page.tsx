import { prisma } from "@/lib/prisma";
import { CommunityDashboardClient, type CommunityChapterStat } from "./CommunityDashboardClient";

export const dynamic = "force-dynamic";

export default async function ComunidadPage() {
    const grouped = await prisma.officialRegistration.groupBy({
        by: ["country", "chapter"],
        _count: {
            _all: true,
        },
        _sum: {
            companionsCount: true,
        },
    });

    const chapterRanking: CommunityChapterStat[] = grouped
        .map((row) => {
            const chapter = String(row.chapter || "Sin capítulo").trim() || "Sin capítulo";
            const country = String(row.country || "Sin país").trim() || "Sin país";
            const riders = Number(row._count._all || 0);
            const companions = Number(row._sum.companionsCount || 0);

            return {
                chapter,
                country,
                riders,
                companions,
                total: riders + companions,
            };
        })
        .sort((a, b) => b.total - a.total);

    const totalRiders = chapterRanking.reduce((sum, row) => sum + row.total, 0);
    const totalCountries = new Set(chapterRanking.map((row) => row.country)).size;

    return <CommunityDashboardClient chapterRanking={chapterRanking} totalRiders={totalRiders} totalCountries={totalCountries} />;
}
