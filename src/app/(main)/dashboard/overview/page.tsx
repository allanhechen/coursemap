"use server";

import { ReactFlowProvider } from "@xyflow/react";
import { redirect } from "next/navigation";

import DashboardWrapper from "@/app/(main)/dashboard/overview/DashboardWrapper";
import { auth } from "@/lib/auth";

export default async function Page() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    return (
        <ReactFlowProvider>
            <DashboardWrapper session={session} />
        </ReactFlowProvider>
    );
}
