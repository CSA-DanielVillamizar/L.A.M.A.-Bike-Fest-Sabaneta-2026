import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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

        const body = (await request.json()) as { id?: string };
        const id = typeof body.id === "string" ? body.id.trim() : "";

        if (!id) {
            return NextResponse.json({ error: "Solicitud invalida." }, { status: 400 });
        }

        const current = await prisma.sponsorRegistration.findUnique({
            where: { id },
            select: { id: true, isContacted: true },
        });

        if (!current) {
            return NextResponse.json({ error: "Patrocinador no encontrado." }, { status: 404 });
        }

        const updated = await prisma.sponsorRegistration.update({
            where: { id },
            data: { isContacted: !current.isContacted },
            select: { id: true, isContacted: true },
        });

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        console.error("Error al cambiar estado de contacto del patrocinador:", error);
        return NextResponse.json({ error: "Error al actualizar el estado de contacto." }, { status: 500 });
    }
}
