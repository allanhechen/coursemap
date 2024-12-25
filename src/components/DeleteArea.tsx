import { Paper, Text } from "@mantine/core";

export default function DeleteArea() {
    return (
        <Paper
            className="nodrag flex justify-center pt-5"
            shadow="sm"
            style={{
                width: "80vw",
                height: "20vh",
            }}
        >
            <Text size="xl">Drop Course Here to Delete</Text>
        </Paper>
    );
}
