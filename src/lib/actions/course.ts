"use server";

import { ChipVariant } from "@/types/chipVariant";
import {
    CourseInformation,
    SemesterCourseInformation,
} from "@/types/courseCard";

export async function searchCourses(): Promise<CourseInformation[]> {
// searchQuery: string,
// includeFall: boolean,
// includeWinter: boolean,
// includeSpring: boolean,
// includeSummer: boolean,
// includeRequired: boolean,
// includeElective: boolean
    // do server side processing to get course chips
    console.log("Getting courses that match the search query");
    return [
        {
            courseCode: "CPS 209",
            courseName: "Computer Science II",
            faculty: "Computer Science",
            chips: [ChipVariant.WINTER, ChipVariant.REQUIRED],
        },
        {
            courseCode: "PHL 201",
            courseName: "Some philosophy course",
            faculty: "Philosophy",
            chips: [ChipVariant.SUMMER, ChipVariant.ELECTIVE],
        },
        {
            courseCode: "MTH 108",
            courseName: "Linear Algebra",
            faculty: "Mathematics",
            chips: [ChipVariant.SUMMER, ChipVariant.REQUIRED],
        },
    ];
}

export async function getAllCourseSemesters(): Promise<
    SemesterCourseInformation[]
> {
    // validate semeseter name is string of correct length, semester year is a valid year, and semseter term is in the four codes
    // get user, program from auth system
    // ensure that semester does not exist with this combination
    // insert semester
    // return semester id
    console.log(`Getting all courses and their related semesters`);
    return [
        {
            semesterId: 1,
            course: {
                courseCode: "CPS 706",
                courseName: "Computer Networks",
                faculty: "Computer Science",
                chips: [ChipVariant.WINTER],
            },
        },
        {
            semesterId: 1,
            course: {
                courseCode: "CPS 109",
                courseName: "Computer Science I",
                faculty: "Computer Science",
                chips: [ChipVariant.FALL],
            },
        },
        {
            semesterId: 2,
            course: {
                courseCode: "CPS 616",
                courseName: "Algorithms",
                faculty: "Computer Science",
                chips: [ChipVariant.SPRING],
            },
        },
    ];
}
