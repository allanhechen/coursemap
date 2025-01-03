import { Dispatch, SetStateAction, useCallback, useContext } from "react";
import {
    applyNodeChanges,
    Node,
    NodePositionChange,
    useReactFlow,
    Viewport,
} from "@xyflow/react";
import { SemesterPlacement, SemesterWrapper } from "@/types/semester";
import { CardWrapper } from "@/types/courseCard";
import { getAllSemesters } from "./actions/semester";
import { getAllCourseSemesters } from "./actions/course";
import { SemesterPositionContext } from "@/app/(main)/dashboard/semesterPositionContext";

// always fix to the bottom of the screen
if (typeof window !== "undefined") {
    // eslint-disable-next-line
    var DELETEAREA_DEFAULT_POSITION = window.innerHeight;
    // eslint-disable-next-line
    var DELETEAREA_ACTIVE_POSITION = window.innerHeight * 0.9;

    // eslint-disable-next-line
    var SEARCHAREA_POSITION_X = 20;
    // eslint-disable-next-line
    var SEARCHAREA_POSITION_Y = window.innerWidth >= 768 ? 106 : 114;

    // eslint-disable-next-line
    var SEMESTER_STARTING_POSITION_X = 420;
    // eslint-disable-next-line
    var SEMESTER_STARTING_POSITION_Y = SEARCHAREA_POSITION_Y;

    window.addEventListener("resize", () => {
        DELETEAREA_DEFAULT_POSITION = window.innerHeight;
        DELETEAREA_ACTIVE_POSITION = window.innerHeight * 0.9;

        SEARCHAREA_POSITION_Y = window.innerWidth >= 768 ? 106 : 114;
        SEMESTER_STARTING_POSITION_Y = SEARCHAREA_POSITION_Y;
    });
}

// TODO: do this with states and useeffect instead instead of lying to eslint

const SEMESTER_WIDTH = 360;
const SEMESTER_GAP = 10;
const SEMESTER_PADDING_X = 20;
const SEMESTER_PADDING_TOP = 50;
const SEMESTER_PADDING_BOTTOM = 20;

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
// currently assumes that the item to be moved is a smester
// must be changed to account for the search bar
export const useScrollHandler = () => {
    const { getIntersectingNodes, setNodes, setViewport, getViewport } =
        useReactFlow();
    const contextItem = useContext(SemesterPositionContext);

    if (!contextItem) {
        throw new Error(
            "useUpdateNodes must be used within a SemseterPositionContext"
        );
    }
    const [placements, setPlacements] = contextItem;

    const verticalScrollHandler = useCallback(
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

            // cannot use map because we skip some elements
            const newPositions: NodePositionChange[] = [];
            nodesToMove.forEach((currentNode: Node) => {
                // don't move the deleteArea or courseSearch
                if (
                    currentNode.id === "deleteArea" ||
                    currentNode.id === "courseSearch"
                ) {
                    return;
                }
                const { x, y } = currentNode.position;
                const newPosition = { x: x, y: y + distance };
                newPositions.push({
                    id: currentNode.id,
                    type: "position" as const,
                    position: newPosition,
                    dragging: false,
                });
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

    const horizontalScrollHandler = useCallback(
        (distance: number) => {
            const { x, y, zoom }: Viewport = getViewport();
            if (x + distance > 0) {
                distance = -x;
            }
            setViewport({
                x: x + distance,
                y: y,
                zoom: zoom,
            });
        },
        [setViewport, getViewport]
    );

    return { verticalScrollHandler, horizontalScrollHandler };
};

// a helper funciton that calculates where the nodes should go
// initializes semesterpositions for intervals
// also adds the delete bar (and the search bar in the future)
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
            // Allow scrolling with the entire height by disabling the card height
            // The downside is that it is harder to delete nodes, but there is a dedicated
            // node delete section to remedy this
            // height:
            //     SEMESTER_PADDING_TOP +
            //     SEMESTER_PADDING_BOTTOM +
            //     CARD_HEIGHT * courses.length +
            //     CARD_GAP * (courses.length - 1),
            cursor: "default",
            overflow: "hidden",
            zIndex: "-1",
        };
        semester.id = `semester-${key}`;
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
            intervalEnd:
                semester.position.x +
                SEMESTER_WIDTH +
                SEMESTER_GAP +
                INTERVAL_OFFSET -
                1, // since we can't have overlapping intervals
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
            course.id = `course-${course.data.courseCode}`;
            course.type = "courseNode" as const;
            finalNodes.push(course as unknown as Node);
        });
        semesterPosition += SEMESTER_WIDTH + SEMESTER_GAP;
    }
    setPlacements(newPlacements);

    // push this near the end so it appears on top of semesters
    const courseSearch: Node = {
        id: "courseSearch",
        data: {},
        type: "searchNode" as const,
        position: {
            x: SEARCHAREA_POSITION_X,
            y: SEARCHAREA_POSITION_Y, //for testing
        },
        className: "nopan nodrag",
        style: {
            cursor: "default",
        },
    };
    finalNodes.push(courseSearch);

    const deleteArea: Node = {
        id: "deleteArea",
        data: {},
        type: "deleteNode" as const,
        position: {
            x: 0.1 * window.innerWidth,
            y: DELETEAREA_DEFAULT_POSITION,
        },
        style: {
            cursor: "default",
        },
    };
    // push this at the end so it always appears on top
    finalNodes.push(deleteArea);
    return finalNodes;
}

