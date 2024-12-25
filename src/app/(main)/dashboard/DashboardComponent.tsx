"use client";

import { useState, useCallback, useEffect } from "react";
import {
    ReactFlow,
    applyNodeChanges,
    PanOnScrollMode,
    Node,
    useOnViewportChange,
    NodeChange,
} from "@xyflow/react";
import CourseCard from "@/components/CourseCard";
import Semester from "@/components/semester/Semester";
import DeleteArea from "@/components/DeleteArea";
import {
    useGroupCards,
    useUpdateNodes,
    useDragStartHandler,
    useOnViewportMove,
} from "@/lib/placement";
import { Button } from "@mantine/core";

// ipmlementation notes:
// 1. pan on drag false -> can't move the viewport with mouse
// 2. panonscoll true -> can scroll
// 3. panonscrollmode -> only allow horizontal scrolling
// 4. translateExtent -> determines how far the camera should be allowed to scroll
//      This will be set to the position of the last semester + some other space for an add semester button
// 5. node takes in data and isconnectable and that is all, all card information is wrapped within data

const nodeTypes = {
    courseNode: CourseCard,
    semesterNode: Semester,
    deleteNode: DeleteArea,
};

export default function DashboardComponent() {
    const [nodes, setNodes] = useState<Node[]>([]);
    const { updateNodes } = useUpdateNodes();
    const { groupCards } = useGroupCards();
    const { dragStartHandler } = useDragStartHandler();
    const { onViewportMove } = useOnViewportMove();

    // get initial node state
    useEffect(() => {
        const loadData = async () => {
            await updateNodes();
        };
        loadData();
    }, [updateNodes]);

    const onNodesChange = useCallback((changes: NodeChange[]) => {
        setNodes((nds) => applyNodeChanges(changes, nds));
    }, []);

    // move the delete area on screen move (in the future will also include search bar)
    useOnViewportChange({
        onChange: onViewportMove,
    });

    return (
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
            />
            <Button onClick={updateNodes} />
        </div>
    );
}
