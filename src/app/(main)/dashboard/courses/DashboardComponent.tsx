"use client";

import { useState, useCallback, useContext, useEffect } from "react";
import { ReactFlow, Node, Edge, useReactFlow, MiniMap } from "@xyflow/react";
import useSWR from "swr";

import { CourseCardDropdownWrapper } from "@/components/courseCard/CourseCard";
import NavBar from "@/components/header/NavBar";

import "@/app/(main)/dashboard/courses/DashboardComponent.css";
import {
    parsePrerequisite,
    placeNodes,
    placeWrappers,
    PrerequisiteNodeType,
    Wrapper,
} from "@/lib/tree";
import CourseSearch from "@/components/courseSearch/CourseSearch";
import { DnDContext } from "@/components/dndContext";
import {
    CourseInformation,
    CourseToSemesterIdDict,
    DropdownCardWrapper,
    WrapperWrapper,
} from "@/types/courseCard";
import { CourseSemesterContext } from "@/app/(main)/dashboard/courses/courseSemesterContext";
import AndWrapper from "@/components/wrapper/AndWrapper";
import OrWrapper from "@/components/wrapper/OrWrapper";
import { SessionContext } from "@/components/sessionContext";
import fetcher from "@/lib/fetcher";

const nodeTypes = {
    courseDropdownNode: CourseCardDropdownWrapper,
    andWrapperNode: AndWrapper,
    orWrapperNode: OrWrapper,
};

export default function DashboardComponent({
    prerequisites,
}: {
    prerequisites: { [key: string]: string };
}) {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [height, setHeight] = useState(1);
    const { fitView } = useReactFlow();

    const courseIdsSWR = useSWR<{ [courseName: string]: number }, string>(
        "/api/course/ids",
        fetcher
    );

    if (courseIdsSWR.error) {
        console.log(courseIdsSWR.error);
    }
    const courseIds: { [courseCode: string]: number } = courseIdsSWR.data!;

    const session = useContext(SessionContext)!;

    const courseSemesterContextItem = useContext(CourseSemesterContext);
    if (!courseSemesterContextItem) {
        throw new Error(
            "DashboardComponent must be used in a CourseSemesterContext"
        );
    }
    const [relatedSemesterId, setRelatedSemesterId] = courseSemesterContextItem;

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

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            const handler = async () => {
                event.preventDefault();

                if (!type) {
                    return;
                }

                const [, droppedNode] = type;

                const nodeOutput: PrerequisiteNodeType[] = [];
                const edgeOutput: Edge[] = [];
                const wrapperOutput: { [key: string]: Wrapper } = {};

                parsePrerequisite(
                    prerequisites,
                    droppedNode.courseCode,
                    nodeOutput,
                    edgeOutput,
                    wrapperOutput,
                    courseIds
                );

                const courseStates: CourseToSemesterIdDict = {};
                const informationEndpoint = new URLSearchParams("");
                nodeOutput.forEach((node) => {
                    informationEndpoint.append(
                        "courseIds",
                        node.courseId.toString()
                    );
                });
                const courseInformationResponse = await fetch(
                    "/api/course/information?" + informationEndpoint
                );
                const courseInformation: {
                    [courseId: number]: CourseInformation;
                } = await courseInformationResponse.json();
                const filledCourses = nodeOutput.map((node) => {
                    const course = courseInformation[node.courseId];
                    return { id: node.key, data: course };
                });

                const courseSemesterResponse = await fetch(
                    "/api/course/semesters"
                );
                const courseSemesters: {
                    semesterId: number;
                    course: CourseInformation;
                }[] = await courseSemesterResponse.json();
                courseSemesters.forEach((courseSemester) => {
                    courseStates[courseSemester.course.courseCode] =
                        courseSemester.semesterId;
                });

                setRelatedSemesterId((prevRelatedSemesterId) => ({
                    ...prevRelatedSemesterId,
                    ...courseStates,
                }));

                const dropdownCourses: (
                    | DropdownCardWrapper
                    | WrapperWrapper
                )[] = filledCourses.map((course) => {
                    return {
                        id: course.id,
                        data: {
                            courseInformation: course.data,
                            courseToSemesters: () => relatedSemesterId,
                            selectSemester: selectSemester,
                        },
                        type: "courseDropdownNode",
                        position: { x: 0, y: 0 },
                    };
                });

                placeNodes(dropdownCourses);
                placeWrappers(dropdownCourses, wrapperOutput);

                setNodes(dropdownCourses as Node[]);
                setEdges(edgeOutput);
            };

            handler();
        },
        [
            session.user.userId,
            type,
            prerequisites,
            selectSemester,
            relatedSemesterId,
            setRelatedSemesterId,
        ]
    );

    useEffect(() => {
        if (typeof window !== "undefined") {
            const updateHeight = () => {
                setHeight(
                    window.innerWidth >= 768
                        ? window.innerHeight - 126
                        : window.innerHeight - 134
                );
            };

            updateHeight();
            window.addEventListener("resize", updateHeight);
            return () => {
                window.removeEventListener("resize", updateHeight);
            };
        }
    }, []);

    useEffect(() => {
        setTimeout(() => fitView(), 10);
    }, [nodes, fitView]);

    return (
        <>
            <div className="dashboard-component">
                <div className="row header">
                    <NavBar />
                </div>
                <div
                    className="row content flex"
                    style={{
                        height: height,
                    }}
                >
                    <CourseSearch />
                    <ReactFlow
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
                    >
                        <MiniMap />
                    </ReactFlow>
                </div>
            </div>
        </>
    );
}
