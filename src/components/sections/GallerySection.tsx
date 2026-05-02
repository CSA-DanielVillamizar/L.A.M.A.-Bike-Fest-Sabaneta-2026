const galleryImages = [
    {
        src: "/images/galeria/caravana1.jpg",
        title: "Logística de Clase Mundial",
        desc: "Ejecución vial perfecta y coordinada para garantizar la seguridad de cada participante.",
    },
    {
        src: "/images/galeria/caravana2.jpg",
        title: "El Poder de la Convocatoria",
        desc: "Miles de máquinas rodando bajo un esquema de orden ejemplar, replicable en Sabaneta.",
    },
    {
        src: "/images/galeria/abrazo1.jpg",
        title: "Hermandad sin Fronteras",
        desc: "Lazos inquebrantables entre moteros de América y Europa.",
    },
    {
        src: "/images/galeria/abrazo2.jpg",
        title: "Cultura y Convivencia",
        desc: "El punto de encuentro de la élite mototurística del continente.",
    },
    {
        src: "/images/galeria/AlianzaPais.jpg",
        title: "Respaldo Institucional",
        desc: "Eventos certificados y apoyados por ministerios, garantizando éxito y seguridad legal.",
    },
    {
        src: "/images/galeria/concierto1.jpg",
        title: "Celebración de Leyenda",
        desc: "La pasión motera unida con el folclor y la fiesta internacional de Sabaneta.",
    },
    {
        src: "/images/galeria/concierto2.jpg",
        title: "Vitrina de Alto Impacto",
        desc: "Posicionamiento estratégico de marca ante una audiencia internacional masiva.",
    },
] as const;

const cardHeights = [
    "aspect-[5/4] lg:aspect-[4/5]",
    "aspect-[5/4]",
    "aspect-[5/4] lg:aspect-[4/5]",
    "aspect-[5/4]",
    "aspect-[5/4] lg:aspect-[4/5]",
    "aspect-[5/4]",
    "aspect-[5/4] lg:col-span-2",
] as const;

export function GallerySection() {
    return (
        <section className="bg-zinc-950 py-16 sm:py-20">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-300">
                    Galería de Impacto
                </p>
                <h2 className="mt-3 font-display text-2xl font-bold text-zinc-100 sm:text-3xl">
                    Nuestra Historia de Éxito: De El Salvador a Sabaneta
                </h2>
                <p className="mt-4 max-w-3xl text-sm text-zinc-300 sm:text-base">
                    Revive la magnitud y la hermandad de nuestros encuentros internacionales.
                </p>

                <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {galleryImages.map((item, index) => (
                        <article
                            key={item.src}
                            className="group relative overflow-hidden rounded-lg border border-white/10 bg-zinc-900/40"
                        >
                            <div className={`relative overflow-hidden ${cardHeights[index] ?? "aspect-[5/4]"}`}>
                                <img
                                    src={item.src}
                                    alt={item.title}
                                    loading={index < 3 ? "eager" : "lazy"}
                                    className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105 group-hover:brightness-110"
                                />
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10 opacity-100 transition duration-300 lg:opacity-0 lg:group-hover:opacity-100" />

                            <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5">
                                <p className="text-sm font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)] sm:text-base">
                                    {item.title}
                                </p>
                                <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-100/95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
                                    {item.desc}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
