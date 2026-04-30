import Link from "next/link";

const socialLinks = [
    { href: "https://www.instagram.com/lamamedellin/", label: "Instagram" },
    { href: "https://www.facebook.com/LAMAMEDELLIN", label: "Facebook" },
];

export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black/80">
            <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-8 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6">
                <div>
                    <p className="font-display text-sm tracking-[0.18em] text-zinc-100">
                        XIII ANIVERSARIO L.A.M.A. MEDELLÍN - L.A.M.A. BIKE FEST SABANETA
                    </p>
                    <p className="mt-2 text-xs text-zinc-400">
                        © 2026 L.A.M.A. Bike Fest Sabaneta 2026. Todos los derechos reservados.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-widest text-zinc-300">
                    {socialLinks.map((social) => (
                        <Link
                            key={social.label}
                            href={social.href}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-zinc-700 px-3 py-1.5 transition hover:border-orange-400 hover:text-orange-300"
                        >
                            {social.label}
                        </Link>
                    ))}
                </div>
            </div>
        </footer>
    );
}
