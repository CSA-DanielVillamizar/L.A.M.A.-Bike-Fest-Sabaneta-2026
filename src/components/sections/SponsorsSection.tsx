"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type SponsorshipTier = {
    id: "plata" | "oro" | "diamante";
    name: string;
    price: string;
    label: string;
    benefits: string[];
    featured?: boolean;
};

const sponsorshipTiers: SponsorshipTier[] = [
    {
        id: "plata",
        name: "Plata",
        price: "$1.5M",
        label: "Starter Visibility",
        benefits: [
            "Logo M (Base)",
            "Punto de Activación",
            "1 Post en redes",
            "Menciones en tarima",
        ],
    },
    {
        id: "oro",
        name: "Oro",
        price: "$3M",
        label: "Brand Lift",
        benefits: [
            "Logo L (Central)",
            "Stand Estándar",
            "2 Posts",
            "Presencia en Tarima y La Molienda",
        ],
    },
    {
        id: "diamante",
        name: "Diamante",
        price: "$5.5M",
        label: "Maximum Dominance",
        featured: true,
        benefits: [
            "Logo XL (Superior)",
            "Stand VIP",
            "Home Page + 4 Posts",
            "Presencia Total (Hotel, Tarima, La Molienda)",
            "Branding en Fiestas del Plátano",
        ],
    },
];

const marqueeText = "Respaldado por la Alcaldía de Sabaneta - 58 Años de Historia";

function TierCard({ tier }: { tier: SponsorshipTier }) {
    const cardInner = (
        <article
            className={`h-full rounded-3xl bg-white/5 p-6 backdrop-blur-md ${tier.featured
                ? "relative border border-yellow-300/40 shadow-[0_0_40px_rgba(255,202,40,0.2)]"
                : "border border-white/10"
                }`}
        >
            {tier.featured && (
                <span className="absolute -top-3 right-5 rounded-full border border-yellow-300/70 bg-yellow-300/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-yellow-100">
                    Main Sponsor
                </span>
            )}

            <p className="text-xs uppercase tracking-[0.2em] text-zinc-300">{tier.name}</p>
            <h3 className="mt-3 font-display text-3xl font-bold text-white">{tier.price}</h3>
            <p className="mt-1 text-sm text-zinc-400">{tier.label}</p>

            <ul className="mt-6 space-y-3">
                {tier.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2 text-sm text-zinc-200">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300" />
                        <span>{benefit}</span>
                    </li>
                ))}
            </ul>

            <Link
                href="#contacto"
                className={`mt-7 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-center text-sm font-bold uppercase tracking-[0.12em] transition ${tier.featured
                    ? "bg-yellow-300 text-zinc-950 hover:bg-yellow-200"
                    : "bg-orange-500 text-zinc-950 hover:bg-orange-400"
                    }`}
            >
                Quiero ser Patrocinador
            </Link>
        </article>
    );

    if (!tier.featured) {
        return <div className="h-full">{cardInner}</div>;
    }

    return (
        <motion.div
            className="h-full rounded-3xl p-[1px] md:scale-110"
            style={{
                background:
                    "linear-gradient(120deg, rgba(250,204,21,0.35), rgba(255,255,255,0.12), rgba(250,204,21,0.75), rgba(255,255,255,0.12))",
                backgroundSize: "220% 220%",
            }}
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 5, ease: "linear", repeat: Infinity }}
        >
            {cardInner}
        </motion.div>
    );
}

export function SponsorsSection() {
    return (
        <section id="patrocinadores" className="bg-zinc-900/70 py-16 sm:py-20">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="rounded-3xl border border-white/10 bg-zinc-950/70 p-6 sm:p-8"
                >
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">Sponsorship Tiers</p>
                    <h2 className="mt-3 font-display text-2xl font-bold text-zinc-100 sm:text-3xl">
                        Patrocina el rugido que va a mover a todo Sabaneta
                    </h2>
                    <p className="mt-4 max-w-4xl text-zinc-300 sm:text-lg">
                        Este no es un anuncio más. Es tu oportunidad de entrar al corazón de una comunidad
                        internacional con poder de decisión, afinidad de marca y alcance real en territorio.
                    </p>

                    <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                            <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">Logo Evento Oficial</p>
                            <div className="relative mt-3 h-20 overflow-hidden rounded-xl border border-white/10 bg-white/95">
                                <Image
                                    src="/images/LogoBikeFestSabaneta2026.png"
                                    alt="Logo Bike Fest Sabaneta 2026"
                                    fill
                                    className="object-contain p-2"
                                    sizes="(max-width: 640px) 90vw, 45vw"
                                />
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                            <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">Logo L.A.M.A.</p>
                            <div className="relative mt-3 h-20 overflow-hidden rounded-xl border border-white/10 bg-white/95">
                                <Image
                                    src="/images/Logotipo-LM-vertical-transp.png"
                                    alt="Logo L.A.M.A. Medellín"
                                    fill
                                    className="object-contain p-2"
                                    sizes="(max-width: 640px) 90vw, 45vw"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] py-3">
                        <motion.div
                            className="flex min-w-max items-center gap-8 px-5"
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{ duration: 20, ease: "linear", repeat: Infinity }}
                        >
                            {Array.from({ length: 6 }).map((_, index) => (
                                <span key={index} className="flex items-center gap-3 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
                                    <Image
                                        src="/images/Escudo_de_Sabaneta.png"
                                        alt="Alcaldía de Sabaneta"
                                        width={32}
                                        height={32}
                                        className="h-8 w-8 object-contain"
                                    />
                                    {marqueeText}
                                </span>
                            ))}
                        </motion.div>
                    </div>

                    <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 md:grid md:grid-cols-3 md:overflow-visible">
                        {sponsorshipTiers.map((tier) => (
                            <motion.div
                                key={tier.id}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45, ease: "easeOut" }}
                                viewport={{ once: true, margin: "-60px" }}
                                className="min-w-[82%] snap-start sm:min-w-[58%] md:min-w-0"
                            >
                                <TierCard tier={tier} />
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-10 rounded-3xl border border-orange-300/45 bg-gradient-to-r from-orange-500/20 via-amber-400/15 to-yellow-300/20 p-6">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-200">Mesa Fraterna</p>
                        <h3 className="mt-2 font-display text-2xl font-bold text-zinc-100">
                            Patrocinio de Impacto Emocional
                        </h3>
                        <p className="mt-3 max-w-4xl text-zinc-200">
                            Apadrina los almuerzos de la hermandad y conviértete en la marca que hará posible
                            uno de los momentos más memorables del evento: fraternidad real en la mesa, entre
                            capítulos de 26 países, con gratitud y recordación duradera.
                        </p>
                        <Link
                            href="#contacto"
                            className="mt-5 inline-flex rounded-full border border-orange-200/70 bg-orange-200/15 px-5 py-2 text-sm font-bold uppercase tracking-[0.12em] text-orange-100 transition hover:bg-orange-200/25"
                        >
                            Quiero activar Mesa Fraterna
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

