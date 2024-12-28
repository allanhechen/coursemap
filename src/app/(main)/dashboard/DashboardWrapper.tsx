"use client";

import { SemesterPositionContext } from "./semesterPositionContext";
import { useState } from "react";
import { SemesterPlacement } from "@/types/semester";
import { User } from "@/types/user";
import DashboardComponent from "./DashboardComponent";

export default function DashboardWrapper(props: User) {
    const [placements, setPlacements] = useState<SemesterPlacement[]>([]);

    return (
        <SemesterPositionContext.Provider value={[placements, setPlacements]}>
            <DashboardComponent {...props} />
        </SemesterPositionContext.Provider>
    );
}
