"use client";

import { ChipProps, ChipVariant } from "@/types/chipVariant";
import { useMantineTheme } from "@mantine/core";
import { Text } from "@mantine/core";

export default function ChipUnfilled({
    variant,
    clickable = true,
    ...rootDomAttributes
}: ChipProps) {
    const theme = useMantineTheme();

    let textColor = "";
    let backgroundColor = "";
    switch (variant) {
        case ChipVariant.FALL:
            backgroundColor = theme.colors.orange[2];
            textColor = theme.colors.orange[5];
            break;
        case ChipVariant.WINTER:
            backgroundColor = theme.colors.blue[2];
            textColor = theme.colors.blue[5];
            break;
        case ChipVariant.SPRING:
            backgroundColor = theme.colors.lime[2];
            textColor = theme.colors.lime[5];
            break;
        case ChipVariant.SUMMER:
            backgroundColor = theme.colors.yellow[2];
            textColor = theme.colors.yellow[5];
            break;
        case ChipVariant.REQUIRED:
            backgroundColor = theme.colors.violet[2];
            textColor = theme.colors.violet[5];
            break;
        case ChipVariant.ELECTIVE:
            backgroundColor = theme.colors.green[2];
            textColor = theme.colors.green[5];
            break;
        case ChipVariant.WARNING:
            backgroundColor = theme.colors.red[2];
            textColor = theme.colors.red[5];
            break;
    }

    return (
        <Text
            h="25"
            c={textColor}
            style={{
                backgroundColor: backgroundColor,
            }}
            className={`inline-block px-3 rounded-3xl h-7 select-none ${
                clickable ? "cursor-pointer" : ""
            }`}
            {...rootDomAttributes}
        >
            {variant}
        </Text>
    );
}
