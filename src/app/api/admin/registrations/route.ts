import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const expectedPassword = process.env.NEXT_PUBLIC_ADMIN_ACCESS_PASSWORD?.trim();
        const providedPassword = request.headers.get("x-admin-access-password")?.trim();

        if (!expectedPassword || providedPassword !== expectedPassword) {
            return NextResponse.json({ error: "Acceso no autorizado." }, { status: 401 });
        }

        const [officialRegistrations, clubRegistrations] = await Promise.all([
            prisma.officialRegistration.findMany({
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    fullName: true,
                    chapter: true,
                    emergencyPhone: true,
                    companionsCount: true,
                    isPaid: true,
                    totalToPay: true,
                    createdAt: true,
                },
            }),
            prisma.clubRegistration.findMany({
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    clubName: true,
                    presidentName: true,
                    contactPhone: true,
                    originCity: true,
                    estimatedAttendees: true,
                    isPaid: true,
                    createdAt: true,
                },
            }),
        ]);

        const officials = officialRegistrations.map((registration) => ({
            id: registration.id,
            name: registration.fullName,
            chapter: registration.chapter,
            country: registration.chapter === "Internacional" ? "Internacional" : "Colombia",
            phone: registration.emergencyPhone,
            email: "No registrado",
            companions: registration.companionsCount > 0 ? `${registration.companionsCount} acompanante(s)` : "No",
            isPaid: registration.isPaid,
            totalToPay: registration.totalToPay,
            createdAt: registration.createdAt,
        }));

        const clubs = clubRegistrations.map((registration) => ({
            id: registration.id,
            name: registration.clubName,
            delegate: registration.presidentName,
            country: registration.originCity,
            phone: registration.contactPhone,
            attendees: registration.estimatedAttendees,
            isPaid: registration.isPaid,
            createdAt: registration.createdAt,
        }));

        return NextResponse.json(
            {
                officials,
                clubs,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error obteniendo registros administrativos:", error);
        return NextResponse.json(
            { error: "No fue posible obtener los registros administrativos." },
            { status: 500 },
        );
    }
}
