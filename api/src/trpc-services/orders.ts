import { randomUUID } from "crypto";
import { z } from "zod";
import { publicProcedure, router } from "../trpc/trpc";

// move me to redis or sumthing
let orders: { [k: string]: { by: string; details: string } } = {
  reqid123: {
    by: "john",
    details: "some orders here",
  },
};

export const ordersRouter = router({
  list: publicProcedure.query(() => {
    return orders;
  }),
  new: publicProcedure
    .input(z.object({ by: z.string(), details: z.string() }))
    .mutation(({ input }) => {
      const { by, details } = input;
      const key = randomUUID();
      orders[key] = { by, details };
      return orders;
    }),
});
