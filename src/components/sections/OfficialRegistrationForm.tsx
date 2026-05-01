"use client";

import { CHAPTERS_BY_COUNTRY, COUNTRIES } from "@/constants/countries";
import { AnimatePresence, motion } from "framer-motion";
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
const OFFICIAL_WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/KnwJ31J2ddBJsbc0Jr3Ufl";

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
    country: string;
    chapter: string;
    specifiedChapter: string;
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
    country: string;
    chapter: string;
    totalToPay: number;
    participantCategory: string;
    wantsJersey: boolean;
    jerseySize: string;
    companions: CompanionForm[];
};

type WizardStep = 1 | 2 | 3;

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
    country: "",
    chapter: "",
    specifiedChapter: "",
    isDirective: false,
    directiveScope: "",
    directiveRole: "",
    arrivalDate: "2026-06-26",
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

async function loadImageAsDataUrl(imagePath: string): Promise<string | null> {
    try {
        const response = await fetch(imagePath);
        if (!response.ok) {
            return null;
        }

        const blob = await response.blob();
        return await new Promise<string | null>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
}

function getImageFormat(dataUrl: string): "PNG" | "JPEG" {
    return dataUrl.includes("image/png") ? "PNG" : "JPEG";
}

export function OfficialRegistrationForm() {
    const [form, setForm] = useState<FormValues>(initialForm);
    const [selectedCountry, setSelectedCountry] = useState("");
    const [currentStep, setCurrentStep] = useState<WizardStep>(1);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successRegistration, setSuccessRegistration] = useState<SuccessRegistration | null>(null);

    const availableChapters = useMemo(
        () => [...(CHAPTERS_BY_COUNTRY[selectedCountry] || [])].sort((a, b) => a.localeCompare(b, "es")),
        [selectedCountry],
    );
    const hasPredefinedChapters = availableChapters.length > 0;
    const shouldAskSpecifiedChapter = Boolean(selectedCountry) && (!hasPredefinedChapters || form.chapter === "Otro");

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

    const stepProgress = (currentStep / 3) * 100;

    const goToStep = (step: WizardStep) => {
        setCurrentStep(step);
        if (typeof window !== "undefined") {
            requestAnimationFrame(() => {
                const section = document.getElementById("registro-oficial");
                section?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        }
    };

    const validateStep = (step: WizardStep): string | null => {
        if (step === 1) {
            if (!form.participantCategory.trim()) return "Selecciona la categoría del participante.";
            if (!form.fullName.trim()) return "Ingresa el nombre completo.";
            if (!form.documentId.trim()) return "Ingresa el documento de identidad.";
            if (!form.eps.trim()) return "Ingresa la EPS.";
            if (!form.emergencyName.trim()) return "Ingresa el nombre de contacto de emergencia.";
            if (!form.emergencyPhone.trim()) return "Ingresa el teléfono de emergencia.";
            if (!selectedCountry) return "Debes seleccionar tu país en Pertenencia L.A.M.A.";
            if (hasPredefinedChapters && !form.chapter.trim()) return "Debes seleccionar tu capítulo.";
            if (shouldAskSpecifiedChapter && !form.specifiedChapter.trim()) return "Debes especificar tu capítulo.";
            if (form.isDirective && (!form.directiveScope || !form.directiveRole)) {
                return "Completa ámbito y cargo directivo.";
            }
            return null;
        }

        if (step === 2) {
            if (!form.arrivalDate) return "Selecciona la fecha de llegada a Sabaneta.";
            if (form.wantsJersey && !form.jerseySize) return "Selecciona la talla de camiseta titular.";
            if (form.hasCompanions) {
                if (form.companionsCount < 1) return "Define al menos un acompañante.";
                if (form.companions.length !== form.companionsCount) {
                    return "Debes completar la información de todos los acompañantes.";
                }

                for (let index = 0; index < form.companions.length; index += 1) {
                    const companion = form.companions[index];
                    if (!companion.fullName.trim() || !companion.documentId.trim() || !companion.category.trim()) {
                        return `Completa nombre, documento y categoría del acompañante ${index + 1}.`;
                    }
                    if (companion.wantsJersey && !companion.jerseySize) {
                        return `Selecciona la talla de camiseta del acompañante ${index + 1}.`;
                    }
                }
            }
            return null;
        }

        return null;
    };

    const handleNextStep = () => {
        const error = validateStep(currentStep);
        if (error) {
            setErrorMessage(error);
            return;
        }

        setErrorMessage("");
        if (currentStep < 3) {
            goToStep((currentStep + 1) as WizardStep);
        }
    };

    const handlePreviousStep = () => {
        setErrorMessage("");
        if (currentStep > 1) {
            goToStep((currentStep - 1) as WizardStep);
        }
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

    const generatePDF = async () => {
        if (!successRegistration) {
            return;
        }

        try {
            const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
            const pageW = doc.internal.pageSize.getWidth();
            const pageH = doc.internal.pageSize.getHeight();
            const left = 20;
            const right = pageW - left;
            let y = 18;

            const [logoDataUrl, qrDataUrl] = await Promise.all([
                loadImageAsDataUrl("/images/Logotipo-LM-vertical-transp.png"),
                loadImageAsDataUrl("/images/QRBancolombia.jpeg"),
            ]);

            // Brand strip header
            doc.setFillColor(249, 115, 22);
            doc.rect(0, 0, pageW, 8, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(255, 255, 255);
            doc.text("L.A.M.A. Medellín | Registro Oficial", left, 5.6);
            doc.setTextColor(0, 0, 0);

            y = 14;

            let logoBottomY = y;

            if (logoDataUrl) {
                const props = doc.getImageProperties(logoDataUrl);
                const logoWidth = 80;
                const logoHeight = logoWidth * (props.height / props.width);
                const logoX = (pageW - logoWidth) / 2;
                doc.addImage(logoDataUrl, getImageFormat(logoDataUrl), logoX, y, logoWidth, logoHeight);
                logoBottomY = y + logoHeight;
            }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(16);
            doc.text("XIII Aniversario L.A.M.A. Medellín", pageW / 2, logoBottomY + 8, { align: "center" });
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.text("Resumen Oficial de Inscripción", pageW / 2, logoBottomY + 14, { align: "center" });

            // 15mm of whitespace between logo and table start.
            y = logoBottomY + 15;

            doc.setDrawColor(210, 210, 210);
            doc.line(left, y, right, y);
            y += 7;

            const tableRows: Array<[string, string]> = [
                ["ID de Registro", successRegistration.id],
                ["Nombre", successRegistration.fullName],
                ["País", successRegistration.country],
                ["Capítulo", successRegistration.chapter],
                ["Categoría", successRegistration.participantCategory],
                ["Inscripción titular", formatCop(getParticipantBaseCost(successRegistration.participantCategory))],
                [
                    "Camiseta titular",
                    successRegistration.wantsJersey
                        ? `Sí - Talla ${successRegistration.jerseySize || "por definir"} (${formatCop(JERSEY_COST)})`
                        : "No",
                ],
                ["Acompañantes", successRegistration.companions.length ? String(successRegistration.companions.length) : "Sin acompañantes"],
                ["Total a pagar", formatCop(successRegistration.totalToPay)],
            ];

            const rowH = 8;
            const tableW = right - left;
            const labelColW = 56;

            doc.setDrawColor(224, 224, 224);
            doc.setLineWidth(0.2);
            tableRows.forEach(([label, value], index) => {
                const rowTop = y + index * rowH;
                if (index % 2 === 0) {
                    doc.setFillColor(250, 250, 250);
                    doc.rect(left, rowTop, tableW, rowH, "F");
                }

                doc.rect(left, rowTop, tableW, rowH);
                doc.line(left + labelColW, rowTop, left + labelColW, rowTop + rowH);

                doc.setFont("helvetica", "bold");
                doc.setFontSize(10);
                doc.text(label, left + 2, rowTop + 5.4);

                doc.setFont("helvetica", "normal");
                doc.text(value, left + labelColW + 2, rowTop + 5.4, { maxWidth: tableW - labelColW - 4 });
            });

            y += tableRows.length * rowH + 10;

            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text("Instrucciones de Pago", left, y);
            y += 6;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.text("Bancolombia Ahorros: 23000013774", left, y);
            y += 5;
            doc.text("Titular: Fundación L.A.M.A. Medellín", left, y);
            y += 8;

            if (qrDataUrl) {
                const qrWidth = 45;
                const qrHeight = (qrWidth * 753) / 423;
                const qrX = (pageW - qrWidth) / 2;
                const qrY = Math.max(y + 10, pageH - qrHeight - 14);

                doc.setFont("helvetica", "bold");
                doc.setFontSize(12);
                doc.text("PASO FINAL: REALIZA TU PAGO", pageW / 2, qrY - 6, { align: "center" });

                doc.setDrawColor(230, 230, 230);
                doc.roundedRect(qrX - 3, qrY - 3, qrWidth + 6, qrHeight + 6, 2, 2);
                doc.addImage(qrDataUrl, getImageFormat(qrDataUrl), qrX, qrY, qrWidth, qrHeight);

                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.text("Escanea para pagar desde tu App Bancaria", pageW / 2, qrY + qrHeight + 6, { align: "center" });
            }

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
            const stepOneError = validateStep(1);
            if (stepOneError) {
                throw new Error(stepOneError);
            }

            const stepTwoError = validateStep(2);
            if (stepTwoError) {
                throw new Error(stepTwoError);
            }

            if (!selectedCountry) {
                throw new Error("Debes seleccionar tu país en Pertenencia L.A.M.A.");
            }

            const selectedChapter = form.chapter.trim();
            const manualChapter = form.specifiedChapter.trim();
            const normalizedChapter = shouldAskSpecifiedChapter ? manualChapter : selectedChapter;

            if (hasPredefinedChapters && !selectedChapter) {
                throw new Error("Debes seleccionar tu capítulo en Pertenencia L.A.M.A.");
            }

            if (shouldAskSpecifiedChapter && !manualChapter) {
                throw new Error("Debes especificar tu capítulo en Pertenencia L.A.M.A.");
            }

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
                country: selectedCountry,
                chapter: normalizedChapter,
                totalToPay,
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
                country: selectedCountry,
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
            setSelectedCountry("");
            setCurrentStep(1);
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
                        <div className="mx-auto grid max-w-4xl gap-6">
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, ease: "easeOut" }}
                                className="rounded-2xl border border-green-500/40 bg-zinc-950/80 p-6"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <motion.div
                                        initial={{ scale: 0.6, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: "spring", stiffness: 240, damping: 14 }}
                                        className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20"
                                    >
                                        <motion.span
                                            animate={{ scale: [1, 1.08, 1] }}
                                            transition={{ duration: 1.4, repeat: Infinity, repeatType: "loop" }}
                                            className="absolute h-16 w-16 rounded-full border border-green-400/40"
                                        />
                                        <span className="text-3xl font-black text-green-300">✓</span>
                                    </motion.div>

                                    <p className="text-xs uppercase tracking-[0.2em] text-green-300">Registro completado</p>
                                    <h3 className="mt-2 text-3xl font-black text-zinc-50">¡Inscripción exitosa!</h3>
                                    <p className="mt-3 text-sm text-zinc-300">
                                        Tu ID de registro es <span className="font-black text-zinc-100">{successRegistration.id}</span>
                                    </p>
                                </div>

                                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
                                        <p className="text-xs uppercase tracking-[0.12em] text-zinc-400">Nombre</p>
                                        <p className="mt-2 text-base font-semibold text-zinc-100">{successRegistration.fullName}</p>
                                    </div>
                                    <div className="rounded-xl border border-zinc-700 bg-zinc-900/70 p-4">
                                        <p className="text-xs uppercase tracking-[0.12em] text-zinc-400">Total a pagar</p>
                                        <p className="mt-2 text-2xl font-black text-orange-300">{formatCop(successRegistration.totalToPay)}</p>
                                    </div>
                                </div>

                                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                    <button
                                        type="button"
                                        onClick={generatePDF}
                                        className="inline-flex w-full items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-zinc-950 transition hover:bg-orange-400"
                                    >
                                        Descargar Resumen PDF
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleWhatsappRedirect}
                                        className="inline-flex w-full items-center justify-center rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:brightness-110"
                                    >
                                        Enviar Comprobante por WhatsApp
                                    </button>
                                </div>
                            </motion.div>

                            <div className="rounded-2xl border border-orange-500/40 bg-zinc-950/80 p-6">
                                <h4 className="text-lg font-bold uppercase tracking-[0.12em] text-orange-200">Instrucciones de Pago</h4>
                                <div className="mt-4 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
                                    <div className="space-y-2 text-sm text-zinc-300">
                                        <p><span className="font-semibold text-zinc-100">Banco:</span> Bancolombia</p>
                                        <p><span className="font-semibold text-zinc-100">Cuenta de Ahorros:</span> 23000013774</p>
                                        <p><span className="font-semibold text-zinc-100">Titular:</span> Fundación L.A.M.A. Medellín</p>
                                        <p><span className="font-semibold text-zinc-100">Referencia:</span> Usa tu ID <span className="font-black text-zinc-100">{successRegistration.id}</span></p>
                                    </div>
                                    <img
                                        src="/images/Logotipo-LM-vertical-transp.png"
                                        alt="Logotipo oficial L.A.M.A. Medellín"
                                        className="mx-auto h-28 w-auto object-contain sm:mx-0"
                                    />
                                </div>

                                <div className="mt-5 flex justify-center">
                                    <a
                                        href={OFFICIAL_WHATSAPP_GROUP_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-600 px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.08em] text-zinc-100 transition hover:border-orange-300 hover:text-orange-200"
                                    >
                                        Unirme al Grupo Oficial de WhatsApp
                                    </a>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setSuccessRegistration(null);
                                    setErrorMessage("");
                                }}
                                className="inline-flex items-center justify-center rounded-full border border-transparent px-6 py-2 text-sm font-semibold text-zinc-400 transition hover:text-zinc-200"
                            >
                                Registrar otra persona
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6 rounded-xl border border-zinc-700 bg-zinc-950/60 p-4">
                                <div className="mb-3 grid gap-2 text-xs font-bold uppercase tracking-[0.14em] sm:grid-cols-3">
                                    <p className={currentStep === 1 ? "text-orange-300" : "text-zinc-400"}>1. Perfil</p>
                                    <p className={currentStep === 2 ? "text-orange-300" : "text-zinc-400"}>2. Logística</p>
                                    <p className={currentStep === 3 ? "text-orange-300" : "text-zinc-400"}>3. Pago</p>
                                </div>
                                <div className="h-2 rounded-full bg-zinc-800">
                                    <div
                                        className="h-full rounded-full bg-orange-500 transition-all duration-300"
                                        style={{ width: `${stepProgress}%` }}
                                    />
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentStep}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.22, ease: "easeOut" }}
                                        className="grid gap-5 sm:grid-cols-2"
                                    >
                                        {currentStep === 1 && (
                                            <>
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
                                                    País
                                                    <select
                                                        required
                                                        value={selectedCountry}
                                                        onChange={(event) => {
                                                            const country = event.target.value;
                                                            setSelectedCountry(country);
                                                            setForm((current) => ({
                                                                ...current,
                                                                country,
                                                                chapter: "",
                                                                specifiedChapter: "",
                                                            }));
                                                        }}
                                                        className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring"
                                                    >
                                                        <option value="">Selecciona tu país</option>
                                                        {COUNTRIES.map((country) => (
                                                            <option key={country} value={country}>{country}</option>
                                                        ))}
                                                    </select>
                                                </label>

                                                {hasPredefinedChapters && (
                                                    <label className="sm:col-span-2 flex flex-col gap-2 text-sm text-zinc-300">
                                                        Capítulo
                                                        <select
                                                            required
                                                            value={form.chapter}
                                                            onChange={(event) => {
                                                                const chapter = event.target.value;
                                                                setForm((current) => ({
                                                                    ...current,
                                                                    chapter,
                                                                    specifiedChapter: chapter === "Otro" ? current.specifiedChapter : "",
                                                                }));
                                                            }}
                                                            className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring"
                                                        >
                                                            <option value="">Selecciona tu capítulo</option>
                                                            {availableChapters.map((chapter) => (
                                                                <option key={chapter} value={chapter}>{chapter}</option>
                                                            ))}
                                                            <option value="Otro">Otro</option>
                                                        </select>
                                                    </label>
                                                )}

                                                {shouldAskSpecifiedChapter && (
                                                    <label className="sm:col-span-2 flex flex-col gap-2 text-sm text-zinc-300">
                                                        Especifica tu capítulo
                                                        <input
                                                            required
                                                            value={form.specifiedChapter}
                                                            onChange={(event) => updateField("specifiedChapter", event.target.value)}
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
                                            </>
                                        )}

                                        {currentStep === 2 && (
                                            <>
                                                <h3 className="sm:col-span-2 text-sm font-bold uppercase tracking-[0.16em] text-orange-200">Información Médica</h3>

                                                <label className="sm:col-span-2 flex flex-col gap-2 text-sm text-zinc-300">
                                                    Condición médica (opcional)
                                                    <textarea
                                                        rows={3}
                                                        value={form.medicalCondition}
                                                        onChange={(event) => updateField("medicalCondition", event.target.value)}
                                                        className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring"
                                                    />
                                                </label>

                                                <h3 className="sm:col-span-2 text-sm font-bold uppercase tracking-[0.16em] text-orange-200">Tallas de Jersey</h3>

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
                                                        Talla titular
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

                                                <h3 className="sm:col-span-2 text-sm font-bold uppercase tracking-[0.16em] text-orange-200">Datos de Llegada</h3>

                                                <label className="sm:col-span-2 flex flex-col gap-2 text-sm text-zinc-300">
                                                    Fecha de llegada a Sabaneta
                                                    <input
                                                        type="date"
                                                        required
                                                        min="2026-06-01"
                                                        max="2026-06-30"
                                                        value={form.arrivalDate}
                                                        onChange={(event) => updateField("arrivalDate", event.target.value)}
                                                        className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring"
                                                    />
                                                </label>
                                            </>
                                        )}

                                        {currentStep === 3 && (
                                            <div className="sm:col-span-2 rounded-xl border border-orange-500/40 bg-zinc-950/70 p-5">
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
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>

                                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-4">
                                    <button
                                        type="button"
                                        onClick={handlePreviousStep}
                                        disabled={currentStep === 1 || loading}
                                        className="inline-flex items-center justify-center rounded-full border border-orange-500 px-5 py-2 text-sm font-bold uppercase tracking-[0.1em] text-orange-300 transition hover:bg-orange-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Anterior
                                    </button>

                                    {currentStep < 3 ? (
                                        <button
                                            type="button"
                                            onClick={handleNextStep}
                                            className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-zinc-950 transition hover:bg-orange-400"
                                        >
                                            Siguiente
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-zinc-950 transition hover:bg-orange-400 disabled:opacity-60"
                                        >
                                            {loading ? "Guardando..." : "Finalizar Registro"}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
