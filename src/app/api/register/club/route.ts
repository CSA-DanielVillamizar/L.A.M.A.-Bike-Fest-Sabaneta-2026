import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const databaseUrl = process.env.DATABASE_URL;

        if (!databaseUrl || databaseUrl.includes("<nombre-servidor>") || databaseUrl.includes("<nombre-db>")) {
            return NextResponse.json(
                {
                    error: "La base de datos aun no esta configurada. Actualiza DATABASE_URL para activar el registro de clubes.",
                },
                { status: 503 },
            );
        }

        const body = await request.json();

        const { nombreClub, delegado, ciudad, asistentes, tipoMoto } = body;

        if (
            !nombreClub ||
            !delegado ||
            !ciudad ||
            !asistentes ||
            !tipoMoto
        ) {
            return NextResponse.json(
                { error: "Faltan campos requeridos" },
                { status: 400 },
            );
        }

        const registration = await prisma.clubRegistration.create({
            data: {
                clubName: nombreClub,
                presidentName: delegado,
                originCity: ciudad,
                estimatedAttendees: parseInt(asistentes, 10),
                motorcycleType: tipoMoto,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "¡Club registrado correctamente!",
                data: registration,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error en registro de club:", error);
        return NextResponse.json(
            { error: "Error al procesar el registro" },
            { status: 500 },
        );
    }
}
