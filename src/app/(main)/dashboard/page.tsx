"use server";

import { ReactFlowProvider } from "@xyflow/react";

import DashboardWrapper from "@/app/(main)/dashboard/DashboardWrapper";

import { getUser } from "@/lib/actions/user";

export default async function Page() {
    const user = await getUser();

    return (
        <ReactFlowProvider>
            <DashboardWrapper {...user} />
        </ReactFlowProvider>
    );
}
