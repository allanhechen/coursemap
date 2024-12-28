import { User } from "@/types/user";
import SemesterForm from "../semester/SemesterForm";
import CompactLogo from "./CompactLogo";
import ThemeSwitcher from "./ThemeSwitcher";
import UserMenu from "./UserMenu";
import WideLogo from "./WideLogo";
import { Group, Paper } from "@mantine/core";

export default function NavBar(props: User) {
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
                <SemesterForm />
                <ThemeSwitcher />
                <UserMenu {...props} />
            </Group>
        </Paper>
    );
}
