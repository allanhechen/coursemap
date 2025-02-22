import { Card, Group, Modal, Text } from "@mantine/core";
import Chip from "@/components/chip/ChipFilled";
import { stringToColor, stringToDeg } from "@/lib/color";
import {
    CardWrapper,
    CourseDropdownInformation,
    CourseInformation,
} from "@/types/courseCard";
import { useScrollHandler } from "@/lib/placement";
import { useCallback, useState, useEffect, useMemo } from "react";
import { Handle, Node, Position, useNodeId, useReactFlow } from "@xyflow/react";

import "@/components/courseCard/CourseCard.css";
import CourseCardForm from "@/components/courseCard/CourseCardForm";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import CourseModal from "@/components/courseCard/CourseModal";
import { IconDotsDiagonal2 } from "@tabler/icons-react";

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
            shadow="sm"
            style={{
                borderRadius: "20px",
            }}
        >
            <CourseCardForm
                courseId={courseInformation.courseId}
                courseCode={courseInformation.courseCode}
                selectSemester={selectSemester}
            />
            <CourseCard
                {...courseInformation}
                requisiteWarning={prerequisiteMet === false}
            />
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
    courseId,
    courseDescription,
    institutionName,
    externalLink,
    prerequisites,
    postrequisites,
    antirequisites,
    ...rest
}: CourseInformation & React.HTMLAttributes<HTMLDivElement>) {
    const [opened, { open, close }] = useDisclosure(false);
    const pathname = usePathname();
    const urlCourseId = pathname.split("/").at(-1);
    const warningClasses = requisiteWarning
        ? "border-2 border-rose-500"
        : termWarning
        ? "border-2 border-yellow-500"
        : "";

    const modalMemo = useMemo(
        () => (
            <Modal
                opened={opened}
                onClose={close}
                withCloseButton={false}
                size="auto"
                padding="xs"
                overlayProps={{
                    backgroundOpacity: 0.55,
                    blur: 3,
                }}
                centered
            >
                <CourseModal
                    courseInformation={{
                        courseCode,
                        courseId,
                        courseName,
                        courseDescription,
                        externalLink,
                        faculty,
                        institutionName,
                        chips,
                        prerequisites,
                        postrequisites,
                        antirequisites,
                    }}
                    termWarning={termWarning}
                    requisiteWarning={requisiteWarning}
                />
            </Modal>
        ),
        // intentionally skip rendering unless opened
        // eslint-disable-next-line
        [opened]
    );

    return (
        <>
            {modalMemo}
            <Card
                {...rest}
                className={`h-44 w-80 min-h-44 select-none course-card relative ${warningClasses}`}
                radius="lg"
                shadow="sm"
                padding="lg"
                data-faculty={faculty}
                data-courseid={courseId}
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

                {courseId === -1 ||
                (urlCourseId && urlCourseId === courseId.toString()) ? (
                    ""
                ) : (
                    <>
                        <Link
                            href={`/dashboard/courses/${courseId}`}
                            className="absolute bottom-0 left-0"
                            prefetch
                        >
                            <div
                                className="flex justify-center items-center"
                                style={{ width: 32, height: 32 }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="27"
                                    height="27"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="icon icon-tabler icons-tabler-outline icon-tabler-border-corner-pill"
                                    transform="rotate(-90)"
                                >
                                    <path
                                        stroke="none"
                                        d="M0 0h24v24H0z"
                                        fill="none"
                                    />
                                    <path d="M4 20v-5c0 -6.075 4.925 -11 11 -11h5" />
                                </svg>
                            </div>
                        </Link>
                    </>
                )}
                {courseId !== -1 ? (
                    <div className="flex w-10 h-10 justify-center items-center absolute top-0 right-0">
                        <IconDotsDiagonal2
                            stroke={2}
                            onClick={open}
                            color="white"
                        />
                    </div>
                ) : (
                    ""
                )}
            </Card>
        </>
    );
}
