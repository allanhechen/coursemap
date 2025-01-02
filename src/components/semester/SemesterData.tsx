import SemesterForm from "@/components/semester/SemesterForm";
import { SemesterInformation } from "@/types/semester";

export default function SemesterData(props: SemesterInformation) {
    return <SemesterForm {...props} />;
}
