import { Paper, Title, Text } from "@mantine/core";
import React from "react";

export default function OverviewDemo({
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
                    <Title className="inline-block">The Overview Page</Title>
                    <Text className="mt-2 mb-5">
                        Drag courses from the search results into your
                        semesters. They are checked against the terms, and the
                        courses you have already finished. Yellow means the
                        course doesn&apos;t typically run in the given term, and
                        red means the prerequisites haven&apos;t been met.
                    </Text>
                    <video
                        style={{ maxHeight: "50vh", width: "100%" }}
                        autoPlay
                        loop
                        muted
                    >
                        <source
                            src="/demos/OverviewDemo.mp4"
                            type="video/mp4"
                        />
                    </video>
                </Paper>
            </div>
        </div>
    );
}
