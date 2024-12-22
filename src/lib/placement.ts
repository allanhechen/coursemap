import { useCallback } from "react";
import { applyNodeChanges, Node, useReactFlow } from "@xyflow/react";
import { SemesterWrapper } from "@/types/semester";
import { CardWrapper } from "@/types/courseCard";
import { getAllSemesters } from "./actions/semester";
import { getAllCourseSemesters } from "./actions/course";

interface SemesterGroup {
    semester: SemesterWrapper;
    courses: CardWrapper[];
}
interface Dictionary<T> {
    [Key: string]: T;
}

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

function placeNodes(semesterGroupDict: Dictionary<SemesterGroup>): Node[] {
    const finalNodes: Node[] = [];
    let semesterPosition = 0;

    for (const key in semesterGroupDict) {
        const { semester, courses } = semesterGroupDict[key];
        semester.position = { x: 0, y: semesterPosition };
        semester.id = `${key}-${semester.data.semesterName}`;
        semester.type = "semesterNode" as const;
        // TODO: fix the wrapper types so they extend node correctly
        finalNodes.push(semester as unknown as Node);
        semesterPosition += 100;
    }
    return finalNodes;
}

export const useUpdateNodes = () => {
    const { setNodes } = useReactFlow();

    const updateNodes = useCallback(async () => {
        // these are already sorted so we don't need to sort them again
        const semesters = await getAllSemesters();
        const courseSemesters = await getAllCourseSemesters();

        // we need to group all the courseSemesters by semesters and convert them into nodes
        const semesterGroupDict: Dictionary<SemesterGroup> = {};
        semesters.forEach((semester) => {
            const key = semester.semesterId.toString();
            semesterGroupDict[key] = {
                semester: { data: semester },
                courses: [],
            };
        });

        courseSemesters.forEach(({ semesterId, course }) => {
            const key = semesterId.toString();
            const { courses } = semesterGroupDict[key];

            courses.push({ data: course });
        });

        const nodes = placeNodes(semesterGroupDict);
        console.log(nodes);
        setNodes(nodes);
    }, [setNodes]);

    return { updateNodes };
};
