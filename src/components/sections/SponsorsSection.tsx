"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const confirmedSponsors = [
    {
        name: "L.A.M.A. Medellín",
        src: "/images/Logotipo-LM-vertical-transp.png",
        containerClass: "bg-white",
        imgClass: "object-contain p-1",
    },
    {
        name: "Alcaldía de Sabaneta",
        src: "/images/AlcaldiaSabaneta.jpeg",
        containerClass: "bg-white",
        imgClass: "object-contain p-0",
    },
    {
        name: "Hotel Extremadura",
        src: "/images/LogoExtremadura.png",
        containerClass: "bg-white",
        imgClass: "object-contain p-2",
    },
    {
        name: "Fonda La Molienda Rincón Equino",
        src: "/images/LaMolinedaBW.jpg",
        containerClass: "bg-white",
        imgClass: "object-contain p-2",
    },
];

const placeholderCount = 4;

export function SponsorsSection() {
    return (
        <section id="patrocinadores" className="bg-zinc-900/70 py-16 sm:py-20">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="rounded-2xl border border-zinc-700/60 bg-zinc-950/70 p-6 sm:p-8"
                >
                    <h2 className="font-display text-2xl font-bold text-zinc-100 sm:text-3xl">
                        Sé parte del epicentro motero de 2026
                    </h2>
                    <p className="mt-4 max-w-4xl text-zinc-300 sm:text-lg">
                        El L.A.M.A. Bike Fest Sabaneta es la oportunidad perfecta para que
                        tu marca se conecte con miles de visitantes en un evento de alto
                        impacto nacional e internacional. Registra tu empresa, asegura un
                        espacio en nuestra zona de exhibición y posiciónate ante una
                        comunidad apasionada que combina estilo de vida, aventura y consumo
                        especializado.
                    </p>

                    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                        {confirmedSponsors.map((sponsor, index) => (
                            <motion.div
                                key={sponsor.name}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.05 }}
                                viewport={{ once: true, margin: "-50px" }}
                                className={`relative h-32 overflow-hidden rounded-xl border border-white/10 ${sponsor.containerClass}`}
                                title={sponsor.name}
                            >
                                <Image
                                    src={sponsor.src}
                                    alt={sponsor.name}
                                    fill
                                    className={sponsor.imgClass}
                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                                />
                            </motion.div>
                        ))}

                        {Array.from({ length: placeholderCount }).map((_, index) => (
                            <motion.div
                                key={`placeholder-${index}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, ease: "easeOut", delay: (confirmedSponsors.length + index) * 0.05 }}
                                viewport={{ once: true, margin: "-50px" }}
                                className="flex h-32 items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.03] text-xs uppercase tracking-[0.16em] text-zinc-500"
                            >
                                Tu logo
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

