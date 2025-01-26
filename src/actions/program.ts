"use server";

import { QueryResult, sql } from "@/lib/db";

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
        // user does not have an active program set, but this will be dealt with by the pages on load
        return {
            institutionId: 0,
            institutionName: "",
            institutionPhoto: "",
            programName: "",
            startingYear: 0,
        };
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
        const check = await client.query(
            `
            SELECT 1
            FROM userprogram
            WHERE userId = $1 AND institutionid = $2 AND programname = $3 and startingyear <> $4
            `,
            [userId, institutionId, programName, startingYear]
        );

        if (check.rowCount !== 0) {
            throw new Error(
                "User has another userProgram with a different starting year"
            );
        }
        await client.query(
            `
            UPDATE userprogram
            SET active = FALSE
            WHERE userId = $1;
            `,
            [userId]
        );

        const result = await client.query<{ operation: string }>(
            `
            INSERT INTO userprogram (userId, institutionId, programName, startingYear, active)
            VALUES ($1, $2, $3, $4, TRUE)
            ON CONFLICT (userId, institutionId, programName, startingYear)
            DO UPDATE SET active = TRUE
            RETURNING CASE xmax WHEN 0 THEN 'inserted' ELSE 'updated' END AS operation
            `,
            [userId, institutionId, programName, startingYear]
        );
        console.log(result.rows);
        if (result.rowCount === 1) {
            if (result.rows[0].operation === "inserted") {
                const programRequirements = await client.query<{
                    courseid: number;
                    recommendedsemester: number;
                }>(
                    `
                    SELECT courseid, recommendedsemester
                    FROM programrequirement
                    WHERE institutionid = $1 AND programname = $2 AND requirementyear = $3`,
                    [institutionId, programName, startingYear]
                );
                const requiredSemesters: number[] = [];
                const semesterQueryArray: string[] = [];
                if (programRequirements.rows.length === 0) {
                    await client.query("COMMIT");
                    return;
                }
                console.log(programRequirements.rows);
                programRequirements.rows.forEach(({ recommendedsemester }) => {
                    if (!requiredSemesters.includes(recommendedsemester)) {
                        requiredSemesters.push(recommendedsemester);
                        const term = recommendedsemester % 2 == 0 ? "WI" : "FA";
                        const letter = recommendedsemester % 2 == 0 ? "b" : "a";
                        const year = Math.floor(recommendedsemester / 2) + 1;
                        semesterQueryArray.push(`INSERT INTO semester(
                                                                    userId, 
                                                                    institutionid, 
                                                                    programname, 
                                                                    startingyear, 
                                                                    semestername, 
                                                                    semesteryear, 
                                                                    semesterterm
                                                                 ) VALUES(
                                                                  ${userId},
                                                                  ${institutionId},
                                                                  '${programName}',
                                                                  ${startingYear},
                                                                  '${
                                                                      year +
                                                                      letter
                                                                  }',
                                                                  ${
                                                                      startingYear +
                                                                      year -
                                                                      1
                                                                  },
                                                                  '${term}')`);
                    }
                });
                console.log(semesterQueryArray);
                const queryResults = await client.query(
                    semesterQueryArray.join(
                        "RETURNING semesterid, semesteryear, semesterterm;"
                    ) + "RETURNING semesterid, semesteryear, semesterterm;"
                );
                const queryResultsArray =
                    queryResults as unknown as QueryResult<{
                        semesterid: number;
                        semesteryear: number;
                        semesterterm: string;
                    }>[];

                const semesterToId: { [key: string]: number } = {};
                queryResultsArray.forEach((queryResult) => {
                    const { semesterid, semesteryear, semesterterm } =
                        queryResult.rows[0];
                    const key = semesteryear + "-" + semesterterm;
                    semesterToId[key] = semesterid;
                });

                const courseSemesters: string[] = [];
                programRequirements.rows.forEach(
                    ({ courseid, recommendedsemester }) => {
                        const term = recommendedsemester % 2 == 0 ? "WI" : "FA";
                        const year = Math.floor(recommendedsemester / 2) + 1;
                        const key = startingYear + year - 1 + "-" + term;
                        console.log(key, semesterToId[key]);
                        courseSemesters.push(`
                            INSERT INTO coursesemester(
                                userId,
                                semesterid,
                                courseid,
                                sortorder
                            )
                            VALUES (
                                ${userId},
                                ${semesterToId[key]},
                                ${courseid},
                                0
                            );
                            `);
                    }
                );

                client.query(courseSemesters.join(";") + ";");
            }
            await client.query("COMMIT");
        } else {
            throw new Error("No userprograms were matched with given criteria");
        }
    } catch (e) {
        await client.query("ROLLBACK");
        console.log(e);
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

export async function getPrograms(): Promise<
    {
        institutionId: number;
        institutionName: string;
        institutionPhoto: string;
        programName: string;
        startingYear: number;
    }[]
> {
    const queryResult = await sql.query<{
        institutionid: number;
        institutionname: string;
        institutionphoto: string;
        programname: string;
        startingyear: number;
    }>(
        `
        SELECT program.institutionId, program.programName, program.startingYear, institution.institutionName, institution.institutionPhoto
        FROM program
        INNER JOIN institution
        ON institution.institutionid = program.institutionid;
        `
    );

    const result: {
        institutionId: number;
        institutionName: string;
        institutionPhoto: string;
        programName: string;
        startingYear: number;
    }[] = queryResult.rows.map(
        ({
            institutionid,
            institutionname,
            institutionphoto,
            programname,
            startingyear,
        }) => {
            return {
                institutionId: institutionid,
                institutionName: institutionname,
                institutionPhoto: institutionphoto,
                programName: programname,
                startingYear: startingyear,
            };
        }
    );
    return result;
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
