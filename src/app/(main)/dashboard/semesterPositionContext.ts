import { createContext } from "react";

import { SemesterPositionContextType } from "@/types/semester";

export const SemesterPositionContext =
    createContext<SemesterPositionContextType | null>(null);
