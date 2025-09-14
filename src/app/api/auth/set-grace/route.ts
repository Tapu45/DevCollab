import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.json().catch(() => ({}));
    const days = typeof body?.days === "number" ? body.days : 7;
    const maxAge = Math.floor(days * 24 * 60 * 60);
    const until = Date.now() + maxAge * 1000;

    const res = NextResponse.json({ ok: true, until }, { status: 200 });
    res.cookies.set("devcollab_grace_until", String(until), {
        httpOnly: true,
        maxAge,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    });

    return res;
}