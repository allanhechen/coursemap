import WideLogo from "@/components/header/WideLogo";
import { Button, Center, Title } from "@mantine/core";
import Link from "next/link";

export default function Splash() {
    return (
        <Center className="h-[75vh]">
            <div className="flex flex-col justify-center items-center">
                <WideLogo link={false} />
                <Title order={1} size={48} className="mt-5">
                    Simplify Finding Courses
                </Title>
                <div className="flex mt-5">
                    <Link href="/signin">
                        <Button variant="light">Sign In </Button>
                    </Link>
                    <Link href="/signin" className="ml-5">
                        <Button>Sign Up</Button>
                    </Link>
                </div>
            </div>
        </Center>
    );
}