// function calls the server for semesters and coursesemesters and properly orders all of them
// initializes semesterpositions as well using placenodes
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
        return nodes.length;
    }, [setNodes, setPlacements]);

    return { updateNodes };
};

function findInterval(
    intervals: SemesterPlacement[],
    position: number
): { interval: SemesterPlacement; index: number } | undefined {
    for (let i = 0; i < intervals.length; i++) {
        if (
            intervals[i].intervalStart <= position &&
            position <= intervals[i].intervalEnd
        ) {
            return { interval: intervals[i], index: i };
        }
    }
}

// a helper function that takes in a list of nodes and simply removes the one specified with the id
function removeNode(id: string, initialNodes: Node[]): Node[] {
    const finalNodes: Node[] = [];
    initialNodes.forEach((node) => {
        if (node.id != id) {
            finalNodes.push(node);
        }
    });

    return finalNodes;
}

// arranges dropped nodes depending on where it's placed
// if it overlaps with the destroy area it is deleted
// finds the interval in semesterposition and then the related y position
// updates the end of the card in semesterposition
export const useGroupCards = () => {
    const { getIntersectingNodes, getNodes, setNodes, updateNode, getNode } =
        useReactFlow();
    const contextItem = useContext(SemesterPositionContext);

    if (!contextItem) {
        throw new Error(
            "useUpdateNodes must be used within a SemseterPositionContext"
        );
    }
    const [oldPlacements, setPlacements] = contextItem;
    // create a copy of placements so we can just modify in place and not worry about it
    const placements = oldPlacements.slice();

    const groupCards = useCallback(
        (_: React.MouseEvent | null, droppedNode: Node) => {
            const nodes = getNodes();
            const intersectingNodes = getIntersectingNodes(droppedNode);

            // see if it's intersecting with deletearea
            // if it is, delete it
            for (let i = 0; i < intersectingNodes.length; i++) {
                const node = intersectingNodes[i];
                if (node.id === "deleteArea") {
                    const newNodes = removeNode(droppedNode.id, nodes);
                    setNodes(newNodes);
                    const deleteArea = getNode("deleteArea") as Node;
                    updateNode("deleteArea", {
                        position: {
                            x: deleteArea.position.x,
                            y: DELETEAREA_DEFAULT_POSITION,
                        },
                    });
                    return;
                }
            }

            const { x, y } = droppedNode.position;
            const foundInterval = findInterval(placements, x);

            // node was not found in any interval
            if (!foundInterval) {
                const newNodes = removeNode(droppedNode.id, nodes);
                setNodes(newNodes);
                return;
            }

            const { interval: relatedSemester, index: relatedSemesterIndex } =
                foundInterval;

            if (y > relatedSemester.bottom) {
                // node was placed too low, we will fix it
                droppedNode.position.y = relatedSemester.bottom - 1;
            }

            // x position was found, now we need to find the y position
            // get the nodes intersecting with the semester
            // for all card nodes lower than the dropped card (y is bigger)
            // shift them down one card length + gap
            // update length of semesterposition
            // if anything was moved, round card position up to the next slot
            // otherwise put card in the first slot
            const newNodes: Node[] = [];

            const nodesInInterval = getIntersectingNodes({
                id: `semester-${relatedSemester.semesterId}`,
            });

            let touchingCards = 0;
            const alreadyUpdated = new Set();
            nodesInInterval.forEach((node) => {
                // ignore non course items
                if (
                    !node.id.startsWith("course-") ||
                    node.id === droppedNode.id
                ) {
                    return;
                } else if (node.position.y >= y) {
                    newNodes.push({
                        id: node.id,
                        data: node.data,
                        position: {
                            x: node.position.x,
                            y: node.position.y + CARD_GAP + CARD_HEIGHT,
                        },
                        type: node.type,
                    });
                    alreadyUpdated.add(node.id);
                }
                touchingCards += 1;
            });

            let newYPosition = 0;
            // ceiling takes care moving card in the correct spot
            // max takes care of placing it too high up
            // min takes care of putting it in the very bottom
            const cardsAbove = Math.min(
                Math.max(
                    Math.ceil(
                        (y - relatedSemester.top - SEMESTER_PADDING_TOP) /
                            (CARD_HEIGHT + CARD_GAP)
                    ),
                    0
                ),
                touchingCards
            );

            newYPosition =
                relatedSemester.top +
                SEMESTER_PADDING_TOP +
                cardsAbove * (CARD_HEIGHT + CARD_GAP);
            const semesterBottomAdjustment =
                touchingCards > 0 ? CARD_GAP + CARD_HEIGHT : CARD_HEIGHT;
            placements[relatedSemesterIndex].bottom += semesterBottomAdjustment;

            // could use updatenodes but I wish to not call setnodes again
            nodes.forEach((node) => {
                if (node.id === "deleteArea") {
                    newNodes.push({
                        id: node.id,
                        data: node.data,
                        position: {
                            x: node.position.x,
                            y: DELETEAREA_DEFAULT_POSITION,
                        },
                        type: node.type,
                    });
                } else if (alreadyUpdated.has(node.id)) {
                    // do nothing since we already added it above
                } else if (node.id !== droppedNode.id) {
                    newNodes.push(node);
                } else {
                    newNodes.push({
                        id: droppedNode.id,
                        data: droppedNode.data,
                        position: {
                            x:
                                (relatedSemester.intervalStart +
                                    relatedSemester.intervalEnd) /
                                    2 +
                                SEMESTER_PADDING_X,
                            y: newYPosition, // for testing
                        },
                        type: droppedNode.type,
                    });
                }
            });
            setNodes(newNodes);
            setPlacements(placements);
            // TODO: call update nodes server action here
        },
        [
            placements,
            getIntersectingNodes,
            getNodes,
            setNodes,
            updateNode,
            getNode,
            setPlacements,
        ]
    );

    return { groupCards };
};

