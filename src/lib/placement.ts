import { useCallback } from "react";
import { applyNodeChanges, Node, useReactFlow } from "@xyflow/react";

// function takes in a node and moves all nodes connected to it
export const useScrollHandler = () => {
    const { getIntersectingNodes, setNodes } = useReactFlow();

    const scrollHandler = useCallback(
        (targetNode: Node, distance: number) => {
            const nodesToMove = getIntersectingNodes(targetNode);
            nodesToMove.push(targetNode);

            const newPositions = nodesToMove.map((currentNode: Node) => {
                const { x, y } = currentNode.position;
                const newPosition = { x: x, y: y + distance };
                return {
                    id: currentNode.id,
                    type: "position" as const,
                    position: newPosition,
                    dragging: false,
                };
            });

            setNodes((nodes) => applyNodeChanges(newPositions, nodes));
        },
        [getIntersectingNodes, setNodes]
    );

    return { scrollHandler };
};
