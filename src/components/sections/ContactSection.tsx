import Link from "next/link";

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

function WhatsAppIcon() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4 flex-shrink-0"
            fill="currentColor"
        >
            <path d="M19.11 4.89A10.94 10.94 0 0 0 12.02 2C6.49 2 2 6.49 2 12.02c0 1.77.46 3.5 1.34 5.03L2 22l5.1-1.33a9.96 9.96 0 0 0 4.92 1.26h.01C17.55 21.93 22 17.44 22 12.02c0-2.68-1.05-5.21-2.89-7.13Zm-7.08 15.22h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.03.79.81-2.95-.2-.31a8.16 8.16 0 0 1-1.25-4.31c0-4.5 3.66-8.17 8.16-8.17a8.1 8.1 0 0 1 5.79 2.4 8.1 8.1 0 0 1 2.37 5.78c0 4.5-3.66 8.16-8.16 8.16Zm4.48-6.12c-.25-.13-1.48-.73-1.71-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.78.98-.14.16-.29.19-.54.06-.25-.13-1.04-.38-1.98-1.2-.73-.66-1.23-1.47-1.37-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.16.04-.31-.02-.43-.06-.13-.56-1.35-.76-1.85-.2-.47-.41-.41-.56-.42h-.48c-.16 0-.43.06-.65.31-.23.25-.85.83-.85 2.03 0 1.2.87 2.36.99 2.52.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.1.15 1.52.09.46-.07 1.48-.6 1.69-1.18.21-.58.21-1.08.15-1.18-.06-.11-.23-.17-.48-.29Z" />
        </svg>
    );
}

export function ContactSection() {
    return (
        <section id="contacto" className="py-16 sm:py-20">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
                <div className="rounded-2xl border border-white/10 bg-black/35 p-6 sm:p-8">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">
                        Contacto Oficial
                    </p>
                    <h2 className="mt-3 font-display text-2xl font-bold text-zinc-100 sm:text-3xl">
                        Junta Directiva L.A.M.A. Medellín
                    </h2>

                    <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {boardContacts.map((contact) => (
                            <article
                                key={contact.name}
                                className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                            >
                                <p className="font-semibold text-zinc-100">{contact.name}</p>
                                <p className="mt-1 text-sm text-zinc-400">{contact.role}</p>
                                <Link
                                    href={`https://wa.me/57${contact.phone}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-2 inline-flex items-center gap-2 text-sm text-zinc-300 transition hover:text-orange-300"
                                >
                                    <WhatsAppIcon />
                                    {contact.phone}
                                </Link>
                            </article>
                        ))}
                    </div>

                    <div className="mt-6 rounded-xl border border-orange-500/30 bg-orange-500/10 px-5 py-4">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-200">
                            Correos Oficiales
                        </p>
                        <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
                            {officialEmails.map((email) => (
                                <a
                                    key={email}
                                    href={`mailto:${email}`}
                                    className="break-all text-sm text-zinc-100 transition hover:text-orange-200"
                                >
                                    {email}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
