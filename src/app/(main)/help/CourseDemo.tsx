import { Paper, Title, Text } from "@mantine/core";
import React from "react";

export default function CourseDemo({
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div {...props}>
            {" "}
            <div className="h-full w-full flex justify-center items-center">
                <Paper
                    className="p-5 m-5 max-h-screen flex-col items-center max-w-5xl"
                    radius="lg"
                    shadow="sm"
                >
                    <Title className="inline-block">The Course Page</Title>
                    <Text className="mt-2 mb-5">
                        Drag courses from the search results into the right side
                        of the page. A tree of courses leading into the current
                        courses will be generated. Choose semesters to add these
                        courses to, and they will appear on the overview page as
                        well!
                    </Text>
                    <video
                        style={{ maxHeight: "50vh", width: "100%" }}
                        autoPlay
                        loop
                        muted
                    >
                        <source src="/demos/CourseDemo.mp4" type="video/mp4" />
                    </video>
                </Paper>
            </div>
        </div>
    );
}
