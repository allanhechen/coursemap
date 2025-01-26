"use server";

import { ReactFlowProvider } from "@xyflow/react";
import { redirect } from "next/navigation";

import DashboardWrapper from "@/app/(main)/dashboard/overview/DashboardWrapper";
import { auth } from "@/lib/auth";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "overview",
    };
}

export default async function Page() {
    const session = await auth();

    if (!session) {
        redirect("/signin");
    } else if (!session.user.institutionId) {
        redirect("/help");
    }

    return (
        <ReactFlowProvider>
            <DashboardWrapper session={session} />
        </ReactFlowProvider>
    );
}
