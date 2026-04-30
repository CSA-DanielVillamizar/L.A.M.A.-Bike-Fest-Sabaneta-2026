"use client";

import { jsPDF } from "jspdf";
import { FormEvent, useMemo, useState } from "react";

const PARTICIPANT_CATEGORIES = [
    "DAMA L.A.M.A.",
    "FULL COLOR MEMBER",
    "ROCKET PROSPECT",
    "PROSPECT",
    "ESPOSA",
    "PAREJA",
    "INVITADO",
    "CLUB HERMANO / INVITADO (Solo Sábado)",
] as const;

const CHAPTERS = [
    "Cartagena",
    "Barranquilla",
    "Puerto Colombia",
    "Zenu",
    "Medellín",
    "Valle de Aburrá",
    "Pereira",
    "Armenia",
    "Manizales",
    "Cali",
    "Popayán",
    "Neiva",
    "Ibagué",
    "Mocoa",
    "Bucaramanga",
    "Floridablanca",
    "Cúcuta",
    "Pasto",
    "Bogotá",
    "Sabana",
    "Duitama",
    "Internacional",
    "Otros",
] as const;

const SORTED_CHAPTERS = [...CHAPTERS].sort((a, b) => a.localeCompare(b, "es"));

const DIRECTIVE_SCOPES = ["Capítulo", "Región", "País", "Internacional"] as const;

const DIRECTIVE_ROLES = [
    "Presidente",
    "MTO",
    "Road Captain",
    "Vicepresidente",
    "Secretario",
    "Tesorero",
    "Sargento de Armas",
] as const;

const JERSEY_SIZES = ["S", "M", "L", "XL", "XXL"] as const;
const COMPANION_CATEGORIES = ["PAREJA", "INVITADO", "HIJO/A", "CLUB HERMANO (Solo Sábado)"] as const;

const BASE_COST = 100000;
const SATURDAY_PASS_COST = 85000;
const COMPANION_COST = 100000;
const JERSEY_COST = 65000;

function getParticipantBaseCost(category: string): number {
    return category === "CLUB HERMANO / INVITADO (Solo Sábado)" ? SATURDAY_PASS_COST : BASE_COST;
}

function getParticipantBaseLabel(category: string): string {
    return category === "CLUB HERMANO / INVITADO (Solo Sábado)"
        ? "Pase Sábado Titular"
        : "Inscripción L.A.M.A. Titular";
}

function getCompanionBaseCost(category: string): number {
    return category === "CLUB HERMANO (Solo Sábado)" ? SATURDAY_PASS_COST : COMPANION_COST;
}

function getCompanionBaseLabel(category: string): string {
    return category === "CLUB HERMANO (Solo Sábado)"
        ? "Pase Sábado Club Hermano"
        : `Acompañante ${category || "general"}`;
}

type CompanionForm = {
    fullName: string;
    documentId: string;
    category: string;
    wantsJersey: boolean;
    jerseySize: string;
};

type FormValues = {
    participantCategory: string;
    fullName: string;
    documentId: string;
    eps: string;
    emergencyName: string;
    emergencyPhone: string;
    chapter: string;
    otherChapter: string;
    isDirective: boolean;
    directiveScope: string;
    directiveRole: string;
    arrivalDate: string;
    medicalCondition: string;
    wantsJersey: boolean;
    jerseySize: string;
    hasCompanions: boolean;
    companionsCount: number;
    companions: CompanionForm[];
};

type SuccessRegistration = {
    id: string;
    fullName: string;
    chapter: string;
    totalToPay: number;
    participantCategory: string;
    wantsJersey: boolean;
    jerseySize: string;
    companions: CompanionForm[];
};

const emptyCompanion = (): CompanionForm => ({
    fullName: "",
    documentId: "",
    category: "",
    wantsJersey: false,
    jerseySize: "",
});

const initialForm: FormValues = {
    participantCategory: "",
    fullName: "",
    documentId: "",
    eps: "",
    emergencyName: "",
    emergencyPhone: "",
    chapter: "",
    otherChapter: "",
    isDirective: false,
    directiveScope: "",
    directiveRole: "",
    arrivalDate: "",
    medicalCondition: "",
    wantsJersey: false,
    jerseySize: "",
    hasCompanions: false,
    companionsCount: 0,
    companions: [],
};

