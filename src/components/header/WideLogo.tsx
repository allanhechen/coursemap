import Link from "next/link";

export default function WideLogo() {
    return (
        <Link href="/dashboard" prefetch>
            <img
                className="hidden dark:block"
                src="/logos/coursemap-banner-dark.svg"
                alt="Wide Coursemap Logo Dark"
            />
            <img
                className="dark:hidden"
                src="/logos/coursemap-banner-light.svg"
                alt="Wide Coursemap Logo Dark"
            />
        </Link>
    );
}
