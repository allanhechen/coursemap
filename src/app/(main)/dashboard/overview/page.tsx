"use server";

import { ReactFlowProvider } from "@xyflow/react";
import { redirect } from "next/navigation";

import DashboardWrapper from "@/app/(main)/dashboard/overview/DashboardWrapper";
import { auth } from "@/lib/auth";
import { Metadata } from "next";
import { getCourseNames } from "@/actions/course";

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

    const courseNames = await getCourseNames(session.user.institutionId);

    return (
        <ReactFlowProvider>
            <DashboardWrapper session={session} courseNames={courseNames} />
        </ReactFlowProvider>
    );
}
