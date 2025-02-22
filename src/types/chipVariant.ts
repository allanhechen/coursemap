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

export function getChipDescription(chipVariant: ChipVariant) {
    switch (chipVariant) {
        case ChipVariant.FALL:
            return "Typically runs during the fall";
        case ChipVariant.WINTER:
            return "Typically runs during the winter";
        case ChipVariant.SPRING:
            return "Typically runs during the spring";
        case ChipVariant.SUMMER:
            return "Typically runs during the summer";
        case ChipVariant.REQUIRED:
            return "Appears in your program's requirements";
        case ChipVariant.ELECTIVE:
            return "Does not appear in your program's requirements";
        case ChipVariant.WARNING:
            return "";
    }
}
