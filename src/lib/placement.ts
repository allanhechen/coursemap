import { Dispatch, SetStateAction, useCallback, useContext } from "react";
import {
    applyNodeChanges,
    Node,
    NodePositionChange,
    Rect,
    useReactFlow,
    Viewport,
} from "@xyflow/react";
import {
    SemesterInformation,
    SemesterPlacement,
    SemesterTerm,
    SemesterWrapper,
} from "@/types/semester";
import { CardWrapper, CourseInformation } from "@/types/courseCard";
import { SemesterPositionContext } from "@/app/(main)/dashboard/overview/semesterPositionContext";
import { ChipVariant } from "@/types/chipVariant";
import { notifications } from "@mantine/notifications";

const termToChipVariant = {
    [SemesterTerm.FA]: ChipVariant.FALL,
    [SemesterTerm.WI]: ChipVariant.WINTER,
    [SemesterTerm.SP]: ChipVariant.SPRING,
    [SemesterTerm.SU]: ChipVariant.SUMMER,
};

let DELETEAREA_DEFAULT_POSITION = window.innerHeight;
let DELETEAREA_ACTIVE_POSITION = window.innerHeight * 0.9;

// let SEARCHAREA_POSITION_X = 20;
let SEARCHAREA_POSITION_Y = window.innerWidth >= 768 ? 106 : 114;

const SEMESTER_STARTING_POSITION_X = 420;
let SEMESTER_STARTING_POSITION_Y = SEARCHAREA_POSITION_Y;

let SEMESTER_BOTTOM_DISTANCE = window.innerHeight - 300;

// TODO: remove all that require event listeners when changing searchArea to be a regular page component
window.addEventListener("resize", () => {
    DELETEAREA_DEFAULT_POSITION = window.innerHeight;
    DELETEAREA_ACTIVE_POSITION = window.innerHeight * 0.9;

    SEARCHAREA_POSITION_Y = window.innerWidth >= 768 ? 106 : 114;
    SEMESTER_STARTING_POSITION_Y = SEARCHAREA_POSITION_Y;

    SEMESTER_BOTTOM_DISTANCE = window.innerHeight - 300;
});

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
                    SEMESTER_STARTING_POSITION_Y +
                    SEMESTER_BOTTOM_DISTANCE -
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
                semesterTerm: targetSemesterPosition.semesterTerm,
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

const termOrder: { [key in SemesterTerm]: number } = {
    [SemesterTerm.WI]: 1,
    [SemesterTerm.SP]: 2,
    [SemesterTerm.SU]: 3,
    [SemesterTerm.FA]: 4,
};

