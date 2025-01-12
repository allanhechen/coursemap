"use client";

import { useDisclosure } from "@mantine/hooks";
import {
    Modal,
    TextInput,
    SegmentedControl,
    Button,
    Input,
    Title,
} from "@mantine/core";
import { YearPickerInput } from "@mantine/dates";
import { useCallback, useContext, useState } from "react";
import { IconEdit } from "@tabler/icons-react";

import { useSemesterFormContext } from "@/components/semester/semesterFormContext";

import { useUpdateNodes } from "@/lib/placement";
import { putSemester, updateSemester } from "@/lib/actions/semester";
import { SemesterDict, SemesterTerm } from "@/types/semester";
import { SemesterContext } from "@/app/(main)/dashboard/courses/semesterContext";
import "@/components/semester/SemesterForm.css";

// semseterForm will be called in two places
// the first is the create page on a semester, where all fields will initially be fileld in
// data is gathered from dashboard component and then sent to semesters
// the semester displays the data using semester data
// semesterdata calls semesterform which is a modal on update

// the second is the edit page on a semester, where all fields except programName will be blank

export default function SemesterForm({
    semesterId,
    semesterName,
    semesterYear,
    semesterTerm,
}: {
    semesterId?: number;
    semesterName?: string;
    semesterYear?: Date;
    semesterTerm?: SemesterTerm;
}) {
    const [opened, { open, close }] = useDisclosure(false);
    const [visible, setVisible] = useState(false);

    let updateNodes: () => Promise<number> | undefined;
    let semesterDict: SemesterDict | undefined;
    let setSemesterDict:
        | React.Dispatch<React.SetStateAction<SemesterDict>>
        | undefined;

    try {
        const result = useUpdateNodes();
        updateNodes = result.updateNodes;
    } catch {}

    try {
        const semesterContextType = useContext(SemesterContext);
        [semesterDict, setSemesterDict] = semesterContextType!;
    } catch {}

    const onMouseEnter = useCallback(() => {
        setVisible(true);
    }, []);

    const onMouseLeave = useCallback(() => {
        setVisible(false);
    }, []);

    const form = useSemesterFormContext();

    const openedWrapper = useCallback(() => {
        form.setValues({
            semesterName: semesterName ? semesterName : "",
            semesterYear: semesterYear ? semesterYear : new Date(2024, 0, 1),
            semesterTerm: semesterTerm ? semesterTerm : SemesterTerm.FA,
        });
        open();
    }, [form, open, semesterName, semesterTerm, semesterYear]);

    return (
        <>
            <Modal
                // lockScroll introduces a bar onto position absolute elements
                lockScroll={false}
                opened={opened}
                onClose={close}
                title={semesterId ? "Edit Semester" : "Add Semester"}
                centered
                overlayProps={{
                    backgroundOpacity: 0.55,
                    blur: 3,
                }}
            >
                <form
                    onSubmit={form.onSubmit(async (values) => {
                        if (semesterId) {
                            updateSemester(
                                semesterId,
                                values.semesterName,
                                values.semesterYear,
                                values.semesterTerm
                            );
                        } else {
                            semesterId = await putSemester(
                                values.semesterName,
                                values.semesterYear,
                                values.semesterTerm
                            );
                            if (semesterDict && setSemesterDict) {
                                const newSemesterDict = {
                                    ...semesterDict,
                                    [semesterId]: {
                                        semesterId: semesterId,
                                        semesterName: values.semesterName,
                                        semesterYear: values.semesterYear,
                                        semesterTerm: values.semesterTerm,
                                    },
                                };
                                setSemesterDict(newSemesterDict);
                            }
                        }

                        if (updateNodes) {
                            updateNodes();
                        }
                    })}
                >
                    <div className="mt-3">
                        <TextInput
                            label="Name"
                            placeholder="Enter Semester Name"
                            key={form.key("semesterName")}
                            {...form.getInputProps("semesterName")}
                            className=""
                        />
                    </div>

                    <div className="mt-3">
                        <YearPickerInput
                            label="Year"
                            placeholder="Enter Semester Year"
                            key={form.key("semesterYear")}
                            {...form.getInputProps("semesterYear")}
                        />
                    </div>
                    <div className="mt-3">
                        <Input.Label>Term</Input.Label>
                        <div>
                            <SegmentedControl
                                key={form.key("semesterTerm")}
                                data={Object.values(SemesterTerm)}
                                {...form.getInputProps("semesterTerm")}
                            />
                        </div>
                    </div>

                    <Button className="mt-5 mb-3" type="submit">
                        Submit
                    </Button>
                </form>
            </Modal>
            <div className="cursor-pointer" onClick={openedWrapper}>
                {semesterName ? (
                    <div
                        className="flex items-center relative mt-2 pr-2"
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                    >
                        <Title order={2}>{semesterName}</Title>
                        <div
                            className="absolute edit-icon"
                            style={{
                                transform: "translate(35px, 1px)",
                                opacity: visible ? 1 : 0,
                            }}
                        >
                            <IconEdit />
                        </div>
                    </div>
                ) : (
                    <Button>Add Semester</Button>
                )}
            </div>
        </>
    );
}
