import { createContext } from "react";

import { SemesterDictContextType } from "@/types/semester";

export const SemesterContext = createContext<SemesterDictContextType | null>(
    null
);
