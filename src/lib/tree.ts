import { NodeContext } from "@/app/(main)/dashboard/courses/nodeContext";
import {
    CourseToSemesterIdDict,
    DropdownCardWrapper,
    WrapperWrapper,
} from "@/types/courseCard";
import {
    SemesterDict,
    SemesterInformation,
    SemesterTerm,
} from "@/types/semester";
import { notifications } from "@mantine/notifications";
import { Edge, Node } from "@xyflow/react";
import { useCallback, useContext, useEffect, useRef } from "react";

export interface PrerequisiteNodeType {
    courseName: string;
    courseId: number;
    key: string;
}

export interface Wrapper {
    id: string;
    wrapperType: "AND" | "OR";
    innerNodeKeys: string[];
}

export function parsePrerequisite(
    prerequisites: { [key: string]: string },
    courseName: string,
    nodeOutput: PrerequisiteNodeType[],
    edgeOutput: Edge[],
    wrapperOutput: { [key: string]: Wrapper },
    courseIds: { [courseCode: string]: number },
    key = ""
) {
    if (key === "") {
        key = courseName;
        nodeOutput.push({
            courseName: courseName,
            key: key,
            courseId: courseIds[courseName],
        });
    }

    const coursePrerequisites = prerequisites[courseIds[courseName]];
    if (coursePrerequisites === "" || courseName === "") {
        return;
    }
    let input_cleaned = coursePrerequisites.replace(
        /{([\w\s]+)}/g,
        (_: string, prerequisite: string) => {
            return prerequisite.replaceAll(" ", "_");
        }
    );
    input_cleaned = input_cleaned.replace(/\s+/g, " ").trim();
    const tokens = input_cleaned.split(" ");

    let andRequirement = false;
    let orRequirement = false;
    let level = 0;

    tokens.forEach((token: string) => {
        if (level === 0 && token === "&&") {
            andRequirement = true;
        } else if (level === 0 && token === "||") {
            orRequirement = true;
        } else if (token === "(") {
            level += 1;
        } else if (token === ")") {
            level -= 1;
        }
    });

    if (andRequirement && orRequirement) {
        throw Error(
            "Malformed prerequisite, can't have both 'and' and 'or' requirements on the same level"
        );
    }

    handleRequirements(
        courseIds,
        prerequisites,
        tokens,
        nodeOutput,
        edgeOutput,
        wrapperOutput,
        courseName,
        key,
        orRequirement ? "OR" : "AND",
        null,
        null
    );
}

