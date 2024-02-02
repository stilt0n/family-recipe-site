import { z } from "zod";

export type FieldErrors = { [key: string]: string };

export const validateForm = <T>(
  formData: FormData,
  schema: z.Schema<T>,
  onSuccess: (data: T) => unknown,
  onError: (errors: FieldErrors) => unknown
) => {
  const result = schema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    const errors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join(".");
      errors[path] = issue.message;
    }
    return onError(errors);
  }
  return onSuccess(result.data);
};
