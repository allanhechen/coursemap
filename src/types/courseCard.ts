export interface CardWrapper {
    data: CardInformation;
    isConnectable: boolean;
}

export interface CardInformation {
    courseCode: string;
    courseName: string;
    faculty: string;
    chips: string[];
}
