import Image from "next/image";
import Link from "next/link";

import darkCompactLogo from "@/../public/logos/coursemap-icon-no-bg-dark.svg";
import lightCompactLogo from "@/../public/logos/coursemap-icon-no-bg-dark.svg";

export default function CompactLogo() {
    return (
        <Link href="/dashboard" prefetch>
            <Image
                className="hidden dark:block"
                src={darkCompactLogo}
                alt="Compact Coursemap Logo Dark"
            />
            <Image
                className="dark:hidden"
                src={lightCompactLogo}
                alt="Compact Coursemap Logo Light"
            />
        </Link>
    );
}
