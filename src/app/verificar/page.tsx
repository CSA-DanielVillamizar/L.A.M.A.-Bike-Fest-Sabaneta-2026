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
const SCAN_FEEDBACK_DELAY_MS = 3000;

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
    const [checkInMode, setCheckInMode] = useState(false);

    const scannerRef = useRef<Html5QrcodeLike | null>(null);
    const scanLockRef = useRef(false);
    const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

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

    const clearResetTimer = useCallback(() => {
        if (resetTimerRef.current) {
            clearTimeout(resetTimerRef.current);
            resetTimerRef.current = null;
        }
    }, []);

    const playBeep = useCallback(async () => {
        try {
            const AudioContextCtor =
                window.AudioContext ||
                (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
            if (!AudioContextCtor) return;

            const context = audioContextRef.current || new AudioContextCtor();
            audioContextRef.current = context;

            if (context.state === "suspended") {
                await context.resume();
            }

            const oscillator = context.createOscillator();
            const gainNode = context.createGain();
            oscillator.type = "sine";
            oscillator.frequency.value = 880;
            gainNode.gain.value = 0.04;
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            oscillator.start();
            oscillator.stop(context.currentTime + 0.18);
        } catch {
            // Audio feedback is optional; ignore browser restrictions silently.
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
            // Ignore stop errors when scanner is not fully started.
        }

        try {
            await scanner.clear();
        } catch {
            // Ignore clear errors during teardown.
        }

        scannerRef.current = null;
        setScannerActive(false);
    }, []);

    const validateScan = useCallback(
        async (rawTerm: string): Promise<VerifyResult | null> => {
            const trimmed = rawTerm.trim();
            if (!trimmed) {
                setResult(null);
                setError("Ingresa un valor para realizar la búsqueda.");
                return null;
            }

            const response = await fetch("/api/verificar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ searchTerm: trimmed }),
            });

            const payload = (await response.json()) as VerifyResult & { error?: string };

            if (!response.ok) {
                setResult(null);
                setError(payload.error || "No fue posible validar la inscripción.");
                return null;
            }

            setError("");
            setResult(payload);
            return payload;
        },
        [],
    );

    const executeSearch = useCallback(
        async (rawTerm: string) => {
            const trimmed = rawTerm.trim();
            if (!trimmed) {
                setResult(null);
                setError("Ingresa un valor para realizar la búsqueda.");
                return;
            }

            setLoading(true);
            setResult(null);
            setCheckInMode(false);

            try {
                await validateScan(trimmed);
            } catch {
                setError("Ocurrió un error de red. Inténtalo de nuevo.");
            } finally {
                setLoading(false);
            }
        },
        [validateScan],
    );

    const handleDetectedQr = useCallback(
        async (decodedText: string) => {
            if (scanLockRef.current) return;

            const extractedTerm = extractSearchTermFromQr(decodedText);
            if (!extractedTerm) return;

            scanLockRef.current = true;
            setSearchTerm(extractedTerm);
            setLoading(true);
            setScannerError("");

            try {
                const payload = await validateScan(extractedTerm);
                if (!payload) {
                    scanLockRef.current = false;
                    return;
                }

                setScannerOpen(false);
                setCheckInMode(true);
                await playBeep();

                clearResetTimer();
                resetTimerRef.current = setTimeout(() => {
                    setResult(null);
                    setCheckInMode(false);
                    setSearchTerm("");
                    setScannerOpen(true);
                    scanLockRef.current = false;
                }, SCAN_FEEDBACK_DELAY_MS);
            } catch {
                setError("Ocurrió un error de red. Inténtalo de nuevo.");
                scanLockRef.current = false;
            } finally {
                setLoading(false);
            }
        },
        [clearResetTimer, playBeep, validateScan],
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
        } catch (scannerStartError) {
            console.error("Error al iniciar el escaner QR:", scannerStartError);
            setScannerError("No se pudo iniciar la camara. Revisa permisos o intenta de nuevo.");
            await stopScanner();
            setScannerOpen(false);
            scanLockRef.current = false;
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

    useEffect(() => {
        return () => {
            clearResetTimer();
            void stopScanner();
            if (audioContextRef.current) {
                void audioContextRef.current.close();
            }
        };
    }, [clearResetTimer, stopScanner]);

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await executeSearch(searchTerm);
    };

    const enableScannerMode = () => {
        clearResetTimer();
        scanLockRef.current = false;
        setResult(null);
        setError("");
        setScannerError("");
        setCheckInMode(false);
        setSearchTerm("");
        setScannerOpen(true);
    };

    const exitScannerMode = async () => {
        clearResetTimer();
        scanLockRef.current = false;
        setCheckInMode(false);
        setResult(null);
        setScannerError("");
        setError("");
        setSearchTerm("");
        setScannerOpen(false);
        await stopScanner();
    };

    const resetForNextScan = () => {
        clearResetTimer();
        scanLockRef.current = false;
        setResult(null);
        setError("");
        setScannerError("");
        setCheckInMode(false);
        setSearchTerm("");
        setScannerOpen(true);
    };

    const resultThemeClass = isPaid
        ? "border-emerald-500/30 bg-gradient-to-br from-emerald-950 via-black to-black"
        : "border-red-500/30 bg-gradient-to-br from-red-950 via-amber-950 to-black";

    const resultLabelClass = isPaid
        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
        : "border-amber-400/30 bg-amber-400/10 text-amber-100";

    const scannerHint = checkInMode ? "Validando..." : scannerActive ? "Camara activa" : "Iniciando camara...";

    return (
        <section className="min-h-screen bg-black px-4 py-10 text-zinc-100 sm:px-6 sm:py-14">
            <div className="mx-auto w-full max-w-4xl">
                <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl">
                    Verifica tu inscripcion
                </h1>

                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    Busca por correo, celular, codigo de confirmacion o numero del documento (coincidencia exacta)
                    para confirmar tu pre-inscripcion al Aniversario. Nota: el codigo de confirmacion solo verifica
                    que te pre-inscribiste; no confirma que ya pagaste. La confirmacion del pago es un proceso manual
                    y puede tardar varios dias en reflejarse en esta busqueda.
                </p>

                <form
                    onSubmit={onSubmit}
                    className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4 sm:p-5"
                >
                    <label
                        htmlFor="searchTerm"
                        className="mb-2 block text-xs uppercase tracking-[0.2em] text-zinc-500"
                    >
                        Datos de busqueda
                    </label>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                            id="searchTerm"
                            type="text"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Correo, celular, codigo de confirmacion o documento"
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
                        onClick={enableScannerMode}
                        className="mt-3 h-12 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-6 text-sm font-bold uppercase tracking-[0.12em] text-zinc-100 transition hover:border-orange-500 hover:bg-neutral-800 sm:w-auto"
                    >
                        Activar Modo Escaner
                    </button>
                </form>

                {error && (
                    <div className="mt-4 rounded-xl border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                        {error}
                    </div>
                )}

                {result && !checkInMode && (
                    <article className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5 shadow-[0_22px_60px_rgba(0,0,0,0.45)] sm:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-xl font-extrabold tracking-tight text-zinc-100 sm:text-2xl">
                                {result.fullName}
                            </h2>
                            <span
                                className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${resultLabelClass}`}
                            >
                                {paymentLabel}
                            </span>
                        </div>

                        <dl className="mt-5 grid gap-4 text-sm text-zinc-300 sm:grid-cols-2">
                            <div className="rounded-xl border border-neutral-800 bg-black/70 p-3">
                                <dt className="text-xs uppercase tracking-[0.12em] text-zinc-500">Documento</dt>
                                <dd className="mt-1 font-semibold text-zinc-100">{result.document}</dd>
                            </div>
                            <div className="rounded-xl border border-neutral-800 bg-black/70 p-3">
                                <dt className="text-xs uppercase tracking-[0.12em] text-zinc-500">Capitulo</dt>
                                <dd className="mt-1 font-semibold text-zinc-100">{result.chapter || "No registrado"}</dd>
                            </div>
                            <div className="rounded-xl border border-neutral-800 bg-black/70 p-3">
                                <dt className="text-xs uppercase tracking-[0.12em] text-zinc-500">Pais</dt>
                                <dd className="mt-1 font-semibold text-zinc-100">{result.country || "No registrado"}</dd>
                            </div>
                            <div className="rounded-xl border border-neutral-800 bg-black/70 p-3">
                                <dt className="text-xs uppercase tracking-[0.12em] text-zinc-500">Categoria</dt>
                                <dd className="mt-1 font-semibold text-zinc-100">
                                    {result.participantCategory || "No registrada"}
                                </dd>
                            </div>
                            <div className="rounded-xl border border-neutral-800 bg-black/70 p-3">
                                <dt className="text-xs uppercase tracking-[0.12em] text-zinc-500">Metodo de llegada</dt>
                                <dd className="mt-1 font-semibold text-zinc-100">
                                    {result.arrivalMethod || "No registrado"}
                                </dd>
                            </div>
                            <div className="rounded-xl border border-neutral-800 bg-black/70 p-3">
                                <dt className="text-xs uppercase tracking-[0.12em] text-zinc-500">Fecha de llegada</dt>
                                <dd className="mt-1 font-semibold text-zinc-100">{result.arrivalDate || "No registrada"}</dd>
                            </div>
                            <div className="rounded-xl border border-neutral-800 bg-black/70 p-3 sm:col-span-2">
                                <dt className="text-xs uppercase tracking-[0.12em] text-zinc-500">Pre-inscripcion registrada</dt>
                                <dd className="mt-1 font-semibold text-zinc-100">{formatDateTime(result.createdAt)}</dd>
                            </div>
                        </dl>

                        {qrValue && (
                            <div className="mt-6 rounded-2xl border border-neutral-800 bg-black/70 p-4">
                                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Credencial QR</p>
                                <div className="mt-3 flex flex-col items-center gap-3 rounded-xl border border-neutral-800 bg-white p-4 text-center text-zinc-900 sm:flex-row sm:items-center sm:justify-between sm:text-left">
                                    <QRCode value={qrValue} size={150} level="M" includeMargin />
                                    <div className="max-w-sm text-sm">
                                        <p className="font-semibold">Presenta este codigo QR en el acceso.</p>
                                        <p className="mt-1 text-zinc-700">Al escanearlo se abrira la validacion automatica en el modulo de verificacion.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </article>
                )}
            </div>

            {result && checkInMode && (
                <div className={`fixed inset-0 z-40 overflow-y-auto px-4 py-6 text-white sm:px-6 sm:py-8 ${resultThemeClass}`}>
                    <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col justify-center gap-6">
                        <div className="rounded-3xl border border-white/10 bg-black/40 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur-md sm:p-8">
                            <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr] lg:items-center">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.28em] text-white/70">Check-in validado</p>
                                    <h2 className="mt-3 text-4xl font-extrabold leading-tight sm:text-6xl">{result.fullName}</h2>
                                    <p className="mt-3 text-lg font-semibold text-white/80 sm:text-2xl">
                                        {result.participantCategory}
                                    </p>
                                    <div
                                        className={`mt-5 inline-flex rounded-full border px-4 py-2 text-lg font-black uppercase tracking-[0.18em] ${resultLabelClass}`}
                                    >
                                        {isPaid ? "ACCESO CONCEDIDO" : "PAGO PENDIENTE: DIRIGIR A TESORERIA"}
                                    </div>

                                    <dl className="mt-6 grid gap-3 text-sm text-white/85 sm:grid-cols-2">
                                        <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                                            <dt className="text-xs uppercase tracking-[0.12em] text-white/60">Documento</dt>
                                            <dd className="mt-1 text-base font-bold">{result.document}</dd>
                                        </div>
                                        <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                                            <dt className="text-xs uppercase tracking-[0.12em] text-white/60">Capitulo</dt>
                                            <dd className="mt-1 text-base font-bold">{result.chapter || "No registrado"}</dd>
                                        </div>
                                        <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                                            <dt className="text-xs uppercase tracking-[0.12em] text-white/60">Pais</dt>
                                            <dd className="mt-1 text-base font-bold">{result.country || "No registrado"}</dd>
                                        </div>
                                        <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                                            <dt className="text-xs uppercase tracking-[0.12em] text-white/60">Pre-inscripcion</dt>
                                            <dd className="mt-1 text-base font-bold">{formatDateTime(result.createdAt)}</dd>
                                        </div>
                                    </dl>
                                </div>

                                {qrValue && (
                                    <div className="rounded-2xl border border-white/10 bg-white p-4 text-center text-zinc-900 shadow-2xl">
                                        <QRCode value={qrValue} size={210} level="M" includeMargin />
                                        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
                                            Ticket oficial
                                        </p>
                                        <p className="mt-1 text-[11px] text-zinc-600 break-all">{qrValue}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={resetForNextScan}
                                    className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/10 px-6 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-white/15"
                                >
                                    Continuar / Siguiente Escaneo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        void exitScannerMode();
                                    }}
                                    className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-white/10"
                                >
                                    Salir del Modo Escaner
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {scannerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 px-4 py-6 backdrop-blur-sm">
                    <div className="w-full max-w-xl rounded-2xl border border-neutral-800 bg-neutral-950 p-5 shadow-[0_25px_70px_rgba(0,0,0,0.6)]">
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="text-lg font-bold text-zinc-100">Escaner QR</h3>
                            <button
                                type="button"
                                onClick={() => {
                                    void exitScannerMode();
                                }}
                                className="rounded-lg border border-neutral-700 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-zinc-300 transition hover:border-red-500 hover:text-red-300"
                            >
                                Cerrar
                            </button>
                        </div>

                        <p className="mt-2 text-sm text-zinc-400">
                            Apunta al codigo QR del asistente para validar de forma automatica.
                        </p>

                        <div className="mt-4 overflow-hidden rounded-xl border border-neutral-800 bg-black p-2">
                            <div id={SCANNER_ELEMENT_ID} className="mx-auto w-full max-w-md" />
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3 text-sm text-zinc-400">
                            <span>{scannerHint}</span>
                            <span>Escanea el QR del pasajero para buscar automaticamente</span>
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
