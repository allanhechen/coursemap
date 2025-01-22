/**
 * @jest-environment node
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.development" });

import { Pool } from "pg";
import {
    createSemester,
    deleteSemester,
    getSemesters,
    updateSemester,
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
    it("should not have any semesters initially", async () => {
        const semesters = await getSemesters(1, 1, "Computer Science");
        expect(semesters.length).toEqual(0);
    });

    it("should create semesters properly", async () => {
        const semesterId = await createSemester(
            1,
            1,
            "Computer Science",
            "1a",
            new Date(2020, 0, 1),
            SemesterTerm.FA
        );
        const semesters = await getSemesters(1, 1, "Computer Science");
        expect(semesters.length).toEqual(1);

        const semesterInformation = semesters[0];
        expect(semesterInformation.semesterId).toEqual(semesterId);
        expect(semesterInformation.semesterName).toEqual("1a");
        expect(semesterInformation.semesterTerm).toEqual(SemesterTerm.FA);
        expect(semesterInformation.semesterYear).toEqual(new Date(2020, 0, 1));
    });

    it("should error when two semesters are created with identical primary keys", async () => {
        await expect(
            createSemester(
                1,
                1,
                "Computer Science",
                "1a",
                new Date(2020, 0, 1),
                SemesterTerm.FA
            )
        ).rejects.toThrow("duplicate key value violates unique constraint");
    });

    it("should not update two semesters to the same timeslot", async () => {
        const oldSemesters = await getSemesters(1, 1, "Computer Science");
        expect(oldSemesters.length).toEqual(1);
        const newSemesterNumber = await createSemester(
            1,
            1,
            "Computer Science",
            "1b",
            new Date(2020, 0, 1),
            SemesterTerm.WI
        );
        await expect(
            updateSemester(
                1,
                newSemesterNumber,
                "New Semester Name",
                new Date(2020, 0, 1),
                SemesterTerm.FA
            )
        ).rejects.toThrow("duplicate key value violates unique constraint");
        await deleteSemester(1, newSemesterNumber);
    });

    it("should update semesters properly", async () => {
        const oldSemesters = await getSemesters(1, 1, "Computer Science");
        expect(oldSemesters.length).toEqual(1);
        const oldSemesterInformation = oldSemesters[0];
        await updateSemester(
            1,
            oldSemesterInformation.semesterId,
            "NewSemesterName",
            new Date(2021, 0, 1),
            SemesterTerm.WI
        );
        const newSemesters = await getSemesters(1, 1, "Computer Science");
        expect(newSemesters.length).toEqual(1);
        const newSemesterInformation = newSemesters[0];
        expect(newSemesterInformation.semesterId).toEqual(
            oldSemesterInformation.semesterId
        );
        expect(newSemesterInformation.semesterName).toEqual("NewSemesterName");
        expect(newSemesterInformation.semesterTerm).toEqual(SemesterTerm.WI);
        expect(newSemesterInformation.semesterYear).toEqual(
            new Date(2021, 0, 1)
        );
    });

    it("should delete semesters properly", async () => {
        const oldSemesters = await getSemesters(1, 1, "Computer Science");
        expect(oldSemesters.length).toEqual(1);
        const semester = oldSemesters[0];
        await deleteSemester(1, semester.semesterId);
        const newSemesters = await getSemesters(1, 1, "Computer Science");
        expect(newSemesters.length).toEqual(0);
    });
});

afterAll(async () => {
    await pool.end();
});
