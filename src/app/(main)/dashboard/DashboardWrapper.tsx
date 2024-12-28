"use client";

import { useState } from "react";

import { SemesterPlacement } from "@/types/semester";
import { User } from "@/types/user";

import DashboardComponent from "@/app/(main)/dashboard/DashboardComponent";
import { SemesterPositionContext } from "@/app/(main)/dashboard/semesterPositionContext";

export default function DashboardWrapper(props: User) {
    const [placements, setPlacements] = useState<SemesterPlacement[]>([]);

    return (
        <SemesterPositionContext.Provider value={[placements, setPlacements]}>
            <DashboardComponent {...props} />
        </SemesterPositionContext.Provider>
    );
}
