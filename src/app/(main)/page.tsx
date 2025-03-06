"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Splash from "./Splash";
import FloatingNavBar from "./FloatingNavBar";
import { Button, Title } from "@mantine/core";
import Search from "./Search";
import Dragging from "./Dragging";
import Overview from "./Overview";
import Prerequisites from "./Prerequisites";
import Link from "next/link";

export default async function Page() {
    const session = await auth();

    if (session) {
        redirect("/dashboard/overview");
    }

    return (
        <>
            <FloatingNavBar />
            <div className="mx-auto flex flex-col justify-center">
                <Splash />
                <div>
                    <Search />
                </div>
                <div className="mt-48">
                    <Overview />
                </div>
                <div className="mt-48">
                    <Dragging />
                </div>
                <div className="mt-48">
                    <Prerequisites />
                </div>
                <div className="w-full my-48 p-10 flex flex-col items-center justify-center">
                    <Title order={2} size={48}>
                        What are you waiting for?
                    </Title>
                    <Link href="signin" className="mt-5">
                        <Button>Join Now!</Button>
                    </Link>
                </div>
            </div>
        </>
    );
}
