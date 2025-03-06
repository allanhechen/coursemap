import { Paper, Title, Text } from "@mantine/core";

export default function Dragging() {
    return (
        <div className="mx-auto max-w-5xl w-full flex items-center flex-col md:flex-row justify-center">
            <div className="ml-10 mr-10 w-[25rem] md:mr-0">
                <Title order={2} size={"2.1rem"}>
                    Reorder With One Motion
                </Title>
                <Text size="lg" className="mt-5">
                    Don&apos;t like where a course is? Reorder it by simply
                    dragging and dropping.
                </Text>
            </div>
            <Paper
                shadow="sm"
                className="w-[25rem] md:w-[30rem] overflow-hidden m-10 flex-none"
            >
                <video autoPlay loop muted>
                    <source src="/demos/DraggingDemo.mp4" type="video/mp4" />
                </video>
            </Paper>
        </div>
    );
}
