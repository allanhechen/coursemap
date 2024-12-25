"use server";

import { SemesterCourseInformation } from "@/types/courseCard";

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
                chips: ["Winter"],
            },
        },
        {
            semesterId: 1,
            course: {
                courseCode: "CPS 109",
                courseName: "Computer Science I",
                faculty: "Computer Science",
                chips: ["Winter"],
            },
        },
        {
            semesterId: 2,
            course: {
                courseCode: "CPS 616",
                courseName: "Algorithms",
                faculty: "Computer Science",
                chips: ["Winter"],
            },
        },
    ];
}
