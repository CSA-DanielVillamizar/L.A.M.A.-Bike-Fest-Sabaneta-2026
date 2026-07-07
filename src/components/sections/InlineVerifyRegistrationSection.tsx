"use client";

import { FormEvent, useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

type VerifyResult = {
    id: string;
    document: string;
    fullName: string;
    chapter: string;
    country: string;
    createdAt: string;
    participantCategory: string;
    paymentStatus: string;
    isPaid: boolean;
};

function formatDateTime(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value || "No registrado";

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

export function InlineVerifyRegistrationSection() {
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<VerifyResult | null>(null);

    const paymentLabel = useMemo(() => {
        if (!result) return "";
        return result.isPaid || String(result.paymentStatus || "").toUpperCase() === "PAID"
            ? "Pagado"
            : "Pago pendiente";
    }, [result]);

    const downloadQR = () => {
        if (!result) return;

        const canvas = document.getElementById("qr-credential") as HTMLCanvasElement;
        if (!canvas) return;

        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `Credencial_LAMA_${result.document}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmed = searchTerm.trim();

        if (!trimmed) {
            setResult(null);
            setError("Ingresa documento, celular o ID de registro.");
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
    };

    return (
        <section className="pb-16 sm:pb-20">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                <div className="mb-5 flex items-center gap-3">
                    <div className="h-px flex-1 bg-zinc-700" />
                    <p className="text-center text-sm font-semibold text-zinc-300">
                        ¿Ya te inscribiste? Verifica tu estado aquí
                    </p>
                    <div className="h-px flex-1 bg-zinc-700" />
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/35 p-6 sm:p-8">
                    <h3 className="text-2xl font-black text-zinc-50 sm:text-3xl">Verifica tu inscripción</h3>
                    <p className="mt-2 text-sm text-zinc-300">
                        Consulta rápidamente tu estado con documento, teléfono de emergencia o ID de registro.
                    </p>

                    <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Documento, celular o ID de registro"
                            className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 text-sm text-zinc-100 outline-none ring-zinc-400/40 transition focus:ring"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="h-12 rounded-xl bg-zinc-700 px-6 text-sm font-bold uppercase tracking-[0.12em] text-zinc-100 transition hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {loading ? "Buscando..." : "Buscar"}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                            {error}
                        </div>
                    )}

                    {result && (
                        <article className="mt-5 rounded-2xl border border-zinc-700 bg-zinc-950/75 p-5">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <h4 className="text-lg font-black text-zinc-50 sm:text-2xl">{result.fullName}</h4>
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
                                        paymentLabel === "Pagado"
                                            ? "bg-emerald-500/20 text-emerald-300"
                                            : "bg-amber-500/20 text-amber-300"
                                    }`}
                                >
                                    {paymentLabel}
                                </span>
                            </div>

                            <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
                                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
                                        <dt className="text-xs uppercase tracking-[0.12em] text-zinc-500">ID</dt>
                                        <dd className="mt-1 font-semibold text-zinc-100">{result.id}</dd>
                                    </div>
                                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
                                        <dt className="text-xs uppercase tracking-[0.12em] text-zinc-500">Documento</dt>
                                        <dd className="mt-1 font-semibold text-zinc-100">{result.document}</dd>
                                    </div>
                                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
                                        <dt className="text-xs uppercase tracking-[0.12em] text-zinc-500">País</dt>
                                        <dd className="mt-1 font-semibold text-zinc-100">{result.country}</dd>
                                    </div>
                                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
                                        <dt className="text-xs uppercase tracking-[0.12em] text-zinc-500">Capítulo</dt>
                                        <dd className="mt-1 font-semibold text-zinc-100">{result.chapter}</dd>
                                    </div>
                                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3 sm:col-span-2">
                                        <dt className="text-xs uppercase tracking-[0.12em] text-zinc-500">Registro</dt>
                                        <dd className="mt-1 font-semibold text-zinc-100">{formatDateTime(result.createdAt)}</dd>
                                    </div>
                                </dl>

                                <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center text-zinc-900">
                                    <QRCodeCanvas
                                        id="qr-credential"
                                        value={`https://lamamedellinbikefestsabaneta.azurewebsites.net/verificar?q=${result.document}`}
                                        size={170}
                                        level="M"
                                        includeMargin
                                        className="mx-auto"
                                    />
                                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">
                                        Credencial Digital QR
                                    </p>
                                    <button
                                        type="button"
                                        onClick={downloadQR}
                                        className="mt-3 inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-zinc-800"
                                    >
                                        ⬇️ Descargar mi QR
                                    </button>
                                </div>
                            </div>
                        </article>
                    )}
                </div>
            </div>
        </section>
    );
}
