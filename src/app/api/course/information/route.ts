"use server";

import { getCourseInformation } from "@/actions/course";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import { z, ZodError } from "zod";

const numberArray = z.coerce.number().array().nonempty();

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { institutionId, programName, startingYear } = session.user;

    const searchParams = request.nextUrl.searchParams;
    const courseIdsRaw = searchParams.getAll("courseIds");

    try {
        const courseIds = numberArray.parse(courseIdsRaw);
        const courseInformation = await getCourseInformation(
            institutionId,
            programName,
            startingYear,
            courseIds
        );
        return Response.json(courseInformation);
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
