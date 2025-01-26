"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import OverviewDemo from "@/app/(main)/help/OverviewDemo";
import CourseDemo from "@/app/(main)/help/CourseDemo";
import SemesterDemo from "@/app/(main)/help/SemesterDemo";
import SearchDemo from "@/app/(main)/help/SearchDemo";
import SelectPage from "@/app/(main)/help/SelectPage";
import { Pagination } from "@mantine/core";

import "@/app/(main)/help/help.css";

export default function Page() {
    const { status } = useSession();
    const router = useRouter();
    const [activePage, setPage] = useState(1);

    if (status === "unauthenticated") {
        router.push("/signin");
    }

    return (
        <>
            <div className="fixed top-0 left-0 h-screen w-screen">
                <SemesterDemo
                    className="absolute h-screen w-screen top-0 demo-page"
                    style={{
                        left: `-${(activePage - 1) * 100}vw`,
                    }}
                />
                <SearchDemo
                    className="absolute h-screen w-screen top-0 demo-page"
                    style={{
                        left: `${(1 - (activePage - 1)) * 100}vw`,
                    }}
                />
                <OverviewDemo
                    className="absolute h-screen w-screen top-0 demo-page"
                    style={{
                        left: `${(2 - (activePage - 1)) * 100}vw`,
                    }}
                />
                <CourseDemo
                    className="absolute h-screen w-screen top-0 demo-page"
                    style={{
                        left: `${(3 - (activePage - 1)) * 100}vw`,
                    }}
                />

                <SelectPage
                    className="absolute h-screen w-screen top-0 demo-page"
                    style={{
                        left: `${(4 - (activePage - 1)) * 100}vw`,
                    }}
                />
            </div>
            <Pagination
                total={5}
                value={activePage}
                onChange={setPage}
                radius="md"
                size="lg"
                className="absolute bottom-5 left-1/2 -translate-x-1/2"
            />
        </>
    );
}
