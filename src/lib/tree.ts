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

// export function placeNodes(nodes, edges, wrappers) {}

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
