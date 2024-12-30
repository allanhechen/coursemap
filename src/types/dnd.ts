import { CourseInformation } from "./courseCard";

export type DnDContextType = [
    [string, CourseInformation] | null,
    React.Dispatch<React.SetStateAction<[string, CourseInformation] | null>>
];
