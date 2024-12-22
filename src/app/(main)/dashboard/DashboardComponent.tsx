"use client";

import { useState, useCallback, useEffect } from "react";
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
import { useUpdateNodes } from "@/lib/placement";
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
};

export default function DashboardComponent() {
    const form = useSemesterForm({
        mode: "uncontrolled",
        initialValues: {
            semesterId: 0,
            semesterName: "",
            semesterYear: new Date(2024, 0, 1),
            semesterTerm: SemesterTerm.SU,
        },
    });

    const { getIntersectingNodes } = useReactFlow();

    const [nodes, setNodes] = useState<Node[]>([]);
    const { updateNodes } = useUpdateNodes();

    // get initial node state
    useEffect(() => {
        const loadData = async () => {
            await updateNodes();
        };
        loadData();
    }, [updateNodes]);

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
                <Button onClick={updateNodes} />
            </div>
            <SemesterForm />
        </SemesterFormProvider>
    );
}
