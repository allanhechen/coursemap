import { Stack } from "@mantine/core";
import { useCallback, useContext } from "react";

import { CourseCard } from "@/components/courseCard/CourseCard";
import { CourseInformation } from "@/types/courseCard";
import { DnDContext } from "@/components/dndContext";

import "@/components/courseSearch/SearchResult.css";

export default function SearchResult({
    cards,
}: { cards: CourseInformation[] } & React.HTMLAttributes<HTMLDivElement>) {
    const contextItem = useContext(DnDContext);

    if (!contextItem) {
        throw new Error(
            "SearchResult component must be used within a DnDContext"
        );
    }
    const [, setType] = contextItem;

    const onDragStart = useCallback(
        (
            event: React.DragEvent<HTMLDivElement>,
            nodeType: [string, CourseInformation]
        ) => {
            setType([nodeType[0], nodeType[1]]);
            event.dataTransfer!.effectAllowed = "move";
        },
        [setType]
    );

    const renderedCards = cards.map((card) => {
        return (
            <CourseCard
                draggable
                onDragStart={(event) =>
                    onDragStart(event, ["courseNode", card])
                }
                key={`search-course-${card.courseCode}`}
                courseCode={card.courseCode}
                courseName={card.courseName}
                faculty={card.faculty}
                chips={card.chips}
                prerequisites={card.prerequisites}
                postrequisites={card.postrequisites}
                antirequisites={card.antirequisites}
                courseId={card.courseId}
            />
        );
    });
    return (
        <Stack
            style={{ borderRadius: "16px" }}
            className="mt-4 flex-1 hidden-scrollbar"
        >
            {renderedCards}
        </Stack>
    );
}
