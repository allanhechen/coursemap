"use server";

import { ChipVariant } from "@/types/chipVariant";
import {
    CourseInformation,
    SemesterCourseInformation,
} from "@/types/courseCard";

export async function getPrerequsuites(): Promise<{ [key: string]: string }> {
    console.log(
        "Returning all prerequisites (should probably check user's program"
    );
    return {
        "BLG 143": "",
        "CPS 109": "",
        "CPS 106": "",
        "CPS 118": "",
        "CPS 125": "",
        "CHY 102": "",
        "CPS 188": "",
        "ELE 202": "",
        "PCS 211": "",
        "MTH 131": "",
        "MTH 207": "",
        "MTH 140": "",
        "MTH 304": "{MTH 310} || {MTH 240} || {MTH 231}",
        "MTH 310": "{MTH 207}",
        "MTH 240": "{MTH 140}",
        "MTH 380": "{MTH 131} || {MTH 207}",
        "MTH 231": "{MTH 131}",
        "COE 428": "{COE 318}",
        "COE 528": "{COE 318}",
        "COE 318":
            "{CHY 102} && {CPS 188} && {ELE 202} && {MTH 240} && {PCS 211}",
        "CPS 209": "{CPS 109}",
        "CPS 305": "{CPS 209}",
        "CPS 393": "{CPS 209}",
        "CPS 521": "{CPS 209} && ( {MTH 380} || {MTH 304} )",
        "CPS 590": "{CPS 305} && {CPS 393}",
        "CPS 510": "{CPS 305} || ( {COE 428} && {COE 528} )",
        "CPS 501":
            "( {CPS 106} || {CPS 109} || {CPS 118} || {CPS 125} ) && {BLG 143}",
    };
}

export async function getCourseInformation(
    courses: string[]
): Promise<{ [key: string]: CourseInformation }> {
    console.log(`returning course information for ${courses}`);
    return {
        "CPS 109": {
            courseCode: "CPS 109",
            courseName: "Computer Science I",
            faculty: "Computer Science",
            chips: [ChipVariant.FALL, ChipVariant.REQUIRED],
            prerequisites: "",
            postrequisites: [],
            antirequisites: ["PHL 201"],
        },
        "CPS 209": {
            courseCode: "CPS 209",
            courseName: "Computer Science II",
            faculty: "Computer Science",
            chips: [ChipVariant.WINTER, ChipVariant.REQUIRED],
            prerequisites: "{CPS 109}",
            postrequisites: [],
            antirequisites: ["PHL 201"],
        },
        "PHL 201": {
            courseCode: "PHL 201",
            courseName: "Some philosophy course",
            faculty: "Philosophy",
            chips: [ChipVariant.SUMMER, ChipVariant.ELECTIVE],
            prerequisites: "",
            postrequisites: [],
            antirequisites: [],
        },
        "MTH 108": {
            courseCode: "MTH 108",
            courseName: "Linear Algebra",
            faculty: "Mathematics",
            chips: [ChipVariant.SUMMER, ChipVariant.REQUIRED],
            prerequisites: "",
            postrequisites: [],
            antirequisites: [],
        },
        "COURSE 4": {
            courseCode: "COURSE 4",
            courseName: "Computer Science II",
            faculty: "Computer Science",
            chips: [ChipVariant.WINTER, ChipVariant.REQUIRED],
            prerequisites: "",
            postrequisites: [],
            antirequisites: [],
        },
        "Course 5": {
            courseCode: "Course 5",
            courseName: "Computer Science II",
            faculty: "Computer Science",
            chips: [ChipVariant.WINTER, ChipVariant.REQUIRED],
            prerequisites: "",
            postrequisites: [],
            antirequisites: [],
        },
        "Course 6": {
            courseCode: "Course 6",
            courseName: "Computer Science II",
            faculty: "Computer Science",
            chips: [ChipVariant.WINTER, ChipVariant.REQUIRED],
            prerequisites: "{CPS 209} && {CPS 109}",
            postrequisites: [],
            antirequisites: [],
        },
    };
}

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
            antirequisites: ["PHL 201"],
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
                antirequisites: ["CPS 109"],
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
