"use server";

import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
    const session = await auth();

    if (session) {
        redirect("/dashboard/overview");
    }

    return (
        <h1 className="text-3xl font-bold">
            This will be the hero page, head to{" "}
            <Link href={"/dashboard"}>/dashboard</Link> for the dashboard
        </h1>
    );
}
