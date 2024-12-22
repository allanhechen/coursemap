import { Dispatch, SetStateAction, useCallback, useContext } from "react";
import { applyNodeChanges, Node, useReactFlow } from "@xyflow/react";
import { SemesterPlacement, SemesterWrapper } from "@/types/semester";
import { CardWrapper } from "@/types/courseCard";
import { getAllSemesters } from "./actions/semester";
import { getAllCourseSemesters } from "./actions/course";
import { SemesterPositionContext } from "@/app/(main)/dashboard/semesterPositionContext";

const SEMESTER_WIDTH = 360;
const SEMESTER_GAP = 10;
const SEMESTER_PADDING_X = 20;
const SEMESTER_PADDING_TOP = 50;
const SEMESTER_PADDING_BOTTOM = 20;
const SEMESTER_STARTING_POSITION_X = 0;
const SEMESTER_STARTING_POSITION_Y = 50;

const INTERVAL_OFFSET = -(SEMESTER_WIDTH + SEMESTER_GAP) / 2;

const CARD_GAP = 10;
const CARD_HEIGHT = 175;

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
    const contextItem = useContext(SemesterPositionContext);

    if (!contextItem) {
        throw new Error(
            "useUpdateNodes must be used within a SemseterPositionContext"
        );
    }
    const [placements, setPlacements] = contextItem;

    const scrollHandler = useCallback(
        (targetSemester: Node, distance: number) => {
            const semesterId = targetSemester.data.semesterId;

            const targetSemesterPositionIndex = placements.findIndex(
                (placement) => placement.semesterId === semesterId
            );
            const targetSemesterPosition =
                placements[targetSemesterPositionIndex];
            if (!targetSemesterPosition) {
                throw new Error(
                    "Semester position could not be located in placements"
                );
            }
            // we are scrolling up
            if (distance < 0) {
                // - distance remaining
                const potentialDistanceScrolled =
                    SEMESTER_STARTING_POSITION_Y -
                    targetSemesterPosition.bottom;
                // find maximum of scroll desired and - distance remaining
                // this will be the smaller number
                distance = Math.max(distance, potentialDistanceScrolled);
            }
            // we are scrolling down
            if (distance > 0) {
                // distance remaining
                const potentialDistanceScrolled =
                    SEMESTER_STARTING_POSITION_Y - targetSemesterPosition.top;
                distance = Math.min(distance, potentialDistanceScrolled);
            }

            // if no changes need to be made simply return
            if (distance === 0) {
                return;
            }

            const nodesToMove = getIntersectingNodes(targetSemester);
            nodesToMove.push(targetSemester);

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

            const updatedPlacements = placements.slice();
            updatedPlacements[targetSemesterPositionIndex] = {
                semesterId: targetSemesterPosition.semesterId,
                intervalStart: targetSemesterPosition.intervalStart,
                intervalEnd: targetSemesterPosition.intervalEnd,
                top: targetSemesterPosition.top + distance,
                bottom: targetSemesterPosition.bottom + distance,
            };

            setPlacements(updatedPlacements);
            setNodes((nodes) => applyNodeChanges(newPositions, nodes));
        },
        [getIntersectingNodes, setNodes, placements, setPlacements]
    );

    return { scrollHandler };
};

function placeNodes(
    semesterGroupDict: Dictionary<SemesterGroup>,
    setPlacements: Dispatch<SetStateAction<SemesterPlacement[]>>
): Node[] {
    const finalNodes: Node[] = [];
    const newPlacements: SemesterPlacement[] = [];

    let semesterPosition = SEMESTER_STARTING_POSITION_X;

    for (const key in semesterGroupDict) {
        const cardPositionX = semesterPosition + SEMESTER_PADDING_X;
        let cardPositionY = SEMESTER_PADDING_TOP + SEMESTER_STARTING_POSITION_Y;
        const { semester, courses } = semesterGroupDict[key];
        semester.position = {
            x: semesterPosition,
            y: SEMESTER_STARTING_POSITION_Y,
        };
        semester.style = {
            width: SEMESTER_WIDTH,
            // height:
            //     SEMESTER_PADDING_TOP +
            //     SEMESTER_PADDING_BOTTOM +
            //     CARD_HEIGHT * courses.length +
            //     CARD_GAP * (courses.length - 1),
            // backgroundColor: "white",
            zIndex: -1,
            cursor: "default",
            overflow: "hidden",
        };
        semester.id = `${key}-${semester.data.semesterName}`;
        semester.type = "semesterNode" as const;
        // TODO: fix the wrapper types so they extend node correctly
        finalNodes.push(semester as unknown as Node);

        // deal with the intervals
        // top is simply the initial Y offset of the semester
        // we have x position and the card width, simply offset both by 1/2 width + gap for intervals
        // bottom is the initial y offset + everything within the card
        // reminder that offset is calculated above

        newPlacements.push({
            semesterId: semester.data.semesterId,
            intervalStart: semester.position.x + INTERVAL_OFFSET,
            intervalEnd: semester.position.x + SEMESTER_WIDTH + INTERVAL_OFFSET,
            top: SEMESTER_STARTING_POSITION_Y,
            bottom:
                SEMESTER_STARTING_POSITION_Y +
                SEMESTER_PADDING_TOP +
                SEMESTER_PADDING_BOTTOM +
                CARD_HEIGHT * courses.length +
                CARD_GAP * (courses.length - 1),
        });

        courses.forEach((course) => {
            course.position = {
                x: cardPositionX,
                y: cardPositionY,
            };
            cardPositionY += CARD_HEIGHT + CARD_GAP;
            course.id = `${course.data.courseCode}`;
            course.type = "courseNode" as const;
            finalNodes.push(course as unknown as Node);
        });
        semesterPosition += SEMESTER_WIDTH + SEMESTER_GAP;
    }
    setPlacements(newPlacements);
    return finalNodes;
}

export const useUpdateNodes = () => {
    const { setNodes } = useReactFlow();
    const contextItem = useContext(SemesterPositionContext);

    if (!contextItem) {
        throw new Error(
            "useUpdateNodes must be used within a SemseterPositionContext"
        );
    }
    const [, setPlacements] = contextItem;

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

        const nodes = placeNodes(semesterGroupDict, setPlacements);
        setNodes(nodes);
    }, [setNodes, setPlacements]);

    return { updateNodes };
};
