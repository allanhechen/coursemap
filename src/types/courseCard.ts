import { XYPosition } from "@xyflow/react";
import { ChipVariant } from "@/types/chipVariant";
import { SemesterInformation } from "@/types/semester";

export interface CardWrapper {
    type?: string;
    id?: string;
    data: CourseInformation;
    isConnectable?: boolean;
    position?: XYPosition;
}

export type CourseToSemesterIdDict = {
    [courseCode: string]: number | undefined;
};

export type CourseCodeToSemester = [
    CourseToSemesterIdDict,
    React.Dispatch<React.SetStateAction<CourseToSemesterIdDict>>
];

export interface DropdownCardWrapper {
    type?: string;
    id?: string;
    data: CourseDropdownInformation;
    isConnectable?: boolean;
    position?: XYPosition;
}

export interface CourseDropdownInformation {
    courseInformation: CourseInformation;
    semesters: {
        [semesterId: number]: SemesterInformation;
    };
    selectSemester: (
        courseCode: string,
        semesterId: number | undefined
    ) => void;
}

export interface CourseInformation {
    courseCode: string;
    courseName: string;
    faculty: string;
    chips: ChipVariant[];
    prerequisites: string;
    postrequisites: string[];
    antirequisites: string[];
    termWarning?: boolean;
    requisiteWarning?: boolean;
    fresh?: boolean;
}

export interface SemesterCourseInformation {
    semesterId: number;
    course: CourseInformation;
}
