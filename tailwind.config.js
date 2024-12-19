import { createPreset } from "fumadocs-ui/tailwind-plugin";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/app/**/*.{ts,tsx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",

        "./node_modules/fumadocs-ui/dist/**/*.js",
        "./docs/**/*.mdx",
        "./mdx-components.tsx",
    ],
    presets: [
        createPreset({
            preset: "vitepress",
        }),
    ],
    darkMode: ["class", '[data-mantine-color-scheme="dark"]'],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
        },
    },
    plugins: [],
};
