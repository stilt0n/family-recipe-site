import { FieldErrors } from "./validation";
// This could be avoided by using `useFetcher<typeof action>` but
// the action is in the parent component. So this will need to be
// refactored to avoid this cast to `any`
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getFetcherErrors = (fetcher: any): FieldErrors | undefined => {
  return fetcher?.data?.errors;
};
