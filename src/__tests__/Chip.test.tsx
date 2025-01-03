import { screen } from "@testing-library/react";
import Chip from "@/components/chip/Chip";
import ChipFilled from "@/components/chip/ChipFilled";
import { ChipVariant } from "@/types/chipVariant";
import { renderWithMantineProvider } from "@/../test_utils";

describe("Chip Component", () => {
    it("should render the correct variant", () => {
        const options = [
            ChipVariant.FALL,
            ChipVariant.WINTER,
            ChipVariant.SPRING,
            ChipVariant.SUMMER,
            ChipVariant.REQUIRED,
            ChipVariant.ELECTIVE,
            ChipVariant.WARNING,
        ];

        options.forEach((option) => {
            renderWithMantineProvider(<Chip variant={option} filled={true} />);
            expect(screen.getByText(option)).toBeInTheDocument();
        });
    });

    it("should not have cursor-pointer if it is not clickable", () => {
        renderWithMantineProvider(
            <ChipFilled variant={ChipVariant.FALL} clickable={false} />
        );
        const chip = screen.getByText(ChipVariant.FALL);
        expect(chip).not.toHaveClass("cursor-pointer");
    });

    it("should have cursor-pointer if it is clickable", () => {
        renderWithMantineProvider(
            <ChipFilled variant={ChipVariant.FALL} clickable={true} />
        );
        const chip = screen.getByText(ChipVariant.FALL);
        expect(chip).toHaveClass("cursor-pointer");
    });
});
