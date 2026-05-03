import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

type CompanionPayload = {
    fullName?: string;
    documentId?: string;
    category?: string;
    wantsJersey?: boolean;
    jerseySize?: string | null;
};

type OfficialRegistrationPayload = {
    participantCategory?: string;
    fullName?: string;
    documentId?: string;
    eps?: string;
    emergencyName?: string;
    emergencyPhone?: string;
    country?: string;
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
    companions?: CompanionPayload[];
    totalToPay?: number;
};

const MEMBER_PRICE = 100000;
const SHIRT_PRICE = 65000;
const SATURDAY_PASS_COST = 85000;

const ALLOWED_PARTICIPANT_CATEGORIES = new Set([
    "DAMA L.A.M.A.",
    "FULL COLOR MEMBER",
    "ROCKET PROSPECT",
    "PROSPECT",
    "ESPOSA",
    "ASOCIADO",
    "INVITADO",
    "CLUB HERMANO / INVITADO (Solo Sábado)",
]);

const ALLOWED_COMPANION_CATEGORIES = new Set(["ESPOSA", "INVITADO", "HIJO/A", "CLUB HERMANO (Solo Sábado)"]);

function getParticipantBaseCost(category: string): number {
    return category === "CLUB HERMANO / INVITADO (Solo Sábado)" ? SATURDAY_PASS_COST : MEMBER_PRICE;
}

function getCompanionBaseCost(category: string): number {
    return category === "CLUB HERMANO (Solo Sábado)" ? SATURDAY_PASS_COST : MEMBER_PRICE;
}

