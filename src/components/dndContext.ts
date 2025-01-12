import { createContext } from "react";

import { DnDContextType } from "@/types/dnd";

export const DnDContext = createContext<DnDContextType | null>(null);
