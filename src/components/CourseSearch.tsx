// TODO: Add this component

import ChipFilled from "@/components/ChipFilled";
import ChipUnfilled from "@/components/ChipUnfilled";
import { useState } from "react";

export default function CourseSearch() {
    const [chipClicked, setChipClicked] = useState(false);

    function handleClick() {
        setChipClicked(!chipClicked);
    }
    return (
        <div>
            CourseSearch{" "}
            {chipClicked ? (
                <div onClick={() => handleClick()}>
                    <ChipFilled variant="Winter" />
                </div>
            ) : (
                <div onClick={() => handleClick()}>
                    <ChipUnfilled variant="Winter" />
                </div>
            )}
        </div>
    );
}
