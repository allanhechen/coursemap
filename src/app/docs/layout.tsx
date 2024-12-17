import source from "@/app/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/layout.config";
import WideLogo from "@/app/components/header/WideLogo";
import Link from "next/link";

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <DocsLayout
            tree={source.pageTree}
            {...baseOptions}
            sidebar={{
                banner: (
                    <Link href="/docs">
                        <WideLogo />
                    </Link>
                ),
            }}
        >
            {children}
        </DocsLayout>
    );
}