const CARD_HEIGHT = 256;
const CARD_WIDTH = 352;
const CARD_GAP = 75;
export function placeNodes(nodes: (DropdownCardWrapper | WrapperWrapper)[]) {
    const nodeChildren: {
        [nodeId: string]:
            | { highest: number; lowest: number; stale: boolean }
            | undefined;
    } = {};

    let lastSeenTokenCount = 0;
    let lastSeenY = 0;
    let highestSeenY = 0;

    nodes.forEach((node) => {
        const id = node.id!;
        const idTokens = id.split("-");
        const idTokenCount = idTokens.length;
        const parentId = idTokens.slice(0, -1).join("-");

        // if more tokens then we are child of the last node
        // we move right
        const x = -(
            (idTokenCount - 1) * CARD_WIDTH +
            (idTokenCount - 2) * CARD_GAP
        );

        if (idTokenCount > lastSeenTokenCount) {
            const y = lastSeenY;
            node.position = {
                x: x,
                y: y,
            };

            if (!nodeChildren[parentId]) {
                nodeChildren[parentId] = {
                    highest: y,
                    lowest: y,
                    stale: true,
                };
            }
            lastSeenTokenCount = idTokenCount;
            lastSeenY = y;

            // if same tokens then we are below the last node
            // we move down
        } else if (idTokenCount === lastSeenTokenCount) {
            const y = lastSeenY + CARD_GAP + CARD_HEIGHT;
            node.position = {
                x: x,
                y: y,
            };

            if (nodeChildren[parentId]) {
                nodeChildren[parentId] = {
                    highest: y,
                    lowest: nodeChildren[parentId]!.lowest,
                    stale: true,
                };
            } else {
                nodeChildren[parentId] = {
                    highest: y,
                    lowest: y,
                    stale: true,
                };
            }
            lastSeenTokenCount = idTokenCount;
            lastSeenY = y;
            highestSeenY = Math.max(highestSeenY, y);

            // we are moving right + we need to calculate the x position
            // we are moving below the lowest we've seen for sure
        } else {
            const y = highestSeenY + CARD_GAP + CARD_HEIGHT;
            node.position = {
                x: x,
                y: y,
            };

            if (nodeChildren[parentId]) {
                nodeChildren[parentId] = {
                    highest: y,
                    lowest: nodeChildren[parentId]!.lowest,
                    stale: true,
                };
            } else {
                nodeChildren[parentId] = {
                    highest: y,
                    lowest: y,
                    stale: true,
                };
            }
            lastSeenTokenCount = idTokenCount;
            lastSeenY = y;
            highestSeenY = y;
        }
    });

    nodes.sort((a, b) => b.id!.split("-").length - a.id!.split("-").length);
    nodes.forEach((node: DropdownCardWrapper | WrapperWrapper) => {
        const id = node.id!;
        const currentNodeChildren = nodeChildren[id];
        const idTokens = id.split("-");
        const parentId = idTokens.slice(0, -1).join("-");
        node.measured = {
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
        };

        const newY = currentNodeChildren
            ? (currentNodeChildren.highest + currentNodeChildren.lowest) / 2
            : node.position!.y;

        node.position!.y = newY;
        if (nodeChildren[parentId] && nodeChildren[parentId].stale) {
            nodeChildren[parentId] = {
                highest: newY,
                lowest: newY,
                stale: false,
            };
        } else {
            nodeChildren[parentId] = {
                highest: Math.max(nodeChildren[parentId]!.highest, newY),
                lowest: Math.min(nodeChildren[parentId]!.lowest, newY),
                stale: false,
            };
        }
    });
}

const WRAPPER_PADDING = 16;

export function placeWrappers(
    nodes: (DropdownCardWrapper | WrapperWrapper)[],
    wrapperObject: { [key: string]: Wrapper }
): void {
    const wrappers: Wrapper[] = [];
    for (const key in wrapperObject) {
        wrappers.push(wrapperObject[key]);
    }

    wrappers.sort((a: Wrapper, b: Wrapper) => {
        const aTokens = a.id.split("-");
        const bTokens = b.id.split("-");

        return aTokens[aTokens.length - 1].localeCompare(
            bTokens[bTokens.length - 1]
        );
    });
    wrappers.sort((a: Wrapper, b: Wrapper) => {
        const aTokens = a.id.split("-");
        const bTokens = b.id.split("-");

        return bTokens.length - aTokens.length;
    });

    for (let i = 0; i < wrappers.length; i++) {
        const wrapper = wrappers[i];

        const innerNodeKeys = wrapper.innerNodeKeys;

        if (innerNodeKeys.length === 1) {
            continue;
        }

        let upperBounds: number | undefined; // the bottom of the node, a larger number
        let lowerBounds: number | undefined;
        let leftBounds: number | undefined;
        let rightBounds: number | undefined;
        wrapper.innerNodeKeys.forEach((innerNodeKey: string) => {
            for (let j = 0; j < nodes.length; j++) {
                const node = nodes[j];
                const nodeTop = node.position!.y + node.measured!.height;
                const nodeBottom = node.position!.y;
                const nodeLeft = node.position!.x;
                const nodeRight = node.position!.x + node.measured!.width;

                if (node.id === innerNodeKey) {
                    upperBounds =
                        upperBounds !== undefined
                            ? Math.max(nodeTop, upperBounds)
                            : nodeTop;
                    lowerBounds =
                        lowerBounds !== undefined
                            ? Math.min(nodeBottom, lowerBounds)
                            : nodeBottom;
                    leftBounds =
                        leftBounds !== undefined
                            ? Math.min(nodeLeft, leftBounds)
                            : nodeLeft;
                    rightBounds =
                        rightBounds !== undefined
                            ? Math.max(nodeRight, rightBounds)
                            : nodeRight;
                    break;
                }
            }
        });

        const width = rightBounds! - leftBounds! + 2 * WRAPPER_PADDING;
        const height = upperBounds! - lowerBounds! + 4 * WRAPPER_PADDING;

        const wrapperNode: WrapperWrapper = {
            type:
                wrapper.wrapperType === "AND"
                    ? "andWrapperNode"
                    : "orWrapperNode",
            id: wrapper.id,
            position: {
                x: leftBounds! - WRAPPER_PADDING,
                y: lowerBounds! - 3 * WRAPPER_PADDING,
            },
            style: {
                width: width,
                height: height,
                zIndex: -i - 1,
            },
            measured: {
                width: width,
                height: height,
            },
            data: {
                prerequisiteMet: false,
            },
        };
        nodes.push(wrapperNode);
    }
}

