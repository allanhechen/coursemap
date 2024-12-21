import SemesterForm from "@/components/semester/SemesterForm";
import { SemesterInformation } from "@/types/semester";
import { Title } from "@mantine/core";

export default function SemesterData(props: SemesterInformation) {
    console.log(props);
    return (
        <div className="flex items-center relative mt-2">
            <Title order={2}>{props.semesterName}</Title>
            <div
                className="absolute"
                style={{
                    transform: "translate(35px, 1px)",
                }}
            >
                <SemesterForm
                    semesterId={props.semesterId}
                    semesterName={props.semesterName}
                    semesterYear={props.semesterYear}
                    semesterTerm={props.semesterTerm}
                />
            </div>
        </div>
    );
}
