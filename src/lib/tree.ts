import { DropdownCardWrapper } from "@/types/courseCard";
import { Edge } from "@xyflow/react";

export interface PrerequisiteNodeType {
    courseName: string;
    key: string;
}

export interface Wrapper {
    wrapperType: "AND" | "OR";
    innerNodeKeys: string[];
}

export function parsePrerequisite(
    prerequisites: { [key: string]: string },
    courseName: string,
    nodeOutput: PrerequisiteNodeType[],
    edgeOutput: Edge[],
    wrapperOutput: { [key: string]: Wrapper },
    key = ""
) {
    if (key === "") {
        key = courseName;
        nodeOutput.push({
            courseName: courseName,
            key: key,
        });
    }

    const coursePrerequisites = prerequisites[courseName];
    if (coursePrerequisites === "") {
        return;
    }

    const input_cleaned = coursePrerequisites.replace(
        /{([\w\s]+)}/g,
        (_: string, prerequisite: string) => {
            return prerequisite.replaceAll(" ", "_");
        }
    );

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

    if (orRequirement) {
        handleORRequirement(
            prerequisites,
            tokens,
            courseName,
            nodeOutput,
            edgeOutput,
            wrapperOutput,
            key
        );
    } else {
        handleANDRequirement(
            prerequisites,
            tokens,
            courseName,
            nodeOutput,
            edgeOutput,
            wrapperOutput,
            key
        );
    }
}

const CARD_HEIGHT = 256;
const CARD_WIDTH = 352;
const CARD_GAP = 50;

export function placeNodes(
    nodes: DropdownCardWrapper[],
    wrappers: { [key: string]: Wrapper }
) {
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
        if (idTokenCount > lastSeenTokenCount) {
            const x =
                (idTokenCount - 1) * CARD_WIDTH + (idTokenCount - 2) * CARD_GAP;
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
            const x =
                (idTokenCount - 1) * CARD_WIDTH + (idTokenCount - 2) * CARD_GAP;
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
            const x =
                (idTokenCount - 1) * CARD_WIDTH + (idTokenCount - 2) * CARD_GAP;
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
    nodes.forEach((node) => {
        const id = node.id!;
        const currentNodeChildren = nodeChildren[id];
        const idTokens = id.split("-");
        const parentId = idTokens.slice(0, -1).join("-");

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

    console.log(wrappers);
}

function handleANDRequirement(
    prerequisites: { [key: string]: string },
    inputTokens: string[],
    parentCourse: string,
    nodeOutput: PrerequisiteNodeType[],
    edgeOutput: Edge[],
    wrapperOutput: { [key: string]: Wrapper },
    key: string,
    outerNodeKey?: string
): void {
    for (let i = 0; i < inputTokens.length; i++) {
        const current = inputTokens[i];
        if (current === "||") {
            throw Error(
                "Malformed prerequisite, cannot have 'or' requirements in this level"
            );
        } else if (current === "(") {
            let j = i + 1;
            while (inputTokens[j] !== ")") {
                j += 1;
            }

            handleORRequirement(
                prerequisites,
                inputTokens.slice(i + 1, j),
                parentCourse,
                nodeOutput,
                edgeOutput,
                wrapperOutput,
                key
            );

            i = j;
        } else if (current === "&&") {
            // do nothing
        } else {
            const currentTransformed = current.replace("_", " ");
            const newKey = key + "-" + currentTransformed;
            nodeOutput.push({
                courseName: currentTransformed,
                key: newKey,
            });
            edgeOutput.push({
                selectable: false,
                style: { strokeWidth: 3 },
                source: newKey,
                target: key,
                id: `[${newKey}]-[${key}]`,
            });

            if (outerNodeKey) {
                if (wrapperOutput[outerNodeKey]) {
                    wrapperOutput[outerNodeKey].innerNodeKeys.push(newKey);
                } else {
                    wrapperOutput[outerNodeKey] = {
                        wrapperType: "AND",
                        innerNodeKeys: [newKey],
                    };
                }
            }

            parsePrerequisite(
                prerequisites,
                currentTransformed,
                nodeOutput,
                edgeOutput,
                wrapperOutput,
                newKey
            );
        }
    }
}

function handleORRequirement(
    prerequisites: { [key: string]: string },
    inputTokens: string[],
    parentCourse: string,
    nodeOutput: PrerequisiteNodeType[],
    edgeOutput: Edge[],
    wrapperOutput: { [key: string]: Wrapper },
    key: string
): void {
    for (let i = 0; i < inputTokens.length; i++) {
        const current = inputTokens[i];
        if (current === "&&") {
            throw Error(
                "Malformed prerequisite, cannot have 'or' requirements in this level"
            );
        } else if (current === "(") {
            let j = i + 1;
            while (inputTokens[j] !== ")") {
                j += 1;
            }

            handleANDRequirement(
                prerequisites,
                inputTokens.slice(i + 1, j),
                parentCourse,
                nodeOutput,
                edgeOutput,
                wrapperOutput,
                key,
                key + "-innerWrapper"
            );

            const outerNodeKey = key + "-outerWrapper";
            const innerNodeKey = key + "-innerWrapper";
            if (wrapperOutput[outerNodeKey]) {
                wrapperOutput[outerNodeKey].innerNodeKeys.push(innerNodeKey);
            } else {
                wrapperOutput[outerNodeKey] = {
                    wrapperType: "OR",
                    innerNodeKeys: [innerNodeKey],
                };
            }

            i = j;
        } else if (current === "||") {
            // do nothing
        } else {
            const currentTransformed = current.replace("_", " ");
            const newKey = key + "-" + currentTransformed;
            const outerNodeKey = key + "-outerWrapper";

            nodeOutput.push({
                courseName: currentTransformed,
                key: newKey,
            });
            edgeOutput.push({
                style: { strokeWidth: 3 },
                selectable: false,
                source: newKey,
                target: key,
                id: `[${newKey}]-[${key}]`,
            });

            if (wrapperOutput[outerNodeKey]) {
                wrapperOutput[outerNodeKey].innerNodeKeys.push(newKey);
            } else {
                wrapperOutput[outerNodeKey] = {
                    wrapperType: "OR",
                    innerNodeKeys: [newKey],
                };
            }

            parsePrerequisite(
                prerequisites,
                currentTransformed,
                nodeOutput,
                edgeOutput,
                wrapperOutput,
                newKey
            );
        }
    }
}
