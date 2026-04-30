"use client";

import { motion } from "framer-motion";

type AgendaEvent = {
    time: string;
    title: string;
    description: string;
    note?: string;
};

type AgendaDay = {
    day: string;
    events: AgendaEvent[];
};

const agendaDays: AgendaDay[] = [
    {
        day: "Viernes 26 de Junio",
        events: [
            {
                time: "Tarde",
                title: "Check-in y Recibimiento de Delegaciones",
                description:
                    "Llegada y registro oficial de los capítulos invitados en el Hotel Sede.",
            },
            {
                time: "08:00 PM",
                title: "Gran Integración de Bienvenida",
                description:
                    "Primer encuentro de todos los capítulos invitados en La Fonda La Molienda.",
            },
        ],
    },
    {
        day: "Sábado 27 de Junio",
        events: [
            {
                time: "11:00 AM",
                title: "L.A.M.A. BIKE FEST \"Gran Caravana Internacional\"",
                description:
                    "El gran desfile motorizado que recorrerá las calles de Sabaneta con delegaciones de 26 países.",
            },
            {
                time: "01:00 PM – 06:00 PM",
                title: "Clausura L.A.M.A. Bike Fest Sabaneta 2026",
                description:
                    "Exhibición de motos de alta gama, zona comercial y stands de marcas patrocinadoras. Esto se celebrará en la Fonda La Molienda y contará con cantante en vivo, Almuerzo (Parrilla Mixta) + Cerveza o Gaseosa.",
                note:
                    "Valor para invitados no L.A.M.A. / clubes hermanos: $85.000 COP. Para miembros L.A.M.A. está incluido con la inscripción al XIII Aniversario.",
            },
            {
                time: "04:00 PM",
                title: "Acto Protocolario y Premiación",
                description:
                    "Reconocimiento a campeones y saludo oficial de los clubes participantes.",
            },
            {
                time: "07:00 PM",
                title: "L.A.M.A. BIKE FEST \"After Ride Party\" — Fiestas del Plátano",
                description:
                    "Integración con los tablados oficiales de las Fiestas del Plátano en Sabaneta. Disfrutaremos de artistas de talla internacional como Los Inquietos del Vallenato, Rikarena, Binomio de Oro, Charrito Negro, Sergio Vargas y muchos más.",
            },
        ],
    },
    {
        day: "Domingo 28 de Junio",
        events: [
            {
                time: "11:00 AM – 02:00 PM",
                title: "Rodada hacia MEDAYORK Mirador Gastro Bar",
                description:
                    "Rodada oficial hacia el Mirador Gastro Bar MEDAYORK. Seguiremos disfrutando de conciertos en vivo y espectáculos exclusivos preparados para todos nuestros visitantes internacionales.",
            },
        ],
    },
    {
        day: "Lunes 29 de Junio",
        events: [
            {
                time: "Mañana",
                title: "Despedida de Delegaciones",
                description:
                    "Cierre oficial del XIII Aniversario y retorno seguro de los capítulos invitados.",
            },
        ],
    },
];

/** Pre-compute the global index of each event (for alternating animation direction). */
const eventGlobalIndices: Map<string, number> = new Map();
let _counter = 0;
for (const day of agendaDays) {
    for (const event of day.events) {
        eventGlobalIndices.set(day.day + event.time + event.title, _counter++);
    }
}

export function AgendaSection() {
    return (
        <section id="programa" className="py-16 sm:py-20">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="font-display text-2xl font-bold text-zinc-100 sm:text-3xl"
                >
                    Programa — 4 Días de Celebración
                </motion.h2>

                <div className="relative mt-8">
                    <div className="absolute bottom-0 left-4 top-0 w-px bg-zinc-700 sm:left-1/2" />

                    <div className="space-y-16">
                        {agendaDays.map((day) => (
                            <div key={day.day} className="space-y-8">
                                {/* Day header */}
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    viewport={{ once: true, margin: "-60px" }}
                                    className="relative z-10 ml-10 sm:ml-0 sm:flex sm:justify-center"
                                >
                                    <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/50 bg-orange-500/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.22em] text-orange-300">
                                        <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-400" />
                                        {day.day}
                                    </span>
                                </motion.div>

                                {/* Events */}
                                <div className="space-y-8">
                                    {day.events.map((event) => {
                                        const globalIdx =
                                            eventGlobalIndices.get(day.day + event.time + event.title) ?? 0;
                                        return (
                                            <motion.article
                                                key={event.time + event.title}
                                                initial={{ opacity: 0, x: globalIdx % 2 === 0 ? -50 : 50 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.6, ease: "easeOut" }}
                                                viewport={{ once: true, margin: "-100px" }}
                                                className="relative grid gap-4 sm:grid-cols-2 sm:gap-8"
                                            >
                                                <div
                                                    className={`sm:px-8 ${globalIdx % 2 === 0
                                                        ? "sm:col-start-1 sm:text-right"
                                                        : "sm:col-start-2 sm:text-left"
                                                        }`}
                                                >
                                                    <p className="font-display text-sm uppercase tracking-[0.2em] text-orange-300">
                                                        {event.time}
                                                    </p>
                                                    <h3 className="mt-2 text-xl font-bold text-zinc-100">
                                                        {event.title}
                                                    </h3>
                                                    <p className="mt-2 text-zinc-300">{event.description}</p>
                                                    {event.note && (
                                                        <p className="mt-3 rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-sm italic text-orange-200">
                                                            {event.note}
                                                        </p>
                                                    )}
                                                </div>

                                                <span className="absolute left-4 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full border border-orange-300 bg-orange-500 shadow-[0_0_0_4px_rgba(9,9,9,0.9)] sm:left-1/2" />
                                            </motion.article>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
