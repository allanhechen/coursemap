"use server";

import { ReactFlowProvider } from "@xyflow/react";
import { redirect } from "next/navigation";

import DashboardWrapper from "@/app/(main)/dashboard/courses/DashboardWrapper";
import { auth } from "@/lib/auth";
import { getPrerequsuites } from "@/lib/actions/course";

export default async function Page() {
    const session = await auth();
    const prerequisites = await getPrerequsuites();

    if (!session) {
        redirect("/login");
    }

    return (
        <ReactFlowProvider>
            <DashboardWrapper
                displayName={session.user!.name!}
                userPhoto={session.user!.image!}
                prerequisites={prerequisites}
            />
        </ReactFlowProvider>
    );
}
