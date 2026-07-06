import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type VerifyRequestBody = {
    searchTerm?: string;
};

function cleanSearchTerm(value: string | undefined): string {
    return String(value || "").trim();
}

function inferArrivalMethod(arrivalDate: string | null): string {
    const value = String(arrivalDate || "").toLowerCase();

    if (!value) return "No especificado";
    if (value.includes("moto")) return "Llega en moto";
    if (value.includes("carro") || value.includes("auto")) return "Llega en carro";
    if (value.includes("avion") || value.includes("aereo") || value.includes("aéreo")) return "Llega en avión";
    if (value.includes("bus")) return "Llega en bus";

    return "No especificado";
}

function inferNeedsTransport(arrivalDate: string | null, medicalCondition: string | null): boolean {
    const source = `${String(arrivalDate || "")} ${String(medicalCondition || "")}`.toLowerCase();
    return source.includes("transporte") || source.includes("recoger") || source.includes("traslado");
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as VerifyRequestBody;
        const searchTerm = cleanSearchTerm(body.searchTerm);

        if (!searchTerm) {
            return NextResponse.json(
                { error: "Debes ingresar un correo, celular, código de confirmación o documento." },
                { status: 400 },
            );
        }

        if (searchTerm.length > 120) {
            return NextResponse.json(
                { error: "El valor de búsqueda es demasiado largo." },
                { status: 400 },
            );
        }

        const registration = await prisma.officialRegistration.findFirst({
            where: {
                OR: [
                    { documentId: searchTerm },
                    { emergencyPhone: searchTerm },
                    { id: searchTerm },
                    // El esquema actual no contiene campos email/phone dedicados en OfficialRegistration.
                ],
            },
            select: {
                id: true,
                fullName: true,
                documentId: true,
                chapter: true,
                createdAt: true,
                participantCategory: true,
                arrivalDate: true,
                medicalCondition: true,
                paymentStatus: true,
                isPaid: true,
                country: true,
            },
        });

        if (!registration) {
            return NextResponse.json(
                { error: "No encontramos una pre-inscripción con ese criterio de búsqueda." },
                { status: 404 },
            );
        }

        return NextResponse.json(
            {
                id: registration.id,
                document: registration.documentId,
                fullName: registration.fullName,
                chapter: registration.chapter,
                country: registration.country || "No registrado",
                createdAt: registration.createdAt,
                participantCategory: registration.participantCategory,
                arrivalMethod: inferArrivalMethod(registration.arrivalDate),
                arrivalDate: registration.arrivalDate,
                needsTransport: inferNeedsTransport(registration.arrivalDate, registration.medicalCondition),
                paymentStatus: registration.paymentStatus,
                isPaid: registration.isPaid,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error en POST /api/verificar:", error);
        return NextResponse.json(
            { error: "No fue posible verificar la inscripción en este momento." },
            { status: 500 },
        );
    }
}
