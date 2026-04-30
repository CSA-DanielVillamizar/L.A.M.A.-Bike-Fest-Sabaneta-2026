import { NextRequest, NextResponse } from "next/server";

type TogglePayload = {
    id?: string;
    type?: "official" | "club";
};

function parseSqlServerUrl(rawUrl: string | undefined) {
    if (!rawUrl) throw new Error("DATABASE_URL no esta configurada.");

    const [basePart, ...segments] = rawUrl.split(";").filter(Boolean);

    if (!basePart.startsWith("sqlserver://")) {
        throw new Error("DATABASE_URL tiene un formato no soportado.");
    }

    const hostPart = basePart.replace("sqlserver://", "");
    const [server, portText] = hostPart.split(":");
    const settings = new Map<string, string>();

    for (const segment of segments) {
        const [key, ...rest] = segment.split("=");
        if (!key || rest.length === 0) continue;
        settings.set(key.toLowerCase(), rest.join("="));
    }

    return {
        server,
        port: Number(portText || 1433),
        database: settings.get("database") || "",
        user: settings.get("user") || "",
        password: settings.get("password") || "",
        options: {
            encrypt: (settings.get("encrypt") ?? "true").toLowerCase() === "true",
            trustServerCertificate: (settings.get("trustservercertificate") ?? "false").toLowerCase() === "true",
            loginTimeout: Number(settings.get("logintimeout") || 30),
        },
    };
}

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

        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl || databaseUrl.includes("<nombre-servidor>") || databaseUrl.includes("<nombre-db>")) {
            return NextResponse.json({ error: "La base de datos no esta configurada." }, { status: 503 });
        }

        const body = (await request.json()) as TogglePayload;
        const id = typeof body.id === "string" ? body.id.trim() : "";
        const type = body.type;

        if (!id || (type !== "official" && type !== "club")) {
            return NextResponse.json({ error: "Solicitud invalida." }, { status: 400 });
        }

        const config = parseSqlServerUrl(databaseUrl);
        const { default: sql } = await import("mssql");
        const pool = await sql.connect(config);

        if (type === "official") {
            const currentResult = await pool
                .request()
                .input("id", sql.NVarChar(36), id)
                .query("SELECT TOP 1 isPaid FROM OfficialRegistration WHERE id = @id");

            const current = currentResult.recordset[0] as { isPaid?: boolean } | undefined;

            if (!current) {
                await pool.close();
                return NextResponse.json({ error: "Inscripcion no encontrada." }, { status: 404 });
            }

            const nextPaid = !Boolean(current.isPaid);

            await pool
                .request()
                .input("id", sql.NVarChar(36), id)
                .input("isPaid", sql.Bit, nextPaid)
                .query("UPDATE OfficialRegistration SET isPaid = @isPaid WHERE id = @id");

            await pool.close();

            return NextResponse.json({ id, isPaid: nextPaid }, { status: 200 });
        }

        const currentResult = await pool
            .request()
            .input("id", sql.NVarChar(36), id)
            .query("SELECT TOP 1 isPaid FROM ClubRegistration WHERE id = @id");

        const current = currentResult.recordset[0] as { isPaid?: boolean } | undefined;

        if (!current) {
            await pool.close();
            return NextResponse.json({ error: "Club no encontrado." }, { status: 404 });
        }

        const nextPaid = !Boolean(current.isPaid);

        await pool
            .request()
            .input("id", sql.NVarChar(36), id)
            .input("isPaid", sql.Bit, nextPaid)
            .query("UPDATE ClubRegistration SET isPaid = @isPaid WHERE id = @id");

        await pool.close();

        return NextResponse.json({ id, isPaid: nextPaid }, { status: 200 });
    } catch (error) {
        console.error("Error al cambiar estado de pago:", error);
        return NextResponse.json({ error: "Error al actualizar el pago." }, { status: 500 });
    }
}
