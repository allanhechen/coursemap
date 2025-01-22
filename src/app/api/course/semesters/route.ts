"use server";

import {
    deleteCourseSemester,
    getCourseSemesters,
    updateCourseSemester,
} from "@/actions/course";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import { z, ZodError } from "zod";

const numberArray = z.coerce.number().array().nonempty();
const number = z.coerce.number();

export async function GET() {
    const session = await auth();
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { userId, institutionId, programName, startingYear } = session.user;
    try {
        const courseSemesters = await getCourseSemesters(
            userId,
            institutionId,
            programName,
            startingYear
        );
        return Response.json(courseSemesters);
    } catch (e) {
        console.error("Unexpected error:", e);
        return Response.json(
            { error: "An unexpected error occurred." },
            { status: 500 }
        );
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
        const courseIds = numberArray.parse(body["courseIds"]);
        const semesterId = number.parse(body["semesterId"]);
        await updateCourseSemester(userId, semesterId, courseIds);
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
    const courseIdRaw = searchParams.get("courseId");

    try {
        const courseId = number.parse(courseIdRaw);
        await deleteCourseSemester(userId, courseId);
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
