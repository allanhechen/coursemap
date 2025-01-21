/**
 * @jest-environment node
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.development" });

import { Pool } from "pg";
import {
    createUserProgram,
    deleteUserProgram,
    getActiveUserProgram,
    getProgramRequirements,
    getUserPrograms,
    updateUserProgram,
} from "@/actions/program";

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
    it("should get correct active user program for Allan", async () => {
        const result = await getActiveUserProgram(1);
        expect(result.institutionId).toEqual(1);
        expect(result.institutionName).toEqual(
            "Toronto Metropolitan University"
        );
        expect(result.institutionPhoto).toEqual(
            "https://www.torontomu.ca/content/dam/brand/global/images/visual-guide/tmu-logo-full-colour.jpg"
        );
        expect(result.programName).toEqual("Computer Science");
        expect(result.startingYear).toEqual(2020);
    });

    it("should should add another program for Allan", async () => {
        await createUserProgram(1, 1, "Criminology", 2020);
    });

    it("should throw an error when we try to insert an existing userprogram", async () => {
        await expect(
            createUserProgram(1, 1, "Criminology", 2020)
        ).rejects.toThrow("duplicate key value violates unique constraint");
    });

    it("should give us two userprograms", async () => {
        const result = await getUserPrograms(1);
        expect(result.length).toEqual(2);
    });

    it("should let us set the new userprogram", async () => {
        await updateUserProgram(1, 1, "Criminology", 2020);
        const result = await getActiveUserProgram(1);

        expect(result.institutionId).toEqual(1);
        expect(result.institutionName).toEqual(
            "Toronto Metropolitan University"
        );
        expect(result.institutionPhoto).toEqual(
            "https://www.torontomu.ca/content/dam/brand/global/images/visual-guide/tmu-logo-full-colour.jpg"
        );
        expect(result.programName).toEqual("Criminology");
        expect(result.startingYear).toEqual(2020);
    });

    it("should not let us delete the active userprogram", async () => {
        await expect(
            deleteUserProgram(1, 1, "Criminology", 2020)
        ).rejects.toThrow(
            "Cannot delete only userprogram, or active userprogram"
        );
    });

    it("should let us set the userprogram back", async () => {
        await updateUserProgram(1, 1, "Computer Science", 2020);
    });

    it("should let us delete the inactive userprogram", async () => {
        await deleteUserProgram(1, 1, "Criminology", 2020);
    });

    it("should give us one userprogram", async () => {
        const result = await getUserPrograms(1);
        expect(result.length).toEqual(1);
    });

    it("should give us many programrequirements", async () => {
        const result = await getProgramRequirements(
            1,
            "Computer Science",
            2020
        );
        expect(result.length).toBeGreaterThan(0);
    });
});

afterAll(async () => {
    await pool.end();
});
