import { SemesterWrapper } from "@/types/semester";
import { Paper } from "@mantine/core";
import { applyNodeChanges, Node, useNodeId, useReactFlow } from "@xyflow/react";
import { useCallback, useState } from "react";
import SemesterData from "@/components/semester/SemesterData";

// remember that touchevents coordinates and mouse coordinates aren't exactly the same...

export default function Semester({ data }: SemesterWrapper) {
    const { getIntersectingNodes, setNodes, getNode } = useReactFlow();
    const node_id = useNodeId() as string; // we are sure this is a string
    const [lastY, setLastY] = useState(0);

    const handleDeltaY = useCallback(
        (deltaY: number) => {
            const id = { id: node_id };

            // remember that variables defined outside are not updated (self on outside means position stays the same)
            const self = getNode(node_id) as Node; // we are sure this is a node
            const nodesToMove = getIntersectingNodes(id);
            nodesToMove.push(self);
            const newPositions = nodesToMove.map((node) => {
                const { x, y } = node.position;
                const newPosition = { x: x, y: y + deltaY };
                return {
                    id: node.id,
                    type: "position" as const,
                    position: newPosition,
                    dragging: false,
                };
            });
            setNodes((nds) => applyNodeChanges(newPositions, nds));
        },
        [getIntersectingNodes, getNode, node_id, setNodes]
    );

    const handleScroll = useCallback(
        (event: React.WheelEvent) => {
            const deltaY = event.deltaY;
            handleDeltaY(deltaY);
        },
        [handleDeltaY]
    );

    // usecallback depends on lastY, only call it if lastY changes
    const handleMove = useCallback(
        (event: React.TouchEvent) => {
            const currentY = event.changedTouches[0].pageY;
            const deltaY = currentY - lastY;
            handleDeltaY(deltaY);
            setLastY(currentY);
        },
        [lastY, handleDeltaY]
    );

    const handleFirstTouch = useCallback((event: React.TouchEvent) => {
        setLastY(event.changedTouches[0].pageY);
    }, []);

    return (
        <Paper
            className="nowheel nodrag flex justify-center items-start"
            onWheel={handleScroll}
            onTouchMove={handleMove}
            onTouchStart={handleFirstTouch}
            radius={10}
            style={{
                height: "500px",
                width: "500px",
                backgroundColor: "white",
            }}
        >
            <SemesterData
                semesterId={data.semesterId}
                semesterName={data.semesterName}
                semesterYear={data.semesterYear}
                semesterTerm={data.semesterTerm}
            />
        </Paper>
    );
}
