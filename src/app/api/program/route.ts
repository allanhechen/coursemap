"use server";

import {
    createUserProgram,
    deleteUserProgram,
    getUserPrograms,
    getPrograms,
    updateUserProgram,
} from "@/actions/program";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import { z, ZodError } from "zod";

const year = z.coerce.number().min(1000).max(9999);
const number = z.coerce.number();
const string = z.string().nonempty();

export async function GET() {
    const session = await auth();
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const programs = await getPrograms();
        return Response.json({ programs: programs });
    } catch (e) {
        console.error("Unexpected error:", e);
        return Response.json(
            { error: "An unexpected error occurred." },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { userId } = session.user;

    const body = await request.json();
    try {
        const institutionId = number.parse(body["institutionId"]);
        const programName = string.parse(body["programName"]);
        const startingYear = year.parse(body["startingYear"]);
        await updateUserProgram(
            userId,
            institutionId,
            programName,
            startingYear
        );
        return new Response(null, { status: 200 });
    } catch (e) {
        if (e instanceof ZodError) {
            return Response.json({ error: e.errors }, { status: 400 });
        } else {
            console.error("Unexpected error:", e);
            return Response.json(
                { error: "An unexpected error occurred." },
                { status: 500 }
            );
        }
    }
}

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { userId } = session.user;

    const body = await request.json();
    try {
        const startingYear = year.parse(body["startingYear"]);
        const institutionId = number.parse(body["institutionId"]);
        const programName = string.parse(body["programName"]);
        await createUserProgram(
            userId,
            institutionId,
            programName,
            startingYear
        );
        return new Response(null, { status: 200 });
    } catch (e) {
        if (e instanceof ZodError) {
            return Response.json({ error: e.errors }, { status: 400 });
        } else {
            console.error("Unexpected error:", e);
            return Response.json(
                { error: "An unexpected error occurred." },
                { status: 500 }
            );
        }
    }
}

export async function DELETE(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { userId } = session.user;
    const searchParams = request.nextUrl.searchParams;
    const startingYearRaw = searchParams.get("startingYear");
    const institutionIdRaw = searchParams.get("institutionId");
    const programNameRaw = searchParams.get("programName");

    try {
        const startingYear = year.parse(startingYearRaw);
        const institutionId = number.parse(institutionIdRaw);
        const programName = string.parse(programNameRaw);
        await deleteUserProgram(
            userId,
            institutionId,
            programName,
            startingYear
        );
        return new Response(null, { status: 200 });
    } catch (e) {
        if (e instanceof ZodError) {
            return Response.json({ error: e.errors }, { status: 400 });
        } else {
            console.error("Unexpected error:", e);
            return Response.json(
                { error: "An unexpected error occurred." },
                { status: 500 }
            );
        }
    }
}
