"use server";

import { sql } from "@/lib/db";

import { ChipVariant } from "@/types/chipVariant";
import { CourseInformation } from "@/types/courseCard";
import { getProgramRequirements } from "@/actions/program";

export async function getPostrequisites(
    institutionId: number
): Promise<{ [courseId: number]: number[] }> {
    const queryResult = await sql.query<{
        courseid: number;
        postrequisite: number;
    }>(
        `
        SELECT coursepostrequisite.courseid, coursepostrequisite.postrequisite
        FROM coursepostrequisite
        INNER JOIN course ON course.courseid = coursepostrequisite.courseid
        WHERE course.institutionid = $1;
        `,
        [institutionId]
    );

    const result: { [courseId: number]: number[] } = {};
    queryResult.rows.forEach(({ courseid, postrequisite }) => {
        if (result[postrequisite]) {
            result[postrequisite].push(courseid);
        } else {
            result[postrequisite] = [courseid];
        }
    });
    return result;
}

export async function getPrerequsuites(
    institutionId: number
): Promise<{ [courseId: number]: string }> {
    const queryResult = await sql.query<{
        courseid: number;
        courseprerequisites: string;
    }>(
        `
        SELECT courseid, courseprerequisites
        FROM course
        WHERE institutionid = $1;
        `,
        [institutionId]
    );

    const result: { [courseId: number]: string } = {};
    queryResult.rows.forEach((prerequisiteEntry) => {
        result[prerequisiteEntry.courseid] =
            prerequisiteEntry.courseprerequisites;
    });
    return result;
}

export async function getCourseIds(
    institutionId: number
): Promise<{ [courseCode: string]: number }> {
    const queryResult = await sql.query<{
        courseid: number;
        coursecode: string;
    }>(
        `
        SELECT courseid, coursecode
        FROM course
        WHERE institutionid = $1;
        `,
        [institutionId]
    );

    const result: { [courseCode: string]: number } = {};
    queryResult.rows.forEach(({ courseid, coursecode }) => {
        result[coursecode] = courseid;
    });
    return result;
}

export async function getCourseNames(
    institutionId: number
): Promise<{ [courseId: number]: string }> {
    const queryResult = await sql.query<{
        courseid: number;
        coursecode: string;
    }>(
        `
        SELECT courseid, coursecode
        FROM course
        WHERE institutionid = $1;
        `,
        [institutionId]
    );

    const result: { [courseId: number]: string } = {};
    queryResult.rows.forEach(({ courseid, coursecode }) => {
        result[courseid] = coursecode;
    });
    return result;
}

