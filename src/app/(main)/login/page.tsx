import { signIn, auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
    const session = await auth();

    if (session) {
        redirect("/dashboard/overview");
    }

    console.log(session);
    return (
        <>
            <form
                action={async () => {
                    "use server";
                    await signIn("github");
                }}
            >
                <button type="submit">Signin with GitHub</button>
            </form>
        </>
    );
}
