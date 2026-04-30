"use client";

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { FormEvent, useMemo, useRef, useState } from "react";

const PARTICIPANT_CATEGORIES = [
    "DAMA L.A.M.A.",
    "FULL COLOR MEMBER",
    "ROCKET PROSPECT",
    "PROSPECT",
    "ESPOSA",
    "PAREJA",
    "INVITADO",
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

const BASE_COST = 100000;
const COMPANION_COST = 100000;
const JERSEY_COST = 65000;

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
};

type SuccessRegistration = {
    id: string;
    fullName: string;
    chapter: string;
    totalToPay: number;
    participantCategory: string;
};

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
    const receiptRef = useRef<HTMLDivElement | null>(null);

    const companionsTotal = form.hasCompanions ? form.companionsCount * COMPANION_COST : 0;
    const jerseyTotal = form.wantsJersey ? JERSEY_COST : 0;

    const totalToPay = useMemo(
        () => BASE_COST + companionsTotal + jerseyTotal,
        [companionsTotal, jerseyTotal],
    );

    const updateField = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const buildWhatsappUrl = (registration: SuccessRegistration) => {
        const whatsappMessage = [
            "Hola, envio mi resumen de inscripcion al XIII Aniversario L.A.M.A. Medellin:",
            `ID de registro: ${registration.id}`,
            `Nombre: ${registration.fullName}`,
            `Capitulo: ${registration.chapter}`,
            `Total a pagar: ${formatCop(registration.totalToPay)}`,
            "Por este medio adjuntare el comprobante de pago.",
        ].join("\n");

        return `https://wa.me/573105127314?text=${encodeURIComponent(whatsappMessage)}`;
    };

    const handleWhatsappRedirect = () => {
        if (!successRegistration) {
            return;
        }

        window.open(buildWhatsappUrl(successRegistration), "_blank", "noopener,noreferrer");
    };

    const generatePDF = async () => {
        if (!receiptRef.current || !successRegistration) {
            return;
        }

        const canvas = await html2canvas(receiptRef.current, {
            backgroundColor: "#111111",
            scale: 2,
        });

        const imageData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imageWidth = pageWidth - 20;
        const imageHeight = (canvas.height * imageWidth) / canvas.width;
        const finalHeight = Math.min(imageHeight, pageHeight - 20);

        pdf.addImage(imageData, "PNG", 10, 10, imageWidth, finalHeight);
        pdf.save("Inscripcion-LAMA-Medellin.pdf");
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setErrorMessage("");
        setSuccessRegistration(null);

        try {
            const normalizedChapter =
                form.chapter === "Otros" ? form.otherChapter.trim() : form.chapter;

            if (!normalizedChapter) {
                throw new Error("Debes indicar tu capitulo en Pertenencia L.A.M.A.");
            }

            const payload = {
                ...form,
                chapter: normalizedChapter,
                directiveScope: form.isDirective ? form.directiveScope : null,
                directiveRole: form.isDirective ? form.directiveRole : null,
                jerseySize: form.wantsJersey ? form.jerseySize : null,
                companionsCount: form.hasCompanions ? form.companionsCount : 0,
                totalToPay,
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
                throw new Error(result.error || "No fue posible registrar la inscripcion.");
            }

            setSuccessRegistration({
                id: result.id,
                fullName: form.fullName,
                chapter: normalizedChapter,
                totalToPay: result.totalToPay ?? totalToPay,
                participantCategory: form.participantCategory,
            });
            setForm(initialForm);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Error al enviar la inscripcion.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="registro-oficial" className="py-16 sm:py-20">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                <div className="rounded-2xl border border-white/10 bg-black/35 p-6 sm:p-8">
                    <div className="mb-6">
                        <p className="text-xs uppercase tracking-[0.2em] text-orange-300">XIII Aniversario</p>
                        <h2 className="mt-2 text-3xl font-black text-zinc-50 sm:text-4xl">
                            Formulario Oficial de Inscripcion
                        </h2>
                        <p className="mt-2 text-sm text-zinc-300">
                            Completa los datos para asegurar tu cupo y recibir el resumen oficial de pago.
                        </p>
                    </div>

                    {errorMessage && (
                        <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/15 px-4 py-3 text-sm text-red-300">
                            {errorMessage}
                        </div>
                    )}

                    {successRegistration ? (
                        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                            <div
                                ref={receiptRef}
                                className="rounded-2xl border border-green-500/40 bg-zinc-950/80 p-6"
                            >
                                <p className="text-xs uppercase tracking-[0.2em] text-green-300">Registro completado</p>
                                <h3 className="mt-2 text-3xl font-black text-zinc-50">
                                    Registro completado con exito
                                </h3>
                                <p className="mt-2 text-sm text-zinc-300">
                                    Ya puedes realizar el pago y enviar el soporte por WhatsApp para finalizar tu proceso.
                                </p>

                                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
                                        <p className="text-xs uppercase tracking-[0.12em] text-zinc-400">ID de registro</p>
                                        <p className="mt-2 break-all text-lg font-bold text-zinc-100">
                                            {successRegistration.id}
                                        </p>
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
                                    <p className="mt-2"><span className="font-semibold text-zinc-100">Capitulo:</span> {successRegistration.chapter}</p>
                                    <p className="mt-2"><span className="font-semibold text-zinc-100">Categoria:</span> {successRegistration.participantCategory}</p>
                                </div>

                                <div className="mt-6 rounded-xl border border-zinc-700 bg-zinc-900/70 p-4 text-sm text-zinc-300">
                                    <p className="font-semibold text-zinc-100">Datos bancarios para el pago</p>
                                    <p className="mt-2">Bancolombia Ahorros: 65200000000</p>
                                    <p>Nequi: 3106328171</p>
                                    <p>Titular: L.A.M.A. Medellin</p>
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
                                <h3 className="sm:col-span-2 text-sm font-bold uppercase tracking-[0.16em] text-orange-200">
                                    Tipo de Participante
                                </h3>

                                <label className="sm:col-span-2 flex flex-col gap-2 text-sm text-zinc-300">
                                    Categoria
                                    <select
                                        required
                                        value={form.participantCategory}
                                        onChange={(event) => updateField("participantCategory", event.target.value)}
                                        className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring"
                                    >
                                        <option value="">Selecciona una categoria</option>
                                        {PARTICIPANT_CATEGORIES.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <h3 className="sm:col-span-2 text-sm font-bold uppercase tracking-[0.16em] text-orange-200">
                                    Datos Personales
                                </h3>

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

                                <h3 className="sm:col-span-2 text-sm font-bold uppercase tracking-[0.16em] text-orange-200">
                                    Contacto de Emergencia
                                </h3>

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
                                    Telefono
                                    <input
                                        required
                                        value={form.emergencyPhone}
                                        onChange={(event) => updateField("emergencyPhone", event.target.value)}
                                        className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring"
                                    />
                                </label>

                                <h3 className="sm:col-span-2 text-sm font-bold uppercase tracking-[0.16em] text-orange-200">
                                    Pertenencia L.A.M.A.
                                </h3>

                                <label className="sm:col-span-2 flex flex-col gap-2 text-sm text-zinc-300">
                                    Capitulo
                                    <select
                                        required
                                        value={form.chapter}
                                        onChange={(event) => updateField("chapter", event.target.value)}
                                        className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring"
                                    >
                                        <option value="">Selecciona tu capitulo</option>
                                        {SORTED_CHAPTERS.map((chapter) => (
                                            <option key={chapter} value={chapter}>
                                                {chapter}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                {form.chapter === "Otros" && (
                                    <label className="sm:col-span-2 flex flex-col gap-2 text-sm text-zinc-300">
                                        Especifica tu capitulo
                                        <input
                                            required
                                            value={form.otherChapter}
                                            onChange={(event) => updateField("otherChapter", event.target.value)}
                                            placeholder="Escribe el nombre de tu capitulo"
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
                                            Ambito
                                            <select
                                                required
                                                value={form.directiveScope}
                                                onChange={(event) => updateField("directiveScope", event.target.value)}
                                                className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring"
                                            >
                                                <option value="">Selecciona ambito</option>
                                                {DIRECTIVE_SCOPES.map((scope) => (
                                                    <option key={scope} value={scope}>
                                                        {scope}
                                                    </option>
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
                                                    <option key={role} value={role}>
                                                        {role}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                    </>
                                )}

                                <h3 className="sm:col-span-2 text-sm font-bold uppercase tracking-[0.16em] text-orange-200">
                                    Logistica
                                </h3>

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
                                    Condicion medica (opcional)
                                    <textarea
                                        rows={3}
                                        value={form.medicalCondition}
                                        onChange={(event) => updateField("medicalCondition", event.target.value)}
                                        className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring"
                                    />
                                </label>

                                <h3 className="sm:col-span-2 text-sm font-bold uppercase tracking-[0.16em] text-orange-200">
                                    Mercadeo
                                </h3>

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
                                                <option key={size} value={size}>
                                                    {size}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                )}

                                <h3 className="sm:col-span-2 text-sm font-bold uppercase tracking-[0.16em] text-orange-200">
                                    Acompanantes
                                </h3>

                                <label className="sm:col-span-2 flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-200">
                                    <span>Asiste con acompanante?</span>
                                    <input
                                        type="checkbox"
                                        checked={form.hasCompanions}
                                        onChange={(event) =>
                                            updateField("hasCompanions", event.target.checked)
                                        }
                                        className="h-4 w-4 accent-orange-500"
                                    />
                                </label>

                                {form.hasCompanions && (
                                    <label className="sm:col-span-2 flex flex-col gap-2 text-sm text-zinc-300">
                                        Numero de acompanantes
                                        <input
                                            type="number"
                                            min={1}
                                            required
                                            value={form.companionsCount}
                                            onChange={(event) =>
                                                updateField(
                                                    "companionsCount",
                                                    Math.max(1, Number(event.target.value) || 1),
                                                )
                                            }
                                            className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring"
                                        />
                                    </label>
                                )}
                            </div>

                            <aside className="h-fit rounded-xl border border-orange-500/40 bg-zinc-950/70 p-5">
                                <h3 className="text-base font-bold uppercase tracking-[0.12em] text-orange-200">Resumen de Pago</h3>

                                <div className="mt-4 space-y-3 text-sm text-zinc-200">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p>Inscripcion base obligatoria</p>
                                            <p className="text-xs text-zinc-400">Incluye cena del acto protocolario</p>
                                        </div>
                                        <p className="font-semibold">{formatCop(BASE_COST)}</p>
                                    </div>

                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p>Acompanantes</p>
                                            <p className="text-xs text-zinc-400">
                                                {form.hasCompanions
                                                    ? `${form.companionsCount} x ${formatCop(COMPANION_COST)}`
                                                    : "Sin acompanantes"}
                                            </p>
                                        </div>
                                        <p className="font-semibold">{formatCop(companionsTotal)}</p>
                                    </div>

                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p>Camiseta oficial</p>
                                            <p className="text-xs text-zinc-400">
                                                {form.wantsJersey ? `Talla ${form.jerseySize || "pendiente"}` : "No incluida"}
                                            </p>
                                        </div>
                                        <p className="font-semibold">{formatCop(jerseyTotal)}</p>
                                    </div>
                                </div>

                                <div className="mt-4 border-t border-zinc-700 pt-4">
                                    <p className="text-xs uppercase tracking-[0.12em] text-zinc-400">Total a pagar</p>
                                    <p className="mt-1 text-2xl font-black text-orange-300">{formatCop(totalToPay)}</p>
                                </div>

                                <div className="mt-4 space-y-2 rounded-lg border border-zinc-700 bg-zinc-900/70 p-3 text-xs text-zinc-300">
                                    <p className="font-semibold text-zinc-100">Datos bancarios</p>
                                    <p>Bancolombia Ahorros: 23000013774</p>
                                    <p>Titular: Fundación L.A.M.A. Medellin</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-zinc-950 transition hover:bg-orange-400 disabled:opacity-60"
                                >
                                    {loading ? "Guardando..." : "Enviar Inscripcion"}
                                </button>
                            </aside>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
