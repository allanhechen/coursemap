import { ProgramInformation } from "@/types/program";
import { Button, Modal, Paper, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useCallback } from "react";
import { useRouter } from "next/navigation";

export default function UserPrograms({
    userPrograms,
}: {
    userPrograms: ProgramInformation[];
}) {
    const router = useRouter();
    const [opened, { open, close }] = useDisclosure(false);

    const handleActivation = useCallback(
        async (userProgram: ProgramInformation) => {
            try {
                await fetch("/api/program", {
                    method: "PATCH",
                    body: JSON.stringify({
                        institutionId: userProgram.institutionId,
                        programName: userProgram.programName,
                        startingYear: userProgram.startingYear,
                    }),
                });
                router.refresh();
                // TODO: send positive message
            } catch {
                // TODO: send failure message
            }
        },
        [router]
    );

    const handleDeletion = useCallback(
        async (userProgram: ProgramInformation) => {
            try {
                const url = new URLSearchParams("");
                url.append(
                    "institutionId",
                    userProgram.institutionId.toString()
                );
                url.append("programName", userProgram.programName);
                url.append("startingYear", userProgram.startingYear.toString());
                await fetch("/api/program?" + url.toString(), {
                    method: "DELETE",
                });
                close();
                router.refresh();
                // TODO: send positive message
            } catch (e) {
                // TODO: send failure message
                console.log(e);
            }
        },
        [router, close]
    );

    const programs = userPrograms.map((userProgram) => {
        return (
            <div key={userProgram.programName}>
                <Modal opened={opened} onClose={close} title="Delete Program">
                    <div className="flex flex-col">
                        <Text className="mt-3">
                            Are you sure you want to delete{" "}
                            {
                                <Text c="blue" className="inline">
                                    {userProgram.programName}{" "}
                                </Text>
                            }{" "}
                            from{" "}
                            {
                                <Text c="blue" className="inline">
                                    {userProgram.institutionName}
                                </Text>
                            }
                            ?
                        </Text>
                        <Button
                            disabled={userProgram.active ? true : undefined}
                            className="col-span-1 mt-3"
                            variant="filled"
                            color="red"
                            onClick={() => handleDeletion(userProgram)}
                        >
                            I am sure
                        </Button>
                    </div>
                </Modal>
                <Paper
                    className="p-5 grid grid-cols-10 items-center gap-2"
                    key={userProgram.programName}
                    shadow="sm"
                    radius="lg"
                    style={
                        userProgram.active
                            ? { border: "1px solid gray" }
                            : undefined
                    }
                >
                    <div className="col-span-3">
                        <div>{userProgram.institutionName}</div>
                        {/* <img src={userProgram.institutionPhoto} /> */}
                    </div>
                    <div className="col-span-3">{userProgram.programName}</div>
                    <div className="col-span-2">{userProgram.startingYear}</div>
                    {userProgram.active ? (
                        <div className="col-span-2 text-center">
                            Curent Active Program
                        </div>
                    ) : (
                        <>
                            {" "}
                            <Button
                                disabled={userProgram.active ? true : undefined}
                                className="col-span-1"
                                variant="filled"
                                onClick={() => handleActivation(userProgram)}
                            >
                                Activate
                            </Button>
                            <Button
                                disabled={userProgram.active ? true : undefined}
                                className="col-span-1"
                                variant="filled"
                                color="red"
                                onClick={open}
                            >
                                Delete
                            </Button>
                        </>
                    )}
                </Paper>
            </div>
        );
    });
    return (
        <div className="w-full overflow-x-auto pb-5">
            <div className="min-w-[65rem]">
                <div className="grid grid-cols-10 p-5 gap-2">
                    <div className="text-left col-span-3">Institution</div>
                    <div className="text-left col-span-3">Program</div>
                    <div className="text-left col-span-2">Starting Year</div>
                    <div className="text-left col-span-2">Actions</div>
                </div>
                <Stack>{programs}</Stack>
            </div>
        </div>
    );
}
