"use client";

import { useEffect, useState } from "react";

type StatsResponse = {
    totalLama: number;
    totalClubs: number;
    countries: number;
};

type AnimatedCounterProps = {
    value: number;
    durationMs?: number;
};

function AnimatedCounter({ value, durationMs = 900 }: AnimatedCounterProps) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let frameId: number | null = null;
        const start = performance.now();

        const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / durationMs, 1);
            const next = Math.round(value * progress);
            setDisplayValue(next);

            if (progress < 1) {
                frameId = requestAnimationFrame(tick);
            }
        };

        setDisplayValue(0);
        frameId = requestAnimationFrame(tick);

        return () => {
            if (frameId !== null) {
                cancelAnimationFrame(frameId);
            }
        };
    }, [value, durationMs]);

    return <span>{displayValue.toLocaleString("es-CO")}</span>;
}

export function LiveStatsSection() {
    const [stats, setStats] = useState<StatsResponse>({
        countries: 26,
        totalLama: 0,
        totalClubs: 0,
    });

    useEffect(() => {
        let cancelled = false;

        const loadStats = async () => {
            try {
                const response = await fetch("/api/stats", { cache: "no-store" });
                if (!response.ok) {
                    return;
                }

                const data = (await response.json()) as StatsResponse;
                if (!cancelled) {
                    setStats({
                        countries: Number.isFinite(data.countries) ? data.countries : 26,
                        totalLama: Number.isFinite(data.totalLama) ? data.totalLama : 0,
                        totalClubs: Number.isFinite(data.totalClubs) ? data.totalClubs : 0,
                    });
                }
            } catch {
                // Keep defaults if request fails.
            }
        };

        loadStats();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <section className="py-10 sm:py-12">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                    <article className="rounded-xl border border-white/10 bg-black/35 p-5 text-center">
                        <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Países Invitados</p>
                        <p className="mt-3 font-display text-3xl font-bold text-orange-300 sm:text-4xl">
                            <AnimatedCounter value={stats.countries} />
                        </p>
                    </article>

                    <article className="rounded-xl border border-white/10 bg-black/35 p-5 text-center">
                        <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Miembros L.A.M.A. Confirmados</p>
                        <p className="mt-3 font-display text-3xl font-bold text-orange-300 sm:text-4xl">
                            <AnimatedCounter value={stats.totalLama} />
                        </p>
                    </article>

                    <article className="rounded-xl border border-white/10 bg-black/35 p-5 text-center">
                        <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Clubes Hermanos Sumados</p>
                        <p className="mt-3 font-display text-3xl font-bold text-orange-300 sm:text-4xl">
                            <AnimatedCounter value={stats.totalClubs} />
                        </p>
                    </article>

                    <article className="rounded-xl border border-fuchsia-300/35 bg-gradient-to-br from-fuchsia-500/20 via-pink-500/15 to-orange-500/15 p-5 text-center">
                        <p className="text-xs uppercase tracking-[0.18em] text-fuchsia-100">Impacto Digital Estimado</p>
                        <p className="mt-3 font-display text-3xl font-extrabold text-fuchsia-300 sm:text-4xl">
                            +500K
                        </p>
                        <p className="mt-2 text-xs text-zinc-200">Alcance proyectado en canales oficiales y aliados</p>
                    </article>
                </div>
                <p className="mt-5 text-center text-sm text-zinc-300 sm:text-base">
                    La familia motera crece minuto a minuto
                </p>
            </div>
        </section>
    );
}
