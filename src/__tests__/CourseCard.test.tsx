import { screen } from "@testing-library/react";
import { renderWithMantineProvider } from "@/../test_utils";

import { CourseCard } from "@/components/CourseCard";
import { ChipVariant } from "@/types/chipVariant";

describe("CourseCard Component", () => {
    it("should render with the information passed in", () => {
        renderWithMantineProvider(
            <CourseCard
                courseCode="CPS 109"
                courseName="Computer Science I"
                faculty="Computer Science"
                chips={[ChipVariant.WINTER]}
            />
        );

        // cps109 is only the title element, we need to find the parent with the data faculty attribute
        const element = screen.getByText("CPS 109").closest("[data-faculty]");

        expect(element).toHaveTextContent("Computer Science I");
        expect(element).toHaveTextContent(ChipVariant.WINTER);
        expect(element).toHaveAttribute("data-faculty", "Computer Science");
    });
});
