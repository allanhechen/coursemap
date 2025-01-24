import "@/lib/db";
import ws from "ws";
import { Pool, neonConfig } from "@neondatabase/serverless";
import NextAuth, { DefaultSession } from "next-auth";
import type { Provider } from "next-auth/providers";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";

import PostgresAdapter from "@auth/pg-adapter";

import { getActiveUserProgram, updateUserProgram } from "@/actions/program";

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

const providers: Provider[] = [GitHub, Google, Discord];

export const providerMap = providers.map((provider) => {
    if (typeof provider === "function") {
        const providerData = provider();
        return { id: providerData.id, name: providerData.name };
    } else {
        return { id: provider.id, name: provider.name };
    }
});

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
    neonConfig.webSocketConstructor = ws;
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
    return {
        adapter: PostgresAdapter(pool),
        providers: providers,
        callbacks: {
            async session({ session, trigger, newSession }) {
                if (trigger === "update") {
                    const { userId, institutionId, programName, startingYear } =
                        newSession.user;
                    await updateUserProgram(
                        userId,
                        institutionId,
                        programName,
                        startingYear
                    );
                    return newSession;
                }
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
