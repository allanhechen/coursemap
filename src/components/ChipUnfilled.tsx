"use client";

import { useMantineTheme } from "@mantine/core";
import { Text } from "@mantine/core";

export default function ChipUnfilled({ variant }: { variant: string }) {
    const theme = useMantineTheme();

    let textColor = "";
    let backgroundColor = "";
    switch (variant) {
        case "Winter":
            backgroundColor = theme.colors.blue[2];
            textColor = theme.colors.blue[5];
    }

    return (
        <Text
            h="25"
            c={textColor}
            style={{
                backgroundColor: backgroundColor,
            }}
            className="inline-block	px-3 rounded-3xl h-7 select-none"
        >
            {variant}
        </Text>
    );
}
