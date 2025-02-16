import { createContext } from "react";

import { NodeContextType } from "@/types/courseCard";

export const NodeContext = createContext<NodeContextType | null>(null);
