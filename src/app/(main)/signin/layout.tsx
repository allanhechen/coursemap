"use server";

import { Tooltip } from "@mantine/core";
import { IconInfoCircleFilled } from "@tabler/icons-react";

export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Tooltip label="No account? Select one anyways!">
                <IconInfoCircleFilled className="absolute right-5 bottom-5" />
            </Tooltip>
            <div
                style={{
                    width: "100vw",
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                {children}
            </div>
        </>
    );
}
