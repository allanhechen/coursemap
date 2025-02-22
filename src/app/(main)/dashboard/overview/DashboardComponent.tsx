"use client";

import { useState, useCallback, useEffect, useContext } from "react";
import {
    ReactFlow,
    applyNodeChanges,
    PanOnScrollMode,
    Node,
    NodeChange,
    useReactFlow,
    useOnViewportChange,
} from "@xyflow/react";
import { useWindowSize } from "@uidotdev/usehooks";

import CourseCardWrapper from "@/components/courseCard/CourseCard";
import DeleteArea from "@/components/DeleteArea";
import Semester from "@/components/semester/Semester";

import {
    useGroupCards,
    useUpdateNodes,
    useDragStartHandler,
    useOnViewportMove,
    useScrollHandler,
} from "@/lib/placement";
import "@/app/(main)/dashboard/overview/DashboardComponent.css";
import "@/app/(main)/dashboard/Dashboard.css";
import { DnDContext } from "@/components/dndContext";
import { CardWrapper, CourseInformation } from "@/types/courseCard";
import { SessionContext } from "@/components/sessionContext";
import { notifications } from "@mantine/notifications";
import { SemesterInformation } from "@/types/semester";

// ipmlementation notes:
// 1. pan on drag false -> can't move the viewport with mouse
// 2. panonscoll true -> can scroll
// 3. panonscrollmode -> only allow horizontal scrolling
// 4. translateExtent -> determines how far the camera should be allowed to scroll
//      This will be set to the position of the last semester + some other space for an add semester button
// 5. node takes in data and isconnectable and that is all, all card information is wrapped within data

const nodeTypes = {
    courseNode: CourseCardWrapper,
    semesterNode: Semester,
    deleteNode: DeleteArea,
};

export default function DashboardComponent({
    courseNames,
    semesters,
    courseSemesters,
}: {
    courseNames: {
        [courseId: number]: string;
    };
    semesters: SemesterInformation[];
    courseSemesters: {
        semesterId: number;
        course: CourseInformation;
    }[];
}) {
    const [lastX, setLastX] = useState(0);
    const [nodes, setNodes] = useState<Node[]>([]);

    const windowSize = useWindowSize();
    const { horizontalScrollHandler } = useScrollHandler();
    const { updateNodes } = useUpdateNodes();
    const { groupCards } = useGroupCards(courseNames);
    const { dragStartHandler } = useDragStartHandler();
    const { onViewportMove } = useOnViewportMove();
    const { getViewport, setViewport, getNodes } = useReactFlow();

    const session = useContext(SessionContext)!;

    const contextItem = useContext(DnDContext);
    if (!contextItem) {
        throw new Error("DashboardComponent must be used in a DnDContext");
    }
    const [type] = contextItem;

    // group cards again on window resize
    useEffect(() => {
        onViewportMove(getViewport());
    }, [windowSize, getViewport, onViewportMove]);

    // get initial node state
    useEffect(() => {
        updateNodes(semesters, courseSemesters);
        // I am unsure why my viewport is being set to something else, hacky way to fix this
        setViewport({ x: 0, y: 0, zoom: 1 });
    }, [updateNodes, setViewport, session, courseSemesters, semesters]);

    const onNodesChange = useCallback((changes: NodeChange[]) => {
        setNodes((nds) => applyNodeChanges(changes, nds));
    }, []);

    // move the delete area on screen move (in the future will also include search bar)
    useOnViewportChange({
        onChange: onViewportMove,
    });
    const onWheel = useCallback(
        (event: React.WheelEvent) => {
            const { deltaX, deltaY } = event;
            // Only scroll horizontal or vertical
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                horizontalScrollHandler(-deltaX);
            }
        },
        [horizontalScrollHandler]
    );

    const onTouchMove = useCallback(
        (event: React.TouchEvent) => {
            const { pageX, pageY } = event.changedTouches[0];
            if (Math.abs(pageX) > Math.abs(pageY)) {
                const deltaX = pageX - lastX;
                horizontalScrollHandler(deltaX);
                setLastX(pageX);
            }
        },
        [lastX, horizontalScrollHandler]
    );

    const onTouchStart = useCallback((event: React.TouchEvent) => {
        setLastX(event.changedTouches[0].pageX);
    }, []);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    useEffect(() => {
        const handleResize = () => horizontalScrollHandler(0);
        window.addEventListener("resize", handleResize);
        return () => {
            notifications.clean();
            window.removeEventListener("resize", handleResize);
        };
    }, [horizontalScrollHandler]);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            if (!type) {
                return;
            }

            const [nodeType, data] = type;
            const id = `course-${data.courseCode}`;

            const nodes = getNodes();
            if (nodes.length === 1) {
                // this means we have no semesters, there are no valid semesters for this course to be dropped on
                return;
            }
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].id === id) {
                    notifications.show({
                        withCloseButton: true,
                        title: "Error adding new course",
                        message: "Course already exists in a semester",
                        color: "red",
                        className: "mt-2 transition-transform",
                    });
                    return;
                }
            }

            const viewport = getViewport();
            const position = {
                x: event.clientX - 600 - viewport.x, // account for the offset of the page vs. the viewport
                y: event.clientY,
            };

            const newNode: CardWrapper = {
                data: data,
                type: nodeType,
                position: position,
                id: id,
                measured: { width: 320, height: 176 },
            };

            const nextNodes = [...nodes];
            const insertIndex = nextNodes.length - 1;
            nextNodes.splice(insertIndex, 0, newNode as unknown as Node);

            groupCards(null, newNode as unknown as Node, nextNodes);
        },
        [groupCards, getViewport, type, getNodes]
    );

    const groupCardsWrapper = (e: React.MouseEvent, droppedNode: Node) =>
        groupCards(e, droppedNode);

    return (
        <ReactFlow
            nodes={nodes}
            onNodesChange={onNodesChange}
            panOnDrag={false}
            panOnScroll={true}
            zoomOnScroll={false}
            zoomOnDoubleClick={false}
            preventScrolling={false}
            nodeTypes={nodeTypes}
            onNodeDragStop={groupCardsWrapper}
            onNodeDragStart={dragStartHandler}
            translateExtent={[
                [0, 0],
                [5000, 1000],
            ]}
            panOnScrollMode={PanOnScrollMode.Horizontal}
            autoPanOnConnect={false}
            autoPanOnNodeDrag={false}
            minZoom={1}
            maxZoom={1}
            className="nodrag nowheel"
            onWheel={onWheel}
            onTouchMove={onTouchMove}
            onTouchStart={onTouchStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            proOptions={{ hideAttribution: true }}
        />
    );
}
