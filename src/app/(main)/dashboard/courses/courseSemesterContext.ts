import { createContext } from "react";

import { CourseCodeToSemester } from "@/types/courseCard";

export const CourseSemesterContext = createContext<CourseCodeToSemester | null>(
    null
);
