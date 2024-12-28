import SemesterForm from "@/components/semester/SemesterForm";
import { SemesterInformation } from "@/types/semester";

export default function SemesterData(props: SemesterInformation) {
    return (
        <SemesterForm
            semesterId={props.semesterId}
            semesterName={props.semesterName}
            semesterYear={props.semesterYear}
            semesterTerm={props.semesterTerm}
        />
    );
}
