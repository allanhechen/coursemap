import { Card, Text } from "@mantine/core";
import "@/components/wrapper/wrapper.css";

export default function AndWrapper() {
    return (
        <Card
            radius="lg"
            shadow="sm"
            style={{
                height: "100%",
            }}
            className="and-wrapper"
        >
            <Text
                className="leading-none"
                size="xl"
                fw={700}
                truncate="end"
                lineClamp={1}
                c="white"
            >
                {"AND"}
            </Text>
        </Card>
    );
}
