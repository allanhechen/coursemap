"use server";

import { ChipVariant } from "@/types/chipVariant";
import {
    CourseInformation,
    SemesterCourseInformation,
} from "@/types/courseCard";

export async function searchCourses(
    searchQuery: string,
    includeFall: boolean,
    includeWinter: boolean,
    includeSpring: boolean,
    includeSummer: boolean,
    includeRequired: boolean,
    includeElective: boolean
): Promise<CourseInformation[]> {
    // do server side processing to get course chips
    console.log(
        `Getting courses for ${searchQuery}, ${includeFall}, ${includeWinter}, ${includeSpring}, ${includeSummer}, ${includeRequired}, ${includeElective}`
    );
    return [
        {
            courseCode: "CPS 209",
            courseName: "Computer Science II",
            faculty: "Computer Science",
            chips: [ChipVariant.WINTER, ChipVariant.REQUIRED],
            prerequisites: "{CPS 109}",
            postrequisites: [],
            antirequisites: [],
        },
        {
            courseCode: "PHL 201",
            courseName: "Some philosophy course",
            faculty: "Philosophy",
            chips: [ChipVariant.SUMMER, ChipVariant.ELECTIVE],
            prerequisites: "",
            postrequisites: [],
            antirequisites: [],
        },
        {
            courseCode: "MTH 108",
            courseName: "Linear Algebra",
            faculty: "Mathematics",
            chips: [ChipVariant.SUMMER, ChipVariant.REQUIRED],
            prerequisites: "",
            postrequisites: [],
            antirequisites: [],
        },
        {
            courseCode: "COURSE 4",
            courseName: "Computer Science II",
            faculty: "Computer Science",
            chips: [ChipVariant.WINTER, ChipVariant.REQUIRED],
            prerequisites: "",
            postrequisites: [],
            antirequisites: [],
        },
        {
            courseCode: "Course 5",
            courseName: "Computer Science II",
            faculty: "Computer Science",
            chips: [ChipVariant.WINTER, ChipVariant.REQUIRED],
            prerequisites: "",
            postrequisites: [],
            antirequisites: [],
        },
        {
            courseCode: "Course 6",
            courseName: "Computer Science II",
            faculty: "Computer Science",
            chips: [ChipVariant.WINTER, ChipVariant.REQUIRED],
            prerequisites: "{CPS 209} && {CPS 109}",
            postrequisites: [],
            antirequisites: [],
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
                chips: [
                    ChipVariant.WINTER,
                    ChipVariant.FALL,
                    ChipVariant.SPRING,
                    ChipVariant.SUMMER,
                    ChipVariant.ELECTIVE,
                    ChipVariant.REQUIRED,
                ],
                prerequisites: "",
                postrequisites: [],
                antirequisites: [],
            },
        },
        {
            semesterId: 1,
            course: {
                courseCode: "CPS 109",
                courseName: "Computer Science I",
                faculty: "Computer Science",
                chips: [ChipVariant.FALL],
                prerequisites: "",
                postrequisites: [],
                antirequisites: [],
            },
        },
        {
            semesterId: 2,
            course: {
                courseCode: "CPS 616",
                courseName: "Algorithms",
                faculty: "Computer Science",
                chips: [ChipVariant.SPRING],
                prerequisites: "",
                postrequisites: [],
                antirequisites: [],
            },
        },
    ];
}
