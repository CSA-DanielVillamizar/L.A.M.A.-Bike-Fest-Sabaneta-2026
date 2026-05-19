"use client";

import { Handshake } from "lucide-react";
import Link from "next/link";

export function SponsorsCTASection() {
    return (
        <section className="bg-zinc-950 px-4 py-16 sm:px-6 sm:py-20">
            <div className="mx-auto max-w-5xl">
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black px-6 py-10 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:px-10 sm:py-12">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute left-0 top-0 h-32 w-32 rounded-full bg-orange-500/20 blur-3xl" />
                        <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-yellow-400/10 blur-3xl" />
                    </div>

                    <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
                                <Handshake className="h-3.5 w-3.5 text-yellow-300" /> Aliados estratégicos
                            </div>
                            <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
                                Aliados Estratégicos y Marcas
                            </h2>
                            <p className="mt-4 max-w-xl text-base text-zinc-300 sm:text-lg">
                                ¿Quieres que tu marca sea protagonista en la Gran Caravana Internacional ante 26 países?
                            </p>
                        </div>

                        <Link
                            href="/dosier"
                            className="inline-flex items-center justify-center rounded-full bg-yellow-300 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-zinc-950 transition hover:bg-yellow-200"
                        >
                            Ver Oportunidades de Patrocinio
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
