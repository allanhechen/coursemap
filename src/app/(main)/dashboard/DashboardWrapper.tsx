"use client";

import { useState } from "react";

import { SemesterPlacement } from "@/types/semester";
import { User } from "@/types/user";

import DashboardComponent from "@/app/(main)/dashboard/DashboardComponent";
import { SemesterPositionContext } from "@/app/(main)/dashboard/semesterPositionContext";
import { DnDContext } from "@/app/(main)/dashboard/dndContext";
import { CourseInformation } from "@/types/courseCard";

export default function DashboardWrapper(props: User) {
    const [placements, setPlacements] = useState<SemesterPlacement[]>([]);
    const [type, setType] = useState<[string, CourseInformation] | null>(null);

    return (
        <SemesterPositionContext.Provider value={[placements, setPlacements]}>
            <DnDContext.Provider value={[type, setType]}>
                <DashboardComponent {...props} />
            </DnDContext.Provider>
        </SemesterPositionContext.Provider>
    );
}
