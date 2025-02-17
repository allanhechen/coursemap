import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageComponent from "@/app/(main)/settings/PageComponent";

export default async function Page() {
    const session = await auth();

    if (!session) {
        redirect("/signin");
    } else if (!session.user.institutionId) {
        redirect("/help");
    }

    return (
        <>
            <PageComponent session={session} />
        </>
    );
}
