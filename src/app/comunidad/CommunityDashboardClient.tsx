"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

export type CommunityChapterStat = {
    chapter: string;
    country: string;
    riders: number;
    companions: number;
    total: number;
};

type CommunityDashboardClientProps = {
    chapterRanking: CommunityChapterStat[];
    totalRiders: number;
    totalCountries: number;
};

type CounterProps = {
    value: number;
    durationMs?: number;
};

function AnimatedCounter({ value, durationMs = 1200 }: CounterProps) {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        let frame = 0;
        const start = performance.now();

        const tick = (now: number) => {
            const progress = Math.min((now - start) / durationMs, 1);
            const eased = 1 - (1 - progress) * (1 - progress);
            setCurrent(Math.floor(value * eased));

            if (progress < 1) {
                frame = requestAnimationFrame(tick);
            }
        };

        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [durationMs, value]);

    return <span>{new Intl.NumberFormat("es-CO").format(current)}</span>;
}

function getTopBadge(rank: number): { label: string; className: string } | null {
    if (rank === 0) {
        return {
            label: "TOP 1",
            className: "border-yellow-400/50 bg-yellow-400/15 text-yellow-100",
        };
    }

    if (rank === 1) {
        return {
            label: "TOP 2",
            className: "border-slate-300/40 bg-slate-300/10 text-slate-100",
        };
    }

    if (rank === 2) {
        return {
            label: "TOP 3",
            className: "border-amber-700/50 bg-amber-700/20 text-amber-100",
        };
    }

    return null;
}

export function CommunityDashboardClient({ chapterRanking, totalRiders, totalCountries }: CommunityDashboardClientProps) {
    const maxTotal = Math.max(...chapterRanking.map((row) => row.total), 1);

    const topThreeKeys = useMemo(() => {
        return new Set(chapterRanking.slice(0, 3).map((row) => `${row.country}::${row.chapter}`));
    }, [chapterRanking]);

    return (
        <section className="relative min-h-screen overflow-hidden bg-[#090909] px-4 py-10 text-zinc-100 sm:px-6 sm:py-14">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-20 top-[-90px] h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />
                <div className="absolute right-[-90px] top-[180px] h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />
                <div className="absolute bottom-[-130px] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-zinc-200/5 blur-3xl" />
            </div>

            <div className="relative mx-auto w-full max-w-7xl">
                <header className="rounded-3xl border border-yellow-700/20 bg-[#121212]/95 p-6 shadow-[0_24px_85px_rgba(0,0,0,0.55)] sm:p-8">
                    <p className="text-xs uppercase tracking-[0.26em] text-zinc-500">Comunidad Global L.A.M.A.</p>
                    <h1 className="mt-3 max-w-4xl text-3xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                        Dashboard Comunitario de Alto Impacto
                    </h1>
                    <p className="mt-4 max-w-3xl text-sm text-zinc-400 sm:text-base">
                        Ranking en vivo de delegaciones rumbo a Sabaneta. Esta vista publica potencia orgullo de
                        pertenencia y competencia sana entre capitulos.
                    </p>

                    <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <motion.article
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45 }}
                            className="rounded-2xl border border-yellow-600/35 bg-gradient-to-br from-zinc-900 to-zinc-950 p-5"
                        >
                            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Motociclistas Registrados</p>
                            <p className="mt-2 text-5xl font-black text-white sm:text-7xl lg:text-8xl">
                                <AnimatedCounter value={totalRiders} />
                            </p>
                        </motion.article>

                        <motion.article
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45, delay: 0.1 }}
                            className="rounded-2xl border border-yellow-600/25 bg-gradient-to-br from-zinc-900 to-zinc-950 p-5"
                        >
                            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Paises Rodando al Evento</p>
                            <p className="mt-2 text-5xl font-black text-white sm:text-7xl lg:text-8xl">
                                <AnimatedCounter value={totalCountries} />
                            </p>
                        </motion.article>
                    </div>
                </header>

                <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {chapterRanking.map((item, index) => {
                        const key = `${item.country}::${item.chapter}`;
                        const progressByTop = Math.max(6, Math.round((item.total / maxTotal) * 100));
                        const progressByGlobal = Math.max(2, Math.round((item.total / Math.max(totalRiders, 1)) * 100));
                        const badge = getTopBadge(index);
                        const isTop = topThreeKeys.has(key);

                        return (
                            <motion.article
                                key={key}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.55) }}
                                whileHover={{ y: -6, scale: 1.015 }}
                                className={`group relative overflow-hidden rounded-2xl border bg-neutral-950 p-5 transition-all ${
                                    isTop
                                        ? "border-yellow-500/45 shadow-[0_0_0_1px_rgba(250,204,21,0.2),0_0_34px_rgba(245,158,11,0.22)]"
                                        : "border-yellow-600/30"
                                }`}
                            >
                                {badge && (
                                    <span
                                        className={`absolute right-3 top-3 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${badge.className}`}
                                    >
                                        {badge.label}
                                    </span>
                                )}

                                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{item.country}</p>
                                <h2 className="mt-2 pr-16 text-2xl font-extrabold leading-tight text-amber-200 sm:text-3xl">
                                    {item.chapter}
                                </h2>

                                <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-2">
                                        <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">Titulares</p>
                                        <p className="mt-1 text-lg font-bold text-zinc-100">{item.riders}</p>
                                    </div>
                                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-2">
                                        <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">Acomp.</p>
                                        <p className="mt-1 text-lg font-bold text-zinc-100">{item.companions}</p>
                                    </div>
                                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-2">
                                        <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">Total</p>
                                        <p className="mt-1 text-lg font-black text-white">{item.total}</p>
                                    </div>
                                </div>

                                <div className="mt-5 space-y-2">
                                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                                        <span>Peso vs lider</span>
                                        <span>{progressByTop}%</span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-amber-300"
                                            style={{ width: `${progressByTop}%` }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                                        <span>Peso global</span>
                                        <span>{progressByGlobal}%</span>
                                    </div>
                                    <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
                                        <div className="h-full rounded-full bg-yellow-500/90" style={{ width: `${progressByGlobal}%` }} />
                                    </div>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
