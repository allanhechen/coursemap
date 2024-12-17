import Link from "next/link";

export default function WideLogo() {
    return (
        <Link href="/dashboard">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src="/logos/coursemap-banner-dark.svg"
                alt="Wide Coursemap Logo"
            />
        </Link>
    );
}
