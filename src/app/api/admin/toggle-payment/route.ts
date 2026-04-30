import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type TogglePayload = {
    id?: string;
    type?: "official" | "club";
};

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

        const body = (await request.json()) as TogglePayload;
        const id = typeof body.id === "string" ? body.id.trim() : "";
        const type = body.type;

        if (!id || (type !== "official" && type !== "club")) {
            return NextResponse.json({ error: "Solicitud invalida." }, { status: 400 });
        }

        if (type === "official") {
            const current = await prisma.officialRegistration.findUnique({
                where: { id },
                select: { isPaid: true },
            });

            if (!current) {
                return NextResponse.json({ error: "Inscripcion no encontrada." }, { status: 404 });
            }

            const updated = await prisma.officialRegistration.update({
                where: { id },
                data: { isPaid: !current.isPaid },
                select: { id: true, isPaid: true },
            });

            return NextResponse.json(updated, { status: 200 });
        }

        const current = await prisma.clubRegistration.findUnique({
            where: { id },
            select: { isPaid: true },
        });

        if (!current) {
            return NextResponse.json({ error: "Club no encontrado." }, { status: 404 });
        }

        const updated = await prisma.clubRegistration.update({
            where: { id },
            data: { isPaid: !current.isPaid },
            select: { id: true, isPaid: true },
        });

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        console.error("Error al cambiar estado de pago:", error);
        return NextResponse.json({ error: "Error al actualizar el pago." }, { status: 500 });
    }
}
