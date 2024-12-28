import ChipFilled from "@/components/chip/ChipFilled";
import ChipUnfilled from "@/components/chip/ChipUnfilled";
import { ChipProps } from "@/types/chipVariant";

export default function Chip({
    variant,
    filled,
    ...rootDomAttributes
}: ChipProps) {
    return filled ? (
        <ChipFilled variant={variant} clickable={true} {...rootDomAttributes} />
    ) : (
        <ChipUnfilled
            variant={variant}
            clickable={true}
            {...rootDomAttributes}
        />
    );
}
