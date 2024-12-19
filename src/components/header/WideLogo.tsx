import Link from "next/link";

export default function WideLogo() {
    return (
        <Link href="/dashboard">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                className="hidden dark:block"
                src="/logos/coursemap-banner-dark.svg"
                alt="Wide Coursemap Logo Dark"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                className="dark:hidden"
                src="/logos/coursemap-banner-light.svg"
                alt="Wide Coursemap Logo Dark"
            />
        </Link>
    );
}
