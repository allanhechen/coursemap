import { XYPosition } from "@xyflow/react";

export type SemesterDict = {
    [semesterId: number]: SemesterInformation;
};

export type SemesterDictContextType = [
    SemesterDict,
    React.Dispatch<React.SetStateAction<SemesterDict>>
];

export interface SemesterWrapper {
    data: SemesterInformation;
    isConnectable?: boolean;
    position?: XYPosition;
    id?: string;
    style?: object;
    type?: "semesterNode";
}

export enum SemesterTerm {
    FA = "FA",
    WI = "WI",
    SP = "SP",
    SU = "SU",
}

export interface SemesterInformation {
    semesterId: number;
    semesterName: string;
    semesterYear: Date;
    semesterTerm: SemesterTerm;
}

export const termOrder: Record<SemesterTerm, number> = {
    [SemesterTerm.WI]: 1,
    [SemesterTerm.SP]: 2,
    [SemesterTerm.SU]: 3,
    [SemesterTerm.FA]: 4,
};

export interface SemesterPlacement {
    semesterId: number;
    semesterTerm: SemesterTerm;
    intervalStart: number;
    intervalEnd: number;
    top: number;
    bottom: number;
}

export type SemesterPositionContextType = [
    SemesterPlacement[],
    React.Dispatch<React.SetStateAction<SemesterPlacement[]>>
];
