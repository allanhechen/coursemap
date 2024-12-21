import { Card, Group, Text } from "@mantine/core";
import Chip from "@/components/ChipFilled";
import { stringToColor, stringToDeg } from "@/lib/color";
import { CardWrapper } from "@/types/courseCard";

export default function CourseCard({ data }: CardWrapper) {
    const { courseCode, courseName, faculty, chips } = data;
    return (
        <Card
            className="h-44 w-80 select-none not-prose"
            radius="lg"
            shadow="sm"
            padding="lg"
            data-faculty={faculty}
            style={{
                background: `linear-gradient(${stringToDeg(
                    courseCode + courseName
                )}, ${stringToColor(courseCode)}, ${stringToColor(
                    courseName
                )})`,
            }}
        >
            <Text
                className="leading-none"
                size="xl"
                fw={700}
                truncate="end"
                lineClamp={1}
                c="white"
            >
                {courseCode}
            </Text>
            <Text
                className="mt-2"
                size="l"
                truncate="end"
                lineClamp={1}
                c="white"
            >
                {courseName}
            </Text>
            <Group className="flex-wrap mt-3" gap="xs">
                {chips &&
                    chips.map((chip) => {
                        return (
                            <Chip
                                key={courseCode + chip}
                                variant={chip}
                                clickable={false}
                            />
                        );
                    })}
            </Group>
        </Card>
    );
}
