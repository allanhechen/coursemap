"use server";

import { ReactFlowProvider } from "@xyflow/react";
import { redirect } from "next/navigation";

import DashboardWrapper from "@/app/(main)/dashboard/courses/DashboardWrapper";
import { auth } from "@/lib/auth";
import { getPrerequsuites } from "@/lib/actions/course";
import { getAllSemesters } from "@/lib/actions/semester";
import { SemesterInformation } from "@/types/semester";

export default async function Page() {
    const session = await auth();
    if (!session) {
        redirect("/login");
    }

    const prerequisites = await getPrerequsuites();
    const semesterInformation = await getAllSemesters();
    const semesterObject: {
        [semesterId: number]: SemesterInformation;
    } = {};
    semesterInformation.forEach((semester) => {
        semesterObject[semester.semesterId] = semester;
    });

    return (
        <ReactFlowProvider>
            <DashboardWrapper
                displayName={session.user!.name!}
                userPhoto={session.user!.image!}
                prerequisites={prerequisites}
                allSemesters={semesterObject}
            />
        </ReactFlowProvider>
    );
}
