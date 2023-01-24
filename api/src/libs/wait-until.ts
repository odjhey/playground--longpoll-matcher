export async function waitUntil<S extends Record<string, any>, D>(
  p: {
    initState: S;
    doStillWaitPredicate: (state: S) => Promise<[boolean, S]> | [boolean, S];
    waitFn: () => Promise<unknown>;
    fin: (state: S) => D;
  },
  options: { maxRetries: number } = { maxRetries: 30 }
): Promise<{ ok: false; message: string } | { ok: true; data: D }> {
  let currentState = p.initState;

  // this is a forced timeout/hard timeout to avoid forever loops
  const maxRetries = options.maxRetries;
  let retryInfo = { count: 0, hasTimedOut: false };

  while (true) {
    // check timeout
    retryInfo.count++;
    if (retryInfo.count > maxRetries) {
      retryInfo.hasTimedOut = true;
      break;
    }

    const [isDone, newState] = await p.doStillWaitPredicate(currentState);
    currentState = newState;
    if (isDone) {
      break;
    }

    await p.waitFn();
  }

  if (retryInfo.hasTimedOut) {
    return { ok: false, message: "Timeout" };
  }

  return { ok: true, data: p.fin(currentState) };
}
