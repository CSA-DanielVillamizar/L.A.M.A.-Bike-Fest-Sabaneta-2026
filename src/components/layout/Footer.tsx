import Link from "next/link";

const socialLinks = [
    { href: "https://instagram.com", label: "Instagram" },
    { href: "https://facebook.com", label: "Facebook" },
    { href: "https://youtube.com", label: "YouTube" },
];

const boardContacts = [
    { name: "Daniel Villamizar", role: "President", phone: "3106328171" },
    { name: "Carlos Pérez", role: "Vice President", phone: "3017560517" },
    { name: "Robinson Galvis", role: "Treasurer", phone: "3105127314" },
    { name: "Carlos Díaz", role: "Secretary", phone: "3213167406" },
    { name: "Edinson Ospina", role: "Business Manager", phone: "3008542336" },
    { name: "Carlos Rendón", role: "MTO", phone: "3507757020" },
];

const officialEmails = [
    "juntacapitulolamamedellin@gmail.com",
    "gerencia@fundacionlamamedellin.org",
];

export function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-white/10 bg-black/80">
            <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_1.4fr_0.8fr]">
                <div>
                    <p className="font-display text-sm tracking-[0.18em] text-zinc-100">
                        L.A.M.A. BIKE FEST SABANETA
                    </p>
                    <p className="mt-2 text-xs text-zinc-400">
                        © {year} L.A.M.A. Bike Fest Sabaneta 2026. Todos los derechos
                        reservados.
                    </p>
                </div>

                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">Contacto Oficial</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {boardContacts.map((contact) => (
                            <div key={contact.name} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-zinc-200">
                                <p className="font-semibold text-zinc-100">{contact.name}</p>
                                <p className="mt-1 text-zinc-400">{contact.role}</p>
                                <a
                                    href={`https://wa.me/57${contact.phone}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-2 inline-flex text-orange-300 transition hover:text-orange-200"
                                >
                                    {contact.phone}
                                </a>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 rounded-xl border border-orange-500/30 bg-orange-500/10 p-3 text-sm">
                        <p className="font-semibold text-orange-200">Correos oficiales</p>
                        <div className="mt-2 flex flex-col gap-1">
                            {officialEmails.map((email) => (
                                <a
                                    key={email}
                                    href={`mailto:${email}`}
                                    className="break-all text-zinc-100 transition hover:text-orange-200"
                                >
                                    {email}
                                </a>
                            ))}
                        </div>
                    </div>
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
