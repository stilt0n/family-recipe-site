import { useMatches } from "@remix-run/react";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";

export const useMatchesData = (id: string) => {
  const matches = useMatches();
  const route = useMemo(
    () => matches.find((route) => route.id === id),
    [matches, id]
  );
  return route?.data;
};

export const isRunningOnServer = () => {
  return typeof window === "undefined";
};

// Prevents React warning about useLayoutEffect
export const useServerLayoutEffect = isRunningOnServer()
  ? useEffect
  : useLayoutEffect;

let hasHydrated = false;
export const useIsHydrated = () => {
  const [isHydrated, setIsHydrated] = useState(hasHydrated);
  // useEffect does not run in the server render. Which means that if it runs
  // the page must be hydrated. But since the effect will also be called after
  // hydration and initially be false we need to keep track of this.
  useEffect(() => {
    setIsHydrated(true);
    hasHydrated = true;
  }, []);
  return isHydrated;
};
