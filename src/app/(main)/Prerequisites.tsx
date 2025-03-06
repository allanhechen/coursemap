import { Paper, Title, Text } from "@mantine/core";
import Image from "next/image";

import darkOverview from "@/../public/images/prerequisite-demo-dark.png";
import lightTree from "@/../public/images/prerequisite-demo-light.png";

export default function Prerequisites() {
    return (
        <div className="mx-auto max-w-5xl w-full flex items-center flex-col justify-center p-10">
            <div className="w-full flex flex-col items-center">
                <Title order={2} size={"2.1rem"}>
                    Details When You Need Them
                </Title>
                <Text size="lg" className="my-5">
                    Prerequisites? Postrequisites? Antirequisites? Doesn&apos;t
                    matter! We have them all!
                </Text>
            </div>
            <Paper shadow="sm" className="w-full overflow-hidden flex-none">
                <Image
                    className="w-full dark:hidden"
                    src={lightTree}
                    alt="Light search demo"
                />
                <Image
                    className="w-full hidden dark:block"
                    src={darkOverview}
                    alt="Dark search demo"
                />
            </Paper>
        </div>
    );
}
