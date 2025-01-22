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
import { SemesterPlacement } from "@/types/semester";
import { SemesterTerm } from "@/types/semester";
import { Session } from "next-auth";
import { SessionContext } from "@/components/sessionContext";

export default function DashboardWrapper({ session }: { session: Session }) {
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
    });

    return (
        <SessionContext.Provider value={session}>
            <SemesterPositionContext.Provider
                value={[placements, setPlacements]}
            >
                <SemesterFormProvider form={form}>
                    <DnDContext.Provider value={[type, setType]}>
                        <DashboardComponent />
                    </DnDContext.Provider>
                </SemesterFormProvider>
            </SemesterPositionContext.Provider>
        </SessionContext.Provider>
    );
}
