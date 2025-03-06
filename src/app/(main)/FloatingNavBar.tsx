"use client";

import { Button, Group, Paper } from "@mantine/core";

import CompactLogo from "@/components/header/CompactLogo";
import WideLogo from "@/components/header/WideLogo";
import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeSwitcher from "@/components/header/ThemeSwitcher";

export default function FloatingNavBar() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        function handleScroll() {
            if (window.scrollY > (1 / 2) * window.innerHeight) {
                setVisible(true);
            } else {
                setVisible(false);
            }
        }
        window.addEventListener("scroll", handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);
    return (
        <div
            className={`flex justify-center fixed w-full transition-transform duration-200 ease-out z-50 ${
                visible ? "translate-y-0" : "-translate-y-full"
            }`}
        >
            <Paper
                shadow="sm"
                className={`flex justify-between items-center py-3 px-6 mx-7 mt-5 w-full max-w-[75rem]`}
                radius="lg"
            >
                <div className="hidden md:block">
                    <WideLogo />
                </div>
                <div className="block md:hidden">
                    <CompactLogo />
                </div>
                <Group gap="xs" className="items-center">
                    <ThemeSwitcher />
                    <Link href="/signin">
                        <Button variant="light">Sign In </Button>
                    </Link>
                    <Link href="/signin">
                        <Button>Sign Up</Button>
                    </Link>
                </Group>
            </Paper>
        </div>
    );
}
