import { Stack } from "@mantine/core";
import { ReactNode, useContext } from "react";

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

    function onDragStart(
        event: React.DragEvent<HTMLDivElement>,
        nodeType: [string, CourseInformation]
    ) {
        setType([nodeType[0], nodeType[1]]);
        event.dataTransfer!.effectAllowed = "move";
    }

    const renderedCards: ReactNode[] = [];
    for (let i = 0; i < cards.length && i < 30; i++) {
        const card = cards[i];
        renderedCards.push(
            <CourseCard
                draggable
                onDragStart={(event) =>
                    onDragStart(event, ["courseNode", card])
                }
                key={`search-course-${card.courseCode}`}
                courseCode={card.courseCode}
                courseName={card.courseName}
                courseDescription={card.courseDescription}
                externalLink={card.externalLink}
                faculty={card.faculty}
                institutionName={card.institutionName}
                chips={card.chips}
                prerequisites={card.prerequisites}
                postrequisites={card.postrequisites}
                antirequisites={card.antirequisites}
                courseId={card.courseId}
            />
        );
    }
    if (cards.length >= 30) {
        renderedCards.push(
            <CourseCard
                draggable
                key="additional-results"
                courseCode="Refine your search term"
                courseName="There are additional results hidden"
                courseDescription=""
                externalLink=""
                institutionName=""
                faculty="NA"
                chips={[]}
                prerequisites=""
                postrequisites={[]}
                antirequisites={[]}
                courseId={-1}
            />
        );
    } else if (cards.length == 0) {
        renderedCards.push(
            <CourseCard
                draggable
                key="no-results-found"
                courseCode="No results found"
                courseName="Please try another search query"
                courseDescription=""
                externalLink=""
                faculty="NA"
                institutionName=""
                chips={[]}
                prerequisites=""
                postrequisites={[]}
                antirequisites={[]}
                courseId={-1}
            />
        );
    }

    return (
        <Stack
            style={{ borderRadius: "16px" }}
            className="mt-4 hidden-scrollbar"
        >
            {renderedCards}
        </Stack>
    );
}
