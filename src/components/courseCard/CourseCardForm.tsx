import { CourseSemesterContext } from "@/app/(main)/dashboard/courses/courseSemesterContext";
import { SemesterContext } from "@/app/(main)/dashboard/courses/semesterContext";
import eventBus from "@/lib/eventBus";
import { useCheckPrerequisites } from "@/lib/tree";
import { SemesterInformation, termOrder } from "@/types/semester";
import {
    CloseButton,
    Combobox,
    Input,
    InputBase,
    useCombobox,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ReactNode, useContext, useEffect, useRef } from "react";

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
    const comboboxRef = useRef(combobox);
    const { checkPrerequisites } = useCheckPrerequisites();
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

    // https://stackoverflow.com/questions/71277021/react-redux-useeffect-useselector-stale-closures-and-event-listeners
    // In short, the event listener points to a stale reference
    // We get around this with useRef but we also need to update the ref when combobox changes
    useEffect(() => {
        comboboxRef.current = combobox;
    }, [combobox]);

    useEffect(() => {
        const closeHandler = () => {
            comboboxRef.current?.closeDropdown();
        };

        eventBus.addEventListener("closeDropdowns", closeHandler);

        return () => {
            eventBus.removeEventListener("closeDropdowns", closeHandler);
        };
    }, []);

    return (
        <Combobox
            store={combobox}
            onOptionSubmit={async (semesterIdString: string | undefined) => {
                let semesterId;
                try {
                    if (semesterIdString) {
                        semesterId = parseInt(semesterIdString);
                        const response = await fetch("/api/course/semesters", {
                            method: "PUT",
                            body: JSON.stringify({
                                courseIds: [courseId],
                                semesterId: semesterId,
                                courseIdToDelete: courseId,
                            }),
                        });
                        if (!response.ok) {
                            throw new Error("Coursesemester API called failed");
                        }
                    }
                } catch {
                    notifications.show({
                        withCloseButton: false,
                        autoClose: false,
                        title: "Error updating course semester",
                        message:
                            "API call to update course semester failed, please reload the page",
                        color: "red",
                        className: "mt-2 transition-transform",
                    });
                }

                selectSemester(courseCode, semesterId);
                combobox.closeDropdown();
                if (semesterId) {
                    relatedSemesterId[courseCode] = semesterId;
                } else {
                    delete relatedSemesterId[courseCode];
                }
                checkPrerequisites(relatedSemesterId, semesterDict);
            }}
        >
            <Combobox.Target>
                <InputBase
                    component="button"
                    type="button"
                    pointer
                    onClick={() => {
                        combobox.openDropdown();
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
                                    try {
                                        const response = await fetch(
                                            "/api/course/semesters?" + params,
                                            {
                                                method: "DELETE",
                                            }
                                        );
                                        if (!response.ok) {
                                        }
                                    } catch {
                                        notifications.show({
                                            withCloseButton: false,
                                            autoClose: false,
                                            title: "Error updating course semester",
                                            message:
                                                "API call to update course semester failed, please reload the page",
                                            color: "red",
                                            className:
                                                "mt-2 transition-transform",
                                        });
                                    }
                                    delete relatedSemesterId[courseCode];

                                    checkPrerequisites(
                                        relatedSemesterId,
                                        semesterDict
                                    );
                                }}
                                aria-label="Clear value"
                            />
                        ) : (
                            <Combobox.Chevron />
                        )
                    }
                    c="white"
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
