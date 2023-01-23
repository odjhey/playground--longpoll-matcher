import { router } from "./trpc";
import { apiRouter } from "../trpc-services/api";
import { ordersRouter } from "../trpc-services/orders";

export const appRouter = router({
  api: apiRouter,
  orders: ordersRouter,
});

export type AppRouter = typeof appRouter;
