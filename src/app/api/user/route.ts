"use server";

import { deleteUser } from "@/actions/user";
import { auth } from "@/lib/auth";

export async function DELETE() {
    const session = await auth();
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { userId } = session.user;

    try {
        await deleteUser(userId);
        return new Response(null, { status: 200 });
    } catch (e) {
        console.error("Unexpected error:", e);
        return Response.json(
            { error: "An unexpected error occurred." },
            { status: 500 }
        );
    }
}
