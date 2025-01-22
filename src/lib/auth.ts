import "@/lib/db";
import ws from "ws";
import { Pool, neonConfig } from "@neondatabase/serverless";
import NextAuth, { DefaultSession } from "next-auth";
import GitHub from "next-auth/providers/github";
import PostgresAdapter from "@auth/pg-adapter";

import { getActiveUserProgram } from "@/actions/program";

declare module "next-auth" {
    interface Session {
        user: {
            userId: number;
            institutionId: number;
            programName: string;
            startingYear: number;
        } & DefaultSession["user"];
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
    neonConfig.webSocketConstructor = ws;
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
    return {
        adapter: PostgresAdapter(pool),
        providers: [GitHub],
        callbacks: {
            async session({ session }) {
                const userId = parseInt(session.user.id);
                session.user.userId = userId;
                const { institutionId, programName, startingYear } =
                    await getActiveUserProgram(userId);
                session.user.institutionId = institutionId;
                session.user.programName = programName;
                session.user.startingYear = startingYear;

                return session;
            },
        },
    };
});
