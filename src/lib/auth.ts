import "@/lib/db";
import ws from "ws";
import { Pool, neonConfig } from "@neondatabase/serverless";
import NextAuth, { DefaultSession } from "next-auth";
import GitHub from "next-auth/providers/github";
import { GitHubProfile } from "next-auth/providers/github";
import PostgresAdapter from "@auth/pg-adapter";

import { getGitHubUserProgram, getUserProgram } from "@/actions/user";

declare module "next-auth" {
    interface Session {
        user: {
            userId?: number;
            institutionId?: number;
            programName?: string;
        } & DefaultSession["user"];
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
    neonConfig.webSocketConstructor = ws;
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
    return {
        adapter: PostgresAdapter(pool),
        providers: [GitHub],
        async profile(profile: GitHubProfile) {
            const userInformation = await getGitHubUserProgram(profile.id);
            return {
                ...profile,
                ...userInformation,
            };
        },
        callbacks: {
            async session({ session }) {
                const userId = parseInt(session.user.id);
                session.user.userId = userId;
                const { institutionId, programName } = await getUserProgram(
                    userId
                );
                session.user.institutionId = institutionId;
                session.user.programName = programName;

                return session;
            },
        },
    };
});
