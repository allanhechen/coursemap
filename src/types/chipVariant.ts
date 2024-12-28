export enum ChipVariant {
    FALL = "Fall",
    WINTER = "Winter",
    SPRING = "Spring",
    SUMMER = "Summer",
    REQUIRED = "Required",
    ELECTIVE = "Elective",
    WARNING = "Warning",
}

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
    variant: ChipVariant;
    filled?: boolean;
    clickable?: boolean;
}
