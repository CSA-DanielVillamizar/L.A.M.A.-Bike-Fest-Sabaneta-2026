import { CountdownTimer } from "@/components/sections/CountdownTimer";

export function HeroSection() {
    return (
        <section id="inicio" className="relative overflow-hidden">
            <video
                autoPlay
                loop
                muted
                playsInline
                poster="/images/hero-bg-poster.jpg"
                className="absolute inset-0 h-full w-full object-cover -z-10"
            >
                <source src="/images/hero-bg.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 -z-10 bg-black/65" />
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_12%,rgba(249,115,22,0.28),transparent_42%),radial-gradient(circle_at_18%_90%,rgba(220,38,38,0.22),transparent_48%)]" />

            <div className="mx-auto flex w-full max-w-6xl flex-col px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:pb-24">
                {/* XIII Aniversario badge */}
                <p className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-amber-400/50 bg-amber-400/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.26em] text-amber-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    XIII Aniversario L.A.M.A. Medellín
                </p>

                <p className="mb-4 inline-flex w-fit rounded-full border border-orange-500/40 bg-orange-500/15 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-orange-200">
                    Festival Internacional De Motociclismo
                </p>

                <h1 className="font-display max-w-4xl text-3xl font-extrabold uppercase leading-[1.1] tracking-tight text-zinc-100 sm:text-5xl lg:text-6xl">
                    L.A.M.A. Bike Fest Sabaneta 2026
                </h1>

                <p className="mt-4 text-sm uppercase tracking-[0.22em] text-orange-300 sm:text-base">
                    Exhibición · Stands · Música · Hermandad
                </p>

                <p className="mt-3 max-w-3xl text-base font-semibold text-zinc-100 sm:text-lg">
                    Sabaneta, Antioquia · 26, 27 y 28 de Junio de 2026
                </p>

                <p className="mt-1.5 text-sm text-zinc-400 sm:text-base">
                    Recibiendo delegaciones de{" "}
                    <span className="font-semibold text-orange-300">26 países invitados</span>
                </p>

                <CountdownTimer />

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <a
                        href="#registro"
                        className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-bold uppercase tracking-wider text-zinc-950 transition hover:bg-orange-400"
                    >
                        ¡Regístrate como Club Invitado!
                    </a>
                    <a
                        href="#contacto"
                        className="inline-flex items-center justify-center rounded-full border border-orange-300/60 bg-black/25 px-6 py-3 text-sm font-bold uppercase tracking-wider text-zinc-100 transition hover:border-orange-300 hover:text-orange-200"
                    >
                        Conviértete en Patrocinador
                    </a>
                </div>
            </div>
        </section>
    );
}
