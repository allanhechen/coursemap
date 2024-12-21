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
