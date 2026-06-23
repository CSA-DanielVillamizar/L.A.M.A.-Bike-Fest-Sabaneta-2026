"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type AwardCategory = {
    id: number;
    title: string;
    winner: string;
};

const INITIAL_CATEGORIES: AwardCategory[] = [
    {
        id: 1,
        title: "Dama L.A.M.A. que recorrió mayor distancia (Capítulo Nacional)",
        winner: "[Nombre]",
    },
    {
        id: 2,
        title: "Dama L.A.M.A. que recorrió mayor distancia (Capítulo Internacional)",
        winner: "[Nombre]",
    },
    {
        id: 3,
        title: "Piloto L.A.M.A. que recorrió mayor distancia (Capítulo Nacional)",
        winner: "[Nombre]",
    },
    {
        id: 4,
        title: "Piloto L.A.M.A. que recorrió mayor distancia (Capítulo Internacional)",
        winner: "[Nombre]",
    },
    {
        id: 5,
        title: "Capítulo L.A.M.A. con mayor cantidad de asistentes",
        winner: "[Nombre del Capítulo]",
    },
];

export default function CeremoniaPremiosPage() {
    const [categories, setCategories] = useState<AwardCategory[]>(INITIAL_CATEGORIES);
    const [categoriaActiva, setCategoriaActiva] = useState<number | null>(null);
    const [winnerRevealed, setWinnerRevealed] = useState(false);
    const [panelOpen, setPanelOpen] = useState(false);

    const activeCategory = useMemo(
        () => categories.find((category) => category.id === categoriaActiva) ?? null,
        [categories, categoriaActiva],
    );

    const selectCategory = (id: number) => {
        setCategoriaActiva(id);
        setWinnerRevealed(false);
    };

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key >= "1" && event.key <= "5") {
                selectCategory(Number(event.key));
                return;
            }

            if (event.key === " ") {
                if (categoriaActiva !== null) {
                    event.preventDefault();
                    setWinnerRevealed(true);
                }
                return;
            }

            if (event.key === "Escape") {
                setCategoriaActiva(null);
                setWinnerRevealed(false);
                return;
            }

            if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
                return;
            }

            event.preventDefault();

            const currentIndex = categories.findIndex((category) => category.id === categoriaActiva);
            if (currentIndex < 0) {
                selectCategory(categories[0].id);
                return;
            }

            const nextIndex =
                event.key === "ArrowRight"
                    ? (currentIndex + 1) % categories.length
                    : (currentIndex - 1 + categories.length) % categories.length;

            selectCategory(categories[nextIndex].id);
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [categories, categoriaActiva]);

    useEffect(() => {
        const header = document.querySelector("header");
        const footer = document.querySelector("footer");
        const previousHeaderDisplay = header instanceof HTMLElement ? header.style.display : "";
        const previousFooterDisplay = footer instanceof HTMLElement ? footer.style.display : "";

        if (header instanceof HTMLElement) {
            header.style.display = "none";
        }
        if (footer instanceof HTMLElement) {
            footer.style.display = "none";
        }

        document.body.style.overflow = "hidden";

        return () => {
            if (header instanceof HTMLElement) {
                header.style.display = previousHeaderDisplay;
            }
            if (footer instanceof HTMLElement) {
                footer.style.display = previousFooterDisplay;
            }
            document.body.style.overflow = "";
        };
    }, []);

    return (
        <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black px-6 py-12 text-zinc-100">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(255,215,120,0.18),transparent_45%),radial-gradient(circle_at_50%_88%,rgba(184,134,11,0.14),transparent_50%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-40 [background:linear-gradient(120deg,rgba(255,224,130,0.08)_0%,rgba(255,224,130,0)_35%,rgba(255,224,130,0.06)_65%,rgba(255,224,130,0)_100%)]" />

            <AnimatePresence mode="wait">
                {activeCategory === null ? (
                    <motion.div
                        key="welcome"
                        initial={{ opacity: 0, scale: 0.96, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.02, y: -20 }}
                        transition={{ duration: 0.75, ease: "easeOut" }}
                        className="relative z-10 max-w-6xl text-center"
                    >
                        <p className="text-sm uppercase tracking-[0.42em] text-yellow-600/90 sm:text-base">
                            XIII Aniversario L.A.M.A. Medellín
                        </p>
                        <h1 className="mt-5 bg-gradient-to-r from-yellow-700 via-yellow-400 to-yellow-700 bg-clip-text text-4xl font-extrabold uppercase tracking-[0.08em] text-transparent drop-shadow-[0_0_28px_rgba(212,175,55,0.26)] sm:text-6xl lg:text-7xl">
                            Ceremonia de Reconocimientos
                        </h1>
                        <p className="mx-auto mt-8 max-w-3xl text-sm uppercase tracking-[0.25em] text-zinc-400 sm:text-base">
                            Selecciona una categoría desde el panel de control para iniciar la presentación.
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        key={activeCategory.id}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.55, ease: "easeOut" }}
                        className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center justify-center text-center"
                    >
                        <p className="text-xs uppercase tracking-[0.45em] text-yellow-700 sm:text-sm">
                            Categoría en Anuncio
                        </p>
                        <h2 className="mt-6 max-w-5xl text-3xl font-semibold uppercase tracking-[0.09em] text-yellow-400 sm:text-5xl lg:text-6xl">
                            {activeCategory.title}
                        </h2>

                        <AnimatePresence>
                            {winnerRevealed && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.84, y: 32 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                                    className="mt-12"
                                >
                                    <p className="text-xs uppercase tracking-[0.45em] text-yellow-700/90 sm:text-sm">
                                        Ganador
                                    </p>
                                    <motion.p
                                        animate={{ scale: [1, 1.025, 1] }}
                                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                                        className="mt-5 bg-gradient-to-r from-yellow-700 via-yellow-300 to-yellow-700 bg-clip-text px-4 text-6xl font-extrabold uppercase leading-tight tracking-[0.04em] text-transparent drop-shadow-[0_0_35px_rgba(250,204,21,0.28)] sm:text-7xl lg:text-8xl"
                                    >
                                        {activeCategory.winner}
                                    </motion.p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="fixed bottom-4 left-1/2 z-50 w-[min(95vw,1100px)] -translate-x-1/2 rounded-full border border-neutral-800 bg-neutral-900/80 px-3 py-2 backdrop-blur-md">
                <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                        type="button"
                        onClick={() => setPanelOpen((prev) => !prev)}
                        className="rounded-full border border-yellow-600/40 bg-black/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300 transition hover:border-yellow-500 hover:text-yellow-200"
                    >
                        {panelOpen ? "Ocultar Control" : "Mostrar Control"}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setCategoriaActiva(null);
                            setWinnerRevealed(false);
                        }}
                        className="rounded-full border border-neutral-700 bg-black/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300 transition hover:border-neutral-500 hover:text-zinc-100"
                    >
                        Pantalla Inicial
                    </button>

                    <button
                        type="button"
                        disabled={categoriaActiva === null}
                        onClick={() => setWinnerRevealed(true)}
                        className="rounded-full border border-yellow-600/40 bg-yellow-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300 transition hover:bg-yellow-500/20 hover:text-yellow-200 disabled:cursor-not-allowed disabled:border-neutral-700 disabled:text-neutral-500"
                    >
                        Revelar Ganador
                    </button>
                </div>

                <AnimatePresence>
                    {panelOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="mt-3 grid gap-2 md:grid-cols-5"
                        >
                            {categories.map((category) => {
                                const isActive = category.id === categoriaActiva;

                                return (
                                    <button
                                        key={category.id}
                                        type="button"
                                        onClick={() => selectCategory(category.id)}
                                        className={`rounded-2xl border px-3 py-2 text-left transition ${isActive
                                            ? "border-yellow-500 bg-yellow-500/20 text-yellow-100"
                                            : "border-neutral-700 bg-black/35 text-zinc-300 hover:border-neutral-500 hover:text-zinc-100"
                                            }`}
                                    >
                                        <p className="text-[10px] uppercase tracking-[0.22em] text-yellow-700/90">
                                            Categoría {category.id}
                                        </p>
                                        <p className="mt-1 line-clamp-3 text-xs font-medium uppercase tracking-[0.08em]">
                                            {category.title}
                                        </p>
                                    </button>
                                );
                            })}

                            {categoriaActiva !== null && (
                                <div className="rounded-2xl border border-neutral-700 bg-black/35 p-3 text-left md:col-span-5">
                                    <label htmlFor="winner-input" className="text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                                        Editar Ganador (Último Minuto)
                                    </label>
                                    <input
                                        id="winner-input"
                                        type="text"
                                        value={activeCategory?.winner ?? ""}
                                        onChange={(event) => {
                                            const value = event.target.value;
                                            setCategories((prev) =>
                                                prev.map((item) =>
                                                    item.id === categoriaActiva
                                                        ? { ...item, winner: value }
                                                        : item,
                                                ),
                                            );
                                        }}
                                        className="mt-2 w-full rounded-xl border border-neutral-600 bg-neutral-950 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-yellow-500"
                                        placeholder="Escribe el nombre del ganador"
                                    />
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
