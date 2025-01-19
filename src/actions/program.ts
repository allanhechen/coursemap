"use server";

import { sql } from "@/lib/db";

export async function getActiveUserProgram(userId: number): Promise<{
    institutionId: number;
    institutionName: string;
    institutionPhoto: string;
    programName: string;
    startingYear: number;
}> {
    const queryResult = await sql.query<{
        institutionid: number;
        institutionname: string;
        institutionphoto: string;
        programname: string;
        startingyear: number;
    }>(
        `
        SELECT 
            institution.institutionid, 
            institution.institutionname, 
            institution.institutionphoto, 
            userprogram.programname,
            userprogram.startingyear
        FROM userprogram
        INNER JOIN institution ON userprogram.institutionid = institution.institutionid
        WHERE userid = $1 AND active = TRUE;
        `,
        [userId]
    );

    const rows = queryResult.rows;
    if (rows.length != 1) {
        throw new Error(
            `Incorrect number of active entries returned for user ${userId}`
        );
    }
    const result = {
        institutionId: rows[0].institutionid,
        institutionName: rows[0].institutionname,
        institutionPhoto: rows[0].institutionphoto,
        programName: rows[0].programname,
        startingYear: rows[0].startingyear,
    };
    return result;
}

export async function createUserProgram(
    userId: number,
    institutionId: number,
    programName: string,
    startingyear: number
): Promise<void> {
    await sql.query(
        `
        INSERT INTO userprogram(
            userId,
            institutionid,
            programname,
            startingyear,
            active
        )
        VALUES(
            $1,
            $2,
            $3,
            $4,
            FALSE
        );`,
        [userId, institutionId, programName, startingyear]
    );
}

export async function updateUserProgram(
    userId: number,
    institutionId: number,
    programName: string,
    startingYear: number
): Promise<void> {
    const client = await sql.connect();
    try {
        await client.query("BEGIN");
        await client.query(
            `
            UPDATE userprogram
            SET active = FALSE
            WHERE userId = $1;
            `,
            [userId]
        );
        const result = await client.query(
            `
            UPDATE userprogram
            SET active = TRUE
            WHERE userId = $1 AND institutionid = $2 AND programname = $3 AND startingyear = $4
            RETURNING *;
            `,
            [userId, institutionId, programName, startingYear]
        );

        if (result.rowCount === 1) {
            await client.query("COMMIT");
        } else {
            throw new Error("No userprograms were matched with given criteria");
        }
    } catch (e) {
        await client.query("ROLLBACK");
        throw new Error("Error updating user program");
    } finally {
        client.release();
    }
}

export async function deleteUserProgram(
    userId: number,
    institutionId: number,
    programName: string,
    startingyear: number
): Promise<void> {
    const result = await sql.query(
        `
        SELECT COUNT(*) 
        FROM userprogram
        WHERE userId = $1 AND
              active = TRUE AND
              (institutionid != $2 OR
               programname != $3 OR
               startingyear != $4);
        `,
        [userId, institutionId, programName, startingyear]
    );

    const activeCount = parseInt(result.rows[0].count);

    if (activeCount < 1) {
        throw new Error(
            "Cannot delete only userprogram, or active userprogram"
        );
    }
    await sql.query(
        `
        DELETE FROM userprogram
        WHERE userId = $1 AND institutionid = $2 AND programname = $3 AND startingyear = $4;
        `,
        [userId, institutionId, programName, startingyear]
    );
}

export async function getUserPrograms(userId: number): Promise<
    {
        institutionId: number;
        institutionName: string;
        institutionPhoto: string;
        programName: string;
        startingYear: number;
        active: boolean;
    }[]
> {
    const result = await sql.query<{
        institutionId: number;
        institutionName: string;
        institutionPhoto: string;
        programName: string;
        startingYear: number;
        active: boolean;
    }>(
        `
        SELECT 
            institution.institutionid, 
            institution.institutionname, 
            institution.institutionphoto, 
            userprogram.programname,
            userprogram.startingyear,
            userprogram.active
        FROM userprogram
        INNER JOIN institution ON userprogram.institutionid = institution.institutionid
        WHERE userid = $1;
        `,
        [userId]
    );

    const rows = result.rows;
    return rows;
}

export async function getProgramRequirements(
    institutionId: number,
    programName: string,
    startingYear: number
): Promise<number[]> {
    const queryResult = await sql.query<{
        courseid: number;
    }>(
        `
        SELECT courseid FROM programrequirement WHERE institutionid = $1 AND programname = $2 AND requirementyear = $3`,
        [institutionId, programName, startingYear]
    );

    const result: number[] = [];
    queryResult.rows.forEach(({ courseid }) => {
        result.push(courseid);
    });

    return result;
}
