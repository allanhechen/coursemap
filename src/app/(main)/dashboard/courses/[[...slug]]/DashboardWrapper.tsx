"use client";

import { useState } from "react";

import DashboardComponent from "@/app/(main)/dashboard/courses/[[...slug]]//DashboardComponent";
import { CourseSemesterContext } from "@/app/(main)/dashboard/courses/[[...slug]]//courseSemesterContext";
import { DnDContext } from "@/components/dndContext";
import {
    SemesterFormProvider,
    useSemesterForm,
} from "@/components/semester/semesterFormContext";

import { CourseInformation, CourseToSemesterIdDict } from "@/types/courseCard";
import { SemesterDict, SemesterTerm } from "@/types/semester";
import { SemesterContext } from "@/app/(main)/dashboard/courses/[[...slug]]//semesterContext";
import { Session } from "next-auth";
import { SessionContext } from "@/components/sessionContext";
import { NodeContext } from "./nodeContext";
import { Node } from "@xyflow/react";
import NoSSR from "@/components/NoSSR";

export default function DashboardWrapper({
    session,
    prerequisites,
    postrequisites,
    allSemesters,
    courseIds,
}: {
    session: Session;
    prerequisites: { [key: string]: string };
    postrequisites: { [key: string]: number[] };
    allSemesters: SemesterDict;
    courseIds: { [courseCode: string]: number };
}) {
    const [nodes, setNodes] = useState<Node[]>([]);
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
        <NoSSR>
            <SessionContext.Provider value={session}>
                <SemesterContext.Provider
                    value={[semesterDict, setSemesterDict]}
                >
                    <CourseSemesterContext.Provider
                        value={[relatedSemesterId, setRelatedSemesterId]}
                    >
                        <SemesterFormProvider form={form}>
                            <DnDContext.Provider value={[type, setType]}>
                                <NodeContext.Provider value={[nodes, setNodes]}>
                                    <DashboardComponent
                                        prerequisites={prerequisites}
                                        postrequisites={postrequisites}
                                        courseIds={courseIds}
                                    />
                                </NodeContext.Provider>
                            </DnDContext.Provider>
                        </SemesterFormProvider>
                    </CourseSemesterContext.Provider>
                </SemesterContext.Provider>
            </SessionContext.Provider>
        </NoSSR>
    );
}
