import "@/app/lib/db";
import { Pool, PoolClient, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

async function createTables(client: PoolClient) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS app_user (
            userid SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            hashedpassword CHAR(60),
            firstname VARCHAR(64),
            displayname VARCHAR(64),
            userphoto BYTEA
        );
    `);

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
            userid INT REFERENCES app_user(userid),
            institutionid INT,
            programname VARCHAR(64),
            FOREIGN KEY (institutionid, programname) REFERENCES program(institutionid, programname),
            PRIMARY KEY (userid, institutionid, programname)
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
            userid INT,
            institutionid INT,
            programname VARCHAR(64),
            semestername VARCHAR(32) NOT NULL,
            semesteryear INT NOT NULL,
            semesterterm CHAR(2) NOT NULL,
            FOREIGN KEY (userid, institutionid, programname) REFERENCES userprogram(userid, institutionid, programname)
        );
    `);

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
