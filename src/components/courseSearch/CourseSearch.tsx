"use client";

import { useCallback, useEffect, useState } from "react";
import { Paper, TextInput } from "@mantine/core";
import useSWR from "swr";

import Chip from "@/components/chip/Chip";

import { ChipVariant } from "@/types/chipVariant";
import SearchResult from "@/components/courseSearch/SearchResult";
import { CourseInformation } from "@/types/courseCard";
import fetcher from "@/lib/fetcher";

export default function CourseSearch() {
    const [searchQuery, setSearchQuery] = useState("");
    const [courses, setCourses] = useState<CourseInformation[]>([]);

    const [includeFall, setIncludeFall] = useState(true);
    const [includeWinter, setIncludeWinter] = useState(true);
    const [includeSpring, setIncludeSpring] = useState(true);
    const [includeSummer, setIncludeSummer] = useState(true);
    const [includeRequired, setIncludeRequired] = useState(true);
    const [includeElective, setIncludeElective] = useState(true);

    const url = new URLSearchParams("");
    url.append("includeFall", includeFall.toString());
    url.append("includeWinter", includeWinter.toString());
    url.append("includeSpring", includeSpring.toString());
    url.append("includeSummer", includeSummer.toString());
    url.append("includeRequired", includeRequired.toString());
    url.append("includeElective", includeElective.toString());
    url.append("searchQuery", searchQuery);

    const courseSWR = useSWR<CourseInformation[], string>(
        "/api/course/search?" + url.toString(),
        fetcher
    );

    if (courseSWR.error) {
        console.log(courseSWR.error);
    }
    useEffect(() => {
        if (courseSWR.data) {
            setCourses(courseSWR.data); // Only update `courses` when data changes
        }
    }, [courseSWR.data]);

    const onChange = useCallback((event: React.FormEvent<HTMLInputElement>) => {
        setSearchQuery(event.currentTarget.value);
    }, []);

    const onClickFall = useCallback(() => {
        setIncludeFall(!includeFall);
    }, [includeFall]);
    const onClickWinter = useCallback(() => {
        setIncludeWinter(!includeWinter);
    }, [includeWinter]);
    const onClickSpring = useCallback(() => {
        setIncludeSpring(!includeSpring);
    }, [includeSpring]);
    const onClickSummer = useCallback(() => {
        setIncludeSummer(!includeSummer);
    }, [includeSummer]);
    const onClickRequired = useCallback(() => {
        setIncludeRequired(!includeRequired);
    }, [includeRequired]);
    const onClickElective = useCallback(() => {
        setIncludeElective(!includeElective);
    }, [includeElective]);

    return (
        <Paper
            className="p-5 w-96 flex flex-col items-center justify-center ml-5"
            h={
                typeof window !== "undefined"
                    ? window.innerWidth >= 768
                        ? window.innerHeight - 126
                        : window.innerHeight - 134
                    : "100%"
            }
            style={{
                width: "23rem",
            }}
            shadow="sm"
            radius="lg"
        >
            <TextInput
                placeholder="Search for courses"
                variant="filled"
                w="20rem"
                onChange={onChange}
            />
            <div className="flex flex-wrap justify-center">
                <div className="mt-4 mx-1">
                    <Chip
                        onClick={onClickFall}
                        variant={ChipVariant.FALL}
                        filled={includeFall}
                    />
                </div>
                <div className="mt-4 mx-1">
                    <Chip
                        onClick={onClickWinter}
                        variant={ChipVariant.WINTER}
                        filled={includeWinter}
                    />
                </div>
                <div className="mt-4 mx-1">
                    <Chip
                        onClick={onClickSpring}
                        variant={ChipVariant.SPRING}
                        filled={includeSpring}
                    />
                </div>
                <div className="mt-4 mx-1">
                    <Chip
                        onClick={onClickSummer}
                        variant={ChipVariant.SUMMER}
                        filled={includeSummer}
                    />
                </div>
                <div className="mt-2 mx-1">
                    <Chip
                        onClick={onClickRequired}
                        variant={ChipVariant.REQUIRED}
                        filled={includeRequired}
                    />
                </div>
                <div className="mt-2 mx-1">
                    <Chip
                        onClick={onClickElective}
                        variant={ChipVariant.ELECTIVE}
                        filled={includeElective}
                    />
                </div>
            </div>
            <SearchResult cards={courses} />
        </Paper>
    );
}
