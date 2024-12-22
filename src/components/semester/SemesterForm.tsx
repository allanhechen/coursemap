"use client";

import { useDisclosure } from "@mantine/hooks";
import {
    Modal,
    TextInput,
    SegmentedControl,
    Button,
    Input,
} from "@mantine/core";
import { YearPickerInput } from "@mantine/dates";
import { SemesterTerm } from "@/types/semester";
import { useSemesterFormContext } from "./semesterFormContext";
import { putSemester, updateSemester } from "@/lib/actions/semester";
import { useCallback } from "react";
import { IconEdit, IconCirclePlus } from "@tabler/icons-react";

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
                    onSubmit={form.onSubmit((values) => {
                        if (semesterId) {
                            updateSemester(
                                semesterId,
                                values.semesterName,
                                values.semesterYear,
                                values.semesterTerm
                            );
                        } else {
                            putSemester(
                                values.semesterName,
                                values.semesterYear,
                                values.semesterTerm
                            );
                        }

                        // we might need to reorder the semesters
                        // this workaround forces a page refresh so it is guaranteed to get the up to date semesters
                        // i will figure out how to redraw the semesters without triggering a full refresh
                        // but as of right now this is already implemented on initial page load
                        // perhaps we can usecallback -> get data using server action -> recreate reactflowprovider?
                        setTimeout(function () {
                            window.location.reload();
                        }, 1000);
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
                        <Input.Label>Hello World</Input.Label>
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
                    <>
                        <IconEdit />
                    </>
                ) : (
                    <IconCirclePlus size="2rem" />
                )}
            </div>
        </>
    );
}
