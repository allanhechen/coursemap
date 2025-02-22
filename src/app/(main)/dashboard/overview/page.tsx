"use server";

import { ReactFlowProvider } from "@xyflow/react";
import { redirect } from "next/navigation";

import DashboardWrapper from "@/app/(main)/dashboard/overview/DashboardWrapper";
import { auth } from "@/lib/auth";
import { Metadata } from "next";
import { getCourseNames, getCourseSemesters } from "@/actions/course";
import { getSemesters } from "@/actions/semester";

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "overview",
    };
}

export default async function Page() {
    const session = await auth();

    if (!session) {
        redirect("/signin");
    } else if (!session.user.institutionId) {
        redirect("/help");
    }

    const { userId, institutionId, programName, startingYear } = session.user;

    const courseNames = await getCourseNames(session.user.institutionId);
    const semesters = await getSemesters(
        userId,
        institutionId,
        programName,
        startingYear
    );
    const courseSemesters = await getCourseSemesters(
        userId,
        institutionId,
        programName,
        startingYear
    );

    return (
        <ReactFlowProvider>
            <DashboardWrapper
                session={session}
                courseNames={courseNames}
                semesters={semesters}
                courseSemesters={courseSemesters}
            />
        </ReactFlowProvider>
    );
}
