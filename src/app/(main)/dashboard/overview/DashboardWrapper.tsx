"use client";

import { useState } from "react";

import DashboardComponent from "@/app/(main)/dashboard/overview/DashboardComponent";
import { SemesterPositionContext } from "@/app/(main)/dashboard/overview/semesterPositionContext";
import { DnDContext } from "@/components/dndContext";
import {
    SemesterFormProvider,
    useSemesterForm,
} from "@/components/semester/semesterFormContext";

import { CourseInformation } from "@/types/courseCard";
import { SemesterInformation, SemesterPlacement } from "@/types/semester";
import { SemesterTerm } from "@/types/semester";
import { Session } from "next-auth";
import { SessionContext } from "@/components/sessionContext";
import NoSSR from "@/components/NoSSR";
import NavBar from "@/components/header/NavBar";
import CourseSearch from "@/components/courseSearch/CourseSearch";

export default function DashboardWrapper({
    session,
    courseNames,
    semesters,
    courseSemesters,
}: {
    session: Session;
    courseNames: {
        [courseId: number]: string;
    };
    semesters: SemesterInformation[];
    courseSemesters: {
        semesterId: number;
        course: CourseInformation;
    }[];
}) {
    const [placements, setPlacements] = useState<SemesterPlacement[]>([]);
    const [type, setType] = useState<[string, CourseInformation] | null>(null);

    const form = useSemesterForm({
        mode: "uncontrolled",
        initialValues: {
            semesterId: 0,
            semesterName: "",
            semesterYear: new Date(2024, 0, 1),
            semesterTerm: SemesterTerm.SU,
        },
        validate: {
            semesterName: (value) =>
                value.length === 0 ? "Invalid semester name" : null,
            semesterYear: (value) => {
                console.log(
                    value,
                    1000 < value.getFullYear(),
                    value.getFullYear() < 9999
                );
                return 1000 < value.getFullYear() && value.getFullYear() < 9999
                    ? null
                    : "Invalid semester year";
            },
        },
    });

    return (
        <NoSSR>
            <SessionContext.Provider value={session}>
                <SemesterPositionContext.Provider
                    value={[placements, setPlacements]}
                >
                    <SemesterFormProvider form={form}>
                        <DnDContext.Provider value={[type, setType]}>
                            <div className="dashboard-component">
                                <div className="row header">
                                    <NavBar />
                                </div>
                                <div className="row content flex">
                                    <CourseSearch className="ml-5 my-5" />
                                    <DashboardComponent
                                        courseNames={courseNames}
                                        semesters={semesters}
                                        courseSemesters={courseSemesters}
                                    />
                                </div>
                            </div>
                        </DnDContext.Provider>
                    </SemesterFormProvider>
                </SemesterPositionContext.Provider>
            </SessionContext.Provider>
        </NoSSR>
    );
}
