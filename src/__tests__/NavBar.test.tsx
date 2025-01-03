import { screen } from "@testing-library/react";
import { renderWithMantineProvider } from "@/../test_utils";

import UserMenu from "@/components/header/UserMenu";

describe("NavBar Component", () => {
    it("should display the user's name", () => {
        renderWithMantineProvider(
            <UserMenu displayName="Allan" userPhoto={null} />
        );
        expect(screen.getByText("Allan")).toBeInTheDocument();
    });
});
