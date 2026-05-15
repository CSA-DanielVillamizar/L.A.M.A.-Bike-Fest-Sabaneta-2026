import Image from "next/image";

export function PresidentLetterSection() {
    return (
        <section id="carta-presidencia" style={{ backgroundColor: "#0d0d0d" }} className="py-20 text-white">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
                    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-yellow-500/40 shadow-[0_0_30px_rgba(234,179,8,0.12)]">
                        <Image
                            src="/images/Presidente-LAMA.png"
                            alt="Presidente L.A.M.A. Medellin"
                            width={900}
                            height={1200}
                            className="h-auto w-full object-cover"
                            priority={false}
                        />
                    </div>

                    <div className="space-y-6 border-l-4 border-yellow-500 pl-6 lg:pl-8">
                        <h2 className="font-serif text-3xl leading-tight text-white md:text-4xl">
                            Mensaje Oficial de Presidencia
                        </h2>

                        <p className="text-base leading-relaxed text-zinc-200">
                            Respetados Hermanos Motociclistas y Aliados Estratégicos,
                        </p>

                        <p className="text-base leading-relaxed text-zinc-300">
                            Medellín y Sabaneta se preparan para ser el epicentro del mundo motor. Es un honor
                            extenderles una invitación que trasciende nuestras fronteras: ser los protagonistas de
                            la "Gran Caravana Internacional" en el marco del L.A.M.A. BIKE FEST 2026.
                        </p>

                        <p className="text-base leading-relaxed text-zinc-300">
                            Este año, nuestro territorio recibe a delegaciones oficiales de 26 países. No es solo la
                            celebración de nuestro XIII Aniversario; es la oportunidad de mostrarle al mundo la
                            fuerza, el orden, el respeto y la pasión que definen a la cultura motera. Uniremos a
                            todo un continente rodando bajo una misma bandera en las históricas Fiestas del Plátano.
                        </p>

                        <p className="text-base leading-relaxed text-zinc-300">
                            Los invitamos a encender los motores y ser parte de esta columna de marcha que hará
                            historia. Su presencia es el verdadero motor de esta hermandad.
                        </p>

                        <div className="space-y-1 pt-2">
                            <p className="font-serif text-lg italic text-yellow-400">
                                Daniel Andrey Villamizar Araque
                            </p>
                            <p className="text-sm text-zinc-300">Presidente Capítulo L.A.M.A. Medellín</p>
                            <p className="text-sm text-zinc-300">Presidente Región Norte – L.A.M.A. Colombia</p>
                        </div>

                        <div className="pt-4">
                            <a
                                href="/images/XIII Aniversario L.A.M.A. Medellín & L.A.M.A. Bike Fest 2026 🇨🇴.pdf"
                                download
                                className="inline-flex items-center rounded-full border border-yellow-500 bg-yellow-500/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-yellow-300 transition hover:bg-yellow-500/20"
                            >
                                Descargar Dosier Oficial
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
