import { useMatches } from "@remix-run/react";
import { useEffect, useLayoutEffect, useMemo } from "react";

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
