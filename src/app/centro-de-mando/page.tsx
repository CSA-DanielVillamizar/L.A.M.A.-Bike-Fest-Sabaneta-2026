"use client";

import { scaleLinear } from "d3-scale";
import { useEffect, useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import {
    Bar,
    BarChart,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const SESSION_PASSWORD_KEY = "lama-admin-access-password";
const WORLD_GEO_URL = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

type OfficialAdminRecord = {
    id: string;
    name: string;
    chapter: string;
    country: string;
    phone: string;
    email: string;
    companions: string;
    isPaid: boolean;
    totalToPay: number;
    createdAt: string;
};

type ClubAdminRecord = {
    id: string;
    name: string;
    delegate: string;
    country: string;
    phone: string;
    attendees: number;
    isPaid: boolean;
    createdAt: string;
};

type AdminPayload = {
    officials: OfficialAdminRecord[];
    clubs: ClubAdminRecord[];
    analytics: {
        registrationsByCountry: Array<{ country: string; totalPeople: number }>;
        registrationsByCountryIso: Array<{ country: string; isoA3: string; totalPeople: number }>;
        registrationsByChapter: Array<{ chapter: string; totalPeople: number }>;
        globalCountryProgress: {
            activeCountries: number;
            goalCountries: number;
            percentage: number;
            countries: string[];
        };
    };
};

const DONUT_COLORS = ["#f97316", "#ea580c", "#c2410c", "#a16207", "#0f172a", "#1f2937", "#334155", "#52525b"];

function downloadCsvFile(filename: string, rows: string[][]) {
    // Agregar BOM para UTF-8 — obliga a Excel a reconocer acentos y ñ
    const BOM = '\uFEFF';
    const csvContent = BOM + rows
        .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

export default function AdminPage() {
    const expectedPassword = process.env.NEXT_PUBLIC_ADMIN_ACCESS_PASSWORD ?? "";
    const [officials, setOfficials] = useState<OfficialAdminRecord[]>([]);
    const [clubs, setClubs] = useState<ClubAdminRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [pendingKeys, setPendingKeys] = useState<Record<string, boolean>>({});
    const [registrationsByCountry, setRegistrationsByCountry] = useState<Array<{ country: string; totalPeople: number }>>([]);
    const [registrationsByCountryIso, setRegistrationsByCountryIso] = useState<Array<{ country: string; isoA3: string; totalPeople: number }>>([]);
    const [registrationsByChapter, setRegistrationsByChapter] = useState<Array<{ chapter: string; totalPeople: number }>>([]);
    const [globalCountryProgress, setGlobalCountryProgress] = useState({
        activeCountries: 0,
        goalCountries: 26,
        percentage: 0,
    });
    const [mapTooltip, setMapTooltip] = useState<{ country: string; totalPeople: number } | null>(null);
    const [copyToast, setCopyToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [passwordInput, setPasswordInput] = useState("");
    const [accessPassword, setAccessPassword] = useState("");
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const robotsMeta = document.querySelector('meta[name="robots"]') ?? document.createElement("meta");
        robotsMeta.setAttribute("name", "robots");
        robotsMeta.setAttribute("content", "noindex, nofollow");
        if (!robotsMeta.parentElement) {
            document.head.appendChild(robotsMeta);
        }

        return () => {
            if (robotsMeta.parentElement) {
                robotsMeta.parentElement.removeChild(robotsMeta);
            }
        };
    }, []);

    useEffect(() => {
        const storedPassword = window.sessionStorage.getItem(SESSION_PASSWORD_KEY) ?? "";
        if (expectedPassword && storedPassword === expectedPassword) {
            setAccessPassword(storedPassword);
            setIsAuthorized(true);
        } else {
            window.sessionStorage.removeItem(SESSION_PASSWORD_KEY);
        }
    }, [expectedPassword]);

    useEffect(() => {
        if (!isAuthorized || !accessPassword) {
            setLoading(false);
            return;
        }

        const loadData = async () => {
            try {
                setLoading(true);
                setErrorMessage("");
                const response = await fetch("/api/management/registrations", {
                    cache: "no-store",
                    headers: {
                        "x-admin-access-password": accessPassword,
                    },
                });
                const data = (await response.json()) as AdminPayload | { error?: string };

                if (!response.ok || !("officials" in data) || !("clubs" in data)) {
                    throw new Error("error" in data ? data.error || "No fue posible cargar el panel." : "No fue posible cargar el panel.");
                }

                setOfficials(data.officials);
                setClubs(data.clubs);
                setRegistrationsByCountry(data.analytics?.registrationsByCountry ?? []);
                setRegistrationsByCountryIso(data.analytics?.registrationsByCountryIso ?? []);
                setRegistrationsByChapter(data.analytics?.registrationsByChapter ?? []);
                setGlobalCountryProgress(data.analytics?.globalCountryProgress ?? { activeCountries: 0, goalCountries: 26, percentage: 0 });
            } catch (error) {
                setErrorMessage(error instanceof Error ? error.message : "No fue posible cargar el panel.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [isAuthorized, accessPassword]);

    const totalPaidCount = useMemo(
        () => officials.filter((item) => item.isPaid).length + clubs.filter((item) => item.isPaid).length,
        [officials, clubs],
    );

    const totalRecordsCount = useMemo(
        () => officials.length + clubs.length,
        [officials.length, clubs.length],
    );

    const totalConfirmedPeople = useMemo(
        () => registrationsByCountry.reduce((sum, item) => sum + item.totalPeople, 0),
        [registrationsByCountry],
    );

    const totalRevenueAmount = useMemo(
        () => officials.filter((item) => item.isPaid).reduce((sum, item) => sum + (Number(item.totalToPay) || 0), 0),
        [officials],
    );

    const chapterDonutData = useMemo(() => {
        if (registrationsByChapter.length <= 8) return registrationsByChapter;

        const top = registrationsByChapter.slice(0, 7);
        const othersTotal = registrationsByChapter
            .slice(7)
            .reduce((sum, item) => sum + item.totalPeople, 0);

        return [...top, { chapter: "Otras delegaciones", totalPeople: othersTotal }];
    }, [registrationsByChapter]);

    const handleTogglePayment = async (id: string, type: "official" | "club") => {
        const key = `${type}:${id}`;
        setPendingKeys((current) => ({ ...current, [key]: true }));

        try {
            const response = await fetch("/api/management/toggle-payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-admin-access-password": accessPassword,
                },
                body: JSON.stringify({ id, type }),
            });

            const data = (await response.json()) as { isPaid?: boolean; error?: string };
            if (!response.ok || typeof data.isPaid !== "boolean") {
                throw new Error(data.error || "No fue posible actualizar el pago.");
            }

            if (type === "official") {
                setOfficials((current) =>
                    current.map((item) => (item.id === id ? { ...item, isPaid: data.isPaid as boolean } : item)),
                );
            } else {
                setClubs((current) =>
                    current.map((item) => (item.id === id ? { ...item, isPaid: data.isPaid as boolean } : item)),
                );
            }
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "No fue posible actualizar el pago.");
        } finally {
            setPendingKeys((current) => ({ ...current, [key]: false }));
        }
    };

    const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!expectedPassword) {
            setErrorMessage("La contraseña administrativa no está configurada en el entorno.");
            return;
        }

        if (passwordInput !== expectedPassword) {
            setErrorMessage("Contraseña incorrecta.");
            return;
        }

        window.sessionStorage.setItem(SESSION_PASSWORD_KEY, passwordInput);
        setAccessPassword(passwordInput);
        setIsAuthorized(true);
        setPasswordInput("");
        setErrorMessage("");
    };

    const handleLogout = () => {
        window.sessionStorage.removeItem(SESSION_PASSWORD_KEY);
        setAccessPassword("");
        setIsAuthorized(false);
        setOfficials([]);
        setClubs([]);
        setRegistrationsByCountry([]);
        setRegistrationsByCountryIso([]);
        setRegistrationsByChapter([]);
        setGlobalCountryProgress({ activeCountries: 0, goalCountries: 26, percentage: 0 });
        setMapTooltip(null);
    };

    const countryTotalsByIso = useMemo(() => {
        const entries = registrationsByCountryIso.map((item) => [item.isoA3.toUpperCase(), item] as const);
        return new Map(entries);
    }, [registrationsByCountryIso]);

    const maxCountryPeople = useMemo(
        () => Math.max(0, ...registrationsByCountryIso.map((item) => item.totalPeople)),
        [registrationsByCountryIso],
    );

    const heatColorScale = useMemo(() => {
        return scaleLinear<string>()
            .domain([1, Math.max(1, maxCountryPeople)])
            .range(["#fdba74", "#f97316"]);
    }, [maxCountryPeople]);

    const handleExportCsv = () => {
        // Función helper para formatear fechas
        const formatDate = (dateString: string): string => {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        };

        const rows: string[][] = [
            ["Tipo", "Nombre", "Capítulo/Delegado", "País", "Teléfono", "Correo", "Acompañantes", "Pagado", "Fecha"],
            ...officials.map((item) => [
                "Inscrito Oficial",
                item.name,
                item.chapter,
                item.country,
                item.phone,
                "-",
                item.companions,
                item.isPaid ? "Pagado" : "Pendiente",
                formatDate(item.createdAt),
            ]),
            ...clubs.map((item) => [
                "Club",
                item.name,
                item.delegate,
                item.country,
                item.phone,
                "-",
                `${item.attendees} asistentes estimados`,
                item.isPaid ? "Pagado" : "Pendiente",
                formatDate(item.createdAt),
            ]),
        ];

        downloadCsvFile("centro-de-mando-xiii-aniversario.csv", rows);
    };

    const handleCopyDailyReport = async () => {
        const now = new Date();
        const formattedDate = now.toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });

        const formattedRevenue = new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(totalRevenueAmount);

        const report = `📊 *REPORTE DIARIO: XIII ANIVERSARIO L.A.M.A. MEDELLÍN* 🏍️
📅 Fecha: ${formattedDate}

🌎 *Países Confirmados:* ${globalCountryProgress.activeCountries} de 26 (${globalCountryProgress.percentage}%)
👥 *Total Almas Confirmadas:* ${totalConfirmedPeople} (Pilotos + Acompañantes)
💰 *Recaudación Total:* $${formattedRevenue} USD

🏁 _"¡La pasión no conoce fronteras, nos vemos en Sabaneta!"_
🌐 lamabikefestsabaneta.com`;

        try {
            await navigator.clipboard.writeText(report);
            setCopyToast({ type: "success", message: "¡Reporte copiado! Listo para pegar en WhatsApp" });
        } catch {
            setCopyToast({ type: "error", message: "No fue posible copiar el reporte. Intenta nuevamente." });
        }

        window.setTimeout(() => setCopyToast(null), 2600);
    };

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6">
                <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-2xl border border-white/10 bg-black/40 p-6 sm:p-8">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">
                            Acceso Protegido
                        </p>
                        <h1 className="mt-3 font-display text-3xl font-bold text-zinc-100">
                            Centro de Mando Administrativo
                        </h1>
                        <p className="mt-2 text-sm text-zinc-400">
                            Ingresa la contraseña administrativa para visualizar el panel de inscritos y pagos.
                        </p>
                    </div>

                    {errorMessage ? (
                        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                            {errorMessage}
                        </div>
                    ) : null}

                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <label className="flex flex-col gap-2 text-sm text-zinc-300">
                            Contraseña
                            <input
                                type="password"
                                value={passwordInput}
                                onChange={(event) => setPasswordInput(event.target.value)}
                                className="rounded-xl border border-zinc-700 bg-zinc-900/70 px-4 py-3 text-zinc-100 outline-none ring-orange-400/40 transition focus:ring"
                                placeholder="Ingresa la clave de acceso"
                                autoComplete="current-password"
                            />
                        </label>

                        <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-zinc-950 transition hover:bg-orange-400"
                        >
                            Ingresar al Panel
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
                <header className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/40 p-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">
                            Centro de Mando Administrativo
                        </p>
                        <h1 className="mt-3 font-display text-3xl font-bold text-zinc-100">
                            XIII Aniversario L.A.M.A. Medellin
                        </h1>
                        <p className="mt-2 max-w-3xl text-sm text-zinc-400 sm:text-base">
                            Gestiona inscritos, clubes confirmados y estados de pago desde un solo panel operativo.
                        </p>

                        <div className="mt-5 w-full max-w-3xl rounded-xl border border-orange-500/30 bg-zinc-900/75 p-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                <p className="font-display text-lg font-bold leading-tight text-zinc-100 sm:text-2xl">
                                    Llevamos {globalCountryProgress.activeCountries} de {globalCountryProgress.goalCountries} países confirmados
                                </p>
                                <p className="text-sm font-semibold text-orange-300 sm:text-base">
                                    {globalCountryProgress.percentage}% de la meta global
                                </p>
                            </div>

                            <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-[#1a1a1a]">
                                <div
                                    className="h-full rounded-full bg-[#f97316] transition-all duration-500"
                                    style={{ width: `${globalCountryProgress.percentage}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:items-end">
                        <div className="flex flex-wrap gap-2 sm:justify-end">
                            <button
                                type="button"
                                onClick={handleCopyDailyReport}
                                className="inline-flex items-center justify-center rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold uppercase tracking-[0.08em] text-zinc-950 transition hover:brightness-110"
                            >
                                Copiar Reporte Diario
                            </button>

                            <button
                                type="button"
                                onClick={handleExportCsv}
                                className="inline-flex items-center justify-center rounded-full border border-orange-400 px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-orange-300 transition hover:bg-orange-500/10"
                            >
                                Exportar CSV
                            </button>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="inline-flex items-center justify-center rounded-full border border-zinc-600 px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-zinc-300 transition hover:border-zinc-400 hover:text-zinc-100"
                            >
                                Cerrar sesión
                            </button>
                        </div>

                        {copyToast ? (
                            <div
                                className={`rounded-lg px-3 py-2 text-xs font-semibold ${copyToast.type === "success"
                                    ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                                    : "border border-red-500/40 bg-red-500/10 text-red-300"
                                    }`}
                            >
                                {copyToast.message}
                            </div>
                        ) : null}
                    </div>
                </header>

                <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <article className="rounded-2xl border border-white/10 bg-black/35 p-6">
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Total Recaudado</p>
                        <p className="mt-3 font-display text-4xl font-bold text-orange-300">{totalPaidCount}</p>
                        <p className="mt-2 text-sm text-zinc-400">Pagos confirmados en el sistema.</p>
                    </article>

                    <article className="rounded-2xl border border-white/10 bg-black/35 p-6">
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Total Inscritos</p>
                        <p className="mt-3 font-display text-4xl font-bold text-zinc-100">{totalRecordsCount}</p>
                        <p className="mt-2 text-sm text-zinc-400">Registros oficiales y clubes consolidados.</p>
                    </article>
                </section>

                <section className="rounded-2xl border border-white/10 bg-black/35 p-6">
                    <div className="mb-4 flex flex-col gap-2">
                        <h2 className="font-display text-2xl font-bold text-zinc-100">Mapa de Calor Mundial</h2>
                        <p className="text-sm text-zinc-400">
                            Densidad de inscritos por país, sumando oficiales, acompañantes y asistentes estimados de clubes.
                        </p>
                    </div>

                    <div className="relative h-[340px] w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-950/60 sm:h-[420px]">
                        <ComposableMap
                            projection="geoMercator"
                            projectionConfig={{ scale: 120 }}
                            width={980}
                            height={460}
                            style={{ width: "100%", height: "100%" }}
                        >
                            <Geographies geography={WORLD_GEO_URL}>
                                {({ geographies }) =>
                                    geographies.map((geo) => {
                                        const isoA3 = String(geo.id || "").toUpperCase();
                                        const countryData = countryTotalsByIso.get(isoA3);
                                        const totalPeople = countryData?.totalPeople || 0;
                                        const countryName = countryData?.country || (geo.properties.name as string) || "País";

                                        const fillColor = totalPeople > 0
                                            ? heatColorScale(totalPeople)
                                            : "#1a1a1a";

                                        return (
                                            <Geography
                                                key={geo.rsmKey}
                                                geography={geo}
                                                onMouseEnter={() => {
                                                    if (totalPeople > 0) {
                                                        setMapTooltip({ country: countryName, totalPeople });
                                                    }
                                                }}
                                                onMouseLeave={() => setMapTooltip(null)}
                                                style={{
                                                    default: {
                                                        fill: fillColor,
                                                        stroke: "#27272a",
                                                        strokeWidth: 0.5,
                                                        outline: "none",
                                                    },
                                                    hover: {
                                                        fill: totalPeople > 0 ? "#fb923c" : "#262626",
                                                        stroke: "#3f3f46",
                                                        strokeWidth: 0.7,
                                                        outline: "none",
                                                    },
                                                    pressed: {
                                                        fill: fillColor,
                                                        outline: "none",
                                                    },
                                                }}
                                            />
                                        );
                                    })
                                }
                            </Geographies>
                        </ComposableMap>

                        <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg border border-white/10 bg-black/70 px-3 py-2 text-[11px] text-zinc-300">
                            <div className="mb-1 text-[10px] uppercase tracking-[0.14em] text-zinc-400">Intensidad</div>
                            <div className="h-2 w-28 rounded-full bg-gradient-to-r from-[#fdba74] to-[#f97316]" />
                            <div className="mt-1 flex justify-between text-[10px] text-zinc-400">
                                <span>1</span>
                                <span>{maxCountryPeople || 0}</span>
                            </div>
                        </div>

                        {mapTooltip && (
                            <div className="pointer-events-none absolute right-3 top-3 rounded-lg border border-orange-500/40 bg-zinc-950/95 px-3 py-2 text-xs text-zinc-100 shadow-lg shadow-black/40">
                                <p className="font-semibold text-orange-300">{mapTooltip.country}</p>
                                <p className="mt-0.5 text-zinc-300">{mapTooltip.totalPeople} persona(s)</p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <article className="rounded-2xl border border-white/10 bg-black/35 p-6">
                        <h2 className="font-display text-2xl font-bold text-zinc-100">Inscritos por País</h2>
                        <p className="mt-1 text-sm text-zinc-400">
                            Total de personas por origen, incluyendo acompañantes y asistentes estimados.
                        </p>
                        <div className="mt-5 h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={registrationsByCountry} margin={{ top: 8, right: 12, left: 0, bottom: 32 }}>
                                    <XAxis
                                        dataKey="country"
                                        stroke="#a1a1aa"
                                        tick={{ fill: "#a1a1aa", fontSize: 12 }}
                                        angle={-20}
                                        textAnchor="end"
                                        interval={0}
                                        height={52}
                                    />
                                    <YAxis stroke="#a1a1aa" tick={{ fill: "#a1a1aa", fontSize: 12 }} allowDecimals={false} />
                                    <Tooltip
                                        cursor={{ fill: "rgba(255,255,255,0.04)" }}
                                        contentStyle={{ background: "#09090b", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "12px" }}
                                        labelStyle={{ color: "#e4e4e7" }}
                                    />
                                    <Bar dataKey="totalPeople" fill="#f97316" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </article>

                    <article className="rounded-2xl border border-white/10 bg-black/35 p-6">
                        <h2 className="font-display text-2xl font-bold text-zinc-100">Distribución por Capítulo</h2>
                        <p className="mt-1 text-sm text-zinc-400">
                            Presencia de capítulos y delegaciones según personas registradas.
                        </p>
                        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,220px)]">
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chapterDonutData}
                                            dataKey="totalPeople"
                                            nameKey="chapter"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={62}
                                            outerRadius={102}
                                            paddingAngle={2}
                                        >
                                            {chapterDonutData.map((item, index) => (
                                                <Cell key={`${item.chapter}-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ background: "#09090b", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "12px" }}
                                            labelStyle={{ color: "#e4e4e7" }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="max-h-72 space-y-2 overflow-auto pr-1 text-xs text-zinc-300">
                                {chapterDonutData.map((item, index) => (
                                    <div key={`${item.chapter}-legend`} className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-zinc-900/50 px-3 py-2">
                                        <span className="inline-flex items-center gap-2">
                                            <span
                                                className="h-2.5 w-2.5 rounded-full"
                                                style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}
                                            />
                                            <span className="max-w-[130px] truncate">{item.chapter}</span>
                                        </span>
                                        <span className="font-semibold text-zinc-100">{item.totalPeople}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </article>
                </section>

                {errorMessage ? (
                    <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {errorMessage}
                    </div>
                ) : null}

                <section className="rounded-2xl border border-white/10 bg-black/35 p-6">
                    <div className="mb-4">
                        <h2 className="font-display text-2xl font-bold text-zinc-100">Inscritos Oficiales</h2>
                        <p className="mt-1 text-sm text-zinc-400">
                            El campo de correo no existe hoy en la base actual; el panel lo marca como no registrado.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="text-xs uppercase tracking-[0.14em] text-zinc-400">
                                <tr className="border-b border-white/10">
                                    <th className="px-3 py-3">Nombre</th>
                                    <th className="px-3 py-3">Capítulo</th>
                                    <th className="px-3 py-3">País</th>
                                    <th className="px-3 py-3">Teléfono</th>
                                    <th className="px-3 py-3">Correo</th>
                                    <th className="px-3 py-3">Acompañante</th>
                                    <th className="px-3 py-3">Pago</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-3 py-6 text-center text-zinc-400">
                                            Cargando inscritos...
                                        </td>
                                    </tr>
                                ) : officials.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-3 py-6 text-center text-zinc-400">
                                            No hay inscritos oficiales registrados.
                                        </td>
                                    </tr>
                                ) : (
                                    officials.map((item) => {
                                        const pendingKey = `official:${item.id}`;
                                        return (
                                            <tr key={item.id} className="border-b border-white/5 align-top">
                                                <td className="px-3 py-3 font-medium text-zinc-100">{item.name}</td>
                                                <td className="px-3 py-3 text-zinc-300">{item.chapter}</td>
                                                <td className="px-3 py-3 text-zinc-300">{item.country}</td>
                                                <td className="px-3 py-3 text-zinc-300">{item.phone}</td>
                                                <td className="px-3 py-3 text-zinc-400">{item.email}</td>
                                                <td className="px-3 py-3 text-zinc-300">{item.companions}</td>
                                                <td className="px-3 py-3">
                                                    <button
                                                        type="button"
                                                        disabled={Boolean(pendingKeys[pendingKey])}
                                                        onClick={() => handleTogglePayment(item.id, "official")}
                                                        className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition disabled:opacity-60 ${item.isPaid
                                                            ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                                                            : "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                                                            }`}
                                                    >
                                                        {pendingKeys[pendingKey] ? "Actualizando..." : item.isPaid ? "Pagado" : "Pendiente"}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="rounded-2xl border border-white/10 bg-black/35 p-6">
                    <div className="mb-4">
                        <h2 className="font-display text-2xl font-bold text-zinc-100">Clubes Confirmados</h2>
                        <p className="mt-1 text-sm text-zinc-400">
                            La base actual guarda ciudad de origen; se muestra en la columna de país como referencia operativa.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="text-xs uppercase tracking-[0.14em] text-zinc-400">
                                <tr className="border-b border-white/10">
                                    <th className="px-3 py-3">Nombre</th>
                                    <th className="px-3 py-3">Delegado</th>
                                    <th className="px-3 py-3">País</th>
                                    <th className="px-3 py-3">Teléfono</th>
                                    <th className="px-3 py-3">Pago</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-3 py-6 text-center text-zinc-400">
                                            Cargando clubes...
                                        </td>
                                    </tr>
                                ) : clubs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-3 py-6 text-center text-zinc-400">
                                            No hay clubes registrados.
                                        </td>
                                    </tr>
                                ) : (
                                    clubs.map((item) => {
                                        const pendingKey = `club:${item.id}`;
                                        return (
                                            <tr key={item.id} className="border-b border-white/5 align-top">
                                                <td className="px-3 py-3 font-medium text-zinc-100">{item.name}</td>
                                                <td className="px-3 py-3 text-zinc-300">{item.delegate}</td>
                                                <td className="px-3 py-3 text-zinc-300">{item.country}</td>
                                                <td className="px-3 py-3 text-zinc-300">{item.phone}</td>
                                                <td className="px-3 py-3">
                                                    <button
                                                        type="button"
                                                        disabled={Boolean(pendingKeys[pendingKey])}
                                                        onClick={() => handleTogglePayment(item.id, "club")}
                                                        className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition disabled:opacity-60 ${item.isPaid
                                                            ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                                                            : "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                                                            }`}
                                                    >
                                                        {pendingKeys[pendingKey] ? "Actualizando..." : item.isPaid ? "Pagado" : "Pendiente"}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}