export function getPostrequisitePlacements(
    originalNodes: Node[],
    postrequisiteNodes: DropdownCardWrapper[]
): { newEdges: Edge[]; newNodes: Node[] } {
    if (postrequisiteNodes.length > 5) {
        return placeManyPostrequisites(originalNodes, postrequisiteNodes);
    } else {
        return placeFewPostrequisites(originalNodes, postrequisiteNodes);
    }
}

function placeManyPostrequisites(
    originalNodes: Node[],
    postrequisiteNodes: DropdownCardWrapper[]
) {
    const newEdges: Edge[] = [];
    const newNodes: Node[] = [];
    const firstNode = originalNodes.find(
        (node) => node.id!.split("-").length === 1
    );

    if (!firstNode) {
        return {
            newEdges: newEdges,
            newNodes: newNodes,
        };
    }

    const firstNodeY = firstNode.position!.y;
    let x = firstNode!.position!.x + CARD_GAP + CARD_WIDTH;
    const topY = firstNodeY - 0.5 * CARD_WIDTH;
    const bottomY = firstNodeY + 0.5 * CARD_WIDTH;

    for (let i = 0; i < postrequisiteNodes.length; i++) {
        const node = postrequisiteNodes[i];
        const id = node.id!;
        node.position = {
            x: x,
            y: i % 2 === 0 ? topY : bottomY,
        };

        if (i % 2 === 1) {
            x += CARD_GAP + CARD_WIDTH;
        }

        newNodes.push(node as unknown as Node);
        newEdges.push({
            selectable: false,
            style: {
                strokeWidth: 3,
                opacity: 0.25,
            },
            source: firstNode.id,
            target: id,
            id: `[${id}]-[${firstNode.id}]`,
        });
    }

    return {
        newEdges: newEdges,
        newNodes: newNodes,
    };
}

function placeFewPostrequisites(
    originalNodes: Node[],
    postrequisiteNodes: DropdownCardWrapper[]
) {
    const newEdges: Edge[] = [];
    const newNodes: Node[] = [];
    const firstNode = originalNodes.find(
        (node) => node.id!.split("-").length === 1
    );

    if (!firstNode) {
        return {
            newEdges: newEdges,
            newNodes: newNodes,
        };
    }

    const firstNodeY = firstNode.position!.y;
    const x = firstNode!.position!.x + CARD_GAP + CARD_WIDTH;
    let initialY: number;

    if (postrequisiteNodes.length % 2 === 0) {
        initialY =
            firstNodeY -
            ((postrequisiteNodes.length - 1) / 2) * (CARD_GAP + CARD_HEIGHT);
    } else {
        initialY =
            firstNodeY -
            Math.floor(postrequisiteNodes.length / 2) *
                (CARD_GAP + CARD_HEIGHT);
    }

    let y = initialY;
    postrequisiteNodes.forEach((node) => {
        const id = node.id!;
        node.position = {
            x: x,
            y: y,
        };
        newNodes.push(node as unknown as Node);
        y += CARD_GAP + CARD_HEIGHT;
        newEdges.push({
            selectable: false,
            style: {
                strokeWidth: 3,
                opacity: 0.25,
                // animation: "fadein 0.5s",
                // WebkitAnimation: "fadein 0.5s", // Safari, Chrome
                // MozAnimation: "fadein 0.5s", // Firefox
                // OAnimation: "fadein 0.5s", // Opera
            },
            source: firstNode.id,
            target: id,
            id: `[${id}]-[${firstNode.id}]`,
        });
    });

    return {
        newEdges: newEdges,
        newNodes: newNodes,
    };
}

