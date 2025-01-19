"use server";

import { sql } from "@/lib/db";

import { SemesterInformation, SemesterTerm } from "@/types/semester";

export async function getSemesters(
    userId: number,
    institutionId: number,
    programName: string
): Promise<SemesterInformation[]> {
    const queryResult = await sql.query<{
        semesterid: number;
        semestername: string;
        semesteryear: number;
        semesterterm: SemesterTerm;
    }>(
        `
        SELECT semesterid, semestername, semesteryear, semesterterm
        FROM semester
        WHERE userId = $1 AND institutionid = $2 AND programname = $3;
        `,
        [userId, institutionId, programName]
    );

    const result: SemesterInformation[] = [];
    queryResult.rows.forEach(
        ({ semesterid, semestername, semesterterm, semesteryear }) => {
            result.push({
                semesterId: semesterid,
                semesterName: semestername,
                semesterTerm: semesterterm,
                semesterYear: new Date(semesteryear, 0, 1),
            });
        }
    );
    return result;
}

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
            institutionid,
            programname,
            semestername,
            semesteryear,
            semesterterm
        ) VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6
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

export async function updateSemester(
    userId: number,
    semesterId: number,
    semesterName: string,
    semesterYear: Date,
    semesterTerm: SemesterTerm
): Promise<void> {
    await sql.query(
        `
        UPDATE semester
        SET semestername = $1, semesteryear = $2, semesterterm = $3
        WHERE userId = $4 AND semesterid = $5;
        `,
        [
            semesterName,
            semesterYear.getFullYear(),
            semesterTerm,
            userId,
            semesterId,
        ]
    );
}

export async function deleteSemester(
    userId: number,
    semesterId: number
): Promise<void> {
    await sql.query(
        `
        DELETE FROM semester
        WHERE userId = $1 AND semesterid = $2;`,
        [userId, semesterId]
    );
}
