"use server";

import { ReactFlowProvider } from "@xyflow/react";
import { redirect } from "next/navigation";

import DashboardWrapper from "@/app/(main)/dashboard/courses/[[...slug]]//DashboardWrapper";
import { auth } from "@/lib/auth";
import {
    getCourseIds,
    getCourseInformation,
    getPostrequisites,
    getPrerequsuites,
} from "@/actions/course";
import { getSemesters } from "@/actions/semester";
import { SemesterInformation } from "@/types/semester";
import { Metadata } from "next";
import { CourseInformation } from "@/types/courseCard";

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "courses",
    };
}

export default async function Page({
    params,
}: {
    params: Promise<{ slug?: string[] }>;
}) {
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

    const { slug } = await params;

    let initialCourse: CourseInformation | undefined = undefined;
    if (slug && slug.length > 0) {
        const firstCourseId = parseInt(slug[0]);
        if (!isNaN(firstCourseId)) {
            const courseInformationObj = await getCourseInformation(
                institutionId,
                programName,
                startingYear,
                [firstCourseId]
            );

            const values = Object.values(courseInformationObj);
            if (values.length > 0) {
                initialCourse = values[0];
            }
        }
    }

    return (
        <ReactFlowProvider>
            <DashboardWrapper
                session={session}
                prerequisites={prerequisites}
                postrequisites={postrequisites}
                allSemesters={semesterObject}
                courseIds={courseIds}
                initialCourse={initialCourse}
            />
        </ReactFlowProvider>
    );
}
