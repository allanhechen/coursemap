import { MantineProvider } from "@mantine/core";
import { render, RenderOptions } from "@testing-library/react";

export const renderWithMantineProvider = (
    ui: React.ReactElement,
    options?: RenderOptions
) => {
    return render(ui, {
        wrapper: ({ children }) => (
            <MantineProvider theme={{}}>{children}</MantineProvider>
        ),
        ...options,
    });
};
