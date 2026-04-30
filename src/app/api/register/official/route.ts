import { prisma } from "@/lib/prisma";
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
};

const BASE_REGISTRATION_COST = 100000;
const COMPANION_COST = 100000;
const JERSEY_COST = 65000;

const ALLOWED_COMPANION_CATEGORIES = new Set(["PAREJA", "INVITADO", "HIJO/A"]);

function sanitizeText(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: NextRequest) {
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

        const calculatedTotal =
            BASE_REGISTRATION_COST +
            companionsCount * COMPANION_COST +
            (wantsJersey ? JERSEY_COST : 0) +
            companionsJerseyCount * JERSEY_COST;

        const registration = await prisma.officialRegistration.create({
            data: {
                participantCategory,
                fullName,
                documentId,
                eps,
                emergencyName,
                emergencyPhone,
                chapter,
                isDirective,
                directiveScope: isDirective ? directiveScope : null,
                directiveRole: isDirective ? directiveRole : null,
                arrivalDate,
                medicalCondition: medicalCondition || null,
                wantsJersey,
                jerseySize: wantsJersey ? jerseySize : null,
                hasCompanions,
                companionsCount,
                totalToPay: calculatedTotal,
                companions: {
                    create: normalizedCompanions.map((companion) => ({
                        fullName: companion.fullName,
                        documentId: companion.documentId,
                        category: companion.category,
                        wantsJersey: companion.wantsJersey,
                        jerseySize: companion.wantsJersey ? companion.jerseySize : null,
                    })),
                },
            },
            select: {
                id: true,
                totalToPay: true,
            },
        });

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
        return NextResponse.json(
            { error: "Error al procesar la inscripcion oficial." },
            { status: 500 },
        );
    }
}
