import { useRef } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useDebouncedFunction = <T extends Array<any>>(
  fn: (...args: T) => void,
  ms: number
) => {
  // using ref instead of state because refs do not trigger ui re-renders while state does
  const timeoutId = useRef<ReturnType<typeof setTimeout>>();
  const debouncedFn = (...args: T) => {
    clearTimeout(timeoutId.current);
    timeoutId.current = setTimeout(() => {
      fn(...args);
    }, ms);
  };

  return debouncedFn;
};
