"use client";

import { useState, useCallback, useContext, useEffect } from "react";
import { ReactFlow, Node, Edge, useReactFlow, MiniMap } from "@xyflow/react";

import {
    CourseCardDropdownWrapper,
    CourseCardPostrequisiteDropdownWrapper,
} from "@/components/courseCard/CourseCard";
import NavBar from "@/components/header/NavBar";

import "@/app/(main)/dashboard/courses/DashboardComponent.css";
import {
    parsePrerequisite,
    placeNodes,
    getPostrequisitePlacements,
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
}: {
    prerequisites: { [key: string]: string };
    postrequisites: { [key: string]: number[] };
    courseIds: { [courseCode: string]: number };
}) {
    const [nextPostrequisites, setNextPostrequisites] = useState<
        DropdownCardWrapper[]
    >([]);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [height, setHeight] = useState(1);
    const { fitView } = useReactFlow();

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
                setEdges([]);
                setNodes([]);

                const [, droppedNode] = type;

                const nodeOutput: PrerequisiteNodeType[] = [];
                const edgeOutput: Edge[] = [];
                const wrapperOutput: { [key: string]: Wrapper } = {};
                let postrequisiteOutput: number[] =
                    postrequisites[droppedNode.courseId.toString()];
                if (!postrequisiteOutput) {
                    postrequisiteOutput = [];
                }

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
                postrequisiteOutput.forEach((postrequisiteId) => {
                    informationEndpoint.append(
                        "courseIds",
                        postrequisiteId.toString()
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

                const postrequisiteDropdownCourses: DropdownCardWrapper[] =
                    postrequisiteOutput.map((postrequisiteId) => {
                        return {
                            id: postrequisiteId.toString(),
                            data: {
                                courseInformation:
                                    courseInformation[postrequisiteId],
                                courseToSemesters: () => relatedSemesterId,
                                selectSemester: selectSemester,
                            },
                            type: "prerequisiteDropdownNode",
                            postition: { x: 0, y: 0 },
                        };
                    });

                setNextPostrequisites(postrequisiteDropdownCourses);

                setNodes(dropdownCourses as Node[]);
                setEdges(edgeOutput);
            };

            handler();
        },
        [
            type,
            prerequisites,
            postrequisites,
            selectSemester,
            relatedSemesterId,
            setRelatedSemesterId,
            courseIds,
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
        const fitAndPlaceEdges = async () => {
            fitView({ padding: 0.1 });

            // Small delay to allow layout adjustments if needed
            await new Promise((resolve) => setTimeout(resolve, 500));

            let newEdges: Edge[];
            setNodes((currentNodes) => {
                if (currentNodes.length > 0) {
                    const updatedNodes = [...currentNodes];
                    const temp = getPostrequisitePlacements(
                        updatedNodes,
                        nextPostrequisites
                    );
                    newEdges = temp["newEdges"];
                    const newNodes = temp["newNodes"];

                    return updatedNodes.concat(newNodes);
                }
                return currentNodes;
            });
            setEdges((currentEdges) => {
                if (newEdges && newEdges.length > 0) {
                    return currentEdges.concat(newEdges);
                }
                return currentEdges;
            });
        };

        setTimeout(fitAndPlaceEdges, 10);
    }, [fitView, nextPostrequisites]);

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
