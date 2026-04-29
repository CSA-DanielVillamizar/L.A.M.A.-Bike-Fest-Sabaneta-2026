import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const databaseUrl = process.env.DATABASE_URL;

        if (!databaseUrl || databaseUrl.includes("<nombre-servidor>") || databaseUrl.includes("<nombre-db>")) {
            return NextResponse.json(
                {
                    error: "La base de datos aun no esta configurada. Actualiza DATABASE_URL para activar el registro de patrocinadores.",
                },
                { status: 503 },
            );
        }

        const body = await request.json();

        const { empresa, email, telefono, categoria, intereses } = body;

        if (!empresa || !email || !telefono || !categoria || !intereses) {
            return NextResponse.json(
                { error: "Faltan campos requeridos" },
                { status: 400 },
            );
        }

        const interestsArray = Array.isArray(intereses)
            ? intereses.join(",")
            : intereses;

        const registration = await prisma.sponsorRegistration.create({
            data: {
                companyName: empresa,
                contactEmail: email,
                contactPhone: telefono,
                category: categoria,
                interests: interestsArray,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "¡Solicitud de patrocinio registrada!",
                data: registration,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error en registro de patrocinador:", error);
        return NextResponse.json(
            { error: "Error al procesar la solicitud" },
            { status: 500 },
        );
    }
}
