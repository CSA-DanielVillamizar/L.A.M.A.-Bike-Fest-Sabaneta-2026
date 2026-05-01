"use client";

import { FormEvent, useState } from "react";

type ActiveTab = "clubs" | "brands";

const motorcycleTypes = [
    "Alto cilindraje",
    "Clásicas",
    "Turismo",
    "Custom",
    "Otro",
];

const sponsorCategories = ["Motos", "Accesorios", "Gastronomía", "Servicios"];

const sponsorInterests = [
    "Stand de exhibición",
    "Patrocinio oficial",
    "Activación de marca",
];

const OFFICIAL_WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/KnwJ31J2ddBJsbc0Jr3Ufl";

export function RegistrationForms() {
    const [activeTab, setActiveTab] = useState<ActiveTab>("clubs");
    const [clubLoading, setClubLoading] = useState(false);
    const [clubSuccess, setClubSuccess] = useState(false);
    const [sponsorLoading, setSponsorLoading] = useState(false);
    const [sponsorSuccess, setSponsorSuccess] = useState(false);
    const [clubMessage, setClubMessage] = useState("");
    const [sponsorMessage, setSponsorMessage] = useState("");

    const handleSponsorDossierRequest = () => {
        const message = "Hola Daniel, estoy interesado en participar como patrocinador en el XIII Aniversario L.A.M.A. Medellín. Me gustaría recibir el Dossier Comercial para conocer los planes de marca.";
        window.open(`https://wa.me/573106328171?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    };

    const handleClubSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setClubLoading(true);
        setClubSuccess(false);
        setClubMessage("");

        try {
            const formData = new FormData(event.currentTarget);
            const data = Object.fromEntries(formData.entries());

            const response = await fetch("/api/register/club", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Error en la solicitud");
            }

            await response.json();
            setClubSuccess(true);
            setClubMessage("¡Club registrado correctamente! Te contactaremos pronto.");
            event.currentTarget.reset();
            setTimeout(() => setClubSuccess(false), 5000);
        } catch (error) {
            setClubMessage("Error al registrar el club. Intenta nuevamente.");
            console.error(error);
        } finally {
            setClubLoading(false);
        }
    };

    const handleSponsorSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSponsorLoading(true);
        setSponsorSuccess(false);
        setSponsorMessage("");

        try {
            const formData = new FormData(event.currentTarget);
            const intereses = formData.getAll("intereses");
            const data = {
                ...Object.fromEntries(formData.entries()),
                intereses,
            };

            const response = await fetch("/api/register/sponsor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Error en la solicitud");
            }

            setSponsorSuccess(true);
            setSponsorMessage(result.message || "¡Solicitud enviada! Pronto recibirás el dossier comercial.");
            event.currentTarget.reset();
            setTimeout(() => setSponsorSuccess(false), 5000);
        } catch (error) {
            setSponsorMessage(error instanceof Error ? error.message : "Error al enviar la solicitud. Intenta nuevamente.");
            console.error(error);
        } finally {
            setSponsorLoading(false);
        }
    };

    return (
        <section id="clubes" className="py-16 sm:py-20">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                <div id="registro" className="rounded-2xl border border-white/10 bg-black/35 p-6 sm:p-8">
                    <div className="inline-flex rounded-full border border-white/10 bg-zinc-900/80 p-1">
                        <button
                            type="button"
                            onClick={() => setActiveTab("clubs")}
                            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition sm:text-sm ${activeTab === "clubs"
                                ? "bg-orange-500 text-zinc-950"
                                : "text-zinc-300 hover:text-zinc-100"
                                }`}
                        >
                            Clubes Invitados
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("brands")}
                            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition sm:text-sm ${activeTab === "brands"
                                ? "bg-orange-500 text-zinc-950"
                                : "text-zinc-300 hover:text-zinc-100"
                                }`}
                        >
                            Marcas y Patrocinadores
                        </button>
                    </div>

                    {clubSuccess && activeTab === "clubs" && (
                        <div className="mt-4 rounded-lg border border-green-500/50 bg-green-500/15 px-4 py-4 text-sm text-green-300">
                            <p>{clubMessage}</p>
                            <div className="mt-4 flex justify-center">
                                <a
                                    href={OFFICIAL_WHATSAPP_GROUP_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-center text-xs font-bold uppercase tracking-[0.08em] text-white transition hover:brightness-110 sm:text-sm"
                                >
                                    <span aria-hidden="true">💬</span>
                                    UNIRME AL GRUPO OFICIAL DE WHATSAPP
                                </a>
                            </div>
                        </div>
                    )}

                    {clubMessage && !clubSuccess && activeTab === "clubs" && (
                        <div className="mt-4 rounded-lg border border-red-500/50 bg-red-500/15 px-4 py-3 text-sm text-red-300">
                            {clubMessage}
                        </div>
                    )}

                    {sponsorSuccess && activeTab === "brands" && (
                        <div className="mt-4 rounded-lg border border-green-500/50 bg-green-500/15 px-4 py-3 text-sm text-green-300">
                            {sponsorMessage}
                        </div>
                    )}

                    {sponsorMessage && !sponsorSuccess && activeTab === "brands" && (
                        <div className="mt-4 rounded-lg border border-red-500/50 bg-red-500/15 px-4 py-3 text-sm text-red-300">
                            {sponsorMessage}
                        </div>
                    )}

                    {activeTab === "clubs" ? (
                        <form onSubmit={handleClubSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
                            <label className="flex flex-col gap-2 text-sm text-zinc-300">
                                Nombre del Club
                                <input name="nombreClub" required disabled={clubLoading} className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring disabled:opacity-60" />
                            </label>

                            <label className="flex flex-col gap-2 text-sm text-zinc-300">
                                Presidente / Delegado
                                <input name="delegado" required disabled={clubLoading} className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring disabled:opacity-60" />
                            </label>

                            <label className="flex flex-col gap-2 text-sm text-zinc-300">
                                Teléfono de Contacto (WhatsApp)
                                <input
                                    name="telefono"
                                    type="tel"
                                    inputMode="numeric"
                                    pattern="[0-9]{7,15}"
                                    required
                                    disabled={clubLoading}
                                    className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring disabled:opacity-60"
                                />
                            </label>

                            <label className="flex flex-col gap-2 text-sm text-zinc-300">
                                Ciudad/Municipio de origen
                                <input name="ciudad" required disabled={clubLoading} className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring disabled:opacity-60" />
                            </label>

                            <label className="flex flex-col gap-2 text-sm text-zinc-300">
                                Número de asistentes estimados
                                <input name="asistentes" type="number" min={1} required disabled={clubLoading} className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring disabled:opacity-60" />
                            </label>

                            <label className="flex flex-col gap-2 text-sm text-zinc-300 sm:col-span-2">
                                Tipo de Motos
                                <select name="tipoMoto" required disabled={clubLoading} className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring disabled:opacity-60">
                                    <option value="">Selecciona una opción</option>
                                    {motorcycleTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <div className="sm:col-span-2">
                                <button
                                    type="submit"
                                    disabled={clubLoading}
                                    className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-zinc-950 transition hover:bg-orange-400 disabled:opacity-60"
                                >
                                    {clubLoading ? "Enviando..." : "Confirmar Asistencia"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleSponsorSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
                            <label className="flex flex-col gap-2 text-sm text-zinc-300">
                                Nombre de la Empresa
                                <input name="empresa" required disabled={sponsorLoading} className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring disabled:opacity-60" />
                            </label>

                            <label className="flex flex-col gap-2 text-sm text-zinc-300">
                                Email de contacto
                                <input name="email" type="email" required disabled={sponsorLoading} className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring disabled:opacity-60" />
                            </label>

                            <label className="flex flex-col gap-2 text-sm text-zinc-300">
                                Teléfono
                                <input name="telefono" type="tel" required disabled={sponsorLoading} className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring disabled:opacity-60" />
                            </label>

                            <label className="flex flex-col gap-2 text-sm text-zinc-300">
                                Categoría
                                <select name="categoria" required disabled={sponsorLoading} className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring disabled:opacity-60">
                                    <option value="">Selecciona una categoría</option>
                                    {sponsorCategories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <fieldset className="sm:col-span-2" disabled={sponsorLoading}>
                                <legend className="text-sm text-zinc-300">Interés</legend>
                                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                                    {sponsorInterests.map((interest) => (
                                        <label
                                            key={interest}
                                            className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-200 disabled:opacity-60"
                                        >
                                            <input
                                                type="checkbox"
                                                name="intereses"
                                                value={interest}
                                                disabled={sponsorLoading}
                                                className="accent-orange-500"
                                            />
                                            {interest}
                                        </label>
                                    ))}
                                </div>
                            </fieldset>

                            <div className="sm:col-span-2">
                                <button
                                    type="button"
                                    onClick={handleSponsorDossierRequest}
                                    className="inline-flex items-center justify-center rounded-full border border-orange-400 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-orange-300 transition hover:bg-orange-500/10 disabled:opacity-60"
                                >
                                    Solicitar Dossier Comercial
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}

