import { nanoid } from "nanoid";
import { z } from "zod";
import { waitOneSec, waitUntil } from "../libs/wait-until";
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
  reset: publicProcedure.mutation(() => {
    orders = {};
    matchRequests = {};
  }),
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
    .mutation(async ({ input }) => {
      const v = await waitUntil({
        initState: { matchKey: "" },
        doStillWaitPredicate: (prevState) => {
          const orderKey = Object.keys(matchRequests).find((k) => {
            if (
              !matchRequests[k].isRetryDone &&
              matchRequests[k].matched === false
            ) {
              return true;
            }
          });

          if (orderKey) {
            return [true, { matchKey: orderKey }];
          }
          return [false, prevState];
        },
        waitFn: waitOneSec,
        afterSuccess: (state) => {
          // Warning! below is sensitive, due to reference chuchu, careful
          const m = matchRequests[state.matchKey];
          m.matched = true;
          if (m.matched) {
            m.with = { name: input.name };
          }
          return { orderId: state.matchKey };
        },
      });

      if (v.ok) {
        return v.data;
      }

      return { failed: true, message: v.message };
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
    .mutation(async ({ input }) => {
      if (!matchRequests[input.orderId]) {
        // init
        matchRequests[input.orderId] = {
          matched: false,
          isRetryDone: false,
        };
      }

      const matchReq = matchRequests[input.orderId];

      const v = await waitUntil({
        initState: {},
        waitFn: waitOneSec,
        doStillWaitPredicate: (prevState) => {
          // this needs to be a Sync operation,
          // lets wait for `matchReq` to be mutated outside
          // of this request
          if (matchReq.matched === true) {
            return [true, prevState];
          }
          return [false, prevState];
        },
        afterSuccess: () => {
          if (matchReq.matched) {
            return { with: matchReq.with };
          }
          return { with: "" };
        },
      });

      matchReq.isRetryDone = true;
      if (v.ok) {
        return v.data;
      }

      return { failed: true, message: v.message };
    }),
});
