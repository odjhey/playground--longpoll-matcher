import { nanoid } from "nanoid";
import { z } from "zod";
import { publicProcedure, router } from "../trpc/trpc";

// move me to some database
let orders: { [id: string]: { by: string; details: string } } = {};

// move me to some redis or sumthin
let matchRequests: {
  [orderId: string]:
    | { matched: true; isRetryDone: boolean; with: { name: string } }
    | { matched: false; isRetryDone: boolean };
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

  // TODO: better to create another list of below then feed both to matchmaking algo
  fulfill: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input }) => {
      return new Promise<{ failed: true } | { orderId: string }>(
        async (res, rej) => {
          let fulfillTimer = 0;
          let matchKey = "";

          // wait for orders
          // this needs to be a Sync operation,
          // lets wait for `matchReq` to be mutated outside
          // of this request
          while (true) {
            console.log("fulfillTimer", fulfillTimer);

            // wait for ~30seconds if no match, trying every second
            if (fulfillTimer > 30) {
              break;
            }
            fulfillTimer++;

            const orderKey = Object.keys(matchRequests).find((k) => {
              if (
                !matchRequests[k].isRetryDone &&
                matchRequests[k].matched === false
              ) {
                return true;
              }
            });

            if (orderKey) {
              matchKey = orderKey;
              break;
            }

            // wait for a second before retrying
            await new Promise((timerResolve, rej) => {
              setTimeout(() => {
                timerResolve({});
              }, 1000);
            });
          }

          // Warning! below is sensitive, due to reference chuchu, careful
          if (matchKey) {
            const m = matchRequests[matchKey];
            m.matched = true;
            if (m.matched) {
              m.with = { name: input.name };
            }
            res({ orderId: matchKey });
          }

          res({ failed: true });
        }
      );
    }),

  commitments: publicProcedure.query(() => {
    const keys = Object.keys(matchRequests).filter((k) => {
      return matchRequests[k].matched;
    });
    return keys;
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
          isRetryDone: false,
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

            if (matchReq.isRetryDone) {
              break;
            }

            if (matchReq.matched === true) {
              // donezos
              break;
            }

            // wait for ~30seconds if no match, trying every second
            if (timer > 30) {
              matchReq.isRetryDone = true;
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
