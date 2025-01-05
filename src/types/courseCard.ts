import { XYPosition } from "@xyflow/react";
import { ChipVariant } from "@/types/chipVariant";

export interface CardWrapper {
    type?: string;
    id?: string;
    data: CourseInformation;
    isConnectable?: boolean;
    position?: XYPosition;
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
