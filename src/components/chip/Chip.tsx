import ChipFilled from "@/components/chip/ChipFilled";
import ChipUnfilled from "@/components/chip/ChipUnfilled";
import { ChipVariant } from "@/types/chipVariant";

export default function Chip({
    variant,
    filled,
}: {
    variant: ChipVariant;
    filled: boolean;
}) {
    return filled ? (
        <ChipFilled variant={variant} clickable={true} />
    ) : (
        <ChipUnfilled variant={variant} clickable={true} />
    );
}
