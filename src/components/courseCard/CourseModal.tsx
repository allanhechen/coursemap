import { CourseInformation } from "@/types/courseCard";
import { Button, Divider, Group, Text, Title } from "@mantine/core";
import Chip from "../chip/Chip";
import { getChipDescription } from "@/types/chipVariant";
import Link from "next/link";

export default function CourseModal({
    courseInformation,
    termWarning,
    requisiteWarning,
}: {
    courseInformation: CourseInformation;
    termWarning: boolean | undefined;
    requisiteWarning: boolean | undefined;
}) {
    return (
        <div
            className="flex flex-wrap max-w-6xl items-center"
            style={{
                width: "calc(100vw - 2 * var(--modal-x-offset) - 2 * var(--mantine-spacing-md))",
            }}
        >
            <div className="min-w-[450px] flex-1 p-3">
                <Title order={1} className="inline-block mr-2">
                    {courseInformation.courseName}
                </Title>
                <Title order={1} className="inline-block">
                    ({courseInformation.courseCode})
                </Title>
                <Group className="mt-3">
                    <Link
                        href={`/dashboard/courses/${courseInformation.courseId}`}
                    >
                        <Button color="green">Prerequisite Tree</Button>
                    </Link>
                    <Link href={courseInformation.externalLink} target="_blank">
                        <Button>External Link</Button>
                    </Link>
                </Group>
                <Divider my="md" />
                <Title order={3}>Attributes</Title>
                <Group gap="xs" className="flex mt-3">
                    {courseInformation.chips.map((chip) => {
                        return (
                            <div
                                className="w-full"
                                key={courseInformation.courseCode + chip}
                            >
                                <div className="w-[100px] inline-block">
                                    <Chip
                                        variant={chip}
                                        filled
                                        clickable={false}
                                    />
                                </div>
                                <Text className="inline-block w-9/12">
                                    {getChipDescription(chip)}
                                </Text>
                            </div>
                        );
                    })}
                </Group>
                {termWarning || requisiteWarning ? (
                    <>
                        <Divider my="md" />
                        <Title order={3} className="mb-3">
                            Warnings
                        </Title>
                        {termWarning ? (
                            <Text>
                                - Course typically does not run in this semester
                            </Text>
                        ) : (
                            ""
                        )}
                        {requisiteWarning ? (
                            <Text>
                                - Course&apos;s prerequisites are not met
                            </Text>
                        ) : (
                            ""
                        )}
                    </>
                ) : (
                    ""
                )}
            </div>
            <div className="min-w-[450px] flex-1 p-3">
                <Text>{courseInformation.courseDescription}</Text>
            </div>
        </div>
    );
}
