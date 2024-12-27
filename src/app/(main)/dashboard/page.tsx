"use client";

import { ReactFlowProvider } from "@xyflow/react";
import DashboardComponent from "@/app/(main)/dashboard/DashboardComponent";
import { useState } from "react";
import { SemesterPlacement } from "@/types/semester";

import { SemesterPositionContext } from "./semesterPositionContext";
import NavBar from "@/components/header/NavBar";

export default function Page() {
    const [placements, setPlacements] = useState<SemesterPlacement[]>([]);

    return (
        <SemesterPositionContext.Provider value={[placements, setPlacements]}>
            <ReactFlowProvider>
                <NavBar />

                <DashboardComponent />
            </ReactFlowProvider>
        </SemesterPositionContext.Provider>
    );
}
