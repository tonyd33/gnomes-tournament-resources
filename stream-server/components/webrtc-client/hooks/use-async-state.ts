import { DependencyList, useState } from "react";
import { useStableCallback } from "./use-stable-callback";
import { pipe, tap } from "@/lib/fp";

type AsyncState<T> =
  | { status: "nothing" }
  | { status: "loading" }
  | { status: "ok"; data: T }
  | { status: "err"; err: unknown };

export function useAsyncState<ArgT, RetT>(
  call: (...args: ArgT[]) => Promise<RetT>,
  deps: DependencyList
) {
  const [state, setState] = useState<AsyncState<RetT>>({ status: "nothing" });

  const wrappedCall = useStableCallback(
    (
      ...args: ArgT[]
    ): Promise<
      { status: "ok"; data: RetT } | { status: "err"; err: unknown }
    > => {
      setState({ status: "loading" });
      return call(...args)
        .then(
          pipe(
            (data) => ({ status: "ok" as const, data }),
            tap((x) => setState(x))
          )
        )
        .catch(
          pipe(
            (err) => ({ status: "err" as const, err }),
            tap((x) => setState(x))
          )
        );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [call, ...deps]
  );

  return { call: wrappedCall, state };
}
