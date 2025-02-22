"use client";

import { useState, useCallback, useContext, useEffect } from "react";
import { ReactFlow, Node, Edge, useReactFlow } from "@xyflow/react";

import {
    CourseCardDropdownWrapper,
    CourseCardPostrequisiteDropdownWrapper,
} from "@/components/courseCard/CourseCard";

import "@/app/(main)/dashboard/courses/[[...slug]]//DashboardComponent.css";
import "@/app/(main)/dashboard/Dashboard.css";
import {
    parsePrerequisite,
    placeNodes,
    getPostrequisitePlacements,
    placeWrappers,
    PrerequisiteNodeType,
    Wrapper,
    useCheckPrerequisites,
} from "@/lib/tree";
import { DnDContext } from "@/components/dndContext";
import {
    CourseInformation,
    CourseToSemesterIdDict,
    DropdownCardWrapper,
    WrapperWrapper,
} from "@/types/courseCard";
import { CourseSemesterContext } from "@/app/(main)/dashboard/courses/[[...slug]]//courseSemesterContext";
import AndWrapper from "@/components/wrapper/AndWrapper";
import OrWrapper from "@/components/wrapper/OrWrapper";
import eventBus from "@/lib/eventBus";
import { NodeContext } from "@/app/(main)/dashboard/courses/[[...slug]]//nodeContext";
import { SemesterContext } from "@/app/(main)/dashboard/courses/[[...slug]]//semesterContext";
import { notifications } from "@mantine/notifications";

const nodeTypes = {
    prerequisiteDropdownNode: CourseCardPostrequisiteDropdownWrapper,
    courseDropdownNode: CourseCardDropdownWrapper,
    andWrapperNode: AndWrapper,
    orWrapperNode: OrWrapper,
};

