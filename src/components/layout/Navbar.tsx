"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
    { href: "#inicio", label: "Inicio" },
    { href: "#programa", label: "Programa" },
    { href: "#clubes", label: "Clubes" },
    { href: "#registro-oficial", label: "Inscribirme" },
    { href: "#contacto", label: "Contacto" },
];

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Bloquear scroll del body cuando el drawer está abierto
    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [menuOpen]);

    const closeMenu = () => setMenuOpen(false);

    return (
        <>
            <header
                className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${isScrolled || menuOpen
                    ? "border-white/15 bg-black/90 shadow-2xl shadow-black/40 backdrop-blur-md"
                    : "border-transparent bg-transparent"
                    }`}
            >
                <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
                    {/* Logo */}
                    <Link href="#inicio" className="flex shrink-0 items-center gap-3" onClick={closeMenu}>
                        <Image
                            src="/images/LogoBikeFestSabaneta2026.png"
                            alt="Logo L.A.M.A. Bike Fest Sabaneta 2026"
                            width={40}
                            height={40}
                            className="h-9 w-9 rounded-full object-cover sm:h-10 sm:w-10"
                            priority
                        />
                        <div>
                            <p className="font-display text-[10px] leading-tight tracking-[0.18em] text-white sm:text-base sm:tracking-[0.22em]">
                                L.A.M.A. BIKE FEST
                            </p>
                            <p className="text-[9px] tracking-[0.16em] text-orange-400 sm:text-xs sm:tracking-[0.2em]">
                                SABANETA 2026
                            </p>
                        </div>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden items-center gap-5 text-sm uppercase tracking-wider text-zinc-200 sm:flex">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`whitespace-nowrap rounded-full px-2 py-1 transition ${link.href === "#registro-oficial"
                                    ? "border border-orange-500/60 bg-orange-500/15 px-3 py-1.5 font-semibold text-orange-300 hover:bg-orange-500/25 hover:text-orange-200"
                                    : "hover:text-orange-400"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Botón hamburguesa — solo móvil */}
                    <button
                        type="button"
                        aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen((prev) => !prev)}
                        className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-lg border border-white/10 bg-white/5 transition hover:bg-white/10 sm:hidden"
                    >
                        <span
                            className={`block h-0.5 w-5 rounded-full bg-zinc-100 transition-all duration-300 ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`}
                        />
                        <span
                            className={`block h-0.5 w-5 rounded-full bg-zinc-100 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
                        />
                        <span
                            className={`block h-0.5 w-5 rounded-full bg-zinc-100 transition-all duration-300 ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
                        />
                    </button>
                </nav>
            </header>

            {/* Mobile drawer overlay */}
            {menuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm sm:hidden"
                    onClick={closeMenu}
                    aria-hidden="true"
                />
            )}

            {/* Mobile drawer panel */}
            <div
                className={`fixed inset-x-0 top-[57px] z-40 border-b border-white/10 bg-zinc-950/95 backdrop-blur-md transition-all duration-300 sm:hidden ${menuOpen ? "translate-y-0 opacity-100" : "-translate-y-4 pointer-events-none opacity-0"}`}
            >
                <nav className="flex flex-col px-6 py-4">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={closeMenu}
                            className={`flex items-center rounded-xl px-4 py-4 text-sm font-semibold uppercase tracking-[0.14em] transition active:scale-[0.98] ${link.href === "#registro-oficial"
                                ? "mt-2 justify-center border border-orange-500 bg-orange-500/20 text-orange-300 hover:bg-orange-500/30"
                                : "border-b border-white/5 text-zinc-200 hover:text-orange-400 last:border-0"
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </>
    );
}
