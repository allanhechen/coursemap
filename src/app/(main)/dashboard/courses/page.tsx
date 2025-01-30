"use server";

import { ReactFlowProvider } from "@xyflow/react";
import { redirect } from "next/navigation";

import DashboardWrapper from "@/app/(main)/dashboard/courses/DashboardWrapper";
import { auth } from "@/lib/auth";
import {
    getCourseIds,
    getPostrequisites,
    getPrerequsuites,
} from "@/actions/course";
import { getSemesters } from "@/actions/semester";
import { SemesterInformation } from "@/types/semester";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "courses",
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

    const prerequisites = await getPrerequsuites(institutionId);
    const postrequisites = await getPostrequisites(institutionId);
    const semesterInformation = await getSemesters(
        userId,
        institutionId,
        programName,
        startingYear
    );
    const courseIds = await getCourseIds(institutionId);
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
                postrequisites={postrequisites}
                allSemesters={semesterObject}
                courseIds={courseIds}
            />
        </ReactFlowProvider>
    );
}
