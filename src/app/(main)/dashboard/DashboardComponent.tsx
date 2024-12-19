import "@xyflow/react/dist/style.css";

import { useState, useCallback } from "react";
import { ReactFlow, useReactFlow, applyNodeChanges } from "@xyflow/react";
import { PanOnScrollMode } from "@xyflow/react";
import CourseCard from "@/components/CourseCard";
import { Node } from "@xyflow/react";

{
    /* <Group>
<Semester
    semesterName="First Semester"
    semesterId={0}
    courses={[
        {
            courseCode: "CPS 305",
            courseName: "Data Structures",
            faculty: "Computer Science",
            chips: ["Winter"],
        },
        {
            courseCode: "CPS 420",
            courseName: "Discrete Structures",
            faculty: "Computer Science",
            chips: ["Winter"],
        },
        {
            courseCode: "CPS 109",
            courseName: "Computer Science I",
            faculty: "Computer Science",
            chips: ["Winter"],
        },
    ]}
/>
<Semester
    semesterName="Second Semester"
    semesterId={1}
    courses={[
        {
            courseCode: "CPS 590",
            courseName: "Operating Systems",
            faculty: "Computer Science",
            chips: ["Winter"],
        },
        {
            courseCode: "CPS 706",
            courseName: "Computer Networks",
            faculty: "Computer Science",
            chips: ["Winter"],
        },
        {
            courseCode: "CPS 616",
            courseName: "Algorithms",
            faculty: "Computer Science",
            chips: ["Winter"],
        },
    ]}
/>
</Group> */
}

// ipmlementation notes:
// 1. pan on drag false -> can't move the viewport with mouse
// 2. panonscoll true -> can scroll
// 3. panonscrollmode -> only allow horizontal scrolling
// 4. translateExtent -> determines how far the camera should be allowed to scroll
//      This will be set to the position of the last semester + some other space for an add semester button
// 5. node takes in data and isconnectable and that is all, all card information is wrapped within data

const initialNodes = [
    {
        id: "1",
        data: { label: "Hello" },
        position: { x: 0, y: 0 },
        type: "input",
    },
    {
        id: "2",
        data: { label: "World" },
        position: { x: 100, y: 100 },
    },
    {
        id: "3",
        data: {
            courseCode: "CPS 706",
            courseName: "Computer Networks",
            faculty: "Computer Science",
            chips: ["Winter"],
        },
        position: { x: 200, y: 200 },
        type: "cardNode",
    },
    {
        id: "4",
        data: {
            courseCode: "CPS 109",
            courseName: "Computer Science I",
            faculty: "Computer Science",
            chips: ["Winter"],
        },
        position: { x: 200, y: 200 },
        type: "cardNode",
    },
];

const nodeTypes = {
    cardNode: CourseCard,
};

export default function DashboardComponent() {
    const reactFlow = useReactFlow();
    const { getIntersectingNodes } = useReactFlow();
    const [nodes, setNodes] = useState(initialNodes);
    const onNodesChange = useCallback(
        (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );
    const onNodeDragStop = useCallback(
        (_: any, node: Node) => console.log(getIntersectingNodes(node)),
        []
    );
    return (
        <div
            style={{
                height: "100vh",
                backgroundColor: "grey",
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
                onNodeDragStop={onNodeDragStop}
                translateExtent={[
                    [0, 0],
                    [5000, 1000],
                ]}
                panOnScrollMode={PanOnScrollMode.Horizontal}
            />
        </div>
    );
}
