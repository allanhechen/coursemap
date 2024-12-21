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
    programName: string;
    semesterId: number | null;
    semesterName: string;
    semesterYear: Date;
    semesterTerm: SemesterTerm;
}
