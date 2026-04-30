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
                                    className="mt-2 inline-flex text-sm text-zinc-300 transition hover:text-orange-300"
                                >
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