function formatCop(value: number): string {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(value);
}

export function OfficialRegistrationForm() {
    const [form, setForm] = useState<FormValues>(initialForm);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successRegistration, setSuccessRegistration] = useState<SuccessRegistration | null>(null);

    const participantBaseTotal = getParticipantBaseCost(form.participantCategory);
    const companionsBaseTotal = form.hasCompanions
        ? form.companions.reduce((acc, companion) => acc + getCompanionBaseCost(companion.category), 0)
        : 0;
    const mainJerseyTotal = form.wantsJersey ? JERSEY_COST : 0;
    const companionsJerseyTotal = form.hasCompanions
        ? form.companions.reduce((acc, companion) => acc + (companion.wantsJersey ? JERSEY_COST : 0), 0)
        : 0;

    const totalToPay = useMemo(
        () => participantBaseTotal + companionsBaseTotal + mainJerseyTotal + companionsJerseyTotal,
        [participantBaseTotal, companionsBaseTotal, mainJerseyTotal, companionsJerseyTotal],
    );

    const updateField = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const setCompanionsCount = (count: number) => {
        setForm((current) => {
            const normalizedCount = Math.max(1, count);
            const existing = current.companions;
            const resized = Array.from({ length: normalizedCount }, (_, index) => existing[index] ?? emptyCompanion());

            return {
                ...current,
                companionsCount: normalizedCount,
                companions: resized,
            };
        });
    };

    const updateCompanion = <K extends keyof CompanionForm>(index: number, field: K, value: CompanionForm[K]) => {
        setForm((current) => {
            const companions = [...current.companions];
            const currentCompanion = companions[index] ?? emptyCompanion();
            companions[index] = { ...currentCompanion, [field]: value };

            if (field === "wantsJersey" && value === false) {
                companions[index].jerseySize = "";
            }

            return {
                ...current,
                companions,
            };
        });
    };

    const buildWhatsappUrl = (registration: SuccessRegistration) => {
        const participantBaseLabel = getParticipantBaseLabel(registration.participantCategory);
        const participantBaseCost = getParticipantBaseCost(registration.participantCategory);
        const companionsText = registration.companions.length
            ? registration.companions
                .map((c, i) => {
                    const companionCost = getCompanionBaseCost(c.category);
                    const jerseyText = c.wantsJersey ? ` + Camiseta ${c.jerseySize} (${formatCop(JERSEY_COST)})` : "";
                    return `${i + 1}. ${c.fullName} (${c.category}) - ${formatCop(companionCost)}${jerseyText}`;
                })
                .join("\n")
            : "Sin acompañantes";

        const whatsappMessage = [
            "Hola, envio mi resumen de inscripción al XIII Aniversario L.A.M.A. Medellín:",
            `ID de registro: ${registration.id}`,
            `Nombre: ${registration.fullName}`,
            `Capítulo: ${registration.chapter}`,
            `Categoría: ${registration.participantCategory}`,
            `${participantBaseLabel}: ${formatCop(participantBaseCost)}`,
            `Camiseta titular: ${registration.wantsJersey ? `Sí - ${registration.jerseySize} (${formatCop(JERSEY_COST)})` : "No"}`,
            `Total a pagar: ${formatCop(registration.totalToPay)}`,
            `Acompañantes:\n${companionsText}`,
            "Por este medio adjuntaré el comprobante de pago.",
        ].join("\n");

        return `https://wa.me/573105127314?text=${encodeURIComponent(whatsappMessage)}`;
    };

    const handleWhatsappRedirect = () => {
        if (!successRegistration) {
            return;
        }

        window.open(buildWhatsappUrl(successRegistration), "_blank", "noopener,noreferrer");
    };

    const generatePDF = () => {
        if (!successRegistration) {
            return;
        }

        try {
            const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
            const pageW = doc.internal.pageSize.getWidth();
            const left = 20;
            const right = pageW - left;
            const lineH = 7;
            let y = 20;

            const addLine = (label: string, value: string) => {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(10);
                doc.text(label, left, y);
                doc.setFont("helvetica", "normal");
                doc.text(value, left + 50, y, { maxWidth: right - (left + 50) });
                y += lineH;
            };

            doc.setFont("helvetica", "bold");
            doc.setFontSize(16);
            doc.text("XIII Aniversario L.A.M.A. Medellín", pageW / 2, y, { align: "center" });
            y += 8;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.text("Resumen Oficial de Inscripción", pageW / 2, y, { align: "center" });
            y += 9;

            doc.setDrawColor(180);
            doc.line(left, y, right, y);
            y += 8;

            addLine("ID de Registro:", successRegistration.id);
            addLine("Nombre:", successRegistration.fullName);
            addLine("Capítulo:", successRegistration.chapter);
            addLine("Categoría:", successRegistration.participantCategory);
            addLine(getParticipantBaseLabel(successRegistration.participantCategory) + ":", formatCop(getParticipantBaseCost(successRegistration.participantCategory)));
            addLine(
                "Camiseta titular:",
                successRegistration.wantsJersey ? `Sí - Talla ${successRegistration.jerseySize || "por definir"} (${formatCop(JERSEY_COST)})` : "No",
            );

            y += 2;
            doc.setFont("helvetica", "bold");
            doc.text("Acompañantes:", left, y);
            y += lineH;
            doc.setFont("helvetica", "normal");

            if (successRegistration.companions.length === 0) {
                doc.text("Sin acompañantes", left + 4, y);
                y += lineH;
            } else {
                successRegistration.companions.forEach((companion, index) => {
                    const companionText = `${index + 1}. ${companion.fullName} - Doc: ${companion.documentId} - ${companion.category} - ${formatCop(getCompanionBaseCost(companion.category))}${companion.wantsJersey ? ` + Camiseta ${companion.jerseySize} (${formatCop(JERSEY_COST)})` : " - Sin camiseta"}`;
                    doc.text(companionText, left + 2, y, { maxWidth: right - left - 2 });
                    y += lineH;
                });
            }

            y += 2;
            addLine("Total a pagar:", formatCop(successRegistration.totalToPay));

            y += 2;
            doc.line(left, y, right, y);
            y += 8;

            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text("Datos bancarios para el pago", left, y);
            y += lineH;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.text("Bancolombia Ahorros: 23000013774", left, y);
            y += lineH;
            doc.text("Titular: Fundación L.A.M.A. Medellín", left, y);

            doc.save("Inscripcion-LAMA-Medellin.pdf");
        } catch (error) {
            console.error("Error generando PDF:", error);
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setErrorMessage("");
        setSuccessRegistration(null);

        try {
            const normalizedChapter = form.chapter === "Otros" ? form.otherChapter.trim() : form.chapter;

            if (!normalizedChapter) {
                throw new Error("Debes indicar tu capítulo en Pertenencia L.A.M.A.");
            }

            const companions = form.hasCompanions ? form.companions : [];

            if (form.hasCompanions && companions.length !== form.companionsCount) {
                throw new Error("Debes completar la información de todos los acompañantes.");
            }

            for (const companion of companions) {
                if (!companion.fullName.trim() || !companion.documentId.trim() || !companion.category.trim()) {
                    throw new Error("Cada acompañante debe tener nombre, documento y categoría.");
                }

                if (companion.wantsJersey && !companion.jerseySize) {
                    throw new Error("Si un acompañante desea camiseta, debes seleccionar su talla.");
                }
            }

            const payload = {
                ...form,
                chapter: normalizedChapter,
                directiveScope: form.isDirective ? form.directiveScope : null,
                directiveRole: form.isDirective ? form.directiveRole : null,
                jerseySize: form.wantsJersey ? form.jerseySize : null,
                companionsCount: form.hasCompanions ? form.companionsCount : 0,
                companions,
            };

            const response = await fetch("/api/register/official", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const contentType = response.headers.get("content-type") || "";
            let result: { error?: string; id?: string; totalToPay?: number } = {};

            if (contentType.includes("application/json")) {
                result = await response.json();
            } else {
                const rawText = await response.text();
                if (!response.ok) {
                    throw new Error(
                        rawText?.trim()
                            ? `Error del servidor (${response.status}): ${rawText.slice(0, 180)}`
                            : `Error del servidor (${response.status}).`,
                    );
                }
            }

            if (!response.ok) {
                throw new Error(result.error || "No fue posible registrar la inscripción.");
            }

            if (!result.id) {
                throw new Error("El servidor no devolvió el ID del registro.");
            }

            setSuccessRegistration({
                id: result.id,
                fullName: form.fullName,
                chapter: normalizedChapter,
                totalToPay: result.totalToPay ?? totalToPay,
                participantCategory: form.participantCategory,
                wantsJersey: form.wantsJersey,
                jerseySize: form.wantsJersey ? form.jerseySize : "",
                companions: companions.map((companion) => ({
                    ...companion,
                    fullName: companion.fullName.trim(),
                    documentId: companion.documentId.trim(),
                })),
            });

            setForm(initialForm);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Error al enviar la inscripción.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="registro-oficial" className="py-16 sm:py-20">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                <div className="rounded-2xl border border-white/10 bg-black/35 p-6 sm:p-8">
                    <div className="mb-6">
                        <p className="text-xs uppercase tracking-[0.2em] text-orange-300">XIII Aniversario L.A.M.A. Medellín</p>
                        <h2 className="mt-2 text-3xl font-black text-zinc-50 sm:text-4xl">
                            Formulario Oficial de Inscripción
                        </h2>
                        <p className="mt-2 text-sm text-zinc-300">
                            Inscripción L.A.M.A. ({formatCop(BASE_COST)}) incluye cena de gala. Pase Club Hermano Solo Sábado ({formatCop(SATURDAY_PASS_COST)}) incluye almuerzo y concierto en La Molienda.
                        </p>
                    </div>

                    {errorMessage && (
                        <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/15 px-4 py-3 text-sm text-red-300">
                            {errorMessage}
                        </div>
                    )}

                    {successRegistration ? (
                        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                            <div className="rounded-2xl border border-green-500/40 bg-zinc-950/80 p-6">
                                <p className="text-xs uppercase tracking-[0.2em] text-green-300">Registro completado</p>
                                <h3 className="mt-2 text-3xl font-black text-zinc-50">Registro completado con éxito</h3>
                                <p className="mt-2 text-sm text-zinc-300">
                                    Ya puedes realizar el pago y enviar el soporte por WhatsApp para finalizar tu proceso.
                                </p>

                                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
                                        <p className="text-xs uppercase tracking-[0.12em] text-zinc-400">ID de registro</p>
                                        <p className="mt-2 break-all text-lg font-bold text-zinc-100">{successRegistration.id}</p>
                                    </div>
                                    <div className="rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
                                        <p className="text-xs uppercase tracking-[0.12em] text-zinc-400">Total a pagar</p>
                                        <p className="mt-2 text-2xl font-black text-orange-300">
                                            {formatCop(successRegistration.totalToPay)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4 text-sm text-zinc-200">
                                    <p><span className="font-semibold text-zinc-100">Nombre:</span> {successRegistration.fullName}</p>
                                    <p className="mt-2"><span className="font-semibold text-zinc-100">Capítulo:</span> {successRegistration.chapter}</p>
                                    <p className="mt-2"><span className="font-semibold text-zinc-100">Categoría:</span> {successRegistration.participantCategory}</p>
                                    <p className="mt-2"><span className="font-semibold text-zinc-100">{getParticipantBaseLabel(successRegistration.participantCategory)}:</span> {formatCop(getParticipantBaseCost(successRegistration.participantCategory))}</p>
                                    <p className="mt-2">
                                        <span className="font-semibold text-zinc-100">Camiseta titular:</span>{" "}
                                        {successRegistration.wantsJersey ? `Sí - ${successRegistration.jerseySize} (${formatCop(JERSEY_COST)})` : "No"}
                                    </p>
                                    <div className="mt-3">
                                        <p><span className="font-semibold text-zinc-100">Acompañantes:</span> {successRegistration.companions.length}</p>
                                        {successRegistration.companions.map((companion, i) => (
                                            <p key={`${companion.documentId}-${i}`} className="mt-1 pl-3 text-zinc-300">
                                                • {companion.fullName} - {companion.category} - {formatCop(getCompanionBaseCost(companion.category))} - Doc: {companion.documentId} - {companion.wantsJersey ? `Camiseta ${companion.jerseySize} (${formatCop(JERSEY_COST)})` : "Sin camiseta"}
                                            </p>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4 text-sm text-zinc-300">
                                    <p className="font-semibold text-zinc-100">Datos bancarios para el pago</p>
                                    <p className="mt-2">Bancolombia Ahorros: 23000013774</p>
                                    <p>Titular: Fundación L.A.M.A. Medellín</p>
                                    <div className="mt-4 flex justify-center">
                                        <img
                                            src="/images/QRBancolombia.jpeg"
                                            alt="QR Bancolombia para transferencia"
                                            className="h-44 w-44 rounded-lg object-contain"
                                        />
                                    </div>
                                </div>
                            </div>

                            <aside className="h-fit rounded-2xl border border-white/10 bg-black/30 p-6">
                                <h4 className="text-lg font-bold text-zinc-50">Siguiente paso</h4>
                                <p className="mt-3 text-sm text-zinc-300">
                                    Realiza el pago por el valor indicado y luego comparte el comprobante por WhatsApp junto con tu ID de registro.
                                </p>

                                <div className="mt-6 grid gap-3">
                                    <button
                                        type="button"
                                        onClick={handleWhatsappRedirect}
                                        className="inline-flex w-full items-center justify-center rounded-full bg-green-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-zinc-950 transition hover:bg-green-400"
                                    >
                                        Enviar Comprobante por WhatsApp
                                    </button>

                                    <button
                                        type="button"
                                        onClick={generatePDF}
                                        className="inline-flex w-full items-center justify-center rounded-full border border-zinc-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-zinc-100 transition hover:border-orange-300 hover:text-orange-200"
                                    >
                                        Descargar Resumen (PDF)
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSuccessRegistration(null);
                                            setErrorMessage("");
                                        }}
                                        className="inline-flex w-full items-center justify-center rounded-full border border-transparent px-6 py-3 text-sm font-semibold text-zinc-400 transition hover:text-zinc-200"
                                    >
                                        Registrar otra persona
                                    </button>
                                </div>
                            </aside>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[2fr_1fr]">
                            <div className="grid gap-5 sm:grid-cols-2">
                                <h3 className="sm:col-span-2 text-sm font-bold uppercase tracking-[0.16em] text-orange-200">Tipo de Participante</h3>

                                <label className="sm:col-span-2 flex flex-col gap-2 text-sm text-zinc-300">
                                    Categoría
                                    <select
                                        required
                                        value={form.participantCategory}
                                        onChange={(event) => updateField("participantCategory", event.target.value)}
                                        className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring"
                                    >
                                        <option value="">Selecciona una categoría</option>
                                        {PARTICIPANT_CATEGORIES.map((category) => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </label>

                                <h3 className="sm:col-span-2 text-sm font-bold uppercase tracking-[0.16em] text-orange-200">Datos Personales</h3>

                                <label className="sm:col-span-2 flex flex-col gap-2 text-sm text-zinc-300">
                                    Nombre completo
                                    <input
                                        required
                                        value={form.fullName}
                                        onChange={(event) => updateField("fullName", event.target.value)}
                                        className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring"
                                    />
                                </label>

                                <label className="flex flex-col gap-2 text-sm text-zinc-300">
                                    Documento (C.C./Pasaporte)
                                    <input
                                        required
                                        value={form.documentId}
                                        onChange={(event) => updateField("documentId", event.target.value)}
                                        className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring"
                                    />
                                </label>

                                <label className="flex flex-col gap-2 text-sm text-zinc-300">
                                    EPS
                                    <input
                                        required
                                        value={form.eps}
                                        onChange={(event) => updateField("eps", event.target.value)}
                                        className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring"
                                    />
                                </label>

                                <h3 className="sm:col-span-2 text-sm font-bold uppercase tracking-[0.16em] text-orange-200">Contacto de Emergencia</h3>

                                <label className="flex flex-col gap-2 text-sm text-zinc-300">
                                    Nombre
                                    <input
                                        required
                                        value={form.emergencyName}
                                        onChange={(event) => updateField("emergencyName", event.target.value)}
                                        className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring"
                                    />
                                </label>

                                <label className="flex flex-col gap-2 text-sm text-zinc-300">
                                    Teléfono
                                    <input
                                        required
                                        value={form.emergencyPhone}
                                        onChange={(event) => updateField("emergencyPhone", event.target.value)}
                                        className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring"
                                    />
                                </label>

                                <h3 className="sm:col-span-2 text-sm font-bold uppercase tracking-[0.16em] text-orange-200">Pertenencia L.A.M.A.</h3>

                                <label className="sm:col-span-2 flex flex-col gap-2 text-sm text-zinc-300">
                                    Capítulo
                                    <select
                                        required
                                        value={form.chapter}
                                        onChange={(event) => updateField("chapter", event.target.value)}
                                        className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring"
                                    >
                                        <option value="">Selecciona tu capítulo</option>
                                        {SORTED_CHAPTERS.map((chapter) => (
                                            <option key={chapter} value={chapter}>{chapter}</option>
                                        ))}
                                    </select>
                                </label>

                                {form.chapter === "Otros" && (
                                    <label className="sm:col-span-2 flex flex-col gap-2 text-sm text-zinc-300">
                                        Especifica tu capítulo
                                        <input
                                            required
                                            value={form.otherChapter}
                                            onChange={(event) => updateField("otherChapter", event.target.value)}
                                            placeholder="Escribe el nombre de tu capítulo"
                                            className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring"
                                        />
                                    </label>
                                )}

                                <label className="sm:col-span-2 flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-200">
                                    <span>Es Directivo?</span>
                                    <input
                                        type="checkbox"
                                        checked={form.isDirective}
                                        onChange={(event) => updateField("isDirective", event.target.checked)}
                                        className="h-4 w-4 accent-orange-500"
                                    />
                                </label>

                                {form.isDirective && (
                                    <>
                                        <label className="flex flex-col gap-2 text-sm text-zinc-300">
                                            Ámbito
                                            <select
                                                required
                                                value={form.directiveScope}
                                                onChange={(event) => updateField("directiveScope", event.target.value)}
                                                className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring"
                                            >
                                                <option value="">Selecciona ámbito</option>
                                                {DIRECTIVE_SCOPES.map((scope) => (
                                                    <option key={scope} value={scope}>{scope}</option>
                                                ))}
                                            </select>
                                        </label>

                                        <label className="flex flex-col gap-2 text-sm text-zinc-300">
                                            Cargo
                                            <select
                                                required
                                                value={form.directiveRole}
                                                onChange={(event) => updateField("directiveRole", event.target.value)}
                                                className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring"
                                            >
                                                <option value="">Selecciona cargo</option>
                                                {DIRECTIVE_ROLES.map((role) => (
                                                    <option key={role} value={role}>{role}</option>
                                                ))}
                                            </select>
                                        </label>
                                    </>
                                )}

                                <h3 className="sm:col-span-2 text-sm font-bold uppercase tracking-[0.16em] text-orange-200">Logística</h3>

                                <label className="flex flex-col gap-2 text-sm text-zinc-300">
                                    Fecha de llegada a Sabaneta
                                    <input
                                        type="date"
                                        required
                                        value={form.arrivalDate}
                                        onChange={(event) => updateField("arrivalDate", event.target.value)}
                                        className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring"
                                    />
                                </label>

                                <label className="sm:col-span-2 flex flex-col gap-2 text-sm text-zinc-300">
                                    Condición médica (opcional)
                                    <textarea
                                        rows={3}
                                        value={form.medicalCondition}
                                        onChange={(event) => updateField("medicalCondition", event.target.value)}
                                        className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring"
                                    />
                                </label>

                                <h3 className="sm:col-span-2 text-sm font-bold uppercase tracking-[0.16em] text-orange-200">Mercadeo</h3>

                                <label className="sm:col-span-2 flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-200">
                                    <span>Interesado en la Camiseta Oficial del Evento? ({formatCop(JERSEY_COST)})</span>
                                    <input
                                        type="checkbox"
                                        checked={form.wantsJersey}
                                        onChange={(event) => updateField("wantsJersey", event.target.checked)}
                                        className="h-4 w-4 accent-orange-500"
                                    />
                                </label>

                                {form.wantsJersey && (
                                    <label className="sm:col-span-2 flex flex-col gap-2 text-sm text-zinc-300">
                                        Talla
                                        <select
                                            required
                                            value={form.jerseySize}
                                            onChange={(event) => updateField("jerseySize", event.target.value)}
                                            className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring"
                                        >
                                            <option value="">Selecciona talla</option>
                                            {JERSEY_SIZES.map((size) => (
                                                <option key={size} value={size}>{size}</option>
                                            ))}
                                        </select>
                                    </label>
                                )}

                                <h3 className="sm:col-span-2 text-sm font-bold uppercase tracking-[0.16em] text-orange-200">Acompañantes</h3>

                                <label className="sm:col-span-2 flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-200">
                                    <span>Asiste con acompañante?</span>
                                    <input
                                        type="checkbox"
                                        checked={form.hasCompanions}
                                        onChange={(event) => {
                                            const checked = event.target.checked;
                                            updateField("hasCompanions", checked);
                                            if (checked) {
                                                setCompanionsCount(form.companionsCount > 0 ? form.companionsCount : 1);
                                            } else {
                                                setForm((current) => ({
                                                    ...current,
                                                    companionsCount: 0,
                                                    companions: [],
                                                }));
                                            }
                                        }}
                                        className="h-4 w-4 accent-orange-500"
                                    />
                                </label>

                                {form.hasCompanions && (
                                    <>
                                        <label className="sm:col-span-2 flex flex-col gap-2 text-sm text-zinc-300">
                                            Número de acompañantes
                                            <input
                                                type="number"
                                                min={1}
                                                required
                                                value={form.companionsCount}
                                                onChange={(event) => setCompanionsCount(Math.max(1, Number(event.target.value) || 1))}
                                                className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring"
                                            />
                                        </label>

                                        {Array.from({ length: form.companionsCount }).map((_, index) => {
                                            const companion = form.companions[index] ?? emptyCompanion();
                                            return (
                                                <div key={index} className="sm:col-span-2 rounded-lg border border-zinc-700 bg-zinc-900/50 p-4">
                                                    <p className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-orange-200">
                                                        Acompañante {index + 1}
                                                    </p>

                                                    <div className="grid gap-3 sm:grid-cols-2">
                                                        <label className="sm:col-span-2 flex flex-col gap-2 text-sm text-zinc-300">
                                                            Nombre completo
                                                            <input
                                                                required
                                                                value={companion.fullName}
                                                                onChange={(event) => updateCompanion(index, "fullName", event.target.value)}
                                                                className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring"
                                                            />
                                                        </label>

                                                        <label className="flex flex-col gap-2 text-sm text-zinc-300">
                                                            Documento de identidad
                                                            <input
                                                                required
                                                                value={companion.documentId}
                                                                onChange={(event) => updateCompanion(index, "documentId", event.target.value)}
                                                                className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring"
                                                            />
                                                        </label>

                                                        <label className="flex flex-col gap-2 text-sm text-zinc-300">
                                                            Categoría
                                                            <select
                                                                required
                                                                value={companion.category}
                                                                onChange={(event) => updateCompanion(index, "category", event.target.value)}
                                                                className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring"
                                                            >
                                                                <option value="">Selecciona categoría</option>
                                                                {COMPANION_CATEGORIES.map((category) => (
                                                                    <option key={category} value={category}>{category}</option>
                                                                ))}
                                                            </select>
                                                        </label>

                                                        <label className="sm:col-span-2 flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-200">
                                                            <span>¿Desea Camiseta Oficial? ({formatCop(JERSEY_COST)})</span>
                                                            <input
                                                                type="checkbox"
                                                                checked={companion.wantsJersey}
                                                                onChange={(event) => updateCompanion(index, "wantsJersey", event.target.checked)}
                                                                className="h-4 w-4 accent-orange-500"
                                                            />
                                                        </label>

                                                        {companion.wantsJersey && (
                                                            <label className="sm:col-span-2 flex flex-col gap-2 text-sm text-zinc-300">
                                                                Talla de camiseta
                                                                <select
                                                                    required
                                                                    value={companion.jerseySize}
                                                                    onChange={(event) => updateCompanion(index, "jerseySize", event.target.value)}
                                                                    className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring"
                                                                >
                                                                    <option value="">Selecciona talla</option>
                                                                    {JERSEY_SIZES.map((size) => (
                                                                        <option key={size} value={size}>{size}</option>
                                                                    ))}
                                                                </select>
                                                            </label>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </>
                                )}
                            </div>

                            <aside className="h-fit rounded-xl border border-orange-500/40 bg-zinc-950/70 p-5">
                                <h3 className="text-base font-bold uppercase tracking-[0.12em] text-orange-200">Resumen de Pago</h3>

                                <div className="mt-4 space-y-3 text-sm text-zinc-200">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p>{getParticipantBaseLabel(form.participantCategory || "")}</p>
                                            <p className="text-xs text-zinc-400">
                                                {form.participantCategory === "CLUB HERMANO / INVITADO (Solo Sábado)"
                                                    ? "Incluye almuerzo y concierto en La Molienda"
                                                    : "Incluye cena de gala"}
                                            </p>
                                        </div>
                                        <p className="font-semibold">{formatCop(participantBaseTotal)}</p>
                                    </div>

                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p>Acompañantes</p>
                                            <div className="text-xs text-zinc-400">
                                                {form.hasCompanions && form.companions.length > 0
                                                    ? form.companions.map((companion, index) => (
                                                        <p key={`${companion.documentId}-${index}`}>
                                                            - Acompañante {index + 1} ({companion.category || "sin categoría"}): {formatCop(getCompanionBaseCost(companion.category))}
                                                        </p>
                                                    ))
                                                    : "Sin acompañantes"}
                                            </div>
                                        </div>
                                        <p className="font-semibold">{formatCop(companionsBaseTotal)}</p>
                                    </div>

                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p>Camiseta titular</p>
                                            <p className="text-xs text-zinc-400">
                                                {form.wantsJersey ? `Talla ${form.jerseySize || "pendiente"}` : "No incluida"}
                                            </p>
                                        </div>
                                        <p className="font-semibold">{formatCop(mainJerseyTotal)}</p>
                                    </div>

                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p>Camisetas de acompañantes</p>
                                            <p className="text-xs text-zinc-400">
                                                {form.hasCompanions ? `${form.companions.filter((c) => c.wantsJersey).length} camiseta(s)` : "Ninguna"}
                                            </p>
                                        </div>
                                        <p className="font-semibold">{formatCop(companionsJerseyTotal)}</p>
                                    </div>

                                    {form.hasCompanions && form.companions.length > 0 && (
                                        <div className="rounded-lg border border-zinc-700 bg-zinc-900/70 p-3">
                                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-300">Detalle acompañantes</p>
                                            <div className="mt-2 space-y-1 text-xs text-zinc-300">
                                                {form.companions.map((companion, index) => (
                                                    <p key={`${companion.documentId}-${index}`}>
                                                        {index + 1}. {companion.fullName || "(sin nombre)"} - {companion.category || "(sin categoría)"} - {formatCop(getCompanionBaseCost(companion.category))} {companion.wantsJersey ? `- Camiseta ${companion.jerseySize || "pendiente"} (${formatCop(JERSEY_COST)})` : "- Sin camiseta"}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 border-t border-zinc-700 pt-4">
                                    <p className="text-xs uppercase tracking-[0.12em] text-zinc-400">Total a pagar</p>
                                    <p className="mt-1 text-2xl font-black text-orange-300">{formatCop(totalToPay)}</p>
                                </div>

                                <div className="mt-4 space-y-2 rounded-lg border border-zinc-700 bg-zinc-900/70 p-3 text-xs text-zinc-300">
                                    <p className="font-semibold text-zinc-100">Datos bancarios</p>
                                    <p>Bancolombia Ahorros: 23000013774</p>
                                    <p>Titular: Fundación L.A.M.A. Medellín</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-zinc-950 transition hover:bg-orange-400 disabled:opacity-60"
                                >
                                    {loading ? "Guardando..." : "Enviar Inscripción"}
                                </button>
                            </aside>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
