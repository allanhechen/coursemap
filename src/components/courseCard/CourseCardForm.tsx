import { CourseSemesterContext } from "@/app/(main)/dashboard/courses/courseSemesterContext";
import { SemesterContext } from "@/app/(main)/dashboard/courses/semesterContext";
import { Combobox, Input, InputBase, useCombobox } from "@mantine/core";
import { useContext } from "react";

export default function CourseCardForm({
    courseCode,
    selectSemester,
}: {
    courseCode: string;
    selectSemester: (
        courseCode: string,
        semesterId: number | undefined
    ) => void;
}) {
    const semesterDictContextItem = useContext(SemesterContext);
    if (!semesterDictContextItem) {
        throw new Error("DashboardComponent must be used in a SemesterContext");
    }
    const [semesterDict] = semesterDictContextItem;

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

    for (const key in semesterDict) {
        const semester = semesterDict[key];
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
                        `${semesterDict[selection].semesterYear.getFullYear()}${
                            semesterDict[selection].semesterTerm
                        } - ${semesterDict[selection].semesterName}`
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
