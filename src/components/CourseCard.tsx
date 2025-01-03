import { Card, Group, Text } from "@mantine/core";
import Chip from "@/components/chip/ChipFilled";
import { stringToColor, stringToDeg } from "@/lib/color";
import { CardWrapper, CourseInformation } from "@/types/courseCard";
import { useScrollHandler } from "@/lib/placement";
import { useCallback } from "react";
import { Node, useNodeId, useReactFlow } from "@xyflow/react";

export default function CourseCardWrapper({ data }: CardWrapper) {
    const { getNode, getIntersectingNodes } = useReactFlow();
    const node_id = useNodeId() as string; // we are sure this is a string
    const { verticalScrollHandler, horizontalScrollHandler } =
        useScrollHandler();

    // only support wheel scrolling for cards since touchmove is used for dragging cards
    const onWheel = useCallback(
        (event: React.WheelEvent) => {
            event.stopPropagation();
            const { deltaX, deltaY } = event;
            // Only scroll horizontal or vertical
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                horizontalScrollHandler(-deltaX);
            } else if (Math.abs(deltaY) > Math.abs(deltaX)) {
                const self = getNode(node_id) as Node; // we know for sure this node exists

                const intersectingNodes = getIntersectingNodes(self);

                // try to find an overlapping node whose key begins with semester
                // this is the semester the course belongs to
                intersectingNodes.forEach((node) => {
                    if (node.id.startsWith("semester")) {
                        verticalScrollHandler(node, -deltaY);
                        return;
                    }
                });
            }
        },
        [
            verticalScrollHandler,
            horizontalScrollHandler,
            getIntersectingNodes,
            getNode,
            node_id,
        ]
    );

    return <CourseCard onWheel={onWheel} {...data} />;
}

export function CourseCard({
    courseCode,
    courseName,
    faculty,
    chips,
    ...rest
}: CourseInformation & React.HTMLAttributes<HTMLDivElement>) {
    return (
        <Card
            {...rest}
            className="h-44 w-80 min-h-44 select-none not-prose nowheel"
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
