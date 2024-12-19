// TODO: Add this component
import NavBar from "@/components/header/NavBar";

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <NavBar />
            {children}
        </>
    );
}
