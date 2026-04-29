"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
    { href: "#inicio", label: "Inicio" },
    { href: "#festival", label: "Festival" },
    { href: "#registro", label: "Registro" },
    { href: "#contacto", label: "Contacto" },
];

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 24);

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });

        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${isScrolled
                    ? "border-white/15 bg-black/85 shadow-2xl shadow-black/40 backdrop-blur-md"
                    : "border-transparent bg-transparent"
                }`}
        >
            <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
                <Link href="#inicio" className="shrink-0">
                    <p className="font-display text-sm leading-tight tracking-[0.22em] text-white sm:text-base">
                        L.A.M.A. BIKE FEST
                    </p>
                    <p className="text-[10px] tracking-[0.2em] text-orange-400 sm:text-xs">
                        SABANETA 2026
                    </p>
                </Link>

                <div className="flex items-center gap-2 overflow-x-auto text-xs uppercase tracking-wider text-zinc-200 sm:gap-5 sm:text-sm">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="whitespace-nowrap rounded-full px-2 py-1 transition hover:text-orange-400"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Link
                        href="#registro"
                        className="whitespace-nowrap rounded-full border border-orange-500/60 bg-orange-500/15 px-3 py-1.5 font-semibold text-orange-300 transition hover:bg-orange-500/25 hover:text-orange-200"
                    >
                        VIP PASS
                    </Link>
                </div>
            </nav>
        </header>
    );
}
