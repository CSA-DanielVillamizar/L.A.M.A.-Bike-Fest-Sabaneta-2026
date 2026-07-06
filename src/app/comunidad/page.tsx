import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type ChapterStats = {
    chapter: string;
    total: number;
};

export default async function ComunidadPage() {
    const registrations = await prisma.officialRegistration.findMany({
        select: {
            chapter: true,
            country: true,
            companionsCount: true,
        },
    });

    const totalRiders = registrations.reduce((sum, row) => sum + 1 + Number(row.companionsCount || 0), 0);

    const countries = Array.from(
        new Set(
            registrations
                .map((row) => String(row.country || "").trim())
                .filter((country) => Boolean(country)),
        ),
    );

    const chapterTotals = new Map<string, number>();
    for (const row of registrations) {
        const chapter = String(row.chapter || "Sin capítulo").trim() || "Sin capítulo";
        const people = 1 + Number(row.companionsCount || 0);
        chapterTotals.set(chapter, (chapterTotals.get(chapter) || 0) + people);
    }

    const chapterRanking: ChapterStats[] = Array.from(chapterTotals.entries())
        .map(([chapter, total]) => ({ chapter, total }))
        .sort((a, b) => b.total - a.total);

    return (
        <section className="min-h-screen bg-black px-4 py-10 text-zinc-100 sm:px-6 sm:py-14">
            <div className="mx-auto w-full max-w-6xl">
                <header className="rounded-3xl border border-neutral-800 bg-neutral-950/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] sm:p-8">
                    <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Tablero Comunitario</p>
                    <h1 className="mt-3 text-2xl font-extrabold leading-tight text-zinc-100 sm:text-4xl">
                        Directorio de Hermandad: {totalRiders} Motociclistas de {countries.length} Países rodando hacia Sabaneta
                    </h1>
                    <p className="mt-4 text-sm text-zinc-400 sm:text-base">
                        Estadísticas públicas en tiempo real por delegación. Esta vista no muestra datos personales.
                    </p>
                </header>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {chapterRanking.map((item) => (
                        <article
                            key={item.chapter}
                            className="rounded-2xl border border-neutral-800 bg-neutral-950/85 p-5 transition hover:border-neutral-700"
                        >
                            <p className="text-lg font-bold leading-snug text-amber-300">{item.chapter}</p>
                            <div className="mt-4 flex items-center gap-2 text-zinc-200">
                                <svg
                                    aria-hidden="true"
                                    viewBox="0 0 24 24"
                                    className="h-[18px] w-[18px] text-orange-400"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="5.5" cy="17.5" r="3.5" />
                                    <circle cx="18.5" cy="17.5" r="3.5" />
                                    <path d="M8 17.5h4.5l3-6h-3.3l-1.4 2.4-2.8-2.4H5" />
                                </svg>
                                <span className="text-sm uppercase tracking-[0.14em]">{item.total} pilotos confirmados</span>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
