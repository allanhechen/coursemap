import { XYPosition } from "@xyflow/react";
import { ChipVariant } from "@/types/chipVariant";

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
    measured?: { width: number; height: number };
}

export interface WrapperWrapper {
    type?: string;
    id?: string;
    isConnectable?: boolean;
    position?: XYPosition;
    measured?: { width: number; height: number };
    style?: React.CSSProperties;
}

export interface CourseDropdownInformation {
    courseInformation: CourseInformation;
    selectSemester: (
        courseCode: string,
        semesterId: number | undefined
    ) => void;
}

export interface CourseInformation {
    courseId: number;
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
