"use server";

import { SessionProvider } from "next-auth/react";

export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <SessionProvider>{children}</SessionProvider>;
}
