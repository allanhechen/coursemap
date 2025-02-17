"use client";

import NavBar from "@/components/header/NavBar";
import { SessionContext } from "@/components/sessionContext";
import { ProgramInformation } from "@/types/program";
import { Divider, Flex, Title } from "@mantine/core";
import { Session } from "next-auth";
import React from "react";
import UserPrograms from "@/app/(main)/settings/UserPrograms";
import AddProgramButton from "@/app/(main)/settings/AddProgramButton";

export default function PageComponent({
    session,
    userPrograms,
}: {
    session: Session;
    userPrograms: ProgramInformation[];
}) {
    return (
        <>
            <SessionContext.Provider value={session}>
                <Flex direction="column" className="h-screen overflow-y-auto">
                    <NavBar hideForm={true} />
                    <div className="flex-auto max-w-7xl w-screen mx-auto px-5">
                        <Title order={1}>Settings</Title>
                        <Divider my="md" />
                        <Title className="mt-10" order={2}>
                            Programs
                        </Title>
                        <Divider my="md" />
                        <UserPrograms userPrograms={userPrograms} />
                        <AddProgramButton />

                        <Title className="mt-10" order={2}>
                            Account
                        </Title>
                        <Divider my="md" />
                    </div>
                </Flex>
            </SessionContext.Provider>
        </>
    );
}
