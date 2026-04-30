import { prisma } from "@/lib/prisma";
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
