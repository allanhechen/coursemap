import SemesterForm from "@/components/semester/SemesterForm";
import { SemesterTerm } from "@/types/semester";

interface SemesterDataProps {
    semesterId: number;
    semesterName: string;
    semesterYear: Date;
    semesterTerm: SemesterTerm;
}

export default function SemesterData(props: SemesterDataProps) {
    return <SemesterForm {...props} />;
}
