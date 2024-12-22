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
    intervalStart: number;
    intervalEnd: number;
    top: number;
    bottom: number;
}

export type SemesterPositionContextType = [
    SemesterPlacement[],
    React.Dispatch<React.SetStateAction<SemesterPlacement[]>>
];
