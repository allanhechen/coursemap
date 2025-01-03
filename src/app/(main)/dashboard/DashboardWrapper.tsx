"use client";

import { useState } from "react";

import DashboardComponent from "@/app/(main)/dashboard/DashboardComponent";
import { SemesterPositionContext } from "@/app/(main)/dashboard/semesterPositionContext";
import { DnDContext } from "@/app/(main)/dashboard/dndContext";
import {
    SemesterFormProvider,
    useSemesterForm,
} from "@/components/semester/semesterFormContext";

import { CourseInformation } from "@/types/courseCard";
import { SemesterPlacement } from "@/types/semester";
import { SemesterTerm } from "@/types/semester";
import { User } from "@/types/user";

export default function DashboardWrapper(props: User) {
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
        <SemesterPositionContext.Provider value={[placements, setPlacements]}>
            <SemesterFormProvider form={form}>
                <DnDContext.Provider value={[type, setType]}>
                    <DashboardComponent {...props} />
                </DnDContext.Provider>
            </SemesterFormProvider>
        </SemesterPositionContext.Provider>
    );
}
