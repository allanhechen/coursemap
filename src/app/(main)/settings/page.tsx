import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageComponent from "@/app/(main)/settings/PageComponent";
import { getUserPrograms } from "@/actions/program";

export default async function Page() {
    const session = await auth();

    if (!session) {
        redirect("/signin");
    } else if (!session.user.institutionId) {
        redirect("/help");
    }

    const userPrograms = await getUserPrograms(parseInt(session.user.id!));

    return (
        <>
            <PageComponent session={session} userPrograms={userPrograms} />
        </>
    );
}
