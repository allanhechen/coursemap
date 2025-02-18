"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import SelectProgram from "@/components/program/SelectProgram";
import { Paper, Title, Text } from "@mantine/core";
import { getBackgroundColor } from "@/lib/color";
import { notifications } from "@mantine/notifications";

export default function SelectPage({
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    const { data: session, status, update } = useSession();
    const router = useRouter();

    const [styleObject, setStyleObject] = useState<{
        background: string;
    } | null>(null);
    useEffect(() => {
        setStyleObject(getBackgroundColor());
    }, []);

    if (status === "unauthenticated") {
        router.push("/signin");
    }

    const updateSession = useCallback(
        async (
            institutionId: number,
            programName: string,
            startingYear: number
        ) => {
            try {
                await update({
                    ...session,
                    institutionId,
                    programName,
                    startingYear,
                });
                router.push("/dashboard/overview");
            } catch {
                notifications.show({
                    withCloseButton: true,
                    autoClose: false,
                    title: "Error adding new program",
                    message:
                        "API call to add program failed, please try again later",
                    color: "red",
                    className: "mt-2 transition-transform",
                });
            }
        },
        [update, router, session]
    );

    return (
        <div {...props}>
            <Paper
                className="p-5 relative top-1/2 left-1/2  -translate-x-1/2  -translate-y-1/2 mb-96"
                shadow="sm"
                radius="lg"
                w={400}
                style={styleObject!}
            >
                <Title>Get Started</Title>
                <Text className="mt-2 mb-5">
                    Choose your institution, program, starting year from the
                    dropdowns below and we&apos;ll take care of the rest!
                </Text>
                <SelectProgram callback={updateSession} buttonText="Go!" />
            </Paper>
        </div>
    );
}
