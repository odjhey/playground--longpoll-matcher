import { nanoid } from "nanoid";
import { z } from "zod";
import { publicProcedure, router } from "../trpc/trpc";

// move me to some database
let orders: { [id: string]: { by: string; details: string } } = {};

// move me to some redis or sumthin
let matchRequests: {
  [orderId: string]:
    | { matched: true; isDone: boolean; with: { name: string } }
    | { matched: false; isDone: boolean };
} = {};

export const ordersRouter = router({
  list: publicProcedure.query(() => {
    return orders;
  }),
  clear: publicProcedure.mutation(() => {
    orders = {};
    return orders;
  }),
  new: publicProcedure
    .input(z.object({ by: z.string(), details: z.string() }))
    .mutation(({ input }) => {
      const { by, details } = input;
      const key = nanoid();
      orders[key] = { by, details };
      return orders;
    }),

  // we can also use a 2-step proccess for finer request tracking
  // request Id, so client takes a hold of a reqId, then let client operate with that reqId until fulfilled
  // Warning: this is a long polling operation, will not return agad and will wait indefinitely (or until timeout config is met)
  findMatch: publicProcedure
    .input(z.object({ orderId: z.string() }))
    .mutation(({ input }) => {
      if (!matchRequests[input.orderId]) {
        // init
        matchRequests[input.orderId] = {
          matched: false,
          isDone: false,
        };
      }

      const matchReq = matchRequests[input.orderId];

      // Caution, this could be a main source of damning leaks
      return new Promise<{ with: { name: string } } | { failed: true }>(
        async (res, rej) => {
          let timer = 0;

          // this needs to be a Sync operation,
          // lets wait for `matchReq` to be mutated outside
          // of this request
          while (true) {
            console.log("timer", timer);

            if (matchReq.isDone) {
              break;
            }

            if (matchReq.matched === true) {
              // donezos
              break;
            }

            // wait for ~30seconds if no match, trying every second
            if (timer > 30) {
              matchReq.isDone = true;
              break;
            }
            timer++;

            // wait for a second before retrying
            await new Promise((timerResolve, rej) => {
              setTimeout(() => {
                timerResolve({});
              }, 1000);
            });
          }

          if (matchReq.matched) {
            res({ with: matchReq.with });
          } else {
            res({ failed: true });
          }
        }
      );
    }),
});
