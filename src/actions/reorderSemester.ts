"use server";

import { CardInformation } from "@/types/courseCard";

export async function reorderSemester(
    prevState: CardInformation[],
    newInformation: { droppedOn: number; semesterId: number }
) {
    console.log(prevState);
    console.log(newInformation);
}
