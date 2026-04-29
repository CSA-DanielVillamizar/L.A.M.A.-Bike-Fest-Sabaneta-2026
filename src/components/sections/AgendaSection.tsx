"use client";

import { motion } from "framer-motion";

const agendaItems = [
    {
        time: "11:00 AM - 01:00 PM",
        title: "Gran Caravana Internacional",
        description: "El desfile.",
    },
    {
        time: "01:00 PM - 06:00 PM",
        title: "L.A.M.A. Bike Fest",
        description:
            "Exhibición de motos de alta gama, zona comercial.",
    },
    {
        time: "04:00 PM",
        title: "Acto protocolario",
        description: "Premiación de Campeones y saludo de clubes.",
    },
    {
        time: "07:00 PM en adelante",
        title: "After Ride Party",
        description:
            "Integración con los tablados oficiales de las Fiestas del Plátano en Sabaneta.",
    },
];

export function AgendaSection() {
    return (
        <section id="agenda" className="py-16 sm:py-20">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="font-display text-2xl font-bold text-zinc-100 sm:text-3xl"
                >
                    Agenda After Ride
                </motion.h2>

                <div className="relative mt-8">
                    <div className="absolute bottom-0 left-4 top-0 w-px bg-zinc-700 sm:left-1/2" />

                    <div className="space-y-8">
                        {agendaItems.map((item, index) => (
                            <motion.article
                                key={item.time + item.title}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                viewport={{ once: true, margin: "-100px" }}
                                className="relative grid gap-4 sm:grid-cols-2 sm:gap-8"
                            >
                                <div
                                    className={`sm:px-8 ${index % 2 === 0
                                        ? "sm:col-start-1 sm:text-right"
                                        : "sm:col-start-2 sm:text-left"
                                        }`}
                                >
                                    <p className="font-display text-sm uppercase tracking-[0.2em] text-orange-300">
                                        {item.time}
                                    </p>
                                    <h3 className="mt-2 text-xl font-bold text-zinc-100">{item.title}</h3>
                                    <p className="mt-2 text-zinc-300">{item.description}</p>
                                </div>

                                <span className="absolute left-4 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full border border-orange-300 bg-orange-500 shadow-[0_0_0_4px_rgba(9,9,9,0.9)] sm:left-1/2" />
                            </motion.article>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
