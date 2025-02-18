import React from "react";
import { useDisclosure } from "@mantine/hooks";
import { Button, Paper, Title } from "@mantine/core";
import SelectProgram from "@/components/program/SelectProgram";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";

export default function AddProgramButton() {
    const router = useRouter();
    const [opened, { open, close }] = useDisclosure(false);

    return (
        <>
            {opened ? (
                <div
                    className="h-screen w-screen absolute left-0 top-0 z-10"
                    style={{
                        backgroundColor: "hsla(12 100% 0% / 0.58)",
                        backdropFilter: "blur(4px)",
                    }}
                    onClick={() => {
                        close();
                    }}
                >
                    <div className="w-full h-full flex justify-center items-center">
                        <Paper
                            className="w-96 p-5"
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            <Title order={2} className="mb-5">
                                Add Program
                            </Title>
                            <SelectProgram
                                buttonText="Add Program"
                                callback={async (
                                    institutionId: number,
                                    programName: string,
                                    startingYear: number
                                ) => {
                                    try {
                                        const res = await fetch(
                                            "/api/program",
                                            {
                                                method: "POST",
                                                body: JSON.stringify({
                                                    institutionId:
                                                        institutionId,
                                                    programName: programName,
                                                    startingYear: startingYear,
                                                }),
                                            }
                                        );
                                        if (!res.ok) {
                                            throw new Error(res.statusText);
                                        }
                                    } catch {
                                        notifications.show({
                                            withCloseButton: true,
                                            autoClose: false,
                                            title: "Error adding new program",
                                            message:
                                                "API call to add program failed, please try again later",
                                            color: "red",
                                            className:
                                                "mt-2 transition-transform",
                                        });
                                        return;
                                    }

                                    close();
                                    router.refresh();
                                }}
                            />
                        </Paper>
                    </div>
                </div>
            ) : (
                ""
            )}
            <Button variant="filled" onClick={open}>
                Add new program
            </Button>
        </>
    );
}
