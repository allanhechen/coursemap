export interface SemesterWrapper {
    data: SemesterInformation;
    isConnectable: boolean;
}

export enum SemesterTerm {
    SU = "SU",
    SP = "SP",
    FA = "FA",
    WI = "WI",
}

export interface SemesterInformation {
    semesterId: number | undefined;
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
