import Link from "next/link";

export default function CompactLogo() {
    return (
        <Link href="/dashboard">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                className="hidden dark:block"
                src="/logos/coursemap-icon-no-bg-dark.svg"
                alt="Compact Coursemap Logo Dark"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                className="dark:hidden"
                src="/logos/coursemap-icon-no-bg-light.svg"
                alt="Compact Coursemap Logo Dark"
            />
        </Link>
    );
}
