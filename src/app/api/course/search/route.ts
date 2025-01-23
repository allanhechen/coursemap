"use server";

import { searchCourses } from "@/actions/course";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import { z, ZodError } from "zod";

const searchParamsSchema = z.object({
    includeFall: z
        .string()
        .refine((val) => val === "true" || val === "false", {
            message: "includeFall must be a boolean (true or false)",
        })
        .transform((val) => val === "true"),

    includeSpring: z
        .string()
        .refine((val) => val === "true" || val === "false", {
            message: "includeSpring must be a boolean (true or false)",
        })
        .transform((val) => val === "true"),

    includeWinter: z
        .string()
        .refine((val) => val === "true" || val === "false", {
            message: "includeWinter must be a boolean (true or false)",
        })
        .transform((val) => val === "true"),

    includeSummer: z
        .string()
        .refine((val) => val === "true" || val === "false", {
            message: "includeSummer must be a boolean (true or false)",
        })
        .transform((val) => val === "true"),

    includeRequired: z
        .string()
        .refine((val) => val === "true" || val === "false", {
            message: "includeRequired must be a boolean (true or false)",
        })
        .transform((val) => val === "true"),

    includeElective: z
        .string()
        .refine((val) => val === "true" || val === "false", {
            message: "includeElective must be a boolean (true or false)",
        })
        .transform((val) => val === "true"),

    searchQuery: z.string(),
});
export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { institutionId, programName, startingYear } = session.user;

    const searchParams = request.nextUrl.searchParams;
    const searchParamsObject = {
        includeFall: searchParams.get("includeFall"),
        includeSpring: searchParams.get("includeSpring"),
        includeWinter: searchParams.get("includeWinter"),
        includeSummer: searchParams.get("includeSummer"),
        includeRequired: searchParams.get("includeRequired"),
        includeElective: searchParams.get("includeElective"),
        searchQuery: searchParams.get("searchQuery"),
    };

    try {
        const parsedParams = searchParamsSchema.parse(searchParamsObject);

        const courseResults = await searchCourses(
            institutionId,
            programName,
            startingYear,
            parsedParams.searchQuery,
            parsedParams.includeFall,
            parsedParams.includeWinter,
            parsedParams.includeSpring,
            parsedParams.includeSummer,
            parsedParams.includeRequired,
            parsedParams.includeElective
        );
        return Response.json(courseResults);
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
