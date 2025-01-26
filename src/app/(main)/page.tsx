"use server";

import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import WideLogo from "@/components/header/WideLogo";
import { Button, Title, Paper } from "@mantine/core";

export default async function Page() {
    const session = await auth();

    if (session) {
        redirect("/dashboard/overview");
    }

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center">
            <Paper
                h={300}
                w={525}
                shadow="sm"
                radius="lg"
                className="p-5 flex flex-col items-center justify-center"
            >
                <WideLogo />
                <Title order={2} className="mt-5">
                    This will be the hero page in the future! For now, head to
                    the signin page!
                </Title>
                <Link href="/signin" className="mt-5">
                    <Button>Go to /signin</Button>
                </Link>
            </Paper>
        </div>
    );
}
