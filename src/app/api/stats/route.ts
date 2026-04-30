import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const [officialCount, companionsCount, totalClubs] = await Promise.all([
            prisma.officialRegistration.count(),
            prisma.companion.count(),
            prisma.clubRegistration.count(),
        ]);

        const totalLama = officialCount + companionsCount;

        return NextResponse.json(
            {
                totalLama,
                totalClubs,
                countries: 26,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error obteniendo estadisticas:", error);
        return NextResponse.json(
            { error: "No fue posible obtener las estadisticas." },
            { status: 500 },
        );
    }
}
