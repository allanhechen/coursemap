import { Card, Group, Text } from "@mantine/core";
import Chip from "@/components/ChipFilled";
import { stringToColor, stringToDeg } from "@/lib/color";
import { CardWrapper } from "@/types/courseCard";
import { useScrollHandler } from "@/lib/placement";
import { useCallback } from "react";
import { Node, useNodeId, useReactFlow } from "@xyflow/react";

export default function CourseCard({ data }: CardWrapper) {
    const { courseCode, courseName, faculty, chips } = data;
    const { getNode, getIntersectingNodes } = useReactFlow();
    const node_id = useNodeId() as string; // we are sure this is a string
    const { scrollHandler } = useScrollHandler();

    // only support wheel scrolling for cards since touchmove  is used for dragging cards
    const onWheel = useCallback(
        (event: React.WheelEvent) => {
            const self = getNode(node_id) as Node; // we know for sure this node exists
            const intersectingNodes = getIntersectingNodes(self);

            // should always be intersecting nodes because card will always be on semester
            // first (and only) on will be the semester
            if (intersectingNodes.length == 1) {
                const deltaY = event.deltaY;
                scrollHandler(intersectingNodes[0], deltaY);
            }
        },
        [scrollHandler, getIntersectingNodes, getNode, node_id]
    );

    return (
        <Card
            className="h-44 w-80 select-none not-prose nowheel"
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
            onWheel={onWheel}
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
