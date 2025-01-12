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
import { SemesterTerm } from "@/types/semester";

export default function DashboardWrapper({
    displayName,
    userPhoto,
    prerequisites,
}: {
    displayName: string;
    userPhoto: string;
    prerequisites: { [key: string]: string };
}) {
    const [type, setType] = useState<[string, CourseInformation] | null>(null);
    const [relatedSemesterId, setRelatedSemesterId] =
        useState<CourseToSemesterIdDict>({});

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
        <CourseSemesterContext.Provider
            value={[relatedSemesterId, setRelatedSemesterId]}
        >
            <SemesterFormProvider form={form}>
                <DnDContext.Provider value={[type, setType]}>
                    <DashboardComponent
                        displayName={displayName}
                        userPhoto={userPhoto}
                        prerequisites={prerequisites}
                    />
                </DnDContext.Provider>
            </SemesterFormProvider>
        </CourseSemesterContext.Provider>
    );
}
