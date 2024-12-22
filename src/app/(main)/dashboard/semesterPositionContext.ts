import { SemesterPositionContextType } from "@/types/semester";

import { createContext } from "react";

export const SemesterPositionContext =
    createContext<SemesterPositionContextType | null>(null);
