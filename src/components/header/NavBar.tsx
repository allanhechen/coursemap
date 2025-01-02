import { Group, Paper } from "@mantine/core";

import CompactLogo from "@/components/header/CompactLogo";
import WideLogo from "@/components/header/WideLogo";
import SemesterForm from "@/components/semester/SemesterForm";
import ThemeSwitcher from "@/components/header/ThemeSwitcher";
import UserMenu from "@/components/header/UserMenu";

import { User } from "@/types/user";

export default function NavBar(props: User) {
    return (
        <Paper
            shadow="sm"
            className="flex justify-between items-center py-3 px-6 m-5 relative"
            radius="lg"
        >
            <div className="hidden md:block">
                <WideLogo />
            </div>
            <div className="block md:hidden">
                <CompactLogo />
            </div>
            <Group gap="xs" className="items-center">
                <SemesterForm />
                <ThemeSwitcher />
                <UserMenu {...props} />
            </Group>
        </Paper>
    );
}