export async function getCourseInformation(
    institutionId: number,
    programName: string,
    startingyear: number,
    courseIds: number[]
): Promise<{ [courseId: number]: CourseInformation }> {
    if (courseIds.length === 0) {
        return {};
    }
    const programRequirements = await getProgramRequirements(
        institutionId,
        programName,
        startingyear
    );
    const input: string[] = [];
    for (let i = 0; i < courseIds.length; i++) {
        input.push(`$${i + 1}`);
    }
    const set = input.join(", ");

    const courseResult = sql.query<{
        courseid: number;
        faculty: string;
        coursecode: string;
        coursetitle: string;
        coursedescription: string;
        courseprerequisites: string;
        externallink: string;
        institutionname: string;
    }>(
        `
        SELECT 
            course.courseid, 
            course.faculty, 
            course.coursecode, 
            course.coursetitle, 
            course.coursedescription, 
            course.courseprerequisites, 
            course.externallink,
            institution.institutionname
        FROM course
        INNER JOIN institution
        ON course.institutionid = institution.institutionid
        WHERE courseid in (${set});
        `,
        courseIds
    );
    const courseattributeResult = sql.query<{
        courseid: number;
        attribute: ChipVariant;
    }>(
        `
        SELECT courseid, attribute
        FROM courseattribute
        WHERE courseid in (${set});
        `,
        courseIds
    );
    const postrequisiteResult = sql.query<{
        courseid: number;
        postrequisite: number;
    }>(
        `
        SELECT courseid, postrequisite
        FROM coursepostrequisite
        WHERE courseid in (${set});
        `,
        courseIds
    );
    const antirequisiteResult = sql.query<{
        courseid: number;
        antirequisite: number;
    }>(
        `
        SELECT courseid, antirequisite
        FROM courseantirequisite
        WHERE courseid in (${set});
        `,
        courseIds
    );
    const [
        courseInformation,
        attributeInformation,
        postrequisiteInformation,
        antirequisiteInformation,
    ] = await Promise.all([
        courseResult,
        courseattributeResult,
        postrequisiteResult,
        antirequisiteResult,
    ]);

    const courseProcessed: { [courseId: number]: CourseInformation } = {};
    const attributeProcessed: { [courseId: number]: ChipVariant[] } = {};
    const postrequisiteProcessed: { [courseId: number]: number[] } = {};
    const antirequisiteProcessed: { [courseId: number]: number[] } = {};

    attributeInformation.rows.forEach(({ courseid, attribute }) => {
        if (!attributeProcessed[courseid]) {
            attributeProcessed[courseid] = [attribute];
        } else {
            attributeProcessed[courseid].push(attribute);
        }
    });
    postrequisiteInformation.rows.forEach(({ courseid, postrequisite }) => {
        if (!postrequisiteProcessed[courseid]) {
            postrequisiteProcessed[courseid] = [postrequisite];
        } else {
            postrequisiteProcessed[courseid].push(postrequisite);
        }
    });
    antirequisiteInformation.rows.forEach(({ courseid, antirequisite }) => {
        if (!antirequisiteProcessed[courseid]) {
            antirequisiteProcessed[courseid] = [antirequisite];
        } else {
            antirequisiteProcessed[courseid].push(antirequisite);
        }
    });

    courseInformation.rows.forEach((row) => {
        const attributes = attributeProcessed[row.courseid]
            ? (attributeProcessed[row.courseid] as string[])
            : [];
        const chips = [];
        if (attributes.includes("FA")) {
            chips.push(ChipVariant.FALL);
        }
        if (attributes.includes("WI")) {
            chips.push(ChipVariant.WINTER);
        }
        if (attributes.includes("SP")) {
            chips.push(ChipVariant.SPRING);
        }
        if (attributes.includes("SU")) {
            chips.push(ChipVariant.SUMMER);
        }
        if (programRequirements.includes(row.courseid)) {
            chips.push(ChipVariant.REQUIRED);
        } else {
            chips.push(ChipVariant.ELECTIVE);
        }

        courseProcessed[row.courseid] = {
            courseId: row.courseid,
            courseCode: row.coursecode,
            courseName: row.coursetitle,
            courseDescription: row.coursedescription,
            externalLink: row.externallink,
            faculty: row.faculty,
            institutionName: row.institutionname,
            chips: chips,
            prerequisites: row.courseprerequisites,
            postrequisites: postrequisiteProcessed[row.courseid]
                ? postrequisiteProcessed[row.courseid]
                : [],
            antirequisites: antirequisiteProcessed[row.courseid]
                ? antirequisiteProcessed[row.courseid]
                : [],
        };
    });

    return courseProcessed;
}

export async function searchCourses(
    institutionId: number,
    programName: string,
    startingyear: number,
    searchQuery: string,
    includeFall: boolean,
    includeWinter: boolean,
    includeSpring: boolean,
    includeSummer: boolean,
    includeRequired: boolean,
    includeElective: boolean
): Promise<CourseInformation[]> {
    const options = [];
    if (!includeFall && !includeWinter && !includeSpring && !includeSummer) {
        return [];
    } else if (includeFall && includeWinter && includeSpring && includeSummer) {
        // do nothing, no options required
        // returns courses without any courseattributes as well
    } else {
        if (includeFall) {
            options.push("courseattribute.attribute = 'FA'");
        }
        if (includeWinter) {
            options.push("courseattribute.attribute = 'WI'");
        }
        if (includeSpring) {
            options.push("courseattribute.attribute = 'SP'");
        }
        if (includeSummer) {
            options.push("courseattribute.attribute = 'SU'");
        }
    }

    const joinedOptions =
        options.length > 0 ? "(" + options.join(" OR ") + ") AND" : "";

    let searchResult;
    if (searchQuery) {
        searchResult = await sql.query<{ courseid: number }>(
            `
            SELECT courseid
            FROM (
                SELECT course.courseid
                FROM course
                LEFT JOIN courseattribute 
                    ON course.courseid = courseattribute.courseid
                WHERE ${joinedOptions} (
                    (course.coursecode ILIKE '%' || $1::TEXT || '%' 
                    OR course.coursetitle ILIKE '%' || $1::TEXT || '%') 
                    AND course.institutionid = $2
                )
            ) AS subquery
            GROUP BY courseid
            LIMIT 30;
            `,
            [searchQuery, institutionId]
        );
    } else {
        searchResult = await sql.query<{ courseid: number }>(
            `
            SELECT course.courseid
            FROM course
            LEFT JOIN 
                courseattribute ON course.courseid = courseattribute.courseid
            WHERE ${joinedOptions} institutionid = $1
            GROUP BY course.courseid
            ORDER BY RANDOM()
            LIMIT 30;
            `,
            [institutionId]
        );
    }

    const courseIds: number[] = [];
    const courseRows = searchResult.rows;
    courseRows.forEach((course) => {
        courseIds.push(course.courseid);
    });

    const rawCourseInformation = await getCourseInformation(
        institutionId,
        programName,
        startingyear,
        courseIds
    );
    const result: CourseInformation[] = [];
    courseRows.forEach(({ courseid }) => {
        const courseInformation = rawCourseInformation[courseid];
        const chips = courseInformation.chips;

        if (
            (chips.includes(ChipVariant.ELECTIVE) && includeElective) ||
            (chips.includes(ChipVariant.REQUIRED) && includeRequired)
        ) {
            result.push(courseInformation);
        }
    });
    return result;
}

