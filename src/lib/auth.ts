import "@/lib/db";
import ws from "ws";
import { Pool, neonConfig } from "@neondatabase/serverless";

import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import PostgresAdapter from "@auth/pg-adapter";

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
    neonConfig.webSocketConstructor = ws;
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
    return {
        adapter: PostgresAdapter(pool),
        providers: [GitHub],
    };
});
