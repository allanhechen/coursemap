import Link from "next/link";

export default function Home() {
    return (
        <h1 className="text-3xl font-bold">
            This will be the hero page, head to{" "}
            <Link href={"/dashboard"}>/dashboard</Link> for the dashboard
        </h1>
    );
}
