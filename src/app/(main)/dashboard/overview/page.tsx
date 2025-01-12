"use server";

import { ReactFlowProvider } from "@xyflow/react";
import { redirect } from "next/navigation";

import DashboardWrapper from "@/app/(main)/dashboard/overview/DashboardWrapper";
import { auth } from "@/lib/auth";
import { User } from "@/types/user";

export default async function Page() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    const user: User = {
        displayName: session.user!.name!,
        userPhoto: session.user!.image!,
    };

    return (
        <ReactFlowProvider>
            <DashboardWrapper {...user} />
        </ReactFlowProvider>
    );
}
