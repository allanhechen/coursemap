import { SemesterWrapper } from "@/types/semester";
import { Node, useNodeId, useReactFlow } from "@xyflow/react";
import { useCallback, useState } from "react";
import SemesterData from "@/components/semester/SemesterData";
import { useScrollHandler } from "@/lib/placement";

// remember that touchevents coordinates and mouse coordinates aren't exactly the same...

export default function Semester({ data }: SemesterWrapper) {
    const { getNode } = useReactFlow();
    const node_id = useNodeId() as string; // we are sure this is a string
    const [lastY, setLastY] = useState(0);
    const { verticalScrollHandler, horizontalScrollHandler } =
        useScrollHandler();

    const onWheel = useCallback(
        (event: React.WheelEvent) => {
            event.stopPropagation();
            const { deltaX, deltaY } = event;
            // Only scroll horizontal or vertical
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                horizontalScrollHandler(-deltaX);
            } else {
                const self = getNode(node_id) as Node; // we know for sure this node exists
                verticalScrollHandler(self, -deltaY);
            }
        },
        [verticalScrollHandler, horizontalScrollHandler, getNode, node_id]
    );

    const onTouchMove = useCallback(
        (event: React.TouchEvent) => {
            event.stopPropagation();
            const { pageY } = event.changedTouches[0];

            const self = getNode(node_id) as Node; // we know for sure this node exists
            const deltaY = pageY - lastY;
            verticalScrollHandler(self, deltaY);
            setLastY(pageY);
        },
        [lastY, verticalScrollHandler, getNode, node_id]
    );

    const onTouchStart = useCallback((event: React.TouchEvent) => {
        event.stopPropagation();
        setLastY(event.changedTouches[0].pageY);
    }, []);

    return (
        <div
            className="nowheel nodrag flex justify-center items-start"
            onWheel={onWheel}
            onTouchMove={onTouchMove}
            onTouchStart={onTouchStart}
            style={{ height: "200vh" }}
        >
            <SemesterData
                semesterId={data.semesterId}
                semesterName={data.semesterName}
                semesterYear={data.semesterYear}
                semesterTerm={data.semesterTerm}
            />
        </div>
    );
}