function handleRequirements(
    courseIds: { [courseCode: string]: number },
    prerequisites: { [key: string]: string },
    inputTokens: string[],
    nodeOutput: PrerequisiteNodeType[],
    edgeOutput: Edge[],
    wrapperOutput: { [key: string]: Wrapper },
    parentCourse: string,
    parentKey: string,
    requirementType: "AND" | "OR",
    currentWrapperKey: string | null,
    differentiator: number | null
): void {
    if (!currentWrapperKey) {
        currentWrapperKey = `${parentKey}-outerWrapper`;
    }

    for (let i = 0; i < inputTokens.length; i++) {
        const current = inputTokens[i];
        if (requirementType === "AND" && current === "||") {
            throw Error(
                "Malformed prerequisite, cannot have 'or' requirements in this level"
            );
        } else if (requirementType === "OR" && current === "&&") {
            throw Error(
                "Malformed prerequisite, cannot have 'and' requirements in this level"
            );
        } else if (current === "(") {
            const start = i + 1;
            let j = start;
            let level = 0;
            while (j < inputTokens.length) {
                if (inputTokens[j] == "(") {
                    level += 1;
                } else if (inputTokens[j] == ")") {
                    if (level === 0) {
                        break;
                    }
                    level -= 1;
                }
                j += 1;
            }
            if (j > inputTokens.length) {
                throw new Error(
                    "Malformed prerequisite, mismatched parenthesis"
                );
            }
            const innerWrapperKey = `${currentWrapperKey}-${i}InnerWrapper`;
            handleRequirements(
                courseIds,
                prerequisites,
                inputTokens.slice(start, j),
                nodeOutput,
                edgeOutput,
                wrapperOutput,
                parentCourse,
                parentKey,
                requirementType === "AND" ? "OR" : "AND",
                innerWrapperKey,
                i
            );

            if (wrapperOutput[currentWrapperKey]) {
                wrapperOutput[currentWrapperKey].innerNodeKeys.push(
                    innerWrapperKey
                );
            } else {
                wrapperOutput[currentWrapperKey] = {
                    id: currentWrapperKey,
                    wrapperType: requirementType,
                    innerNodeKeys: [innerWrapperKey],
                };
            }

            i = j;
        } else if (current === "&&" && requirementType === "AND") {
            // do nothing
        } else if (current === "||" && requirementType === "OR") {
            // do nothing
        } else {
            const currentTransformed = current.replace("_", " ");
            const newKey = differentiator
                ? parentKey + "-" + differentiator + currentTransformed + i
                : parentKey + "-" + currentTransformed + i;

            // first ensure that new course has prerequisites and can be added
            try {
                nodeOutput.push({
                    courseName: currentTransformed,
                    key: newKey,
                    courseId: courseIds[currentTransformed],
                });
                parsePrerequisite(
                    prerequisites,
                    currentTransformed,
                    nodeOutput,
                    edgeOutput,
                    wrapperOutput,
                    courseIds,
                    newKey
                );
                edgeOutput.push({
                    selectable: false,
                    style: { strokeWidth: 3 },
                    source: newKey,
                    target: parentKey,
                    id: `[${newKey}]-[${parentKey}]`,
                });

                if (
                    !(currentWrapperKey === `${parentKey}-outerWrapper`) ||
                    requirementType !== "AND"
                )
                    if (wrapperOutput[currentWrapperKey]) {
                        wrapperOutput[currentWrapperKey].innerNodeKeys.push(
                            newKey
                        );
                    } else {
                        wrapperOutput[currentWrapperKey] = {
                            id: currentWrapperKey,
                            wrapperType: requirementType,
                            innerNodeKeys: [newKey],
                        };
                    }
            } catch {
                // TODO: notify user that the last course could not be added
                const rejectedNode = nodeOutput.pop()!;
                notifications.show({
                    id: rejectedNode.courseName,
                    autoClose: false,
                    withCloseButton: true,
                    title: "Could not add course",
                    message: `Course ${rejectedNode.courseName} has malformed prerequisites`,
                    color: "red",
                    className: "mt-2 transition-transform",
                });
            }
        }
    }
}

