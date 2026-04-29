import Link from "next/link";

const socialLinks = [
    { href: "https://instagram.com", label: "Instagram" },
    { href: "https://facebook.com", label: "Facebook" },
    { href: "https://youtube.com", label: "YouTube" },
];

export function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-white/10 bg-black/80">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                    <p className="font-display text-sm tracking-[0.18em] text-zinc-100">
                        L.A.M.A. BIKE FEST SABANETA
                    </p>
                    <p className="mt-2 text-xs text-zinc-400">
                        © {year} L.A.M.A. Bike Fest Sabaneta 2026. Todos los derechos
                        reservados.
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
