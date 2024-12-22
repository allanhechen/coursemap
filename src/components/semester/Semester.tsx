import { SemesterWrapper } from "@/types/semester";
import { Paper } from "@mantine/core";
import { Node, useNodeId, useReactFlow } from "@xyflow/react";
import { useCallback, useState } from "react";
import SemesterData from "@/components/semester/SemesterData";
import { useScrollHandler } from "@/lib/placement";

// remember that touchevents coordinates and mouse coordinates aren't exactly the same...

export default function Semester({ data }: SemesterWrapper) {
    const { getNode } = useReactFlow();
    const node_id = useNodeId() as string; // we are sure this is a string
    const [lastY, setLastY] = useState(0);
    const { scrollHandler } = useScrollHandler();

    const onWheel = useCallback(
        (event: React.WheelEvent) => {
            const self = getNode(node_id) as Node; // we know for sure this node exists
            const deltaY = event.deltaY;
            scrollHandler(self, deltaY);
        },
        [scrollHandler, getNode, node_id]
    );

    // usecallback depends on lastY, only call it if lastY changes
    const onTouchMove = useCallback(
        (event: React.TouchEvent) => {
            const self = getNode(node_id) as Node; // we know for sure this node exists
            const currentY = event.changedTouches[0].pageY;
            const deltaY = currentY - lastY;
            scrollHandler(self, deltaY);
            setLastY(currentY);
        },
        [lastY, scrollHandler, getNode, node_id]
    );

    const onTouchStart = useCallback((event: React.TouchEvent) => {
        setLastY(event.changedTouches[0].pageY);
    }, []);

    return (
        <Paper
            className="nowheel nodrag flex justify-center items-start"
            onWheel={onWheel}
            onTouchMove={onTouchMove}
            onTouchStart={onTouchStart}
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