function sanitizeText(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function parseSqlServerUrl(rawUrl: string | undefined) {
    if (!rawUrl) throw new Error("DATABASE_URL no esta configurada.");

    const [basePart, ...segments] = rawUrl.split(";").filter(Boolean);

    if (!basePart.startsWith("sqlserver://")) {
        throw new Error("DATABASE_URL tiene un formato no soportado.");
    }

    const hostPart = basePart.replace("sqlserver://", "");
    const [server, portText] = hostPart.split(":");
    const settings = new Map<string, string>();

    for (const segment of segments) {
        const [key, ...rest] = segment.split("=");
        if (!key || rest.length === 0) continue;
        settings.set(key.toLowerCase(), rest.join("="));
    }

    return {
        server,
        port: Number(portText || 1433),
        database: settings.get("database") || "",
        user: settings.get("user") || "",
        password: settings.get("password") || "",
        options: {
            encrypt: (settings.get("encrypt") ?? "true").toLowerCase() === "true",
            trustServerCertificate: (settings.get("trustservercertificate") ?? "false").toLowerCase() === "true",
            loginTimeout: Number(settings.get("logintimeout") || 30),
        },
    };
}

export async function POST(request: NextRequest) {
    try {
        const databaseUrl = process.env.DATABASE_URL;

        if (!databaseUrl || databaseUrl.includes("<nombre-servidor>") || databaseUrl.includes("<nombre-db>")) {
            return NextResponse.json(
                { error: "La base de datos aun no esta configurada. Actualiza DATABASE_URL para activar el registro oficial." },
                { status: 503 },
            );
        }

        const body = (await request.json()) as OfficialRegistrationPayload;

        const participantCategory = sanitizeText(body.participantCategory);
        const fullName = sanitizeText(body.fullName);
        const documentId = sanitizeText(body.documentId);
        const eps = sanitizeText(body.eps);
        const emergencyName = sanitizeText(body.emergencyName);
        const emergencyPhone = sanitizeText(body.emergencyPhone);
        const country = sanitizeText(body.country);
        const chapter = sanitizeText(body.chapter);
        const arrivalDate = sanitizeText(body.arrivalDate);
        const isDirective = Boolean(body.isDirective);
        const wantsJersey = Boolean(body.wantsJersey);
        const hasCompanions = Boolean(body.hasCompanions);

        const directiveScope = sanitizeText(body.directiveScope);
        const directiveRole = sanitizeText(body.directiveRole);
        const jerseySize = sanitizeText(body.jerseySize);
        const medicalCondition = sanitizeText(body.medicalCondition);
        const totalSent = Number(body.totalToPay);

        if (
            !participantCategory ||
            !fullName ||
            !documentId ||
            !eps ||
            !emergencyName ||
            !emergencyPhone ||
            !country ||
            !chapter ||
            !arrivalDate
        ) {
            return NextResponse.json(
                { error: "Faltan campos obligatorios del formulario oficial." },
                { status: 400 },
            );
        }

        if (!ALLOWED_PARTICIPANT_CATEGORIES.has(participantCategory)) {
            return NextResponse.json(
                { error: "Categoria de participante no valida." },
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

        const rawCompanions = Array.isArray(body.companions) ? body.companions : [];
        const normalizedCompanions = hasCompanions
            ? rawCompanions.map((companion) => ({
                fullName: sanitizeText(companion.fullName),
                documentId: sanitizeText(companion.documentId),
                category: sanitizeText(companion.category),
                wantsJersey: Boolean(companion.wantsJersey),
                jerseySize: sanitizeText(companion.jerseySize),
            }))
            : [];

        if (hasCompanions && normalizedCompanions.length === 0) {
            return NextResponse.json(
                { error: "Debes registrar al menos un acompanante." },
                { status: 400 },
            );
        }

        for (const companion of normalizedCompanions) {
            if (!companion.fullName || !companion.documentId || !companion.category) {
                return NextResponse.json(
                    { error: "Cada acompanante debe tener nombre, documento y categoria." },
                    { status: 400 },
                );
            }

            if (!ALLOWED_COMPANION_CATEGORIES.has(companion.category)) {
                return NextResponse.json(
                    { error: "Categoria de acompanante no valida." },
                    { status: 400 },
                );
            }

            if (companion.wantsJersey && !companion.jerseySize) {
                return NextResponse.json(
                    { error: "Si un acompanante desea camiseta, debe seleccionar talla." },
                    { status: 400 },
                );
            }
        }

        const companionsCount = normalizedCompanions.length;
        const companionsJerseyCount = normalizedCompanions.filter((c) => c.wantsJersey).length;
        const participantBaseCost = getParticipantBaseCost(participantCategory);
        const companionsBaseCost = normalizedCompanions.reduce(
            (acc, companion) => acc + getCompanionBaseCost(companion.category),
            0,
        );

        const calculatedTotal =
            participantBaseCost +
            companionsBaseCost +
            (wantsJersey ? SHIRT_PRICE : 0) +
            companionsJerseyCount * SHIRT_PRICE;

        if (!Number.isFinite(totalSent) || Math.round(totalSent) !== Math.round(calculatedTotal)) {
            return NextResponse.json(
                { error: "Inconsistencia en el cálculo de valores" },
                { status: 400 },
            );
        }

        const config = parseSqlServerUrl(databaseUrl);
        const sql: any = (await import("mssql")).default;
        const pool = await sql.connect(config);
        const registrationId = randomUUID().toUpperCase();

        await pool
            .request()
            .query(`IF COL_LENGTH('OfficialRegistration', 'country') IS NULL ALTER TABLE OfficialRegistration ADD country NVARCHAR(255) NULL;`);

        const transaction = new sql.Transaction(pool);

        try {
            await transaction.begin();

            await new sql.Request(transaction)
                .input("id", sql.NVarChar(36), registrationId)
                .input("participantCategory", sql.NVarChar(255), participantCategory)
                .input("fullName", sql.NVarChar(255), fullName)
                .input("documentId", sql.NVarChar(100), documentId)
                .input("eps", sql.NVarChar(255), eps)
                .input("emergencyName", sql.NVarChar(255), emergencyName)
                .input("emergencyPhone", sql.NVarChar(100), emergencyPhone)
                .input("country", sql.NVarChar(255), country)
                .input("chapter", sql.NVarChar(255), chapter)
                .input("isDirective", sql.Bit, isDirective)
                .input("directiveScope", sql.NVarChar(255), isDirective ? directiveScope : null)
                .input("directiveRole", sql.NVarChar(255), isDirective ? directiveRole : null)
                .input("arrivalDate", sql.NVarChar(100), arrivalDate)
                .input("medicalCondition", sql.NVarChar(sql.MAX), medicalCondition || null)
                .input("wantsJersey", sql.Bit, wantsJersey)
                .input("jerseySize", sql.NVarChar(20), wantsJersey ? jerseySize : null)
                .input("hasCompanions", sql.Bit, hasCompanions)
                .input("companionsCount", sql.Int, companionsCount)
                .input("totalToPay", sql.Float, calculatedTotal)
                .query(`
                    INSERT INTO OfficialRegistration (
                        id,
                        participantCategory,
                        fullName,
                        documentId,
                        eps,
                        emergencyName,
                        emergencyPhone,
                        country,
                        chapter,
                        isDirective,
                        directiveScope,
                        directiveRole,
                        arrivalDate,
                        medicalCondition,
                        wantsJersey,
                        jerseySize,
                        hasCompanions,
                        companionsCount,
                        totalToPay,
                        createdAt
                    )
                    VALUES (
                        @id,
                        @participantCategory,
                        @fullName,
                        @documentId,
                        @eps,
                        @emergencyName,
                        @emergencyPhone,
                        @country,
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
                        @totalToPay,
                        GETUTCDATE()
                    )
                `);

            for (const companion of normalizedCompanions) {
                const companionId = randomUUID().toUpperCase();

                await new sql.Request(transaction)
                    .input("id", sql.NVarChar(36), companionId)
                    .input("registrationId", sql.NVarChar(36), registrationId)
                    .input("fullName", sql.NVarChar(255), companion.fullName)
                    .input("documentId", sql.NVarChar(100), companion.documentId)
                    .input("category", sql.NVarChar(100), companion.category)
                    .input("wantsJersey", sql.Bit, companion.wantsJersey)
                    .input("jerseySize", sql.NVarChar(20), companion.wantsJersey ? companion.jerseySize : null)
                    .query(`
                        INSERT INTO Companion (
                            id,
                            registrationId,
                            fullName,
                            documentId,
                            category,
                            wantsJersey,
                            jerseySize
                        )
                        VALUES (
                            @id,
                            @registrationId,
                            @fullName,
                            @documentId,
                            @category,
                            @wantsJersey,
                            @jerseySize
                        )
                    `);
            }

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        } finally {
            await pool.close();
        }

        return NextResponse.json(
            {
                id: registrationId,
                totalToPay: calculatedTotal,
                message: "Inscripcion oficial registrada correctamente.",
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error en registro oficial:", error);
        return NextResponse.json(
            { error: "Error al procesar la inscripcion oficial." },
            { status: 500 },
        );
    }
}
