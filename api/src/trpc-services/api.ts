import { z } from "zod";
import { publicProcedure, router } from "../trpc/trpc";

export const apiRouter = router({
  version: publicProcedure.query(() => {
    return { version: "0.0.1" };
  }),
  hello: publicProcedure
    .input(
      z
        .object({ username: z.string().nullish(), greeting: z.string() })
        .nullish()
    )
    .query(({ input, ctx }) => {
      return {
        text: `hello ${input?.username ?? ctx.user?.name ?? "world"}, ${
          input?.greeting
        }`,
      };
    }),
});
