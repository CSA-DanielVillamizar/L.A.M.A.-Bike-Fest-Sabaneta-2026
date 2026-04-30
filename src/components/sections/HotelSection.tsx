import Link from "next/link";

const hotelRates = [
    { roomType: "Habitación Sencilla", price: "$160.000 COP" },
    { roomType: "Habitación Doble", price: "$260.000 COP" },
    { roomType: "Habitación Triple", price: "$320.000 COP" },
];

function LocationIcon() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5 flex-shrink-0 text-orange-300"
            fill="currentColor"
        >
            <path d="M12 2a7 7 0 0 0-7 7c0 5.16 6.12 12.09 6.38 12.38a.9.9 0 0 0 1.24 0C12.88 21.09 19 14.16 19 9a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 14.5 9 2.5 2.5 0 0 1 12 11.5Z" />
        </svg>
    );
}

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

export function HotelSection() {
    return (
        <section className="py-16 sm:py-20">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                <div className="rounded-2xl border border-orange-500/25 bg-gradient-to-br from-black/55 via-zinc-950/70 to-orange-950/30 p-6 sm:p-8">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">
                        Hotel Sede Oficial
                    </p>
                    <h2 className="mt-3 font-display text-2xl font-bold text-zinc-100 sm:text-3xl">
                        Hacienda Hotel La Extremadura
                    </h2>

                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <LocationIcon />
                        <p className="text-sm text-zinc-200 sm:text-base">
                            Cra. 32 #71 sur 220, interior 127 - Sabaneta, Antioquia.
                        </p>
                    </div>

                    <p className="mt-5 text-sm text-zinc-300 sm:text-base">
                        Beneficios incluidos: Desayuno, seguro hotelero y zonas húmedas.
                    </p>

                    <div className="mt-8">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-200">
                            Tarifas Especiales (Código L.A.M.A.)
                        </p>
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {hotelRates.map((rate) => (
                                <article
                                    key={rate.roomType}
                                    className="rounded-xl border border-white/10 bg-black/45 p-4"
                                >
                                    <p className="text-sm text-zinc-300">{rate.roomType}</p>
                                    <p className="mt-2 text-xl font-bold text-orange-300">{rate.price}</p>
                                </article>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8">
                        <Link
                            href="https://wa.me/573183352439?text=Hola,%20quiero%20hacer%20una%20reserva%20para%20el%20XIII%20Aniversario%20usando%20el%20c%C3%B3digo%20L.A.M.A."
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-zinc-950 transition hover:bg-orange-400"
                        >
                            <WhatsAppIcon />
                            Reservar con Código L.A.M.A.
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
