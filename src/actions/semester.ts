"use server";

import { sql } from "@/lib/db";

import { SemesterInformation, SemesterTerm } from "@/types/semester";

export async function createSemester(
    userId: number,
    institutionId: number,
    programName: string,
    semesterName: string,
    semesterYear: Date,
    semesterTerm: SemesterTerm
): Promise<number> {
    const result = await sql.query<{ semesterid: number }>(
        `
        INSERT INTO semester(
            userid,
            programname,
            institutionid,
            semestername,
            semesteryear,
            semesterterm
        ) VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
        ) RETURNING semesterid`,
        [
            userId,
            institutionId,
            programName,
            semesterName,
            semesterYear.getFullYear(),
            semesterTerm,
        ]
    );
    return result.rows[0].semesterid;
}

export async function getSemesters(
    userId: number, // eslint-disable-line
    institutionId: number, // eslint-disable-line
    programName: string // eslint-disable-line
): Promise<SemesterInformation[]> {
    // get user, program from auth system
    // return all semesters belonging to the user in this program
    console.log(`We are reading semester information`);
    return [
        {
            semesterId: 1,
            semesterName: "1a",
            semesterYear: new Date(2024, 0, 1),
            semesterTerm: SemesterTerm.FA,
        },
        {
            semesterId: 2,
            semesterName: "2a",
            semesterYear: new Date(2024, 0, 1),
            semesterTerm: SemesterTerm.WI,
        },
    ];
}

export async function updateSemester(
    semesterId: number,
    semesterName: string,
    semesterYear: Date,
    semesterTerm: SemesterTerm
): Promise<number> {
    // validate semesterid is integer, semeseter name is string of correct length, semester year is a valid year, and semseter term is in the four codes
    // get user, program from auth system
    // ensure that user and program correspond to the current semester provided
    //      if it doesn't exist return a 400 code
    // update semester information
    // (i believe these fields aren't used anywhere else so they don't need to be updated anywhere else)
    console.log(
        `Update semester ${semesterId} with ${semesterName}, ${semesterYear}, and ${semesterTerm}`
    );
    return 1;
}

export async function deleteSemester(semesterId: number): Promise<void> {
    // validate semseterid is an integer
    // get user, program from auth system
    // ensure that semester exists
    // delete semester
    console.log(`Delete semester with ${semesterId}`);
}
