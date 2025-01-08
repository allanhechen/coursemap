import { signIn, auth, signOut } from "@/lib/auth";

export default async function Page() {
    const session = await auth();

    console.log(session);
    return (
        <>
            {session ? (
                <>
                    <p
                        onClick={async () => {
                            "use server";
                            await signOut();
                        }}
                    >
                        HI {session.user!.name!}
                    </p>
                </>
            ) : (
                <form
                    action={async () => {
                        "use server";
                        await signIn("github");
                    }}
                >
                    <button type="submit">Signin with GitHub</button>
                </form>
            )}
        </>
    );
}
