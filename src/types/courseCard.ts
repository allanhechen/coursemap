import { XYPosition } from "@xyflow/react";

export interface CardWrapper {
    data: CourseInformation;
    isConnectable?: boolean;
    position?: XYPosition;
}

export interface CourseInformation {
    courseCode: string;
    courseName: string;
    faculty: string;
    chips: string[];
}

export interface SemesterCourseInformation {
    semesterId: number;
    course: CourseInformation;
}
