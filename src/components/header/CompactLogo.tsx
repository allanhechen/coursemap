import Link from "next/link";

export default function CompactLogo() {
    return (
        <Link href="/dashboard">
            <img
                className="hidden dark:block"
                src="/logos/coursemap-icon-no-bg-dark.svg"
                alt="Compact Coursemap Logo Dark"
            />
            <img
                className="dark:hidden"
                src="/logos/coursemap-icon-no-bg-light.svg"
                alt="Compact Coursemap Logo Dark"
            />
        </Link>
    );
}
