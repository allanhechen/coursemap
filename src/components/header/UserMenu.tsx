"use client";

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

export default function UserMenu({
    menuItems,
    userName,
    userAvatarURL,
}: {
    menuItems: string[];
    userName: string;
    userAvatarURL: string;
}) {
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
                        <Avatar
                            src={userAvatarURL}
                            alt={`${userName}'s avatar'`}
                        />
                        <Text size="md">{userName}</Text>
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
                    {menuItems && <Menu.Divider />}
                    {menuItems && <Menu.Label>Flows</Menu.Label>}
                    {menuItems &&
                        menuItems.map((menuTitle) => {
                            return (
                                <Menu.Item
                                    key={menuTitle}
                                    leftSection={
                                        <IconVectorBezier2
                                            style={{
                                                width: rem(14),
                                                height: rem(14),
                                            }}
                                        />
                                    }
                                >
                                    {menuTitle}
                                </Menu.Item>
                            );
                        })}
                    <Menu.Divider />
                    <Menu.Item
                        leftSection={
                            <IconSettings
                                style={{ width: rem(14), height: rem(14) }}
                            />
                        }
                    >
                        Overview
                    </Menu.Item>
                    <Menu.Item
                        color="red"
                        leftSection={
                            <IconLogout
                                style={{ width: rem(14), height: rem(14) }}
                            />
                        }
                    >
                        {" "}
                        Sign Out
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </div>
    );
}
