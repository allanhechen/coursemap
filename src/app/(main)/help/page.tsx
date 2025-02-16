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

    const elements = [
        <SemesterDemo
            key={0}
            className="demo-page"
            style={{
                transform: `translateX(-${(activePage - 1) * 100}vw)`,
            }}
        />,
        <SearchDemo
            key={1}
            className="demo-page"
            style={{
                transform: `translateX(${(1 - (activePage - 1)) * 100}vw)`,
            }}
        />,
        <OverviewDemo
            key={2}
            className="demo-page"
            style={{
                transform: `translateX(${(2 - (activePage - 1)) * 100}vw)`,
            }}
        />,
        <CourseDemo
            key={3}
            className="demo-page"
            style={{
                transform: `translateX(${(3 - (activePage - 1)) * 100}vw)`,
            }}
        />,
        <SelectPage
            key={4}
            className="demo-page"
            style={{
                transform: `translateX(${(4 - (activePage - 1)) * 100}vw)`,
            }}
        />,
    ];

    return (
        <div className="flex flex-col items-center justify-center">
            {elements[activePage - 1]}
            <Pagination
                total={5}
                value={activePage}
                onChange={setPage}
                radius="md"
                size="lg"
                className="mb-5"
            />
        </div>
    );
}
