import Image from "next/image";
import Link from "next/link";

import darkWideLogo from "@/../public/logos/coursemap-banner-dark.svg";
import lightWideLogo from "@/../public/logos/coursemap-banner-light.svg";

export default function WideLogo({ link = true }: { link?: boolean }) {
    if (!link) {
        return (
            <>
                <Image
                    className="hidden dark:block"
                    src={darkWideLogo}
                    alt="Wide Coursemap Logo Dark"
                />
                <Image
                    className="dark:hidden"
                    src={lightWideLogo}
                    alt="Wide Coursemap Logo Light"
                />

            </>
        )
    }
    else {
        return (
            <Link href="/dashboard" prefetch>
                <Image
                    className="hidden dark:block"
                    src={darkWideLogo}
                    alt="Wide Coursemap Logo Dark"
                />
                <Image
                    className="dark:hidden"
                    src={lightWideLogo}
                    alt="Wide Coursemap Logo Light"
                />
            </Link>
        )
    }
}
