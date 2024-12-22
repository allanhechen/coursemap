import { XYPosition } from "@xyflow/react";

export interface SemesterWrapper {
    data: SemesterInformation;
    isConnectable?: boolean;
    position?: XYPosition;
    id?: string;
    style?: object;
    type?: "semesterNode";
}

export enum SemesterTerm {
    SU = "SU",
    SP = "SP",
    FA = "FA",
    WI = "WI",
}

export interface SemesterInformation {
    semesterId: number;
    semesterName: string;
    semesterYear: Date;
    semesterTerm: SemesterTerm;
}

export interface SemesterPlacement {
    semesterId: number;
    x: number;
    y: number;
}

export type SemesterPositionContextType = [
    SemesterPlacement[], // Array of objects
    React.Dispatch<React.SetStateAction<SemesterPlacement[]>> // Setter function
];
