import { ReactFlowProvider } from "@xyflow/react";
import DashboardComponent from "./DashboardComponent";

export default function Page() {
    return (
        <ReactFlowProvider>
            <DashboardComponent />
        </ReactFlowProvider>
    );
}
