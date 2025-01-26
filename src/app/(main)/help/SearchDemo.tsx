import { Paper, Title, Text } from "@mantine/core";
import React from "react";

export default function SearchDemo({
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
                        Search for classes on the left
                    </Title>
                    <Text className="mt-2 mb-5">
                        Search for classes based on their course codes, and
                        their titles. Attributes are based on your current
                        program.
                    </Text>
                    <video
                        style={{ maxHeight: "50vh", width: "100%" }}
                        autoPlay
                        loop
                        muted
                    >
                        <source src="/demos/SearchDemo.mp4" type="video/mp4" />
                    </video>
                </Paper>
            </div>
        </div>
    );
}
