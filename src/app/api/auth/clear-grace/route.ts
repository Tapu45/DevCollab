import { NextResponse } from "next/server";

export async function POST() {
    const res = NextResponse.json({ ok: true }, { status: 200 });
    res.cookies.set("devcollab_grace_until", "", { maxAge: 0, path: "/" });
    return res;
}