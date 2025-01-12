import { CourseSemesterContext } from "@/app/(main)/dashboard/courses/courseSemesterContext";
import { SemesterInformation } from "@/types/semester";
import { Combobox, Input, InputBase, useCombobox } from "@mantine/core";
import { useContext } from "react";

export default function CourseCardForm({
    courseCode,
    semesters,
    selectSemester,
}: {
    courseCode: string;
    semesters: {
        [semesterId: number]: SemesterInformation;
    };
    selectSemester: (
        courseCode: string,
        semesterId: number | undefined
    ) => void;
}) {
    const courseSemesterContextItem = useContext(CourseSemesterContext);
    if (!courseSemesterContextItem) {
        throw new Error(
            "DashboardComponent must be used in a CourseSemesterContext"
        );
    }
    const [relatedSemesterId] = courseSemesterContextItem;

    const combobox = useCombobox();
    const options = [];
    const selection = relatedSemesterId[courseCode];

    console.log(relatedSemesterId);

    for (const key in semesters) {
        const semester = semesters[key];
        options.push(
            <Combobox.Option
                value={semester.semesterId.toString()}
                key={semester.semesterId}
            >
                {`${semester.semesterYear.getFullYear()}${
                    semester.semesterTerm
                } - ${semester.semesterName}`}
            </Combobox.Option>
        );
    }

    return (
        <Combobox
            store={combobox}
            onOptionSubmit={(semesterIdString: string | undefined) => {
                let semesterId;
                if (semesterIdString) {
                    semesterId = Number(semesterIdString);
                }
                selectSemester(courseCode, semesterId);
                combobox.closeDropdown();
            }}
        >
            <Combobox.Target>
                <InputBase
                    component="button"
                    type="button"
                    pointer
                    onClick={() => combobox.toggleDropdown()}
                    rightSection={<Combobox.Chevron />}
                >
                    {selection ? (
                        `${semesters[selection].semesterYear.getFullYear()}${
                            semesters[selection].semesterTerm
                        } - ${semesters[selection].semesterName}`
                    ) : (
                        <Input.Placeholder>Pick Value</Input.Placeholder>
                    )}
                </InputBase>
            </Combobox.Target>

            <Combobox.Dropdown>
                <Combobox.Options>{options}</Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
}
