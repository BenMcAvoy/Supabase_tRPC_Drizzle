import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../backend/src/router.mjs";

export const trpc = createTRPCReact<AppRouter>();
