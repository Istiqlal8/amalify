import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

// The server snapshot is used while rendering on the server and during hydration; the client
// snapshot takes over once hydrated. Nothing is subscribed to: the value never changes after that.
export function useClientOnlyValue<S, C>(server: S, client: C): S | C {
  return useSyncExternalStore<S | C>(
    subscribe,
    () => client,
    () => server,
  );
}
