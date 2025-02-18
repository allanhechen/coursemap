import { ProgramInformation } from "@/types/program";
import { Button, Modal, Paper, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";

export default function UserPrograms({
    userPrograms,
}: {
    userPrograms: ProgramInformation[];
}) {
    const router = useRouter();
    const [opened, { open, close }] = useDisclosure(false);
    const [currentProgram, setCurrentProgram] = useState(userPrograms[0]);

    const handleOpen = useCallback(
        (userProgram: ProgramInformation) => {
            setCurrentProgram(userProgram);
            open();
        },
        [open]
    );

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
                notifications.show({
                    withCloseButton: true,
                    title: "Program updated",
                    message: `Successfully set active program to ${userProgram.programName}`,
                    color: "blue",
                    className: "mt-2 transition-transform",
                });
            } catch {
                notifications.show({
                    withCloseButton: true,
                    autoClose: false,
                    title: "Program update failed",
                    message: "Could not activate new program, please try again",
                    color: "red",
                    className: "mt-2 transition-transform",
                });
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
                notifications.show({
                    withCloseButton: true,
                    title: "Program deleted",
                    message: `Successfully deleted program ${userProgram.programName}`,
                    color: "blue",
                    className: "mt-2 transition-transform",
                });
            } catch {
                notifications.show({
                    withCloseButton: true,
                    autoClose: false,
                    title: "Program deletion failed",
                    message: "Could not delete program, please try again",
                    color: "red",
                    className: "mt-2 transition-transform",
                });
            }
        },
        [router, close]
    );

    const programs = userPrograms.map((userProgram) => {
        return (
            <div key={userProgram.programName}>
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
                                onClick={() => handleOpen(userProgram)}
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
        <>
            <Modal opened={opened} onClose={close} title="Delete Program">
                <div className="flex flex-col">
                    <Text className="mt-3">
                        Are you sure you want to delete{" "}
                        {
                            <span className="text-sky-500/100">
                                {currentProgram.programName}{" "}
                            </span>
                        }{" "}
                        from{" "}
                        {
                            <span className="text-sky-500/100">
                                {currentProgram.institutionName}
                            </span>
                        }
                        ?
                    </Text>
                    <Button
                        disabled={currentProgram.active ? true : undefined}
                        className="col-span-1 mt-3"
                        variant="filled"
                        color="red"
                        onClick={() => handleDeletion(currentProgram)}
                    >
                        I am sure
                    </Button>
                </div>
            </Modal>
            <div className="w-full overflow-x-auto pb-5">
                <div className="min-w-[65rem]">
                    <div className="grid grid-cols-10 p-5 gap-2">
                        <div className="text-left col-span-3">Institution</div>
                        <div className="text-left col-span-3">Program</div>
                        <div className="text-left col-span-2">
                            Starting Year
                        </div>
                        <div className="text-left col-span-2">Actions</div>
                    </div>
                    <Stack>{programs}</Stack>
                </div>
            </div>
        </>
    );
}
