import source from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/layout.config";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { RootProvider } from "fumadocs-ui/provider";
import "@/app/(docs)/docs/globals.css";
import Image from "next/image";

import darkWideLogo from "@/../public/logos/coursemap-banner-dark.svg";
import lightWideLogo from "@/../public/logos/coursemap-banner-light.svg";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <head></head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100vh",
                }}
            >
                {" "}
                <RootProvider>
                    <DocsLayout
                        tree={source.pageTree}
                        {...baseOptions}
                        sidebar={{
                            banner: (
                                <Link href="/docs">
                                    <Image
                                        className="hidden dark:block"
                                        src={darkWideLogo}
                                        alt="Wide Coursemap Logo Dark"
                                    />
                                    <Image
                                        className="dark:hidden"
                                        src={lightWideLogo}
                                        alt="Wide Coursemap Logo Light"
                                    />
                                </Link>
                            ),
                        }}
                    >
                        {children}
                    </DocsLayout>
                </RootProvider>
            </body>
        </html>
    );
}
