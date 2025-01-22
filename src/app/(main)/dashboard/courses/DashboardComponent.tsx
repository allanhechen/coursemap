"use client";

import { useState, useCallback, useContext, useEffect } from "react";
import { ReactFlow, Node, Edge, useReactFlow, MiniMap } from "@xyflow/react";

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
import { getCourseSemesters, getCourseInformation } from "@/actions/course";
import {
    CourseToSemesterIdDict,
    DropdownCardWrapper,
    WrapperWrapper,
} from "@/types/courseCard";
import { CourseSemesterContext } from "@/app/(main)/dashboard/courses/courseSemesterContext";
import AndWrapper from "@/components/wrapper/AndWrapper";
import OrWrapper from "@/components/wrapper/OrWrapper";
import { SessionContext } from "@/components/sessionContext";

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

                const [, data] = type;

                const nodeOutput: PrerequisiteNodeType[] = [];
                const edgeOutput: Edge[] = [];
                const wrapperOutput: { [key: string]: Wrapper } = {};

                parsePrerequisite(
                    prerequisites,
                    data.courseCode,
                    nodeOutput,
                    edgeOutput,
                    wrapperOutput
                );

                const courseStates: CourseToSemesterIdDict = {};
                const courses = nodeOutput.map((node) => node.courseName);

                const courseInformation = await getCourseInformation(courses);
                const filledCourses = nodeOutput.map((node) => ({
                    id: node.key,
                    data: courseInformation[node.courseName],
                }));

                const courseSemesters = await getCourseSemesters(
                    session.user.userId
                );
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
