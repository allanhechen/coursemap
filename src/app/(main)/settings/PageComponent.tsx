"use client";

import NavBar from "@/components/header/NavBar";
import { SessionContext } from "@/components/sessionContext";
import { Divider, Flex, Title } from "@mantine/core";
import { Session } from "next-auth";
import React from "react";

export default function PageComponent({ session }: { session: Session }) {
    return (
        <>
            <SessionContext.Provider value={session}>
                <Flex direction="column" className="h-screen overflow-y-auto">
                    <NavBar hideForm={true} />
                    <div
                        className="flex-auto max-w-7xl w-screen mx-auto"
                        style={{ backgroundColor: "gray" }}
                    >
                        <Title order={1}>Settings</Title>
                        <Divider my="md" />
                        <Title order={2}>Programs</Title>
                        <Divider my="md" />
                        <Title order={2}>Account</Title>
                    </div>
                </Flex>
            </SessionContext.Provider>
        </>
    );
}
