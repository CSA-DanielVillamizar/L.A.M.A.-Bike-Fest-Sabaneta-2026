"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Download, MapPin, Shield, TrendingUp, Users, Gift, Zap, Medal, Phone, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function DosierPage() {
    const handleDownloadPDF = () => {
        const element = document.getElementById("dosier-content");
        if (element) {
            window.print();
        }
    };

    const handleWhatsApp = () => {
        const message = "Hola Daniel, estoy interesado en ser patrocinador del L.A.M.A. BIKE FEST 2026. Me gustaría conocer más detalles sobre los planes disponibles.";
        window.open(`https://wa.me/573106328171?text=${encodeURIComponent(message)}`, "_blank");
    };

    return (
        <div className="min-h-screen bg-zinc-950" id="dosier-content">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/95 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-white">L.A.M.A. BIKE FEST 2026</h1>
                    <button
                        onClick={handleDownloadPDF}
                        className="inline-flex items-center gap-2 rounded-full bg-yellow-300 px-4 py-2 text-sm font-bold text-zinc-950 transition hover:bg-yellow-200"
                    >
                        <Download className="h-4 w-4" /> Descargar PDF
                    </button>
                </div>
            </nav>

            {/* PORTADA */}
            <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-950 to-black px-4 py-20 sm:px-6 flex items-center justify-center">
                <div className="absolute inset-0 opacity-20">
                    <Image
                        src="/images/hero-bg.jpg.png"
                        alt="Background"
                        fill
                        className="object-cover"
                    />
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 mx-auto max-w-3xl text-center"
                >
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-300">Oportunidad de Marca</p>
                    <h1 className="mt-4 font-display text-5xl font-bold text-white sm:text-6xl">
                        Tu marca rodará con <span className="text-yellow-300">26 naciones</span>
                    </h1>
                    <p className="mt-6 text-lg text-zinc-300 sm:text-xl">
                        Gran Caravana Internacional - Sabaneta 2026
                    </p>
                    <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
                        <button
                            onClick={handleWhatsApp}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-yellow-300 px-6 py-4 text-sm font-bold uppercase tracking-[0.12em] text-zinc-950 transition hover:bg-yellow-200"
                        >
                            <Phone className="h-5 w-5" /> Contáctame por WhatsApp
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-yellow-300 bg-yellow-300/10 px-6 py-4 text-sm font-bold uppercase tracking-[0.12em] text-yellow-300 transition hover:bg-yellow-300/20"
                        >
                            <Download className="h-5 w-5" /> Descargar PDF
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* RESUMEN EJECUTIVO */}
            <section className="bg-zinc-950 px-4 py-16 sm:px-6 sm:py-24">
                <div className="mx-auto max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="rounded-3xl border border-yellow-300/40 bg-gradient-to-br from-yellow-500/15 via-amber-400/10 to-black/30 p-8 sm:p-12"
                    >
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-200">Resumen Ejecutivo</p>
                        <h2 className="mt-3 font-display text-3xl font-bold text-white">¿Por qué Sabaneta 2026?</h2>
                        <p className="mt-6 text-lg text-zinc-200">
                            Sabaneta se convierte en el epicentro del motociclismo continental. Con delegaciones de <span className="font-bold text-yellow-300">26 países</span>, el festival es el punto de encuentro de líderes de opinión, viajeros de larga distancia y empresarios del sector motor.
                        </p>
                        <p className="mt-4 text-lg text-zinc-200">
                            Su marca será protagonista en un entorno de <span className="font-bold text-yellow-300">alta fidelidad y camaradería</span>, donde el poder adquisitivo es alto y la recordación garantizada.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* MÉTRICAS DE CONFIANZA */}
            <section className="bg-zinc-900/50 px-4 py-16 sm:px-6 sm:py-24">
                <div className="mx-auto max-w-6xl">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center font-display text-3xl font-bold text-white sm:text-4xl"
                    >
                        Métricas de Valor Probadas
                    </motion.h2>
                    <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            { icon: Users, label: "Naciones", value: "+26", color: "sky" },
                            { icon: Shield, label: "Incidentes", value: "0", color: "emerald" },
                            { icon: TrendingUp, label: "Impresiones", value: "+500K", color: "orange" },
                            { icon: MapPin, label: "Ubicaciones", value: "3", color: "yellow" },
                        ].map((metric, idx) => {
                            const Icon = metric.icon;
                            const colorClass = {
                                sky: "bg-sky-500/10 border-sky-300/30 text-sky-100",
                                emerald: "bg-emerald-500/10 border-emerald-300/30 text-emerald-100",
                                orange: "bg-orange-500/10 border-orange-300/30 text-orange-100",
                                yellow: "bg-yellow-500/10 border-yellow-300/30 text-yellow-100",
                            }[metric.color];

                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                    viewport={{ once: true }}
                                    className={`rounded-2xl border p-6 ${colorClass}`}
                                >
                                    <Icon className="h-8 w-8" />
                                    <p className="mt-3 text-4xl font-bold">{metric.value}</p>
                                    <p className="mt-2 text-sm font-semibold opacity-75">{metric.label}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* PLANES DE PATROCINIO */}
            <section className="bg-zinc-950 px-4 py-16 sm:px-6 sm:py-24">
                <div className="mx-auto max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-yellow-300">Niveles de Vinculación</p>
                        <h2 className="mt-3 text-center font-display text-3xl font-bold text-white sm:text-4xl">
                            Planes de Patrocinio
                        </h2>
                    </motion.div>

                    <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
                        {[
                            {
                                name: "PLATA",
                                price: "$1.5M",
                                label: "Partner",
                                benefits: [
                                    "Logo M (Base)",
                                    "Punto de Activación",
                                    "1 Post en redes",
                                    "Menciones en tarima",
                                ],
                                featured: false,
                            },
                            {
                                name: "ORO",
                                price: "$3M",
                                label: "Premium",
                                benefits: [
                                    "Logo L (Central)",
                                    "Stand Estándar",
                                    "2 Posts en redes",
                                    "Presencia en Tarima y La Molienda",
                                ],
                                featured: false,
                            },
                            {
                                name: "DIAMANTE",
                                price: "$5.5M",
                                label: "Main Sponsor",
                                benefits: [
                                    "Logo XL (Superior)",
                                    "Stand VIP",
                                    "Home Page + 4 Posts",
                                    "Presencia Total (Hotel, Tarima, La Molienda)",
                                    "Branding en Fiestas del Plátano",
                                ],
                                featured: true,
                            },
                        ].map((plan, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className={`rounded-3xl border p-6 backdrop-blur-md ${
                                    plan.featured
                                        ? "relative border-yellow-300/40 bg-yellow-500/15 shadow-[0_0_40px_rgba(234,179,8,0.2)]"
                                        : "border-white/10 bg-white/5"
                                }`}
                            >
                                {plan.featured && (
                                    <span className="absolute -top-3 right-5 rounded-full border border-yellow-300/70 bg-yellow-300/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-yellow-100">
                                        Main Sponsor
                                    </span>
                                )}
                                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">{plan.name}</p>
                                <h3 className="mt-3 font-display text-3xl font-bold text-white">{plan.price}</h3>
                                <p className="mt-1 text-sm text-zinc-300">{plan.label}</p>
                                <ul className="mt-6 space-y-3">
                                    {plan.benefits.map((benefit) => (
                                        <li key={benefit} className="flex items-start gap-2 text-sm text-zinc-200">
                                            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-300" />
                                            <span>{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={handleWhatsApp}
                                    className={`mt-7 w-full rounded-full px-5 py-3 text-center text-sm font-bold uppercase tracking-[0.12em] transition ${
                                        plan.featured
                                            ? "bg-yellow-300 text-zinc-950 hover:bg-yellow-200"
                                            : "bg-orange-500 text-zinc-950 hover:bg-orange-400"
                                    }`}
                                >
                                    Quiero este plan
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* MESA FRATERNA */}
            <section className="bg-zinc-900/50 px-4 py-16 sm:px-6 sm:py-24">
                <div className="mx-auto max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="rounded-3xl border border-orange-300/45 bg-gradient-to-r from-orange-500/20 via-amber-400/15 to-yellow-300/20 p-8 sm:p-12"
                    >
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-200">Mesa Fraterna</p>
                        <h2 className="mt-3 font-display text-3xl font-bold text-zinc-100">
                            Patrocinio de Impacto Emocional
                        </h2>
                        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-yellow-200">
                            Inversión: $850.000 COP
                        </p>
                        <p className="mt-4 text-lg text-zinc-200">
                            <span className="font-bold text-yellow-300">Apadrina 10 almuerzos de alto nivel</span> y pon tu marca en el plato de un hermano motero. Lleva tu nombre al momento más humano del festival y vincúlate desde la fraternidad real.
                        </p>
                        <div className="mt-4 rounded-xl border border-white/15 bg-black/20 px-4 py-3">
                            <p className="text-sm text-zinc-100">
                                ✨ El <span className="font-bold text-yellow-300">100%</span> de este aporte va directo a la alimentación de nuestros hermanos locales e internacionales.
                            </p>
                        </div>
                        <ul className="mt-6 space-y-2">
                            <li className="flex items-start gap-2 text-sm text-zinc-200">
                                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-300" />
                                <span>Branding en individuales de mesa.</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-zinc-200">
                                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-300" />
                                <span>Mención de honor en la clausura.</span>
                            </li>
                        </ul>
                        <button
                            onClick={handleWhatsApp}
                            className="mt-6 inline-flex rounded-full border border-orange-200/70 bg-orange-200/15 px-5 py-2 text-sm font-bold uppercase tracking-[0.12em] text-orange-100 transition hover:bg-orange-200/25"
                        >
                            Activar Mesa Fraterna
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* FORMAS DE VINCULACIÓN FLEXIBLES */}
            <section className="bg-zinc-950 px-4 py-16 sm:px-6 sm:py-24">
                <div className="mx-auto max-w-6xl">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center font-display text-3xl font-bold text-white sm:text-4xl"
                    >
                        Formas de Vinculación Flexibles
                    </motion.h2>

                    <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
                        {[
                            {
                                icon: Gift,
                                title: "Donaciones en Especie",
                                description: "Souvenirs, herramientas, accesorios o tecnología para fortalecer los kits oficiales.",
                            },
                            {
                                icon: Zap,
                                title: "Experiencias de Marca",
                                description: "Activaciones en vivo y rifas especiales en La Molienda para crear recuerdo y tracción comercial.",
                            },
                            {
                                icon: TrendingUp,
                                title: "Aportes de Capital",
                                description: "Destinados al fortalecimiento operativo y fondo de fomento para participación masiva.",
                            },
                        ].map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                    viewport={{ once: true }}
                                    className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md"
                                >
                                    <Icon className="h-8 w-8 text-yellow-300" />
                                    <h3 className="mt-4 font-display text-xl font-bold text-white">{item.title}</h3>
                                    <p className="mt-2 text-sm text-zinc-300">{item.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* BANDERA OFICIAL */}
            <section className="bg-zinc-900/50 px-4 py-16 sm:px-6 sm:py-24">
                <div className="mx-auto max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="grid items-center gap-8 lg:grid-cols-2"
                    >
                        <div>
                            <p className="inline-flex items-center gap-2 rounded-full border border-yellow-300/60 bg-yellow-200/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-yellow-100">
                                <Medal className="h-3.5 w-3.5" /> Presencia Permanente
                            </p>
                            <h2 className="mt-4 font-display text-3xl font-bold text-white">
                                Tu marca en la Bandera de la Hermandad
                            </h2>
                            <p className="mt-4 text-lg text-zinc-300">
                                Un trofeo de visibilidad premium que escoltará los momentos más importantes del festival.
                            </p>
                            <ol className="mt-6 space-y-3 text-sm text-zinc-200">
                                <li className="flex items-start gap-3">
                                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-yellow-300/20 text-yellow-300">1</span>
                                    <span>Tablados oficiales de las Fiestas del Plátano.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-yellow-300/20 text-yellow-300">2</span>
                                    <span>Lobby de bienvenida en el Hotel Sede.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-yellow-300/20 text-yellow-300">3</span>
                                    <span>Escenario principal de la Fonda La Molienda.</span>
                                </li>
                            </ol>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="relative overflow-hidden rounded-3xl border border-yellow-300/40 bg-gradient-to-br from-yellow-500/15 via-amber-300/10 to-black/30 p-6"
                        >
                            <div className="relative h-64 overflow-hidden rounded-2xl">
                                <Image
                                    src="/images/bandera.png"
                                    alt="Bandera oficial de la hermandad"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <p className="mt-4 text-center text-sm text-zinc-300">Bandera Oficial L.A.M.A. Medellín</p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* CASOS DE ÉXITO */}
            <section className="bg-zinc-950 px-4 py-16 sm:px-6 sm:py-24">
                <div className="mx-auto max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-yellow-300">Casos de Éxito</p>
                        <h2 className="mt-3 text-center font-display text-3xl font-bold text-white sm:text-4xl">
                            Gestión El Salvador 2026
                        </h2>
                        <p className="mt-4 text-center text-lg text-zinc-300">
                            Un modelo de éxito replicable en Sabaneta
                        </p>
                    </motion.div>

                    <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {[
                            {
                                stat: "24+",
                                label: "Naciones Participantes",
                                desc: "Delegaciones de Centro y Sudamérica",
                            },
                            {
                                stat: "0",
                                label: "Incidentes Reportados",
                                desc: "Logística de clase mundial y seguridad",
                            },
                            {
                                stat: "+500K",
                                label: "Impresiones Digitales",
                                desc: "Cobertura en prensa nacional e internacional",
                            },
                            {
                                stat: "100%",
                                label: "Satisfacción de Patrocinadores",
                                desc: "ROI visible y asociación de marca positiva",
                            },
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center"
                            >
                                <p className="font-display text-4xl font-bold text-yellow-300">{item.stat}</p>
                                <p className="mt-2 font-semibold text-white">{item.label}</p>
                                <p className="mt-1 text-sm text-zinc-400">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA FINAL */}
            <section className="bg-zinc-900/50 px-4 py-16 sm:px-6 sm:py-24">
                <div className="mx-auto max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="rounded-3xl border border-yellow-300/40 bg-gradient-to-br from-yellow-500/15 via-amber-300/10 to-black/30 p-8 text-center sm:p-12"
                    >
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-200">Último Paso</p>
                        <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
                            Únete a la Gran Caravana
                        </h2>
                        <p className="mt-6 text-lg text-zinc-300">
                            Solo quedan <span className="font-bold text-yellow-300">3 spots Diamante</span> disponibles. Contacta hoy mismo y asegura el reconocimiento de marca a nivel continental.
                        </p>
                        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                            <button
                                onClick={handleWhatsApp}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-yellow-300 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-zinc-950 transition hover:bg-yellow-200"
                            >
                                <Phone className="h-5 w-5" /> Contáctame Ahora
                            </button>
                            <Link
                                href="mailto:gerencia@fundacionlamamedellin.org"
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-yellow-300/60 bg-yellow-300/15 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-yellow-100 transition hover:bg-yellow-300/25"
                            >
                                <Mail className="h-5 w-5" /> Enviar Email
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="border-t border-white/10 bg-zinc-950 px-4 py-12 sm:px-6">
                <div className="mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Contacto Directo</p>
                            <p className="mt-3 font-semibold text-white">Daniel Andrey Villamizar Araque</p>
                            <p className="text-sm text-zinc-400">Presidente Capítulo L.A.M.A. Medellín</p>
                            <p className="text-sm text-zinc-400">Presidente Región Norte – L.A.M.A. Colombia</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Teléfono</p>
                            <Link
                                href="https://wa.me/573106328171"
                                className="mt-3 flex items-center gap-2 text-yellow-300 transition hover:text-yellow-200"
                            >
                                <Phone className="h-4 w-4" /> +57 310 632 8171
                            </Link>
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Email</p>
                            <Link
                                href="mailto:gerencia@fundacionlamamedellin.org"
                                className="mt-3 flex items-center gap-2 text-yellow-300 transition hover:text-yellow-200"
                            >
                                <Mail className="h-4 w-4" /> gerencia@fundacionlama...
                            </Link>
                        </div>
                    </div>
                    <div className="mt-8 border-t border-white/10 pt-8 text-center text-sm text-zinc-400">
                        <p>© 2026 L.A.M.A. BIKE FEST - Gran Caravana Internacional</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
