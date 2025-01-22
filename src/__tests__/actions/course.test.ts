/**
 * @jest-environment node
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.development" });

import { Pool } from "pg";
import {
    deleteCourseSemester,
    getCourseInformation,
    getCourseSemesters,
    getPrerequsuites,
    searchCourses,
    updateCourseSemester,
} from "@/actions/course";
import {
    createSemester,
    deleteSemester,
    getSemesters,
} from "@/actions/semester";
import { SemesterTerm } from "@/types/semester";

let pool: Pool;

jest.mock("@/lib/db", () => ({
    sql: {
        query: jest.fn((...args) => {
            if (args.length === 1) {
                return pool.query(args[0]);
            } else if (args.length === 2) {
                return pool.query(args[0], args[1]);
            } else if (args.length === 3) {
                return pool.query(args[0], args[1], args[2]);
            }
            return null;
        }),
        connect: jest.fn((args) => {
            return pool.connect(args);
        }),
    },
}));

beforeAll(async () => {
    try {
        const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;
        const POSTGRES_URL = process.env.POSTGRES_URL?.replace(
            "${POSTGRES_PASSWORD}",
            POSTGRES_PASSWORD!
        );
        pool = new Pool({
            connectionString: POSTGRES_URL,
        });
    } catch (error) {
        console.error("Error during beforeAll:", error);
    }
});

describe("Program Server Actions", () => {
    it("should get course information for any course", async () => {
        const courseInformation = await getCourseInformation(
            1,
            "Computer Science",
            2020,
            [1]
        );
        const values = Object.values(courseInformation);
        expect(values.length).toBe(1);
    });

    it("should get the course CPS 209", async () => {
        const courses = await searchCourses(
            1,
            "Computer Science",
            2020,
            "CPS 209",
            true,
            true,
            true,
            true,
            true,
            true
        );
        expect(courses[0].courseCode).toEqual("CPS 209");
    });

    it("should get an object containing prerequisites for TMU", async () => {
        const prerequisites = await getPrerequsuites(1);
        const courseInformation = await searchCourses(
            1,
            "Computer Science",
            2020,
            "CPS 209",
            true,
            true,
            true,
            true,
            true,
            true
        );
        const cps209 = courseInformation[0];

        expect(prerequisites[cps209.courseId]).toBe("{CPS 109} || {CPS 106}");
    });

    it("should be able to add any amount of courses to a semester", async () => {
        const semesterId = await createSemester(
            1,
            1,
            "Computer Science",
            "1a",
            new Date(2020, 0, 1),
            SemesterTerm.FA
        );
        const cpsCourses = await searchCourses(
            1,
            "Computer Science",
            2020,
            "CPS",
            true,
            true,
            true,
            true,
            true,
            true
        );
        const courseIds = cpsCourses.map((course) => course.courseId);
        await updateCourseSemester(1, semesterId, courseIds);
    });

    it("should be able to retrieve courses associated with a course semester", async () => {
        const semesters = await getSemesters(1, 1, "Computer Science");
        expect(semesters.length).toBe(1);

        const retrievedSemesterId = semesters[0].semesterId;
        const cpsCourses = await searchCourses(
            1,
            "Computer Science",
            2020,
            "CPS",
            true,
            true,
            true,
            true,
            true,
            true
        );
        const courseIds = cpsCourses.map((course) => course.courseId);
        const courseSemesters = await getCourseSemesters(
            1,
            1,
            "Computer Science",
            2020
        );

        courseSemesters.forEach(({ semesterId, course }) => {
            expect(semesterId).toBe(retrievedSemesterId);
            expect(courseIds.includes(course.courseId)).toBe(true);
        });
    });

    it("should be able to retrieve courses associated with a course semester", async () => {
        const semesters = await getSemesters(1, 1, "Computer Science");
        expect(semesters.length).toBe(1);

        const retrievedSemesterId = semesters[0].semesterId;
        const cpsCourses = await searchCourses(
            1,
            "Computer Science",
            2020,
            "CPS",
            true,
            true,
            true,
            true,
            true,
            true
        );
        const courseIds = cpsCourses.map((course) => course.courseId);
        const courseSemesters = await getCourseSemesters(
            1,
            1,
            "Computer Science",
            2020
        );

        courseSemesters.forEach(({ semesterId, course }) => {
            expect(semesterId).toBe(retrievedSemesterId);
            expect(courseIds.includes(course.courseId)).toBe(true);
        });
    });

    it("should properly delete coursesemesters", async () => {
        const courseSemesters = await getCourseSemesters(
            1,
            1,
            "Computer Science",
            2020
        );

        const promises = courseSemesters.map(({ semesterId, course }) => {
            return deleteCourseSemester(1, semesterId, course.courseId);
        });
        await Promise.all(promises);

        const newCourseSemesters = await getCourseSemesters(
            1,
            1,
            "Computer Science",
            2020
        );
        expect(newCourseSemesters.length).toBe(0);

        await deleteSemester(1, courseSemesters[0].semesterId);
    });
});

afterAll(async () => {
    await pool.end();
});