export async function getCourseSemesters(
    userId: number,
    institutionId: number,
    programName: string,
    startingYear: number
): Promise<{ semesterId: number; course: CourseInformation }[]> {
    const coursesemesterQuery = await sql.query<{
        semesterid: number;
        courseid: number;
    }>(
        `
        SELECT coursesemester.semesterid, coursesemester.courseid
        FROM coursesemester
        INNER JOIN semester ON coursesemester.semesterid = semester.semesterid
        WHERE 
            semester.userid = $1 AND 
            semester.institutionid = $2 AND 
            semester.programname = $3 
            AND semester.startingyear = $4
        ORDER BY coursesemester.sortorder ASC;
        `,
        [userId, institutionId, programName, startingYear]
    );

    const result: { semesterId: number; course: CourseInformation }[] = [];
    const courseRelations = coursesemesterQuery.rows;
    const courseIds = courseRelations.map(({ courseid }) => courseid);

    const courseInformation: { [courseId: number]: CourseInformation } =
        await getCourseInformation(
            institutionId,
            programName,
            startingYear,
            courseIds
        );

    courseRelations.forEach(({ semesterid, courseid }) => {
        result.push({
            semesterId: semesterid,
            course: courseInformation[courseid],
        });
    });

    return result;
}

export async function updateCourseSemester(
    userId: number,
    semesterId: number,
    courseIds: number[],
    institutionId: number,
    programName: string,
    courseIdToDelete?: number
): Promise<void> {
    if (courseIds.length === 0) {
        return;
    }

    const queryResult = await sql.query(
        `
        SELECT 1
        FROM semester
        WHERE userId = $1 AND semesterid = $2`,
        [userId, semesterId]
    );

    if (queryResult.rowCount === 0) {
        throw new Error("Provided semesterId does not belong to given user");
    }
    const client = await sql.connect();
    client.query("BEGIN");
    try {
        if (courseIdToDelete) {
            await sql.query(
                `
                DELETE FROM coursesemester
                USING semester
                WHERE 
                    semester.userId = $1 AND 
                    coursesemester.courseid = $2 AND 
                    semester.institutionid = $3 AND
                    semester.programname = $4;
                `,
                [userId, courseIdToDelete, institutionId, programName]
            );
        }

        for (let i = 0; i < courseIds.length; i++) {
            const courseId = courseIds[i];

            await client.query(
                `
                INSERT INTO coursesemester(
                  userId,
                  semesterid,
                  courseid,
                  sortorder
                ) VALUES (
                  $1, 
                  $2, 
                  $3,
                  $4
                )
                ON CONFLICT (semesterid, courseid) 
                DO UPDATE SET sortorder = excluded.sortorder;
                `,
                [userId, semesterId, courseId, i]
            );
        }
        client.query("COMMIT");
    } catch (e) {
        client.query("ROLLBACK");
        throw e;
    } finally {
        client.release();
    }
}

export async function deleteCourseSemester(
    userId: number,
    institutionId: number,
    programName: string,
    courseId: number
): Promise<void> {
    await sql.query(
        `
        DELETE FROM coursesemester
        USING semester
        WHERE 
            semester.userId = $1 AND 
            coursesemester.courseid = $2 AND 
            semester.institutionid = $3 AND
            semester.programname = $4;
        `,
        [userId, courseId, institutionId, programName]
    );
}
