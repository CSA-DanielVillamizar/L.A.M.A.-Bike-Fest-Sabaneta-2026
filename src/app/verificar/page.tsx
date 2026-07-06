"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { QRCodeSVG as QRCode } from "qrcode.react";

type VerifyResult = {
    id: string;
    document: string;
    fullName: string;
    chapter: string;
    country: string;
    createdAt: string;
    participantCategory: string;
    arrivalMethod: string;
    arrivalDate: string;
    needsTransport: boolean;
    paymentStatus: string;
    isPaid: boolean;
};

function formatDateTime(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value || "No registrado";
    }

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

export default function VerificarInscripcionPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<VerifyResult | null>(null);

    const paymentLabel = useMemo(() => {
        if (!result) return "";

        if (result.isPaid || String(result.paymentStatus || "").toUpperCase() === "PAID") {
            return "✅ Pagado";
        }

        return "⏳ Pago pendiente de verificación";
    }, [result]);

    const qrValue = useMemo(() => {
        if (!result?.document) return "";
        return `https://lamamedellinbikefestsabaneta.azurewebsites.net/verificar?q=${encodeURIComponent(result.document)}`;
    }, [result]);

    const executeSearch = useCallback(async (rawTerm: string) => {
        const trimmed = rawTerm.trim();
        if (!trimmed) {
            setResult(null);
            setError("Ingresa un valor para realizar la búsqueda.");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const response = await fetch("/api/verificar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ searchTerm: trimmed }),
            });

            const payload = (await response.json()) as VerifyResult & { error?: string };

            if (!response.ok) {
                setError(payload.error || "No fue posible validar la inscripción.");
                return;
            }

            setResult(payload);
        } catch {
            setError("Ocurrió un error de red. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const queryValue = (params.get("q") || "").trim();
        if (!queryValue) return;

        setSearchTerm(queryValue);
        void executeSearch(queryValue);
    }, [executeSearch]);

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await executeSearch(searchTerm);
    };

    return (
        <section className="min-h-screen bg-black px-4 py-10 text-zinc-100 sm:px-6 sm:py-14">
            <div className="mx-auto w-full max-w-2xl">
                <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl">
                    Verifica tu inscripción
                </h1>

                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    Busca por correo, celular, código de confirmación o número del documento (coincidencia exacta) para confirmar tu pre-inscripción al Aniversario. Nota: el código de confirmación sólo verifica que te pre-inscribiste; no confirma que ya pagaste. La confirmación del pago es un proceso manual y puede tardar varios días en reflejarse en esta búsqueda.
                </p>

                <form onSubmit={onSubmit} className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4 sm:p-5">
                    <label htmlFor="searchTerm" className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-500">
                        Datos de búsqueda
                    </label>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                            id="searchTerm"
                            type="text"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Correo, celular, código de confirmación o documento"
                            className="h-12 w-full rounded-xl border border-neutral-700 bg-black px-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-orange-500"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="h-12 rounded-xl bg-orange-500 px-6 text-sm font-bold uppercase tracking-[0.12em] text-zinc-950 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-orange-900/70 disabled:text-zinc-300"
                        >
                            {loading ? "Buscando..." : "Buscar"}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="mt-4 rounded-xl border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                        {error}
                    </div>
                )}

                {result && (
                    <article className="mt-6 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/85 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                        <div className="border-b border-dashed border-neutral-800 px-5 py-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Ticket de pre-inscripción</p>
                            <p className="mt-1 text-sm text-zinc-400">Código de confirmación: {result.id}</p>
                        </div>

                        <div className="border-b border-dashed border-neutral-800 px-5 py-5">
                            <div className="mx-auto w-fit rounded-2xl bg-white p-4">
                                <QRCode value={qrValue} size={176} includeMargin={true} bgColor="#ffffff" fgColor="#000000" />
                            </div>
                            <p className="mt-3 text-center text-xs uppercase tracking-[0.18em] text-zinc-400">
                                Presenta este código en la zona de Check-in
                            </p>
                        </div>

                        <div className="grid gap-4 px-5 py-5 text-sm sm:grid-cols-2">
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Capítulo</p>
                                <p className="mt-1 font-semibold text-zinc-100">{result.chapter}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Registrado</p>
                                <p className="mt-1 font-semibold text-zinc-100">{formatDateTime(result.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Nombre</p>
                                <p className="mt-1 font-semibold text-zinc-100">{result.fullName}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Categoría</p>
                                <p className="mt-1 font-semibold text-zinc-100">{result.participantCategory}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Llegada</p>
                                <p className="mt-1 font-semibold text-zinc-100">{result.arrivalMethod || "No especificado"}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Día de llegada</p>
                                <p className="mt-1 font-semibold text-zinc-100">{result.arrivalDate || "No especificado"}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Necesita transporte</p>
                                <p className="mt-1 font-semibold text-zinc-100">{result.needsTransport ? "Sí" : "No"}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Pago</p>
                                <p className="mt-1 font-semibold text-zinc-100">{paymentLabel}</p>
                            </div>
                        </div>
                    </article>
                )}
            </div>
        </section>
    );
}