export default function DashboardComponent({
    prerequisites,
    postrequisites,
    courseIds,
    initialCourse,
}: {
    prerequisites: { [key: string]: string };
    postrequisites: { [key: string]: number[] };
    courseIds: { [courseCode: string]: number };
    initialCourse: CourseInformation | undefined;
}) {
    const [edges, setEdges] = useState<Edge[]>([]);
    const { fitView } = useReactFlow();
    const { checkPrerequisites } = useCheckPrerequisites();

    const nodeContextItem = useContext(NodeContext);
    if (!nodeContextItem) {
        throw new Error("DashboardComponent must be used in a NodeContext");
    }
    const [nodes, setNodes] = nodeContextItem;

    const courseSemesterContextItem = useContext(CourseSemesterContext);
    if (!courseSemesterContextItem) {
        throw new Error(
            "DashboardComponent must be used in a CourseSemesterContext"
        );
    }
    const [relatedSemesterId, setRelatedSemesterId] = courseSemesterContextItem;

    const semesterDictContextItem = useContext(SemesterContext);
    if (!semesterDictContextItem) {
        throw new Error("CourseCardForm must be used in a SemesterContext");
    }
    const [semesterDict] = semesterDictContextItem;

    const dndContextItem = useContext(DnDContext);
    if (!dndContextItem) {
        throw new Error("DashboardComponent must be used in a DnDContext");
    }
    const [type] = dndContextItem;

    const selectSemester = useCallback(
        (courseCode: string, semesterId: number | undefined) => {
            setRelatedSemesterId((prevRelatedSemesterId) => {
                const newRelatedSemesterId = {
                    ...prevRelatedSemesterId,
                    [courseCode]: semesterId,
                };
                return newRelatedSemesterId;
            });
        },
        [setRelatedSemesterId]
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    const handleNewCourse = useCallback(
        async (newCourseNode: CourseInformation) => {
            const nodeOutput: PrerequisiteNodeType[] = [];
            const edgeOutput: Edge[] = [];
            const wrapperOutput: { [key: string]: Wrapper } = {};
            let postrequisiteOutput: number[] =
                postrequisites[newCourseNode.courseId.toString()];
            if (!postrequisiteOutput) {
                postrequisiteOutput = [];
            }

            parsePrerequisite(
                prerequisites,
                newCourseNode.courseCode,
                nodeOutput,
                edgeOutput,
                wrapperOutput,
                courseIds
            );

            const informationEndpoint = new URLSearchParams("");
            nodeOutput.forEach((node) => {
                informationEndpoint.append(
                    "courseIds",
                    node.courseId.toString()
                );
            });
            postrequisiteOutput.forEach((postrequisiteId) => {
                informationEndpoint.append(
                    "courseIds",
                    postrequisiteId.toString()
                );
            });

            let courseInformation: {
                [courseId: number]: CourseInformation;
            };
            try {
                const courseInformationResponse = await fetch(
                    "/api/course/information?" + informationEndpoint
                );
                courseInformation = await courseInformationResponse.json();
            } catch {
                notifications.show({
                    withCloseButton: true,
                    autoClose: false,
                    title: "Error retrieving course information ",
                    message:
                        "API call to retrieve course information failed, please try again",
                    color: "red",
                    className: "mt-2 transition-transform",
                });
                return 0;
            }

            const filledCourses = nodeOutput.map((node) => {
                const course = courseInformation[node.courseId];
                return { id: node.key, data: course };
            });

            const dropdownCourses: (DropdownCardWrapper | WrapperWrapper)[] =
                filledCourses.map((course) => {
                    return {
                        id: course.id,
                        data: {
                            courseInformation: course.data,
                            courseToSemesters: () => relatedSemesterId,
                            selectSemester: selectSemester,
                            prerequisiteMet: undefined,
                        },
                        type: "courseDropdownNode",
                        position: { x: 0, y: 0 },
                    };
                });

            placeNodes(dropdownCourses);
            placeWrappers(dropdownCourses, wrapperOutput);

            const postrequisiteDropdownCourses: DropdownCardWrapper[] =
                postrequisiteOutput.map((postrequisiteId) => {
                    return {
                        id: postrequisiteId.toString(),
                        data: {
                            courseInformation:
                                courseInformation[postrequisiteId],
                            courseToSemesters: () => relatedSemesterId,
                            selectSemester: selectSemester,
                            prerequisiteMet: undefined,
                        },
                        type: "prerequisiteDropdownNode",
                        postition: { x: 0, y: 0 },
                    };
                });

            const nextCourses = dropdownCourses as Node[];

            const {
                newEdges: additionalEdges,
                newNodes: additionalPostrequisites,
            } = getPostrequisitePlacements(
                nextCourses,
                postrequisiteDropdownCourses
            );

            setNodes(nextCourses.concat(additionalPostrequisites));
            setEdges(edgeOutput.concat(additionalEdges));

            setTimeout(() => {
                checkPrerequisites(relatedSemesterId, semesterDict);
                fitView({ padding: 0.1, nodes: nextCourses });
            }, 100);
        },
        [
            prerequisites,
            postrequisites,
            selectSemester,
            relatedSemesterId,
            courseIds,
            setNodes,
            checkPrerequisites,
            fitView,
            semesterDict,
        ]
    );

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            if (!type) {
                return;
            }
            notifications.clean();

            const [, droppedNode] = type;
            handleNewCourse(droppedNode);
        },
        [type, handleNewCourse]
    );

    useEffect(() => {
        async function getSemesters() {
            let courseSemesters: {
                semesterId: number;
                course: CourseInformation;
            }[];

            try {
                const courseSemesterResponse = await fetch(
                    "/api/course/semesters"
                );
                courseSemesters = await courseSemesterResponse.json();
            } catch {
                notifications.show({
                    withCloseButton: true,
                    autoClose: false,
                    title: "Error retrieving course semesters",
                    message:
                        "API call to retrieve course semesters failed, please try again",
                    color: "red",
                    className: "mt-2 transition-transform",
                });
                return 0;
            }

            const courseStates: CourseToSemesterIdDict = {};
            courseSemesters.forEach((courseSemester) => {
                courseStates[courseSemester.course.courseCode] =
                    courseSemester.semesterId;
            });

            setRelatedSemesterId(courseStates);
        }
        getSemesters();

        if (initialCourse) {
            handleNewCourse(initialCourse);
        }

        return () => {
            notifications.clean();
        };
        // intentionally don't include items in dependency array because this should only run on mount
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (nodes.length === 0 && !initialCourse) {
            notifications.show({
                id: "no-course-selected",
                withCloseButton: false,
                autoClose: false,
                title: "No course selected!",
                message: "Drag a course from the search results to the side",
                className: "mt-2 transition-transform",
            });
        } else {
            notifications.hide("no-course-selected");
        }
    }, [nodes, initialCourse]);

    const closeDropdowns = useCallback(() => {
        eventBus.dispatchEvent(new CustomEvent("closeDropdowns", {}));
    }, []);

    return (
        <ReactFlow
            onNodeClick={closeDropdowns}
            onPaneClick={closeDropdowns}
            onMove={closeDropdowns}
            minZoom={0.1}
            maxZoom={1}
            edges={edges}
            nodes={nodes}
            nodeTypes={nodeTypes}
            proOptions={{ hideAttribution: true }}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodesDraggable={false}
            nodesConnectable={false}
        />
    );
}
