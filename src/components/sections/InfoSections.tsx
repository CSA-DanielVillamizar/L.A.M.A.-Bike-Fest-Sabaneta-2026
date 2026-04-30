"use client";

import { motion } from "framer-motion";

export function InfoSections() {
    return (
        <section id="festival" className="mx-auto w-full max-w-6xl px-4 pb-20 pt-10 sm:px-6">
            <div className="grid gap-5 lg:grid-cols-5">
                <motion.article
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition duration-300 hover:-translate-y-1 hover:border-orange-500/50 hover:bg-white/[0.08] lg:col-span-3 lg:p-8"
                >
                    <p className="text-xs uppercase tracking-[0.2em] text-orange-300">
                        Homenaje Especial
                    </p>
                    <h2 className="font-display mt-3 text-2xl font-bold leading-tight text-zinc-100 sm:text-3xl">
                        Presentación de Campeones Internacionales de Mototurismo.
                    </h2>
                    <p className="mt-4 text-zinc-300 sm:text-lg">
                        Celebra con nosotros a los hombres y mujeres que han recorrido miles
                        de kilómetros a través de continentes. Un espacio para reconocer la
                        verdadera resistencia y pasión sobre dos ruedas.
                    </p>
                </motion.article>

                <motion.article
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="group rounded-2xl border border-white/10 bg-gradient-to-br from-orange-500/10 to-red-500/10 p-6 transition duration-300 hover:-translate-y-1 hover:border-orange-400/60 hover:from-orange-500/15 hover:to-red-500/15 lg:col-span-2 lg:p-8"
                >
                    <p className="text-xs uppercase tracking-[0.2em] text-orange-300">
                        Comunidad Global
                    </p>
                    <h3 className="font-display mt-3 text-xl font-bold text-zinc-100 sm:text-2xl">
                        Una Hermandad Sin Fronteras
                    </h3>
                    <p className="mt-4 text-zinc-200">
                        Convocamos a todos los clubes moteros, independientes y apasionados
                        de Medellín y el Valle de Aburrá. El L.A.M.A. Bike Fest no es solo
                        para nuestros capítulos; es el punto de encuentro para toda la
                        cultura biker que promueve el respeto y la rodada segura. ¡Vengan a
                        compartir con hermanos de 26 países!
                    </p>
                </motion.article>
            </div>

            <section id="registro" className="mt-6" aria-hidden />
        </section>
    );
}
