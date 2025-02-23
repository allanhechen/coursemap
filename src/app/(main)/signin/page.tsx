import { signIn, auth, providerMap } from "@/lib/auth";
import { Button, Paper, Title } from "@mantine/core";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import {
    IconBrandGoogleFilled,
    IconBrandDiscordFilled,
    IconBrandGithubFilled,
} from "@tabler/icons-react";
import Image from "next/image";
import darkCompactLogo from "@/../public/logos/coursemap-icon-no-bg-dark.svg";
import lightCompactLogo from "@/../public/logos/coursemap-icon-no-bg-dark.svg";

const providerImages: { [providerName: string]: ReactNode } = {
    GitHub: <IconBrandGithubFilled />,
    Google: <IconBrandGoogleFilled />,
    Discord: <IconBrandDiscordFilled />,
};

const providerColors: { [providerName: string]: string } = {
    GitHub: "#000",
    Google: "#4285F4",
    Discord: "#5865F2",
};

export default async function Page() {
    const session = await auth();
    if (session) {
        redirect("/dashboard/overview");
    }

    let counter = 0;

    return (
        <>
            <Paper
                shadow="sm"
                w={500}
                className="flex justify-between p-5"
                radius="lg"
            >
                <div className="flex-col justify-between items-center self-center ml-2">
                    <Image
                        width={75}
                        className="pointer-events-none -ml-2 -mt-1 hidden dark:block"
                        src={darkCompactLogo}
                        alt="Compact Coursemap Logo Dark"
                    />
                    <Image
                        width={75}
                        className="pointer-events-none -ml-2 -mt-1 dark:hidden"
                        src={lightCompactLogo}
                        alt="Compact Coursemap Logo Light"
                    />
                    <Title>Sign In</Title>
                </div>

                <div>
                    {Object.values(providerMap).map((provider) => {
                        counter += 1;
                        return (
                            <form
                                key={provider.id}
                                action={async () => {
                                    "use server";
                                    try {
                                        await signIn(provider.id, {
                                            redirectTo: "/dashboard/overview",
                                        });
                                    } catch (error) {
                                        if (error instanceof AuthError) {
                                            console.log(error);
                                        }
                                        throw error;
                                    }
                                }}
                            >
                                <Button
                                    className={counter == 1 ? "" : "mt-4"}
                                    style={{
                                        backgroundColor:
                                            providerColors[provider.name],
                                    }}
                                    leftSection={providerImages[provider.name]}
                                    h={50}
                                    w={275}
                                    type="submit"
                                    variant="filled"
                                    radius="md"
                                >
                                    Sign in with {provider.name}
                                </Button>
                            </form>
                        );
                    })}
                </div>
            </Paper>
        </>
    );
}
