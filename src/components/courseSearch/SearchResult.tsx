import { Stack } from "@mantine/core";

import { CourseCard } from "@/components/CourseCard";
import { CourseInformation } from "@/types/courseCard";

import "@/components/courseSearch/SearchResult.css";

export default function SearchResult({
    cards,
}: { cards: CourseInformation[] } & React.HTMLAttributes<HTMLDivElement>) {
    const renderedCards = cards.map((card) => {
        return (
            <CourseCard
                key={`search-course-${card.courseCode}`}
                courseCode={card.courseCode}
                courseName={card.courseName}
                faculty={card.faculty}
                chips={card.chips}
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
