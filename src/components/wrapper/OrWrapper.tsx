import { Card, Text } from "@mantine/core";
import "@/components/wrapper/wrapper.css";

export default function OrWrapper() {
    return (
        <Card
            radius="lg"
            shadow="sm"
            style={{
                height: "100%",
            }}
            className="or-wrapper"
        >
            <Text
                className="leading-noner"
                size="xl"
                fw={700}
                truncate="end"
                lineClamp={1}
                c="white"
            >
                {"OR"}
            </Text>
        </Card>
    );
}
