import { CourseSemesterContext } from "@/app/(main)/dashboard/courses/courseSemesterContext";
import { SemesterContext } from "@/app/(main)/dashboard/courses/semesterContext";
import { SemesterInformation, termOrder } from "@/types/semester";
import {
    CloseButton,
    Combobox,
    Input,
    InputBase,
    useCombobox,
} from "@mantine/core";
import { ReactNode, useContext } from "react";

export default function CourseCardForm({
    courseId,
    courseCode,
    selectSemester,
}: {
    courseId: number;
    courseCode: string;
    selectSemester: (
        courseCode: string,
        semesterId: number | undefined
    ) => void;
}) {
    const semesterDictContextItem = useContext(SemesterContext);
    if (!semesterDictContextItem) {
        throw new Error("CourseCardForm must be used in a SemesterContext");
    }
    const [semesterDict] = semesterDictContextItem;

    const courseSemesterContextItem = useContext(CourseSemesterContext);
    if (!courseSemesterContextItem) {
        throw new Error(
            "CourseCardForm must be used in a CourseSemesterContext"
        );
    }
    const [relatedSemesterId] = courseSemesterContextItem;

    const combobox = useCombobox();
    const options: ReactNode[] = [];
    let orderedSemesters: SemesterInformation[] = [];
    const selection = relatedSemesterId[courseCode];

    // the following is run per semester, but must be done because the semesters are put in a dict
    for (const key in semesterDict) {
        const semester = semesterDict[key];
        orderedSemesters.push(semester);
    }
    orderedSemesters = orderedSemesters.sort((a, b) => {
        if (a.semesterYear.getFullYear() != b.semesterYear.getFullYear()) {
            return a.semesterYear.getFullYear() - b.semesterYear.getFullYear();
        } else {
            return termOrder[a.semesterTerm] - termOrder[b.semesterTerm];
        }
    });

    orderedSemesters.forEach((semester) => {
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
    });

    return (
        <Combobox
            store={combobox}
            onOptionSubmit={async (semesterIdString: string | undefined) => {
                let semesterId;
                try {
                    if (semesterIdString) {
                        semesterId = parseInt(semesterIdString);
                        await fetch("/api/course/semesters", {
                            method: "PUT",
                            body: JSON.stringify({
                                courseIds: [courseId],
                                semesterId: semesterId,
                            }),
                        });
                    }
                } catch (e) {
                    console.log(e);
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
                    onClick={() => {
                        combobox.toggleDropdown();
                    }}
                    rightSection={
                        selection !== null ? (
                            <CloseButton
                                size="sm"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={async () => {
                                    selectSemester(courseCode, undefined);
                                    const params = new URLSearchParams("");
                                    params.append(
                                        "courseId",
                                        courseId.toString()
                                    );
                                    await fetch(
                                        "/api/course/semesters?" + params,
                                        {
                                            method: "DELETE",
                                        }
                                    );
                                }}
                                aria-label="Clear value"
                            />
                        ) : (
                            <Combobox.Chevron />
                        )
                    }
                >
                    {selection ? (
                        `${semesterDict[selection].semesterYear.getFullYear()}${
                            semesterDict[selection].semesterTerm
                        } - ${semesterDict[selection].semesterName}`
                    ) : (
                        <Input.Placeholder>
                            Course Not Included
                        </Input.Placeholder>
                    )}
                </InputBase>
            </Combobox.Target>

            <Combobox.Dropdown>
                <Combobox.Options>{options}</Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
}
