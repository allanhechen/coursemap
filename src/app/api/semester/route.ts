"use server";

import {
    createSemester,
    deleteSemester,
    getSemesters,
    updateSemester,
} from "@/actions/semester";
import { auth } from "@/lib/auth";
import { SemesterTerm } from "@/types/semester";
import { NextRequest } from "next/server";
import { z, ZodError } from "zod";

const number = z.coerce.number();
const semesterSchema = z.object({
    semesterName: z.string().nonempty(),
    semesterYear: z.number().min(1000).max(9999),
    semesterTerm: z.enum(["WI", "FA", "SP", "SU"]),
});

export async function GET() {
    const session = await auth();
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { userId, institutionId, programName } = session.user;
    try {
        const courseSemesters = await getSemesters(
            userId,
            institutionId,
            programName
        );
        return Response.json({ semesters: courseSemesters });
    } catch (e) {
        console.error("Unexpected error:", e);
        return Response.json(
            { error: "An unexpected error occurred." },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { userId, institutionId, programName } = session.user;

    const body = await request.json();
    try {
        const semester = semesterSchema.parse(body);
        const semesterId = createSemester(
            userId,
            institutionId,
            programName,
            semester.semesterName,
            new Date(semester.semesterYear, 0, 1),
            semester.semesterTerm as SemesterTerm
        );
        return Response.json({ semesterid: semesterId });
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

export async function PUT(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { userId } = session.user;

    const body = await request.json();
    try {
        const semester = semesterSchema.parse(body);
        const semesterId = number.parse(body["semesterId"]);
        await updateSemester(
            userId,
            semesterId,
            semester.semesterName,
            new Date(semester.semesterYear, 0, 1),
            semester.semesterTerm as SemesterTerm
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
    const semesterIdRaw = searchParams.get("semesterId");

    try {
        const semesterId = number.parse(semesterIdRaw);
        await deleteSemester(userId, semesterId);
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
