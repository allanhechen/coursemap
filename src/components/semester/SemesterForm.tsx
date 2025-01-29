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
import { SemesterDict, SemesterTerm } from "@/types/semester";
import { SemesterContext } from "@/app/(main)/dashboard/courses/semesterContext";
import "@/components/semester/SemesterForm.css";
import { Session } from "next-auth";
import { SessionContext } from "@/components/sessionContext";

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

    const session = useContext(SessionContext)!;
    let updateNodes: ((session: Session) => Promise<number>) | null = null;
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

    const handleDelete = useCallback(async () => {
        try {
            const params = new URLSearchParams("");
            params.append("semesterId", semesterId!.toString());
            await fetch("/api/semester?" + params, {
                method: "DELETE",
            });
            if (updateNodes) {
                updateNodes(session);
            }
            close();
        } catch (e) {
            console.log(e);
            // TODO: handle this error
        }
    }, [close, semesterId, session, updateNodes]);

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
                        // TODO: Add some client side validation to make sure name and year are filled
                        try {
                            if (semesterId) {
                                await fetch("/api/semester", {
                                    method: "PUT",
                                    body: JSON.stringify({
                                        semesterId: semesterId,
                                        semesterName: values.semesterName,
                                        semesterYear:
                                            values.semesterYear.getFullYear(),
                                        semesterTerm: values.semesterTerm,
                                    }),
                                });
                            } else {
                                const semesterResponse = await fetch(
                                    "/api/semester",
                                    {
                                        method: "POST",
                                        body: JSON.stringify({
                                            semesterName: values.semesterName,
                                            semesterYear:
                                                values.semesterYear.getFullYear(),
                                            semesterTerm: values.semesterTerm,
                                        }),
                                    }
                                );
                                const { semesterId } =
                                    await semesterResponse.json();
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
                        } catch (e) {
                            // TODO: add notification when this goes wrong
                            console.log(e);
                        }

                        if (updateNodes) {
                            updateNodes(session);
                        }
                        close();
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

                    <div className="mt-5 mb-3 flex justify-between">
                        <Button type="submit">Submit</Button>
                        {semesterId && (
                            <Button color="red" onClick={handleDelete}>
                                Delete
                            </Button>
                        )}
                    </div>
                </form>
            </Modal>
            <div className="cursor-pointer relative" onClick={openedWrapper}>
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
                                right: 0,
                                transform: "translate(20px, -1px)",
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
