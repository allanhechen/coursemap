"use client";

import { ReactFlowProvider } from "@xyflow/react";
import DashboardComponent from "./DashboardComponent";

// TODO: Add this component
export default function Page() {
    return (
        <ReactFlowProvider>
            <DashboardComponent />
        </ReactFlowProvider>
    );
}
