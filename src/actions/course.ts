"use server";

import { ChipVariant } from "@/types/chipVariant";
import { CourseInformation } from "@/types/courseCard";

export async function getPrerequsuites(
    institutionId: number // eslint-disable-line
): Promise<{ [key: string]: string }> {
    // gets all prerequisites available for this institution
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
        "BLG 143": {
            courseId: 1,
            courseCode: "BLG 143",
            courseName: "Biology I",
            faculty: "Biology",
            chips: [ChipVariant.FALL, ChipVariant.REQUIRED],
            prerequisites: "",
            postrequisites: [],
            antirequisites: [],
        },
    };
}

export async function searchCourses(
    institutionId: number,
    programName: string,
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
            courseId: 1,
            courseCode: "CPS 616",
            courseName: "Algorithms",
            faculty: "Computer Science",
            chips: [ChipVariant.SPRING],
            prerequisites: "",
            postrequisites: [],
            antirequisites: [],
        },
    ];
}

export async function getCourseSemesters(
    userId: number // eslint-disable-line
): Promise<{ semesterId: number; course: CourseInformation }[]> {
    // put course with courseId into semester with semesterId
    return [
        {
            semesterId: 1,
            course: {
                courseId: 1,
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
    ];
}

export async function updateCourseSemester(
    semesterId: number, // eslint-disable-line
    courseId: number // eslint-disable-line
): Promise<void> {
    // put course with courseId into semester with semesterId
}

export async function deleteCourseSemester(
    semesterId: number, // eslint-disable-line
    courseId: number // eslint-disable-line
): Promise<void> {
    // put course with courseId into semester with semesterId
}
