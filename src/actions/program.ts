"use server";

import { sql } from "@/lib/db";

import { Program } from "@/types/program";

export async function getCurrentProgram(userId: number): Promise<Program> {
    const result = await sql.query<{
        userid: number;
        institutionid: number;
        institutionphoto: string;
        programname: string;
    }>(
        `
        SELECT userid, institutionid, programname
        FROM userprogram
        WHERE userid = ?`,
        [userId]
    );

    if (result.rows.length === 0) {
        throw new Error("No program found for the specified user.");
    }

    const row = result.rows[0];
    return {
        userId: row.userid,
        institutionId: row.institutionid,
        institutionPhoto: row.institutionphoto,
        programName: row.programname,
    };
}
