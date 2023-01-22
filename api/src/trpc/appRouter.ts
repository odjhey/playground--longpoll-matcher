import { router } from "./trpc";
import { apiRouter } from "../trpc-services/api";

export const appRouter = router({
  api: apiRouter,
});

export type AppRouter = typeof appRouter;
