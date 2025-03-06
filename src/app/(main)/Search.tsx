import { Paper, Title, Text } from "@mantine/core";
import Image from "next/image";

import darkSearch from "@/../public/images/search-demo-dark.png";
import lightSearch from "@/../public/images/search-demo-light.png";

export default function Search() {
    return (
        <div className="mx-auto max-w-5xl w-full flex items-center flex-col md:flex-row justify-center">
            <div className="ml-10 mr-10 w-[25rem] md:mr-0">
                <Title order={2} size={"2.1rem"}>
                    Courses a Search Away
                </Title>
                <Text size="lg" className="mt-5">
                    Find your courses by course code or by title, and filter
                    further by term and program requirements.
                </Text>
            </div>
            <Paper
                shadow="sm"
                className="w-[25rem] overflow-hidden m-10 flex-none"
            >
                <Image
                    className="w-full dark:hidden"
                    src={lightSearch}
                    alt="Light search demo"
                />
                <Image
                    className="w-full hidden dark:block"
                    src={darkSearch}
                    alt="Dark search demo"
                />
            </Paper>
        </div>
    );
}
