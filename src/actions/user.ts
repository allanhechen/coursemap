"use server";

export async function getUserProgram(
    userId: number // eslint-disable-line
): Promise<{ institutionId: number; programName: string }> {
    return {
        institutionId: 1,
        programName: "Computer Science",
    };
}
