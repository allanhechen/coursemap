import "@/lib/db";
import { Pool, PoolClient, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

async function createTables(client: PoolClient) {
    // auth related tables
    await client.query(`
        CREATE TABLE IF NOT EXISTS accounts (
            id SERIAL,
            "userId" INTEGER NOT NULL,
            type VARCHAR(255) NOT NULL,
            provider VARCHAR(255) NOT NULL,
            "providerAccountId" VARCHAR(255) NOT NULL,
            refresh_token TEXT,
            access_token TEXT,
            expires_at BIGINT,
            token_type TEXT,
            scope TEXT,
            id_token TEXT,
            session_state TEXT,
            PRIMARY KEY (id)
        );
`);

    await client.query(`
        CREATE TABLE IF NOT EXISTS sessions (
            id SERIAL,
            "sessionToken" VARCHAR(255) NOT NULL,
            "userId" INTEGER NOT NULL,
            expires TIMESTAMPTZ NOT NULL,
            PRIMARY KEY (id)
        );
    `);
    await client.query(`
        CREATE TABLE IF NOT EXISTS verification_tokens (
            identifier TEXT,
            token TEXT,
            expires TIMESTAMPTZ NOT NULL,
            PRIMARY KEY (identifier, token)
        );
    `);

    await client.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL,
            name VARCHAR(255),
            email VARCHAR(255),
            "emailVerified" TIMESTAMPTZ,
            image TEXT,
            PRIMARY KEY (id)
        );
    `);

    // application related tables

    await client.query(`
        CREATE TABLE IF NOT EXISTS institution (
            institutionid SERIAL PRIMARY KEY,
            institutionname VARCHAR(64) NOT NULL,
            institutionphoto BYTEA
        );
    `);

    await client.query(`
        CREATE TABLE IF NOT EXISTS program (
            institutionid INT REFERENCES institution(institutionid),
            programname VARCHAR(64),
            PRIMARY KEY (institutionid, programname)
        );
    `);

    await client.query(`
        CREATE TABLE IF NOT EXISTS userprogram (
            id INT REFERENCES users(id),
            institutionid INT,
            programname VARCHAR(64),
            FOREIGN KEY (institutionid, programname) REFERENCES program(institutionid, programname),
            PRIMARY KEY (id, institutionid, programname)
        );
    `);

    await client.query(`
        CREATE TABLE IF NOT EXISTS course (
            courseid SERIAL PRIMARY KEY,
            institutionid INT REFERENCES institution(institutionid),
            faculty VARCHAR(64) NOT NULL,
            coursecode VARCHAR(10) NOT NULL,
            coursetitle VARCHAR(64) NOT NULL,
            coursedescription VARCHAR(1024),
            useradded BOOLEAN
        );
    `);

    await client.query(`
        CREATE TABLE IF NOT EXISTS courseprerequisite (
            courseid INT REFERENCES course(courseid),
            prerequisite INT REFERENCES course(courseid),
            groupid INT NOT NULL,
            PRIMARY KEY (courseid, prerequisite)
        );
    `);

    await client.query(`
        CREATE TABLE IF NOT EXISTS coursepostrequisite (
            courseid INT REFERENCES course(courseid),
            postrequisite INT REFERENCES course(courseid),
            PRIMARY KEY (courseid, postrequisite)
        );
    `);

    await client.query(`
        CREATE TABLE IF NOT EXISTS courseantirequisite (
            courseid INT REFERENCES course(courseid),
            antirequisite INT REFERENCES course(courseid),
            PRIMARY KEY (courseid, antirequisite)
        );
    `);

    await client.query(`
        CREATE TABLE IF NOT EXISTS coursehistory (
            courseid INT REFERENCES course(courseid),
            pastyear INT,
            pastterm CHAR(2),
            PRIMARY KEY (courseid, pastyear, pastterm)
        );
    `);

    await client.query(`
        CREATE TABLE IF NOT EXISTS courseattribute (
            courseid INT REFERENCES course(courseid),
            attribute CHAR(2),
            PRIMARY KEY (courseid, attribute)
        );
    `);

    await client.query(`
        CREATE TABLE IF NOT EXISTS semester (
            semesterid SERIAL PRIMARY KEY,
            id INT,
            institutionid INT,
            programname VARCHAR(64),
            semestername VARCHAR(32) NOT NULL,
            semesteryear INT NOT NULL,
            semesterterm CHAR(2) NOT NULL,
            FOREIGN KEY (id, institutionid, programname) REFERENCES userprogram(id, institutionid, programname)
        );
    `);

    // TODO: insert userid into this instead of semesterid -> technically breaks 3nf but we need to uniquely identify courseid within semesters
    await client.query(`
        CREATE TABLE IF NOT EXISTS coursesemester (
            semesterid INT REFERENCES semester(semesterid),
            courseid INT REFERENCES course(courseid),
            PRIMARY KEY (semesterid, courseid)
        );
    `);

    await client.query(`
        CREATE TABLE IF NOT EXISTS programrequirement (
            institutionid INT,
            programname VARCHAR(64),
            courseid INT,
            recommendedsemester INT NOT NULL,
            PRIMARY KEY (institutionid, programname, courseid),
            FOREIGN KEY (institutionid, programname) REFERENCES program(institutionid, programname)
        );
    `);
}

export async function GET() {
    neonConfig.webSocketConstructor = ws;
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
    const client = await pool.connect();

    try {
        client.query(`BEGIN`);
        await createTables(client);
        client.query(`COMMIT`);

        return Response.json({ message: "Database seeded successfully" });
    } catch (error) {
        client.query(`ROLLBACK`);
        return Response.json({ error }, { status: 500 });
    }
}
