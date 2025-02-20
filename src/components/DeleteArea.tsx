import { Paper, Text } from "@mantine/core";

export default function DeleteArea() {
    return (
        <Paper
            className="nodrag flex justify-center pt-5"
            shadow="sm"
            style={{
                width: "calc(80vw - 25rem)",
                height: "20vh",
            }}
        >
            <Text size="xl">Drop Course Here to Delete</Text>
        </Paper>
    );
}
