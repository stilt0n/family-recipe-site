import { json } from "@remix-run/node";
import { z } from "zod";

export type FieldErrors = { [key: string]: string };

type FormFields = {
  [key: string]: FormDataEntryValue | FormDataEntryValue[];
};

// Using Object.fromEntries does not work in this case because
// when the provided array has multiple copies of the same key
// Object.fromEntries will overwrite the value instead of appending
// We could determine this from if there are multiple values but we
// still want single value arrays to be arrays since that's what zod
// expects. So we will have to mark array fields' names to indicate
// the are arrays.
const objectify = (formData: FormData) => {
  const formFields: FormFields = {};
  formData.forEach((value, name) => {
    const isArrayField = name.endsWith("[]");
    const fieldName = isArrayField ? name.slice(0, -2) : name;
    if (!(fieldName in formFields)) {
      formFields[fieldName] = isArrayField ? formData.getAll(name) : value;
    }
  });
  return formFields;
};

export const validateForm = <T>(
  formData: FormData,
  schema: z.Schema<T>,
  onSuccess: (data: T) => unknown,
  onError: (errors: FieldErrors) => unknown
) => {
  const result = schema.safeParse(objectify(formData));
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

export const sendErrors = (errors: FieldErrors) =>
  json({ errors }, { status: 400 });
