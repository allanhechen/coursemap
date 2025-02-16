import { Card, Group, Text } from "@mantine/core";
import Chip from "@/components/chip/ChipFilled";
import { stringToColor, stringToDeg } from "@/lib/color";
import {
    CardWrapper,
    CourseDropdownInformation,
    CourseInformation,
} from "@/types/courseCard";
import { useScrollHandler } from "@/lib/placement";
import { useCallback, useState, useEffect } from "react";
import { Handle, Node, Position, useNodeId, useReactFlow } from "@xyflow/react";

import "@/components/courseCard/CourseCard.css";
import CourseCardForm from "@/components/courseCard/CourseCardForm";

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

    return <CourseCard className="nowheel" onWheel={onWheel} {...data} />;
}

export function CourseCardDropdownWrapper({
    data,
}: {
    data: CourseDropdownInformation;
}) {
    const { courseInformation, selectSemester, prerequisiteMet } = data;
    const addedClass = prerequisiteMet
        ? prerequisiteMet === true
            ? "course-included"
            : "course-prerequisite-met"
        : prerequisiteMet === false
        ? "course-error"
        : "";
    return (
        <Card
            className={`h-64 flex content-between justify-between card-dropdown ${addedClass}`}
            radius="lg"
            shadow="sm"
        >
            <CourseCardForm
                courseId={courseInformation.courseId}
                courseCode={courseInformation.courseCode}
                selectSemester={selectSemester}
            />
            <CourseCard {...courseInformation} />
            <Handle type="target" position={Position.Left} />
            <Handle type="source" position={Position.Right} />
        </Card>
    );
}

export function CourseCardPostrequisiteDropdownWrapper({
    data,
}: {
    data: CourseDropdownInformation;
}) {
    const [focused, setFocused] = useState(false);
    const [visible, setVisible] = useState(false);

    const onMouseEnter = useCallback(() => setFocused(true), []);
    const onMouseLeave = useCallback(() => setFocused(false), []);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            style={{
                opacity: visible ? (focused ? 1 : 0.5) : 0,
                transition: "opacity 0.5s ease-out",
            }}
        >
            <CourseCardDropdownWrapper data={data} />
        </div>
    );
}

export function CourseCard({
    courseCode,
    courseName,
    faculty,
    chips,
    termWarning,
    requisiteWarning,
    ...rest
}: CourseInformation & React.HTMLAttributes<HTMLDivElement>) {
    const warningClasses = requisiteWarning
        ? "border-2 border-rose-500"
        : termWarning
        ? "border-2 border-yellow-500"
        : "";

    return (
        <Card
            {...rest}
            className={`h-44 w-80 min-h-44 select-none course-card ${warningClasses}`}
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
