"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
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

type Html5QrcodeLike = {
    start: (
        cameraConfig: { facingMode: string },
        config: { fps: number; qrbox: { width: number; height: number } },
        onSuccess: (decodedText: string) => void,
        onFailure?: (errorMessage: string) => void,
    ) => Promise<void>;
    stop: () => Promise<void>;
    clear: () => Promise<void>;
};

const SCANNER_ELEMENT_ID = "verificar-qr-scanner";

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

function extractSearchTermFromQr(rawValue: string): string {
    const trimmed = String(rawValue || "").trim();
    if (!trimmed) return "";

    try {
        const url = new URL(trimmed);
        const qParam = (url.searchParams.get("q") || "").trim();
        if (qParam) return qParam;

        const lastSegment = url.pathname.split("/").filter(Boolean).pop() || "";
        return decodeURIComponent(lastSegment).trim() || trimmed;
    } catch {
        return trimmed;
    }
}

export default function VerificarInscripcionPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState<VerifyResult | null>(null);
    const [scannerOpen, setScannerOpen] = useState(false);
    const [scannerError, setScannerError] = useState("");
    const [scannerActive, setScannerActive] = useState(false);
    const scannerRef = useRef<Html5QrcodeLike | null>(null);

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

    const isPaid = Boolean(result && (result.isPaid || String(result.paymentStatus || "").toUpperCase() === "PAID"));

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

    const stopScanner = useCallback(async () => {
        const scanner = scannerRef.current;
        if (!scanner) {
            setScannerActive(false);
            return;
        }

        try {
            await scanner.stop();
        } catch {
            // Ignore stop errors when the scanner was not fully started.
        }

        try {
            await scanner.clear();
        } catch {
            // Ignore clear errors during teardown.
        }

        scannerRef.current = null;
        setScannerActive(false);
    }, []);

    const handleDetectedQr = useCallback(
        async (decodedText: string) => {
            const searchValue = extractSearchTermFromQr(decodedText);
            if (!searchValue) return;

            setSearchTerm(searchValue);
            setScannerOpen(false);
            await executeSearch(searchValue);
        },
        [executeSearch],
    );

    const startScanner = useCallback(async () => {
        if (typeof window === "undefined") return;
        if (scannerRef.current) return;

        try {
            const { Html5Qrcode } = await import("html5-qrcode");
            const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID, { verbose: false });
            scannerRef.current = scanner as unknown as Html5QrcodeLike;
            setScannerActive(true);

            await scanner.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    void handleDetectedQr(decodedText);
                },
                () => {
                    // Keep scanning silently until a valid QR is found.
                },
            );
        } catch (scannerError) {
            console.error("Error al iniciar el escáner QR:", scannerError);
            setScannerError("No se pudo iniciar la cámara. Revisa permisos o intenta de nuevo.");
            await stopScanner();
            setScannerOpen(false);
        }
    }, [handleDetectedQr, stopScanner]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const queryValue = (params.get("q") || "").trim();
        if (!queryValue) return;

        setSearchTerm(queryValue);
        void executeSearch(queryValue);
    }, [executeSearch]);

    useEffect(() => {
        if (!scannerOpen) {
            void stopScanner();
            return;
        }

        setScannerError("");
        void startScanner();

        return () => {
            void stopScanner();
        };
    }, [scannerOpen, startScanner, stopScanner]);

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await executeSearch(searchTerm);
    };

    const openScanner = () => {
        setError("");
        setScannerError("");
        setScannerOpen(true);
    };

    const resetForNextScan = () => {
        setResult(null);
        setError("");
        setSearchTerm("");
        setScannerError("");
        setScannerOpen(true);
    };

    const resultThemeClass = isPaid
        ? "border-emerald-500/30 bg-gradient-to-br from-emerald-950 via-black to-black"
        : "border-red-500/30 bg-gradient-to-br from-red-950 via-amber-950 to-black";

    const resultLabelClass = isPaid
        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
        : "border-amber-400/30 bg-amber-400/10 text-amber-100";

    return (
        <section className="min-h-screen bg-black px-4 py-10 text-zinc-100 sm:px-6 sm:py-14">
            <div className="mx-auto w-full max-w-4xl">
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
                    <button
                        type="button"
                        onClick={openScanner}
                        className="mt-3 h-12 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-6 text-sm font-bold uppercase tracking-[0.12em] text-zinc-100 transition hover:border-orange-500 hover:bg-neutral-800 sm:w-auto"
                    >
                        Escanear QR
                    </button>
                </form>

                {error && (
                    <div className="mt-4 rounded-xl border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                        {error}
                    </div>
                )}
            </div>

            {result && (
                <div className={`fixed inset-0 z-40 overflow-y-auto px-4 py-6 text-white sm:px-6 sm:py-8 ${resultThemeClass}`}>
                    <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col justify-center gap-6">
                        <div className="rounded-3xl border border-white/10 bg-black/40 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur-md sm:p-8">
                            <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr] lg:items-center">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.28em] text-white/70">Check-in validado</p>
                                    <h2 className="mt-3 text-4xl font-extrabold leading-tight sm:text-6xl">
                                        {result.fullName}
                                    </h2>
                                    <p className="mt-3 text-lg font-semibold text-white/80 sm:text-2xl">
                                        {result.participantCategory}
                                    </p>
                                    <div className={`mt-5 inline-flex rounded-full border px-4 py-2 text-lg font-black uppercase tracking-[0.18em] ${resultLabelClass}`}>
                                        {paymentLabel}
                                    </div>

                                    <div className="mt-6 grid gap-3 text-sm text-white/85 sm:grid-cols-2">
                                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                            <p className="text-[10px] uppercase tracking-[0.22em] text-white/55">Capítulo</p>
                                            <p className="mt-1 text-base font-semibold">{result.chapter}</p>
                                        </div>
                                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                            <p className="text-[10px] uppercase tracking-[0.22em] text-white/55">Registrado</p>
                                            <p className="mt-1 text-base font-semibold">{formatDateTime(result.createdAt)}</p>
                                        </div>
                                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                            <p className="text-[10px] uppercase tracking-[0.22em] text-white/55">Llegada</p>
                                            <p className="mt-1 text-base font-semibold">{result.arrivalMethod || "No especificado"}</p>
                                        </div>
                                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                            <p className="text-[10px] uppercase tracking-[0.22em] text-white/55">Necesita transporte</p>
                                            <p className="mt-1 text-base font-semibold">{result.needsTransport ? "Sí" : "No"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-white/15 bg-white p-4 text-black shadow-2xl">
                                    <div className="mx-auto w-fit rounded-2xl bg-white p-3">
                                        <QRCode value={qrValue} size={210} includeMargin={true} bgColor="#ffffff" fgColor="#000000" />
                                    </div>
                                    <p className="mt-4 text-center text-sm font-semibold uppercase tracking-[0.14em] text-neutral-600">
                                        Presenta este código en la zona de Check-in
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={resetForNextScan}
                                    className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/10 px-6 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-white/15"
                                >
                                    Continuar / Siguiente Escaneo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {scannerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 px-4 py-6 backdrop-blur-sm">
                    <div className="w-full max-w-3xl rounded-3xl border border-neutral-800 bg-neutral-950 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.65)] sm:p-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Escáner QR</p>
                                <h3 className="mt-1 text-xl font-bold text-zinc-100 sm:text-2xl">Apunta la cámara al código</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setScannerOpen(false)}
                                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-200 transition hover:bg-white/10"
                            >
                                Cerrar
                            </button>
                        </div>

                        <div className="mt-5 overflow-hidden rounded-3xl border border-neutral-800 bg-black p-3">
                            <div id={SCANNER_ELEMENT_ID} className="mx-auto min-h-[320px] w-full max-w-[520px]" />
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3 text-sm text-zinc-400">
                            <span>{scannerActive ? "Cámara activa" : "Iniciando cámara..."}</span>
                            <span>Escanea el QR del pasajero para buscar automáticamente</span>
                        </div>

                        {scannerError && (
                            <div className="mt-4 rounded-xl border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                                {scannerError}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