// shows the delete area when dragging items
export const useDragStartHandler = () => {
    const { updateNode, getNode, getIntersectingNodes } = useReactFlow();
    const contextItem = useContext(SemesterPositionContext);

    if (!contextItem) {
        throw new Error(
            "useDragStartHandler must be used within a SemseterPositionContext"
        );
    }
    const [oldPlacements, setPlacements] = contextItem;
    const placements = oldPlacements.slice();

    const dragStartHandler = useCallback(
        (_: React.MouseEvent, draggedNode: Node) => {
            const deleteArea = getNode("deleteArea") as Node; // will always be defined
            updateNode("deleteArea", {
                position: {
                    x: deleteArea.position.x,
                    y: DELETEAREA_ACTIVE_POSITION,
                },
            });

            const { x, y } = draggedNode.position;
            const { interval: relatedSemester, index: relatedSemesterIndex } =
                findInterval(placements, x) as {
                    interval: SemesterPlacement;
                    index: number;
                };
            const nodesInInterval = getIntersectingNodes({
                id: `semester-${relatedSemester.semesterId}`,
            });

            let touchingCards = 0;
            nodesInInterval.forEach((node) => {
                // ignore non course items
                if (
                    !node.id.startsWith("course") ||
                    node.id === draggedNode.id
                ) {
                    return;
                } else if (node.position.y >= y) {
                    updateNode(node.id, {
                        position: {
                            x: node.position.x,
                            y: node.position.y - CARD_GAP - CARD_HEIGHT,
                        },
                    });
                }
                touchingCards += 1;
            });
            const semesterBottomAdjustment =
                touchingCards > 0 ? CARD_GAP + CARD_HEIGHT : CARD_HEIGHT;
            placements[relatedSemesterIndex].bottom -= semesterBottomAdjustment;
            setPlacements(placements);

            updateNode(draggedNode.id, {
                style: {
                    zIndex: 100,
                },
            });
        },
        [updateNode, getNode, getIntersectingNodes, placements, setPlacements]
    );

    return { dragStartHandler };
};

// updates the delete area on scroll (in the future also search)
export const useOnViewportMove = () => {
    const { updateNode } = useReactFlow();
    const onViewportMove = useCallback(
        (viewport: Viewport) => {
            // I'm not sure why it's negative
            const x = -viewport.x;
            const windowWidth = window.innerWidth;

            // we want 10% on each side since the width is 80vw
            updateNode("deleteArea", {
                position: {
                    x: x + 0.1 * windowWidth,
                    y: DELETEAREA_DEFAULT_POSITION,
                },
            });

            updateNode("courseSearch", {
                position: {
                    x: x + SEARCHAREA_POSITION_X,
                    y: SEARCHAREA_POSITION_Y,
                },
            });
        },
        [updateNode]
    );

    return { onViewportMove };
};