export function useCheckPrerequisites() {
    const nodeContextItem = useContext(NodeContext);
    if (!nodeContextItem) {
        throw new Error("DashboardComponent must be used in a NodeContext");
    }
    const [nodes, setNodes] = nodeContextItem;
    const nodesRef = useRef(nodes);

    useEffect(() => {
        nodesRef.current = nodes;
    }, [nodes]);

    const checkPrerequisites = useCallback(
        (
            courseCodeToSemester: CourseToSemesterIdDict,
            allSemesters: SemesterDict
        ) => {
            let nodes = nodesRef.current;
            nodes = nodes.sort(sortNodePrerequisites);

            const seenCourses: { [courseCode: string]: Date } = {};

            nodes.forEach((node) => {
                node.data.prerequisiteMet = undefined;
            });

            nodes.forEach((node) => {
                if (
                    node.type !== "andWrapperNode" &&
                    node.type !== "orWrapperNode" &&
                    node.type !== "prerequisiteDropdownNode"
                ) {
                    const cardNode = node as unknown as DropdownCardWrapper;
                    const courseData = cardNode.data.courseInformation;
                    const prerequisites = courseData.prerequisites;

                    let relatedDate: Date;
                    const relatedSemesterId =
                        courseCodeToSemester[courseData.courseCode];
                    if (relatedSemesterId === undefined) {
                        relatedDate = new Date(2100, 0, 1);
                    } else {
                        const relatedSemester = allSemesters[relatedSemesterId];
                        relatedDate = generateRelatedDate(relatedSemester);
                    }

                    if (prerequisites.length === 0 && relatedSemesterId) {
                        cardNode.data.prerequisiteMet = true;
                        seenCourses[courseData.courseCode] = relatedDate;
                        return;
                    } else if (prerequisites.length === 0) {
                        cardNode.data.prerequisiteMet = "partially";
                        return;
                    }

                    const prerequisite_eval = prerequisites.replace(
                        /{([\w\s]+)}/g,
                        (_, prerequisite) => {
                            const prerequisiteCheck = courseTakenAlready(
                                prerequisite,
                                seenCourses,
                                relatedDate
                            );
                            return prerequisiteCheck.toString();
                        }
                    );
                    const prerequisiteMet = eval(prerequisite_eval);

                    if (prerequisiteMet && relatedSemesterId) {
                        seenCourses[courseData.courseCode] = relatedDate;
                        cardNode.data.prerequisiteMet = prerequisiteMet;
                    } else if (prerequisiteMet) {
                        cardNode.data.prerequisiteMet = "partially";
                    } else if (!prerequisiteMet && relatedSemesterId) {
                        cardNode.data.prerequisiteMet = false;
                    }
                }
            });
            const newNodes = nodes.map((node) => {
                return { ...node };
            });

            setNodes(newNodes);
        },
        [setNodes]
    );

    return { checkPrerequisites };
}

function sortNodePrerequisites(a: Node, b: Node): number {
    const aFirst = checkOneIsWrapper(a, b);
    if (aFirst) return aFirst;
    const bFirst = checkOneIsWrapper(b, a);
    if (bFirst) return -bFirst;

    return a.position.x - b.position.x;
}

function checkOneIsWrapper(a: Node, b: Node): number | undefined {
    if (a.type === "orWrapperNode" || a.type === "andWrapperNode") {
        if (b.type !== "orWrapperNode" && b.type !== "andWrapperNode") {
            return 1;
        }
        return b.id.split("-").length - a.id.split("-").length;
    }
}

function generateRelatedDate(semester: SemesterInformation) {
    let monthIndex: number;

    switch (semester.semesterTerm) {
        case SemesterTerm.WI:
            monthIndex = 1;
            break;
        case SemesterTerm.SP:
            monthIndex = 5;
            break;
        case SemesterTerm.SU:
            monthIndex = 7;
            break;
        case SemesterTerm.FA:
            monthIndex = 9;
            break;
    }
    return new Date(semester.semesterYear.getFullYear(), monthIndex);
}

function courseTakenAlready(
    courseToCheck: string,
    seenCourses: { [courseCode: string]: Date },
    deadlineDate: Date
): boolean {
    const originalCourseDate = seenCourses[courseToCheck];

    if (!originalCourseDate) {
        return false;
    }

    return originalCourseDate < deadlineDate;
}
