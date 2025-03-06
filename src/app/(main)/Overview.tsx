import { Paper, Title, Text } from "@mantine/core";
import Image from "next/image";

import darkOverview from "@/../public/images/overview-demo-dark.png";
import lightOverview from "@/../public/images/overview-demo-light.png";

export default function Overview() {
    return (
        <div className="mx-auto max-w-5xl w-full flex items-center flex-col-reverse md:flex-row justify-center">
            <Paper
                shadow="sm"
                className="w-[25rem] overflow-hidden m-10 flex-none"
            >
                <Image
                    className="w-full dark:hidden"
                    src={lightOverview}
                    alt="Light search demo"
                />
                <Image
                    className="w-full hidden dark:block"
                    src={darkOverview}
                    alt="Dark search demo"
                />
            </Paper>
            <div className="ml-10 mr-10 w-[25rem] md:ml-0">
                <Title order={2} size={"2.1rem"}>
                    Overview at a Glance
                </Title>
                <Text size="lg" className="mt-5">
                    Organize your courses by semester, and visualize them all in
                    one page.
                </Text>
            </div>
        </div>
    );
}
