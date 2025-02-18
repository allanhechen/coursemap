import type { Metadata } from "next";

import "@xyflow/react/dist/style.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@/app/(main)/globals.css";

import { ColorSchemeScript, createTheme, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

const theme = createTheme({
    primaryShade: { light: 6, dark: 4 },
    primaryColor: "blue",

    white: "#FFFFFF",
    black: "#22242E",
    defaultRadius: "10px",
});

export const metadata: Metadata = {
    metadataBase: new URL("https://coursemap.allan.wtf"),
    title: {
        template: "coursemap | %s",
        default: "coursemap",
    },
    description: "Plan your courses with ease",
    openGraph: {
        title: "coursemap",
        description: "Plan your courses with ease",
        url: "https://coursemap.allan.wtf",
        images: [
            {
                url: "https://coursemap.allan.wtf/logos/opengraph-image.png",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "coursemap",
        description: "Plan your courses with ease",
        images: [
            {
                url: "https://coursemap.allan.wtf/logos/opengraph-image.png",
            },
        ],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <ColorSchemeScript defaultColorScheme="dark" />
            </head>
            <body>
                <MantineProvider theme={theme} defaultColorScheme="dark">
                    <Notifications />
                    {children}
                </MantineProvider>
            </body>
        </html>
    );
}
