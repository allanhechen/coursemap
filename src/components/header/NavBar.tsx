import CompactLogo from "./CompactLogo";
import ThemeSwitcher from "./ThemeSwitcher";
import UserMenu from "./UserMenu";
import WideLogo from "./WideLogo";
import { Group, Paper } from "@mantine/core";

function getData() {
    return ["Math", "Computer Science"];
}

function getUserName() {
    return "Allan";
}

function getUserAvatarURL() {
    return "/logos/coursemap-icon-bg-dark.svg";
}

export default function NavBar() {
    return (
        <Paper
            shadow="sm"
            className="flex justify-between items-center py-3 px-6 m-5 relative"
            radius="lg"
        >
            <div className="hidden sm:block">
                <WideLogo />
            </div>
            <div className="block sm:hidden">
                <CompactLogo />
            </div>
            <Group className="items-center">
                <ThemeSwitcher />
                <UserMenu
                    menuItems={getData()}
                    userName={getUserName()}
                    userAvatarURL={getUserAvatarURL()}
                />
            </Group>
        </Paper>
    );
}
