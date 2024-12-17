import { createPreset } from "fumadocs-ui/tailwind-plugin";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./content/**/*.{md,mdx}",
        "./node_modules/fumadocs-ui/dist/**/*.js",
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./node_modules/fumadocs-ui/dist/**/*.js",

        "./docs/**/*.mdx",
        "./mdx-components.tsx",
    ],
    presets: [
        createPreset({
            preset: "vitepress",
        }),
    ],
    darkMode: "class",
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
