import { Paper, Title, Text } from "@mantine/core";
import React from "react";

export default function SemesterDemo({
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div {...props}>
            <div className="h-full w-full flex justify-center items-center">
                <Paper
                    className="p-5 m-5 max-h-screen flex-col items-center max-w-5xl"
                    radius="lg"
                    shadow="sm"
                >
                    <Title className="inline-block">
                        Add semesters from the Navbar
                    </Title>
                    <Text className="mt-2 mb-5">
                        Choose a unique name, year, and term. This semester
                        belongs to your current program, and holds courses that
                        you choose.
                    </Text>
                    <video
                        style={{ maxHeight: "50vh", width: "100%" }}
                        autoPlay
                        loop
                        muted
                    >
                        <source
                            src="/demos/SemesterDemo.mp4"
                            type="video/mp4"
                        />
                    </video>
                </Paper>
            </div>
        </div>
    );
}
