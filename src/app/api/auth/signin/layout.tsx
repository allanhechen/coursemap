import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Redirecting...",
};

export default function RootLayout({}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head></head>
            <body>Redirecting to login page...</body>
        </html>
    );
}
