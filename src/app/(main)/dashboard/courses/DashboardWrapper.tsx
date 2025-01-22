"use client";

import { useState } from "react";

import DashboardComponent from "@/app/(main)/dashboard/courses/DashboardComponent";
import { CourseSemesterContext } from "@/app/(main)/dashboard/courses/courseSemesterContext";
import { DnDContext } from "@/components/dndContext";
import {
    SemesterFormProvider,
    useSemesterForm,
} from "@/components/semester/semesterFormContext";

import { CourseInformation, CourseToSemesterIdDict } from "@/types/courseCard";
import { SemesterDict, SemesterTerm } from "@/types/semester";
import { SemesterContext } from "@/app/(main)/dashboard/courses/semesterContext";
import { Session } from "next-auth";
import { SessionContext } from "@/components/sessionContext";

export default function DashboardWrapper({
    session,
    prerequisites,
    allSemesters,
}: {
    session: Session;
    prerequisites: { [key: string]: string };
    allSemesters: SemesterDict;
}) {
    const [type, setType] = useState<[string, CourseInformation] | null>(null);
    const [relatedSemesterId, setRelatedSemesterId] =
        useState<CourseToSemesterIdDict>({});
    const [semesterDict, setSemesterDict] =
        useState<SemesterDict>(allSemesters);

    const form = useSemesterForm({
        mode: "uncontrolled",
        initialValues: {
            semesterId: 0,
            semesterName: "",
            semesterYear: new Date(2024, 0, 1),
            semesterTerm: SemesterTerm.SU,
        },
    });

    return (
        <SessionContext.Provider value={session}>
            <SemesterContext.Provider value={[semesterDict, setSemesterDict]}>
                <CourseSemesterContext.Provider
                    value={[relatedSemesterId, setRelatedSemesterId]}
                >
                    <SemesterFormProvider form={form}>
                        <DnDContext.Provider value={[type, setType]}>
                            <DashboardComponent prerequisites={prerequisites} />
                        </DnDContext.Provider>
                    </SemesterFormProvider>
                </CourseSemesterContext.Provider>
            </SemesterContext.Provider>
        </SessionContext.Provider>
    );
}
