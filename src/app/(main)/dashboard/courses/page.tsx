"use server";

import { ReactFlowProvider } from "@xyflow/react";
import { redirect } from "next/navigation";

import DashboardWrapper from "@/app/(main)/dashboard/courses/DashboardWrapper";
import { auth } from "@/lib/auth";
import { getPrerequsuites } from "@/actions/course";
import { getSemesters } from "@/actions/semester";
import { SemesterInformation } from "@/types/semester";

export default async function Page() {
    const session = await auth();
    if (!session) {
        redirect("/signin");
    } else if (!session.user.institutionId) {
        redirect("/help");
    }
    const { userId, institutionId, programName, startingYear } = session.user;

    const prerequisites = await getPrerequsuites(institutionId!);
    const semesterInformation = await getSemesters(
        userId,
        institutionId,
        programName,
        startingYear
    );
    const semesterObject: {
        [semesterId: number]: SemesterInformation;
    } = {};
    semesterInformation.forEach((semester) => {
        semesterObject[semester.semesterId] = semester;
    });

    return (
        <ReactFlowProvider>
            <DashboardWrapper
                session={session}
                prerequisites={prerequisites}
                allSemesters={semesterObject}
            />
        </ReactFlowProvider>
    );
}
