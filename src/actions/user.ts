"use server";

import { sql } from "@/lib/db";

export async function deleteUser(userId: number): Promise<void> {
    const client = await sql.connect();
    client.query("BEGIN");
    try {
        await sql.query(
            `
            DELETE FROM users
            WHERE id = $1
            `,
            [userId]
        );
        await sql.query(
            `
            DELETE FROM sessions
            WHERE "userId" = $1
            `,
            [userId]
        );
        await sql.query(
            `
            DELETE FROM accounts
            WHERE "userId" = $1
            `,
            [userId]
        );
    } catch (e) {
        client.query("ROLLBACK");
        console.log(e);
    } finally {
        client.release();
    }
}
