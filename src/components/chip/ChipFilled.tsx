"use client";

import { ChipVariant } from "@/types/chipVariant";
import { useMantineTheme } from "@mantine/core";
import { Text } from "@mantine/core";

export default function ChipFilled({
    variant,
    clickable = true,
}: {
    variant: ChipVariant;
    clickable?: boolean;
}) {
    const theme = useMantineTheme();

    let backgroundColor = "";
    switch (variant) {
        case ChipVariant.FALL:
            backgroundColor = theme.colors.orange[5];
            break;
        case ChipVariant.WINTER:
            backgroundColor = theme.colors.blue[5];
            break;
        case ChipVariant.SPRING:
            backgroundColor = theme.colors.lime[5];
            break;
        case ChipVariant.SUMMER:
            backgroundColor = theme.colors.yellow[5];
            break;
        case ChipVariant.REQUIRED:
            backgroundColor = theme.colors.violet[5];
            break;
        case ChipVariant.ELECTIVE:
            backgroundColor = theme.colors.green[5];
            break;
        case ChipVariant.WARNING:
            backgroundColor = theme.colors.red[5];
            break;
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
