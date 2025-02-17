"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";

import { Avatar, Text, Group, Menu, rem } from "@mantine/core";
import {
    IconChevronDown,
    IconLogout,
    IconCarouselVertical,
    IconVectorBezier2,
    IconMenu,
    IconSettings,
} from "@tabler/icons-react";
import { useContext, useState } from "react";
import { SessionContext } from "@/components/sessionContext";

// why does menuItems render twice?
// it is undefined the second time, is it becaus react is automatically doing "use-scrict"?

export default function UserMenu() {
    const session = useContext(SessionContext)!;
    const { image, name } = session.user;
    const [menuOpened, setMenuOpened] = useState(false);

    return (
        <div className="cursor-pointer">
            <Menu
                shadow="sm"
                position="bottom-end"
                onClose={() => setMenuOpened(false)}
                onOpen={() => setMenuOpened(true)}
            >
                <Menu.Target>
                    <Group>
                        <Avatar src={image} alt={`${name}'s avatar'`} />
                        <Text className="hidden md:block" size="md">
                            {name}
                        </Text>
                        {menuOpened ? (
                            <IconChevronDown size="1rem" />
                        ) : (
                            <IconMenu size="1rem" />
                        )}
                    </Group>
                </Menu.Target>

                <Menu.Dropdown>
                    <Link href="/dashboard/overview">
                        <Menu.Item
                            leftSection={
                                <IconCarouselVertical
                                    style={{ width: rem(14), height: rem(14) }}
                                />
                            }
                        >
                            Overview
                        </Menu.Item>
                    </Link>
                    <Link href="/dashboard/courses">
                        <Menu.Item
                            leftSection={
                                <IconVectorBezier2
                                    style={{
                                        width: rem(14),
                                        height: rem(14),
                                    }}
                                />
                            }
                        >
                            Courses
                        </Menu.Item>
                    </Link>
                    <Menu.Divider />
                    <Link href="/settings">
                        <Menu.Item
                            leftSection={
                                <IconSettings
                                    style={{ width: rem(14), height: rem(14) }}
                                />
                            }
                        >
                            Settings
                        </Menu.Item>
                    </Link>
                    <Menu.Item
                        color="red"
                        leftSection={
                            <IconLogout
                                style={{ width: rem(14), height: rem(14) }}
                            />
                        }
                        onClick={() => {
                            signOut();
                        }}
                    >
                        {" "}
                        Sign Out
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </div>
    );
}
