import { createFormContext } from "@mantine/form";
import { SemesterInformation } from "@/types/semester";

export const [SemesterFormProvider, useSemesterFormContext, useSemesterForm] =
    createFormContext<SemesterInformation>();
