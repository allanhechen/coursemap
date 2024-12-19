"use client";

import { useMantineTheme } from "@mantine/core";
import { Text } from "@mantine/core";

export default function ChipFilled({
    variant,
    clickable = true,
}: {
    variant: string;
    clickable?: boolean;
}) {
    const theme = useMantineTheme();

    let backgroundColor = "";
    switch (variant) {
        case "Winter":
            backgroundColor = theme.colors.blue[5];
    }

    return (
        <Text
            h="25"
            c="white"
            style={{
                backgroundColor: backgroundColor,
            }}
            className={`px-3 rounded-3xl h-7 inline-block select-none ${
                clickable ? "cursor-pointer" : ""
            }`}
        >
            {variant}
        </Text>
    );
}
