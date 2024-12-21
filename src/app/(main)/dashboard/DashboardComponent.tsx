"use client";

import { useState, useCallback, createContext } from "react";
import { ReactFlow, useReactFlow, applyNodeChanges } from "@xyflow/react";
import { PanOnScrollMode } from "@xyflow/react";
import CourseCard from "@/components/CourseCard";
import { Node } from "@xyflow/react";
import Semester from "@/components/semester/Semester";
import {
    SemesterFormProvider,
    useSemesterForm,
} from "@/components/semester/semesterFormContext";
import { SemesterTerm } from "@/types/semester";
import SemesterForm from "@/components/semester/SemesterForm";
import {
    SemesterPlacement,
    SemesterPositionContextType,
} from "@/types/semester";

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
    {
        id: "5",
        data: {
            semesterId: 1,
            semesterName: "1a",
            semesterYear: new Date(2024, 0, 1),
            semesterTerm: "FA",
        },
        style: {
            zIndex: -1,
            cursor: "default",
        },
        position: { x: 300, y: 300 },
        type: "semesterNode",
    },
];

const nodeTypes = {
    cardNode: CourseCard,
    semesterNode: Semester,
};

const SemeseterPositionContext =
    createContext<SemesterPositionContextType | null>(null);

export default function DashboardComponent() {
    const form = useSemesterForm({
        mode: "uncontrolled",
        initialValues: {
            semesterId: undefined,
            semesterName: "",
            semesterYear: new Date(2024, 0, 1),
            semesterTerm: SemesterTerm.SU,
        },
    });

    const { getIntersectingNodes } = useReactFlow();

    const [nodes, setNodes] = useState(initialNodes);
    const [placement, setPlacement] = useState<SemesterPlacement[]>([]);

    const onNodesChange = useCallback(
        // eslint-disable-next-line
        (changes: any) => {
            setNodes((nds) => applyNodeChanges(changes, nds));
        },
        []
    );
    const onNodeDragStop = useCallback(
        // eslint-disable-next-line
        (_: any, node: Node) => console.log(getIntersectingNodes(node)),
        [getIntersectingNodes]
    );
    return (
        <SemeseterPositionContext.Provider value={[placement, setPlacement]}>
            <SemesterFormProvider form={form}>
                <div
                    style={{
                        height: "80vh",
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
                <SemesterForm />
            </SemesterFormProvider>
        </SemeseterPositionContext.Provider>
    );
}
