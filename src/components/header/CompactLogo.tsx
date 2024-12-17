import Link from "next/link";

export default function CompactLogo() {
    return (
        <Link href="/dashboard">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src="/logos/coursemap-icon-no-bg-dark.svg"
                alt="Compact Coursemap Logo"
            />
        </Link>
    );
}
