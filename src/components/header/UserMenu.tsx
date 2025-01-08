"use client";

import { signOut } from "next-auth/react";
import { User } from "@/types/user";
import { Avatar, Text, Group, Menu, rem } from "@mantine/core";
import {
    IconChevronDown,
    IconLogout,
    IconCarouselVertical,
    IconVectorBezier2,
    IconMenu,
    IconSettings,
} from "@tabler/icons-react";
import { useState } from "react";

// why does menuItems render twice?
// it is undefined the second time, is it becaus react is automatically doing "use-scrict"?

export default function UserMenu(props: User) {
    const [menuOpened, setMenuOpened] = useState(false);
    const displayName = props.displayName;

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
                        <Avatar
                            src={props.userPhoto}
                            alt={`${displayName}'s avatar'`}
                        />
                        <Text size="md">{displayName}</Text>
                        {menuOpened ? (
                            <IconChevronDown size="1rem" />
                        ) : (
                            <IconMenu size="1rem" />
                        )}
                    </Group>
                </Menu.Target>

                <Menu.Dropdown>
                    <Menu.Item
                        leftSection={
                            <IconCarouselVertical
                                style={{ width: rem(14), height: rem(14) }}
                            />
                        }
                    >
                        Overview
                    </Menu.Item>
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
                    <Menu.Divider />
                    <Menu.Item
                        leftSection={
                            <IconSettings
                                style={{ width: rem(14), height: rem(14) }}
                            />
                        }
                    >
                        Settings
                    </Menu.Item>
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