// a helper function that calculates where the nodes should go
// initializes semesterpositions for intervals
// also adds the delete bar (and the search bar in the future)
function placeNodes(
    semesterGroupDict: Dictionary<SemesterGroup>,
    setPlacements: Dispatch<SetStateAction<SemesterPlacement[]>>,
    viewportXOffset: number
): Node[] {
    const finalNodes: Node[] = [];
    const newPlacements: SemesterPlacement[] = [];
    const seenCourses = new Set();

    let semesterPosition = SEMESTER_STARTING_POSITION_X;

    const semesters = Object.values(semesterGroupDict);
    semesters.sort((a, b) => {
        const yearDiff =
            a.semester.data.semesterYear.getFullYear() -
            b.semester.data.semesterYear.getFullYear();
        if (yearDiff !== 0) return yearDiff;

        return (
            termOrder[a.semester.data.semesterTerm] -
            termOrder[b.semester.data.semesterTerm]
        );
    });

    semesters.forEach(({ semester, courses }) => {
        const key = semester.data.semesterId.toString();
        const cardPositionX = semesterPosition + SEMESTER_PADDING_X;
        let cardPositionY = SEMESTER_PADDING_TOP + SEMESTER_STARTING_POSITION_Y;
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
            semesterTerm: semester.data.semesterTerm,
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

        const newSeenCourses = new Set();
        courses.forEach((course) => {
            course.position = {
                x: cardPositionX,
                y: cardPositionY,
            };
            cardPositionY += CARD_HEIGHT + CARD_GAP;
            course.id = `course-${course.data.courseCode}`;
            course.type = "courseNode" as const;

            const courseData = course.data;
            const prerequisites = courseData.prerequisites;
            // check for term
            if (
                !courseData.chips.includes(
                    termToChipVariant[semester.data.semesterTerm]
                )
            ) {
                courseData.termWarning = true;
            }

            // check for prerequisites
            newSeenCourses.add(courseData.courseCode);
            if (prerequisites !== "") {
                // this gets all items in {brackets} and extracts the text
                // we see if the extracted text (a course code) has already been seen
                // if it is, we set it to true
                const prerequisite_eval = prerequisites.replace(
                    /{([\w\s]+)}/g,
                    (_, prerequisite) => {
                        return seenCourses.has(prerequisite).toString();
                    }
                );
                courseData.requisiteWarning = !eval(prerequisite_eval);
            }

            finalNodes.push(course as unknown as Node);
        });
        newSeenCourses.forEach((value) => seenCourses.add(value));
        semesterPosition += SEMESTER_WIDTH + SEMESTER_GAP;
    });
    setPlacements(newPlacements);

    // check for antirequisites
    finalNodes.forEach((node) => {
        if (node.id.startsWith("course-")) {
            const courseNode = node as unknown as CardWrapper;

            courseNode.data.antirequisites.forEach((antirequisite) => {
                if (seenCourses.has(antirequisite)) {
                    courseNode.data.requisiteWarning = true;
                }
            });
        }
    });

    // push this near the end so it appears on top of semesters
    const courseSearch: Node = {
        id: "courseSearch",
        data: {},
        type: "searchNode" as const,
        position: {
            x: -viewportXOffset,
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
            x: 0.1 * window.innerWidth - viewportXOffset,
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
    const { setNodes, getViewport } = useReactFlow();
    const contextItem = useContext(SemesterPositionContext);

    if (!contextItem) {
        throw new Error(
            "useUpdateNodes must be used within a SemseterPositionContext"
        );
    }
    const [, setPlacements] = contextItem;

    const updateNodes = useCallback(async () => {
        // these are already sorted so we don't need to sort them again
        let semesters;
        try {
            const semesterResponse = await fetch("/api/semester");
            if (!semesterResponse.ok) {
                throw new Error(
                    `${semesterResponse.status} ${semesterResponse.statusText}`
                );
            }
            const temp: { semesters: SemesterInformation[] } =
                await semesterResponse.json();
            semesters = temp.semesters;
        } catch {
            notifications.show({
                withCloseButton: true,
                autoClose: false,
                title: "Error placing courses",
                message:
                    "Could not load existing semesters, please reload the page",
                color: "red",
                className: "mt-2 transition-transform",
            });
            return 0;
        }

        if (semesters.length === 0) {
            notifications.show({
                id: "no-semesters",
                withCloseButton: false,
                autoClose: false,
                title: "No semesters found!",
                message: "Add a semester from the navigation bar above",
                className: "mt-2 transition-transform",
            });
        } else {
            notifications.hide("no-semesters");
        }

        // the items received are not actually dates
        semesters.forEach((semester) => {
            const dateObject = new Date();
            const yearString = (
                semester.semesterYear as unknown as string
            ).substring(0, 5);
            dateObject.setFullYear(parseInt(yearString));
            semester.semesterYear = dateObject;
        });

        let courseSemesters: {
            semesterId: number;
            course: CourseInformation;
        }[];
        try {
            const courseSemestersResponse = await fetch(
                "/api/course/semesters"
            );
            if (!courseSemestersResponse.ok) {
                throw new Error(
                    `${courseSemestersResponse.status} ${courseSemestersResponse.statusText}`
                );
            }
            courseSemesters = await courseSemestersResponse.json();
        } catch {
            notifications.show({
                withCloseButton: true,
                autoClose: false,
                title: "Error placing courses",
                message:
                    "Could not load courseSemesters, please reload the page",
                color: "red",
                className: "mt-2 transition-transform",
            });
            return 0;
        }

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

        const { x } = getViewport();
        const nodes = placeNodes(semesterGroupDict, setPlacements, x);
        setNodes(nodes);
        return nodes.length;
    }, [setNodes, setPlacements, getViewport]);

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

// a helper function that checks for requisiteWarnings
function checkRequisites(
    nodes: Node[],
    getIntersectingNodes: (
        node: Node | Rect | { id: Node["id"] },
        partially?: boolean,
        nodes?: Node[] | undefined
    ) => Node[],
    courseNames: { [courseId: number]: string },
    relatedSemesterId?: number,
    droppedNode?: Node,
    deletedCourseCode?: string
) {
    // re-check all prerequisite information by doing the following:
    // iterate through everything, and clear course prerequisite errors
    // sort semesters by term and year
    // keep track of all seen courses
    // if the current semester is the same as the droppednode's related semester be sure to add it
    const semesters: Node[] = [];
    const seenCourses: Set<string> = new Set();

    nodes.forEach((node) => {
        if (node.type === "semesterNode") {
            // semesters are pre-sorted because of how they are added!
            semesters.push(node);
        }
    });

    semesters.forEach((semester) => {
        const newSeenCourses: Set<string> = new Set();
        let touchingNodes = getIntersectingNodes(semester);
        if (droppedNode) {
            touchingNodes = touchingNodes.filter(
                (node: Node) => node.id !== droppedNode.id
            );
            if (semester.data.semesterId === relatedSemesterId) {
                touchingNodes.push(droppedNode);
            }
        }

        touchingNodes.forEach((node: Node) => {
            if (node.type !== "courseNode") {
                return;
            }

            const courseData = node.data as unknown as CourseInformation;
            // skip deleted course
            if (courseData.courseCode === deletedCourseCode) {
                return;
            }
            const prerequisites = courseData.prerequisites;
            newSeenCourses.add(courseData.courseCode);

            // first reset warning
            courseData.requisiteWarning = false;

            if (prerequisites === "") {
                return;
            }

            // this gets all items in {brackets} and extracts the text
            // we see if the extracted text (a course code) has already been seen
            // if it is, we set it to true
            const prerequisite_eval = prerequisites.replace(
                /{([\w\s]+)}/g,
                (_, prerequisite) => {
                    return seenCourses.has(prerequisite).toString();
                }
            );
            const passedPrerequisiteCheck = eval(prerequisite_eval);
            courseData.requisiteWarning = !passedPrerequisiteCheck;

            if (
                droppedNode &&
                node.id === droppedNode.id &&
                !passedPrerequisiteCheck
            ) {
                notifications.show({
                    withCloseButton: true,
                    title: "Prerequisites not met",
                    message: `Prerequisites not met for dropped course ${droppedNode.data.courseCode}`,
                    color: "red",
                    className: "mt-2 transition-transform",
                });
            }
        });

        // only add courses after the semester is done
        newSeenCourses.forEach((value) => seenCourses.add(value));
    });

    // check for antirequisite warnings by using the seen courses set and checking whether
    // any antirequisites were seen
    nodes.forEach((node) => {
        if (node.id.startsWith("course-")) {
            const courseNode = node as unknown as CardWrapper;

            courseNode.data.antirequisites.forEach((antirequisite) => {
                const courseCode = courseNames[antirequisite];
                if (seenCourses.has(courseCode)) {
                    courseNode.data.requisiteWarning = true;
                }
            });
        }
    });
}

async function sendDeleteFetch(courseId: number) {
    const params = new URLSearchParams("");
    params.append("courseId", courseId.toString());
    fetch("/api/course/semesters?" + params, {
        method: "DELETE",
    })
        .then((res) => {
            if (!res.ok) {
                throw new Error(`${res.status} ${res.statusText}`);
            }
        })
        .catch(() => {
            notifications.show({
                withCloseButton: true,
                autoClose: false,
                title: "Error deleting course",
                message:
                    "API call to delete course from semester failed, please reload the page",
                color: "red",
                className: "mt-2 transition-transform",
            });
        });
}

// arranges dropped nodes depending on where it's placed
// if it overlaps with the destroy area it is deleted
// finds the interval in semesterposition and then the related y position
// updates the end of the card in semesterposition
export const useGroupCards = (courseNames: { [courseId: number]: string }) => {
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
        (notIsInsert: React.MouseEvent | null, droppedNode: Node) => {
            const nodes = getNodes();
            const intersectingNodes = getIntersectingNodes(droppedNode);

            // see if it's intersecting with deletearea
            // if it is, delete it
            for (let i = 0; i < intersectingNodes.length; i++) {
                const node = intersectingNodes[i];
                if (node.id === "deleteArea") {
                    const newNodes = removeNode(droppedNode.id, nodes);
                    setNodes(newNodes);
                    const deleteArea = getNode("deleteArea")!;
                    updateNode("deleteArea", {
                        position: {
                            x: deleteArea.position.x,
                            y: DELETEAREA_DEFAULT_POSITION,
                        },
                    });

                    checkRequisites(
                        nodes,
                        getIntersectingNodes,
                        courseNames,
                        undefined,
                        undefined,
                        droppedNode.data.courseCode as string
                    );

                    sendDeleteFetch(droppedNode.data.courseId as number);
                    return;
                }
            }

            const { x, y } = droppedNode.position;
            const foundInterval = findInterval(placements, x);

            // node was not found in any interval
            if (!foundInterval) {
                const newNodes = removeNode(droppedNode.id, nodes);
                setNodes(newNodes);
                const deleteArea = getNode("deleteArea")!;
                updateNode("deleteArea", {
                    position: {
                        x: deleteArea.position.x,
                        y: DELETEAREA_DEFAULT_POSITION,
                    },
                });

                checkRequisites(
                    nodes,
                    getIntersectingNodes,
                    courseNames,
                    undefined,
                    undefined,
                    droppedNode.data.courseCode as string
                );

                sendDeleteFetch(droppedNode.data.courseId as number);
                return;
            }

            const { interval: relatedSemester, index: relatedSemesterIndex } =
                foundInterval;

            if (y > relatedSemester.bottom) {
                // node was placed too low, we will fix it
                droppedNode.position.y = relatedSemester.bottom - 1;
            }

            // ensure that the found semester corresponds with the dropped course's chips
            const droppedNodeData =
                droppedNode.data as unknown as CourseInformation;
            const courseChips = droppedNodeData.chips;
            if (
                !courseChips.includes(
                    termToChipVariant[relatedSemester.semesterTerm]
                )
            ) {
                droppedNodeData.termWarning = true;
            }

            checkRequisites(
                nodes,
                getIntersectingNodes,
                courseNames,
                relatedSemester.semesterId,
                droppedNode
            );

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
            const courseNodeIds: { courseId: number; yPosition: number }[] = [];
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

            nodesInInterval.forEach((node) => {
                if (!node.id.startsWith("course-")) {
                    return;
                }
                courseNodeIds.push({
                    courseId: node.data.courseId as number,
                    yPosition: node.position.y,
                });
            });
            // don't forget the newly dropped card if it's an insert
            // it's an insert if the first element is null
            if (!notIsInsert) {
                courseNodeIds.push({
                    courseId: droppedNode.data.courseId as number,
                    yPosition: droppedNode.position.y,
                });
            }

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

            const sortedCourseNodeIds = courseNodeIds.sort((a, b) => {
                return a.yPosition - b.yPosition;
            });
            const courseIds = sortedCourseNodeIds.map(({ courseId }) => {
                return courseId;
            });

            fetch("/api/course/semesters", {
                method: "PUT",
                body: JSON.stringify({
                    courseIds: courseIds,
                    semesterId: relatedSemester.semesterId,
                    courseIdToDelete: droppedNode.data.courseId as number,
                }),
            })
                .then((res) => {
                    if (!res.ok) {
                        throw new Error(`${res.status} ${res.statusText}`);
                    }
                })
                .catch(() => {
                    notifications.show({
                        withCloseButton: true,
                        autoClose: false,
                        title: "Error placing card",
                        message:
                            "API call to add course to semester failed, please reload the page",
                        color: "red",
                        className: "mt-2 transition-transform",
                    });
                });

            setNodes(newNodes);
            setPlacements(placements);
        },
        [
            courseNames,
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
            async function asyncWrapper() {
                const deleteArea = getNode("deleteArea") as Node; // will always be defined
                updateNode("deleteArea", {
                    position: {
                        x: deleteArea.position.x,
                        y: DELETEAREA_ACTIVE_POSITION,
                    },
                });

                const { x, y } = draggedNode.position!;
                const {
                    interval: relatedSemester,
                    index: relatedSemesterIndex,
                } = findInterval(placements, x) as {
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
                placements[relatedSemesterIndex].bottom -=
                    semesterBottomAdjustment;
                setPlacements(placements);

                // reset warnings on the node
                draggedNode.data.requisiteWarning = false;
                draggedNode.data.termWarning = false;

                updateNode(draggedNode.id!, {
                    style: {
                        zIndex: 100,
                    },
                });
            }
            asyncWrapper();
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
                    x: x,
                    y: SEARCHAREA_POSITION_Y,
                },
            });
        },
        [updateNode]
    );

    return { onViewportMove };
};
