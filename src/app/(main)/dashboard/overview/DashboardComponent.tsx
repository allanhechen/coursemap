"use client";

import { useState, useCallback, useEffect, useContext } from "react";
import {
    ReactFlow,
    applyNodeChanges,
    PanOnScrollMode,
    Node,
    useOnViewportChange,
    NodeChange,
    useReactFlow,
} from "@xyflow/react";
import { useWindowSize } from "@uidotdev/usehooks";

import CourseCardWrapper from "@/components/courseCard/CourseCard";
import DeleteArea from "@/components/DeleteArea";
import Semester from "@/components/semester/Semester";
import NavBar from "@/components/header/NavBar";

import {
    useGroupCards,
    useUpdateNodes,
    useDragStartHandler,
    useOnViewportMove,
    useScrollHandler,
} from "@/lib/placement";
import "@/app/(main)/dashboard/overview/DashboardComponent.css";
import { User } from "@/types/user";
import CourseSearch from "@/components/courseSearch/CourseSearch";
import { DnDContext } from "@/components/dndContext";
import { CardWrapper } from "@/types/courseCard";

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
    searchNode: CourseSearch,
};

export default function DashboardComponent(props: User) {
    const [lastX, setLastX] = useState(0);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [nodesLength, setNodesLength] = useState(0);

    const windowSize = useWindowSize();
    const { horizontalScrollHandler } = useScrollHandler();
    const { updateNodes } = useUpdateNodes();
    const { groupCards } = useGroupCards();
    const { dragStartHandler } = useDragStartHandler();
    const { onViewportMove } = useOnViewportMove();
    const { getViewport, setViewport, getNodes } = useReactFlow();

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
        const loadData = async () => {
            const countNodes = await updateNodes();
            setNodesLength(countNodes);
        };
        loadData();
        // I am unsure why my viewport is being set to something else, hacky way to fix this
        setViewport({ x: 0, y: 0, zoom: 1 });
    }, [updateNodes, setViewport]);

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

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            if (!type) {
                return;
            }

            const [nodeType, data] = type;
            const id = `course-${data.courseCode}`;

            const nodes = getNodes();
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].id === id) {
                    return;
                }
            }

            const position = {
                x: event.clientX - 100, // offset to account for semester intervals, not precise but it should work
                y: event.clientY,
            };

            data.fresh = true;

            const newNode: CardWrapper = {
                data: data,
                type: nodeType,
                position: position,
                id: id,
            };

            setNodes((nds) => {
                const newNodes = [...nds];
                const insertIndex = newNodes.length - 2;
                newNodes.splice(insertIndex, 0, newNode as unknown as Node);
                return newNodes;
            });
        },
        [type, getNodes]
    );

    useEffect(() => {
        if (nodes.length > nodesLength) {
            const lastAddedNode = nodes[nodes.length - 3];

            // measured isn't added until after calculation
            // the newly added node won't have it
            if (!lastAddedNode.data.fresh) {
                return;
            }

            lastAddedNode.measured = { width: 320, height: 176 };
            groupCards(null, lastAddedNode);
        }
        setNodesLength(nodes.length);
    }, [nodes, nodesLength, groupCards]);

    return (
        <>
            <NavBar {...props} />
            <div
                style={{
                    height: "100vh",
                    width: "100vw",
                    top: 0,
                    left: 0,
                    position: "absolute",
                    zIndex: -1,
                }}
            >
                <ReactFlow
                    nodes={nodes}
                    onNodesChange={onNodesChange}
                    panOnDrag={false}
                    panOnScroll={true}
                    zoomOnScroll={false}
                    zoomOnDoubleClick={false}
                    preventScrolling={false}
                    nodeTypes={nodeTypes}
                    onNodeDragStop={groupCards}
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
            </div>
        </>
    );
}
