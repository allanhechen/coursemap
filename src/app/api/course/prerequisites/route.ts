"use server";

import { getPrerequsuites } from "@/actions/course";
import { auth } from "@/lib/auth";

export async function GET() {
    const session = await auth();
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { institutionId } = session.user;

    try {
        const prerequisites = await getPrerequsuites(institutionId);
        return Response.json(prerequisites);
    } catch (e) {
        console.error("Unexpected error:", e);
        return Response.json(
            { error: "An unexpected error occurred." },
            { status: 500 }
        );
    }
}
