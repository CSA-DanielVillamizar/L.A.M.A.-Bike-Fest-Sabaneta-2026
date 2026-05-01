import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function isAuthorized(request: NextRequest): boolean {
    const expectedPassword = process.env.NEXT_PUBLIC_ADMIN_ACCESS_PASSWORD?.trim();
    const providedPassword = request.headers.get("x-admin-access-password")?.trim();

    if (!expectedPassword) {
        return false;
    }

    return providedPassword === expectedPassword;
}

export async function POST(request: NextRequest) {
    try {
        if (!isAuthorized(request)) {
            return NextResponse.json({ error: "Acceso no autorizado." }, { status: 401 });
        }

        const result = await prisma.$transaction(async (tx) => {
            // Borrar primero hijos para evitar restricciones de FK.
            const companions = await tx.companion.deleteMany();
            const officials = await tx.officialRegistration.deleteMany();
            const clubs = await tx.clubRegistration.deleteMany();
            const sponsors = await tx.sponsorRegistration.deleteMany();

            return {
                companions: companions.count,
                officials: officials.count,
                clubs: clubs.count,
                sponsors: sponsors.count,
            };
        });

        return NextResponse.json(
            {
                message: "Datos de prueba eliminados correctamente.",
                deleted: result,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error al purgar datos de prueba:", error);
        return NextResponse.json({ error: "No fue posible purgar los datos de prueba." }, { status: 500 });
    }
}
