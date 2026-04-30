import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

type OfficialRegistrationPayload = {
    participantCategory?: string;
    fullName?: string;
    documentId?: string;
    eps?: string;
    emergencyName?: string;
    emergencyPhone?: string;
    chapter?: string;
    isDirective?: boolean;
    directiveScope?: string | null;
    directiveRole?: string | null;
    arrivalDate?: string;
    medicalCondition?: string | null;
    wantsJersey?: boolean;
    jerseySize?: string | null;
    hasCompanions?: boolean;
    companionsCount?: number;
    totalToPay?: number;
};

const BASE_REGISTRATION_COST = 100000;
const COMPANION_COST = 100000;
const JERSEY_COST = 65000;

type SqlServerConfig = {
    server: string;
    port: number;
    database: string;
    user: string;
    password: string;
    encrypt: boolean;
    trustServerCertificate: boolean;
    loginTimeout: number;
};

function sanitizeText(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function parseBooleanSetting(value: string | undefined, fallback: boolean): boolean {
    if (value === undefined) {
        return fallback;
    }

    return value.toLowerCase() === "true";
}

function parseSqlServerUrl(rawUrl: string | undefined): SqlServerConfig {
    if (!rawUrl) {
        throw new Error("DATABASE_URL no esta configurada.");
    }

    const [basePart, ...segments] = rawUrl.split(";").filter(Boolean);

    if (!basePart.startsWith("sqlserver://")) {
        throw new Error("DATABASE_URL tiene un formato no soportado.");
    }

    const hostPart = basePart.replace("sqlserver://", "");
    const [server, portText] = hostPart.split(":");
    const settings = new Map<string, string>();

    for (const segment of segments) {
        const [key, ...rest] = segment.split("=");
        if (!key || rest.length === 0) {
            continue;
        }

        settings.set(key.toLowerCase(), rest.join("="));
    }

    return {
        server,
        port: Number(portText || 1433),
        database: settings.get("database") || "",
        user: settings.get("user") || "",
        password: settings.get("password") || "",
        encrypt: parseBooleanSetting(settings.get("encrypt"), true),
        trustServerCertificate: parseBooleanSetting(settings.get("trustservercertificate"), false),
        loginTimeout: Number(settings.get("logintimeout") || 30),
    };
}

export async function POST(request: NextRequest) {
    const debugMode = request.headers.get("x-debug") === "1";

    try {
        const body = (await request.json()) as OfficialRegistrationPayload;

        const participantCategory = sanitizeText(body.participantCategory);
        const fullName = sanitizeText(body.fullName);
        const documentId = sanitizeText(body.documentId);
        const eps = sanitizeText(body.eps);
        const emergencyName = sanitizeText(body.emergencyName);
        const emergencyPhone = sanitizeText(body.emergencyPhone);
        const chapter = sanitizeText(body.chapter);
        const arrivalDate = sanitizeText(body.arrivalDate);
        const isDirective = Boolean(body.isDirective);
        const wantsJersey = Boolean(body.wantsJersey);
        const hasCompanions = Boolean(body.hasCompanions);

        const directiveScope = sanitizeText(body.directiveScope);
        const directiveRole = sanitizeText(body.directiveRole);
        const jerseySize = sanitizeText(body.jerseySize);
        const medicalCondition = sanitizeText(body.medicalCondition);

        const companionsCount = hasCompanions
            ? Math.max(0, Number(body.companionsCount) || 0)
            : 0;

        if (
            !participantCategory ||
            !fullName ||
            !documentId ||
            !eps ||
            !emergencyName ||
            !emergencyPhone ||
            !chapter ||
            !arrivalDate
        ) {
            return NextResponse.json(
                { error: "Faltan campos obligatorios del formulario oficial." },
                { status: 400 },
            );
        }

        if (isDirective && (!directiveScope || !directiveRole)) {
            return NextResponse.json(
                { error: "Debes seleccionar ambito y cargo para directivos." },
                { status: 400 },
            );
        }

        if (wantsJersey && !jerseySize) {
            return NextResponse.json(
                { error: "Debes seleccionar una talla de camiseta." },
                { status: 400 },
            );
        }

        if (hasCompanions && companionsCount <= 0) {
            return NextResponse.json(
                { error: "Indica al menos un acompanante." },
                { status: 400 },
            );
        }

        const calculatedTotal =
            BASE_REGISTRATION_COST +
            companionsCount * COMPANION_COST +
            (wantsJersey ? JERSEY_COST : 0);

        const { default: sql } = await import("mssql");
        const generatedId = randomUUID();
        const config = parseSqlServerUrl(process.env.DATABASE_URL);
        const pool = await sql.connect({
            server: config.server,
            port: config.port,
            database: config.database,
            user: config.user,
            password: config.password,
            options: {
                encrypt: config.encrypt,
                trustServerCertificate: config.trustServerCertificate,
            },
            connectionTimeout: config.loginTimeout * 1000,
            requestTimeout: 30000,
        });

        const result = await pool.request()
            .input("id", sql.UniqueIdentifier, generatedId)
            .input("participantCategory", sql.NVarChar(sql.MAX), participantCategory)
            .input("fullName", sql.NVarChar(sql.MAX), fullName)
            .input("documentId", sql.NVarChar(sql.MAX), documentId)
            .input("eps", sql.NVarChar(sql.MAX), eps)
            .input("emergencyName", sql.NVarChar(sql.MAX), emergencyName)
            .input("emergencyPhone", sql.NVarChar(sql.MAX), emergencyPhone)
            .input("chapter", sql.NVarChar(sql.MAX), chapter)
            .input("isDirective", sql.Bit, isDirective)
            .input("directiveScope", sql.NVarChar(sql.MAX), isDirective ? directiveScope : null)
            .input("directiveRole", sql.NVarChar(sql.MAX), isDirective ? directiveRole : null)
            .input("arrivalDate", sql.NVarChar(sql.MAX), arrivalDate)
            .input("medicalCondition", sql.NVarChar(sql.MAX), medicalCondition || null)
            .input("wantsJersey", sql.Bit, wantsJersey)
            .input("jerseySize", sql.NVarChar(sql.MAX), wantsJersey ? jerseySize : null)
            .input("hasCompanions", sql.Bit, hasCompanions)
            .input("companionsCount", sql.Int, companionsCount)
            .input("totalToPay", sql.Float, calculatedTotal)
            .query(`
                INSERT INTO [OfficialRegistration] (
                    [id],
                    [participantCategory],
                    [fullName],
                    [documentId],
                    [eps],
                    [emergencyName],
                    [emergencyPhone],
                    [chapter],
                    [isDirective],
                    [directiveScope],
                    [directiveRole],
                    [arrivalDate],
                    [medicalCondition],
                    [wantsJersey],
                    [jerseySize],
                    [hasCompanions],
                    [companionsCount],
                    [totalToPay]
                )
                OUTPUT INSERTED.[id], INSERTED.[totalToPay]
                VALUES (
                    @id,
                    @participantCategory,
                    @fullName,
                    @documentId,
                    @eps,
                    @emergencyName,
                    @emergencyPhone,
                    @chapter,
                    @isDirective,
                    @directiveScope,
                    @directiveRole,
                    @arrivalDate,
                    @medicalCondition,
                    @wantsJersey,
                    @jerseySize,
                    @hasCompanions,
                    @companionsCount,
                    @totalToPay
                );
            `);

        await pool.close();

        const registration = result.recordset[0];

        return NextResponse.json(
            {
                id: registration.id,
                totalToPay: registration.totalToPay,
                message: "Inscripcion oficial registrada correctamente.",
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error en registro oficial:", error);

        if (debugMode) {
            return NextResponse.json(
                {
                    error: "Debug oficial registration error.",
                    detail: error instanceof Error ? error.message : String(error),
                },
                { status: 200 },
            );
        }

        return NextResponse.json(
            { error: "Error al procesar la inscripcion oficial." },
            { status: 500 },
        );
    }
}
