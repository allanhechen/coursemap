"use client";

import { ProgramInformation } from "@/types/program";
import {
    Button,
    CloseButton,
    Combobox,
    ComboboxStore,
    Input,
    InputBase,
    Stack,
    useCombobox,
} from "@mantine/core";
import {
    Dispatch,
    ReactNode,
    SetStateAction,
    useEffect,
    useState,
} from "react";

type ProgramObject = {
    [institutionId: string]: {
        [programName: string]: number[];
    };
};

export default function SelectProgram({
    buttonText,
    callback,
}: {
    buttonText: string;
    callback: (
        institutionId: number,
        programName: string,
        startingYear: number
    ) => void;
}) {
    const [institutionId, setInstitutionId] = useState<string | null>(null);
    const [programName, setProgramName] = useState<string | null>(null);
    const [startingYear, setStartingYear] = useState<number | null>(null);

    const [programs, setPrograms] = useState<ProgramObject | null>(null);
    const [institutionIdDict, setInstitutionIdDict] = useState<{
        // the type on this is a string because Object.keys() returns a string array below
        [institutionId: string]: {
            institutionName: string;
            institutionPhoto: string;
        };
    } | null>(null);

    useEffect(() => {
        async function getData() {
            try {
                const response = await fetch("/api/program");
                const json = await response.json();
                const programInformation: ProgramInformation[] =
                    json["programs"];
                const programObject: ProgramObject = {};
                const tempIdDict: {
                    [institutionId: string]: {
                        institutionName: string;
                        institutionPhoto: string;
                    };
                } = {};

                programInformation.forEach(
                    ({
                        institutionId,
                        programName,
                        startingYear,
                        institutionName,
                        institutionPhoto,
                    }) => {
                        if (programObject[institutionId]) {
                            const relatedInstitution =
                                programObject[institutionId];
                            if (relatedInstitution[programName]) {
                                relatedInstitution[programName].push(
                                    startingYear
                                );
                            } else {
                                relatedInstitution[programName] = [
                                    startingYear,
                                ];
                            }
                        } else {
                            programObject[institutionId] = {
                                [programName]: [startingYear],
                            };
                        }

                        if (!tempIdDict[institutionId]) {
                            tempIdDict[institutionId] = {
                                institutionName: institutionName,
                                institutionPhoto: institutionPhoto,
                            };
                        }
                    }
                );

                setInstitutionIdDict(tempIdDict);
                setPrograms(programObject);
            } catch (e) {
                // TODO: display a toast when this goes wrong
                console.log(e);
            }
        }
        getData();
    }, []);

    useEffect(() => {
        if (!institutionId) {
            setProgramName(null);
            setStartingYear(null);
        }
    }, [institutionId]);

    useEffect(() => {
        if (!programName) {
            setStartingYear(null);
        }
    }, [programName]);

    const institutionCombobox = useCombobox({
        onDropdownClose: () => institutionCombobox.resetSelectedOption(),
    });

    const programCombobox = useCombobox({
        onDropdownClose: () => programCombobox.resetSelectedOption(),
    });

    const yearCombobox = useCombobox({
        onDropdownClose: () => yearCombobox.resetSelectedOption(),
    });

    if (!programs || !institutionIdDict) {
        return (
            <Stack>
                <InputBase
                    component="button"
                    type="button"
                    pointer
                    rightSection={<Combobox.Chevron />}
                    rightSectionPointerEvents="none"
                    disabled
                >
                    {programName || (
                        <Input.Placeholder>
                            Select Institution
                        </Input.Placeholder>
                    )}
                </InputBase>
                <InputBase
                    component="button"
                    type="button"
                    pointer
                    rightSection={<Combobox.Chevron />}
                    rightSectionPointerEvents="none"
                    disabled
                >
                    {programName || (
                        <Input.Placeholder>Select Program</Input.Placeholder>
                    )}
                </InputBase>
                <InputBase
                    component="button"
                    type="button"
                    pointer
                    rightSection={<Combobox.Chevron />}
                    rightSectionPointerEvents="none"
                    disabled
                >
                    {programName || (
                        <Input.Placeholder>
                            Select Starting Year
                        </Input.Placeholder>
                    )}
                </InputBase>
                <Button disabled>{buttonText}</Button>
            </Stack>
        );
    }

    const institutionIds = Object.keys(programs);
    const institutionOptions = institutionIds.map((institutionId) => (
        <Combobox.Option value={institutionId} key={institutionId}>
            {institutionIdDict![institutionId].institutionName}
        </Combobox.Option>
    ));

    return (
        <Stack>
            <Combobox
                store={institutionCombobox}
                withinPortal={false}
                onOptionSubmit={(val) => {
                    setInstitutionId(val);
                    institutionCombobox.closeDropdown();
                }}
            >
                <Combobox.Target>
                    <InputBase
                        component="button"
                        type="button"
                        pointer
                        onClick={() => institutionCombobox.toggleDropdown()}
                        rightSection={
                            institutionId !== null ? (
                                <CloseButton
                                    size="sm"
                                    onMouseDown={(event) =>
                                        event.preventDefault()
                                    }
                                    onClick={() => setInstitutionId(null)}
                                    aria-label="Clear value"
                                />
                            ) : (
                                <Combobox.Chevron />
                            )
                        }
                    >
                        <div
                            style={{
                                display: "inline-block",
                                width: "97%",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {" "}
                            {(institutionId &&
                                institutionIdDict![institutionId!]
                                    .institutionName) || (
                                <Input.Placeholder>
                                    Select Institution
                                </Input.Placeholder>
                            )}
                        </div>
                    </InputBase>
                </Combobox.Target>
                <Combobox.Dropdown>
                    <Combobox.Options mah={200} style={{ overflowY: "auto" }}>
                        {institutionOptions}
                    </Combobox.Options>
                </Combobox.Dropdown>
            </Combobox>
            {(institutionId &&
                getProgramOptions(
                    programs,
                    institutionId,
                    programName,
                    setProgramName,
                    programCombobox
                )) || (
                <InputBase
                    component="button"
                    type="button"
                    pointer
                    rightSection={<Combobox.Chevron />}
                    rightSectionPointerEvents="none"
                    disabled
                >
                    {programName || (
                        <Input.Placeholder>Select Program</Input.Placeholder>
                    )}
                </InputBase>
            )}
            {(programName &&
                getYearOptions(
                    programs,
                    institutionId!,
                    programName,
                    startingYear,
                    setStartingYear,
                    yearCombobox
                )) || (
                <InputBase
                    component="button"
                    type="button"
                    pointer
                    rightSection={<Combobox.Chevron />}
                    rightSectionPointerEvents="none"
                    disabled
                >
                    {startingYear || (
                        <Input.Placeholder>
                            Select Starting year
                        </Input.Placeholder>
                    )}
                </InputBase>
            )}
            {(startingYear && (
                <Button
                    onClick={async () => {
                        callback(
                            parseInt(institutionId!),
                            programName!,
                            startingYear
                        );
                    }}
                >
                    {buttonText}
                </Button>
            )) || <Button disabled>{buttonText}</Button>}
        </Stack>
    );
}

function getProgramOptions(
    programs: ProgramObject,
    institutionId: string,
    programName: string | null,
    setProgramName: Dispatch<SetStateAction<string | null>>,
    programCombobox: ComboboxStore
): ReactNode {
    if (!institutionId) {
        return;
    }
    const programObject = programs[institutionId];
    let programNames = Object.keys(programObject);
    programNames = programNames.sort();
    const programOptions = programNames.map((programName) => (
        <Combobox.Option value={programName} key={programName}>
            {programName}
        </Combobox.Option>
    ));

    return (
        <Combobox
            store={programCombobox}
            withinPortal={false}
            onOptionSubmit={(val) => {
                setProgramName(val);
                programCombobox.closeDropdown();
            }}
        >
            <Combobox.Target>
                <InputBase
                    component="button"
                    type="button"
                    pointer
                    onClick={() => programCombobox.toggleDropdown()}
                    rightSection={
                        programName !== null ? (
                            <CloseButton
                                size="sm"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => setProgramName(null)}
                                aria-label="Clear value"
                            />
                        ) : (
                            <Combobox.Chevron />
                        )
                    }
                >
                    <div
                        style={{
                            display: "inline-block",
                            width: "97%",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {" "}
                        {programName || (
                            <Input.Placeholder>Pick Program</Input.Placeholder>
                        )}
                    </div>
                </InputBase>
            </Combobox.Target>
            <Combobox.Dropdown>
                <Combobox.Options mah={150} style={{ overflowY: "auto" }}>
                    {programOptions}
                </Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
}

function getYearOptions(
    programs: ProgramObject,
    institutionId: string,
    programName: string,
    startingYear: number | null,
    setStartingYear: Dispatch<SetStateAction<number | null>>,
    programCombobox: ComboboxStore
): ReactNode {
    if (!programName || !institutionId) {
        return;
    }
    let yearArray = programs[institutionId][programName];
    yearArray = yearArray.sort((a, b) => b - a);
    const programOptions = yearArray.map((year) => (
        <Combobox.Option value={year.toString()} key={year}>
            {year}
        </Combobox.Option>
    ));

    return (
        <Combobox
            store={programCombobox}
            withinPortal={false}
            onOptionSubmit={(val) => {
                setStartingYear(parseInt(val));
                programCombobox.closeDropdown();
            }}
        >
            <Combobox.Target>
                <InputBase
                    component="button"
                    type="button"
                    pointer
                    onClick={() => programCombobox.toggleDropdown()}
                    rightSection={
                        programName !== null ? (
                            <CloseButton
                                size="sm"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => setStartingYear(null)}
                                aria-label="Clear value"
                            />
                        ) : (
                            <Combobox.Chevron />
                        )
                    }
                >
                    {startingYear || (
                        <Input.Placeholder>
                            Pick Starting Year
                        </Input.Placeholder>
                    )}
                </InputBase>
            </Combobox.Target>
            <Combobox.Dropdown>
                <Combobox.Options mah={100} style={{ overflowY: "auto" }}>
                    {programOptions}
                </Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
}
