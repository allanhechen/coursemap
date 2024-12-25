"use client";

import NavBar from "@/components/header/NavBar";
import {
    SemesterFormProvider,
    useSemesterForm,
} from "@/components/semester/semesterFormContext";
import { SemesterTerm } from "@/types/semester";

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const form = useSemesterForm({
        mode: "uncontrolled",
        initialValues: {
            semesterId: 0,
            semesterName: "",
            semesterYear: new Date(2024, 0, 1),
            semesterTerm: SemesterTerm.SU,
        },
    });
    return (
        <>
            <SemesterFormProvider form={form}>
                <NavBar />
                {children}
            </SemesterFormProvider>
        </>
    );
}
