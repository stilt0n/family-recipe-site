// When a route needs to have a dynamic name, you can name the route file starting with a dollar sign

import { Fragment, useRef, useState } from "react";
import cn from "classnames";
import {
  LoaderFunctionArgs,
  json,
  ActionFunction,
  redirect,
  unstable_parseMultipartFormData,
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
} from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useActionData,
  useFetcher,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import db from "~/db.server";
import { Input } from "~/components/forms/input";
import { FormError } from "~/components/forms/formError";
import { DeleteIcon, SaveIcon, TimeIcon } from "~/components/icons";
import { Button } from "~/components/forms/button";
import { z } from "zod";
import { sendErrors, validateForm } from "~/utils/validation";
import { handleDelete } from "~/models/utils";
import { requireLoggedInUser } from "~/utils/auth.server";
import { HandledError, UnhandledError } from "~/components/error";
import { useDebouncedFunction } from "~/utils/useDebouncedFunction";
import { useServerLayoutEffect } from "~/utils/misc";

const saveNameSchema = z.object({
  name: z.string().min(1, "Name cannot be blank"),
});

const saveTotalTimeSchema = z.object({
  totalTime: z.string().min(1, "Total time cannot be blank"),
});

const saveInstructionsSchema = z.object({
  instructions: z.string().min(1, "Instructions cannot be blank"),
});

const saveIngredientAmountSchema = z.object({
  amount: z.string().nullable(),
  id: z.string().min(1, "Ingredient id is missing"),
});

const saveIngredientNameSchema = z.object({
  name: z.string().min(1, "Ingredient name cannot be blank"),
  id: z.string().min(1, "Ingredient id is missing"),
});

const saveRecipeSchema = z
  .object({
    imageUrl: z.string().optional(),
    ingredientIds: z
      .array(z.string().min(1, "Ingredient id is missing"))
      .optional(),
    ingredientAmounts: z.array(z.string().nullable()).optional(),
    ingredientNames: z
      .array(z.string().min(1, "Ingredient name cannot be blank"))
      .optional(),
  })
  .and(saveNameSchema)
  .and(saveTotalTimeSchema)
  .and(saveInstructionsSchema)
  .refine(
    (data) =>
      data.ingredientIds?.length === data.ingredientAmounts?.length &&
      data.ingredientIds?.length === data.ingredientNames?.length,
    { message: "need an equal number of ingredient amounts, names and ids" }
  );

const createIngredientSchema = z.object({
  newIngredientAmount: z.string().nullable(),
  newIngredientName: z.string().min(1, "Ingredient name cannot be blank"),
});

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await requireLoggedInUser(request);
  const recipe = await db.recipe.findUnique({
    // The name `recipeId` here comes from the file name
    where: { id: params.recipeId },
    include: {
      ingredients: {
        select: {
          id: true,
          amount: true,
          name: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (recipe === null) {
    throw json(
      { message: "The recipe you are looking for does not exist" },
      { status: 404 }
    );
  }

  if (recipe.userId !== user.id) {
    throw json(
      { message: "You are not authorized to view this recipe" },
      { status: 401 }
    );
  }

  // cache data for 10 seconds before looking again
  return json({ recipe }, { headers: { "Cache-Control": "max-age=10" } });
};

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireLoggedInUser(request);
  const recipeId = String(params.recipeId);
  const recipe = await db.recipe.findUnique({ where: { id: recipeId } });

  if (recipe === null) {
    throw json(
      { message: "The recipe you are looking for does not exist" },
      { status: 404 }
    );
  }

  if (recipe.userId !== user.id) {
    throw json(
      { message: "You are not authorized to make changes to this recipe" },
      { status: 401 }
    );
  }
  let formData;
  if (request.headers.get("Content-Type")?.includes("multipart/form-data")) {
    const uploadHandler = unstable_composeUploadHandlers(
      unstable_createFileUploadHandler({ directory: "public/images" }),
      unstable_createMemoryUploadHandler()
    );
    formData = await unstable_parseMultipartFormData(request, uploadHandler);
    const image = formData.get("image") as File;
    if (image.size !== 0) {
      formData.set("imageUrl", `/images/${image.name}`);
    }
  } else {
    formData = await request.formData();
  }
  const _action = formData.get("_action");

  if (typeof _action === "string" && _action.startsWith("deleteIngredient")) {
    const id = _action.replace("deleteIngredient.", "");
    return handleDelete(() => db.ingredient.delete({ where: { id } }));
  }

  switch (_action) {
    case "saveRecipe":
      return validateForm(
        formData,
        saveRecipeSchema,
        ({ ingredientNames, ingredientAmounts, ingredientIds, ...data }) => {
          return db.recipe.update({
            where: { id: recipeId },
            data: {
              ...data,
              ingredients: {
                updateMany: ingredientIds?.map((id, index) => ({
                  where: { id },
                  data: {
                    amount: ingredientAmounts?.[index] ?? undefined,
                    name: ingredientNames?.[index],
                  },
                })),
              },
            },
          });
        },
        sendErrors
      );
    case "createIngredient":
      return validateForm(
        formData,
        createIngredientSchema,
        ({ newIngredientAmount, newIngredientName }) => {
          return db.ingredient.create({
            data: {
              recipeId,
              amount: newIngredientAmount ?? "",
              name: newIngredientName,
            },
          });
        },
        sendErrors
      );
    case "saveName":
      return validateForm(
        formData,
        saveNameSchema,
        (data) => db.recipe.update({ where: { id: recipeId }, data }),
        sendErrors
      );
    case "saveTotalTime":
      return validateForm(
        formData,
        saveTotalTimeSchema,
        (data) => db.recipe.update({ where: { id: recipeId }, data }),
        sendErrors
      );
    case "saveInstructions":
      return validateForm(
        formData,
        saveInstructionsSchema,
        (data) => db.recipe.update({ where: { id: recipeId }, data }),
        sendErrors
      );
    case "saveIngredientAmount":
      return validateForm(
        formData,
        saveIngredientAmountSchema,
        ({ id, amount }) =>
          db.ingredient.update({
            where: { id },
            data: { amount: amount ?? undefined },
          }),
        sendErrors
      );
    case "saveIngredientName":
      return validateForm(
        formData,
        saveIngredientNameSchema,
        ({ id, ...data }) => db.ingredient.update({ where: { id }, data }),
        sendErrors
      );
    case "deleteRecipe":
      await handleDelete(() => db.recipe.delete({ where: { id: recipeId } }));
      return redirect("/app/recipes");
    default:
      return null;
  }
};

const RecipeDetail = () => {
  const [ingredientName, setIngredientName] = useState("");
  const [ingredientAmount, setIngredientAmount] = useState("");
  const newIngredientAmountRef = useRef<HTMLInputElement>(null);
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const saveNameFetcher = useFetcher<typeof action>();
  const saveTotalTimeFetcher = useFetcher<typeof action>();
  const saveInstructionsFetcher = useFetcher<typeof action>();
  const createIngredientFetcher = useFetcher<typeof action>();
  const { renderedIngredients, addIngredient } = useOptimisticIngredients(
    data.recipe.ingredients,
    createIngredientFetcher.state
  );

  const saveName = useDebouncedFunction(
    (name: string) =>
      saveNameFetcher.submit(
        {
          _action: "saveName",
          name,
        },
        // use method post so that route action handles form
        // loader would use 'get' here I believe
        { method: "post" }
      ),
    1000
  );

  const saveTotalTime = useDebouncedFunction(
    (totalTime: string) =>
      saveTotalTimeFetcher.submit(
        {
          _action: "saveTotalTime",
          totalTime,
        },
        { method: "post" }
      ),
    1000
  );

  const saveInstructions = useDebouncedFunction(
    (instructions: string) =>
      saveInstructionsFetcher.submit(
        {
          _action: "saveInstructions",
          instructions,
        },
        { method: "post" }
      ),
    1000
  );

  const createIngredient = () => {
    addIngredient(ingredientAmount, ingredientName);
    createIngredientFetcher.submit(
      {
        _action: "createIngredient",
        newIngredientAmount: ingredientAmount,
        newIngredientName: ingredientName,
      },
      { method: "post" }
    );
    setIngredientAmount("");
    setIngredientName("");
    newIngredientAmountRef.current?.focus();
  };

  return (
    <Form method="post" encType="multipart/form-data">
      {/* Default browser form behavior is to use the first button on submit via enter button.
      This is a bit of a hack that allows us to control what the enter button does within the form. */}
      <button name="_action" value="saveRecipe" className="hidden" />
      <div className="mb-2">
        <Input
          key={data.recipe?.id}
          variant="bottom-border"
          type="text"
          autoComplete="off"
          className="text-2xl font-extrabold"
          name="name"
          defaultValue={data.recipe?.name}
          error={
            !!(saveNameFetcher?.data?.errors?.name || actionData?.errors?.name)
          }
          onChange={(e) => saveName(e.target.value)}
        />
        <FormError>
          {saveNameFetcher?.data?.errors?.name || actionData?.errors?.name}
        </FormError>
      </div>
      <div className="flex">
        <TimeIcon />
        <div className="ml-2 flex-grow">
          <Input
            key={data.recipe?.id}
            variant="bottom-border"
            placeholder="Time"
            autoComplete="off"
            name="totalTime"
            defaultValue={data.recipe?.totalTime}
            error={
              !!(
                saveTotalTimeFetcher?.data?.errors?.totalTime ||
                actionData?.errors?.totalTime
              )
            }
            onChange={(e) => saveTotalTime(e.target.value)}
          />
          <FormError>
            {saveTotalTimeFetcher?.data?.errors?.totalTime ||
              actionData?.errors?.totalTime}
          </FormError>
        </div>
      </div>
      <div className="grid grid-cols-[30%_auto_min-content] my-4 gap-2">
        <h2 className="font-bold text-sm pb-1">Amount</h2>
        <h2 className="font-bold text-sm pb-1">Name</h2>
        <div />
        {renderedIngredients.map((ingredient, i) => (
          <IngredientRow
            key={ingredient.id}
            ingredient={ingredient}
            amountError={actionData?.errors?.[`ingredientAmounts.${i}`]}
            nameError={actionData?.errors?.[`ingredientNames.${i}`]}
          />
        ))}
        <div>
          <Input
            ref={newIngredientAmountRef}
            variant="bottom-border"
            type="text"
            autoComplete="off"
            name="newIngredientAmount"
            className="border-b-gray-200"
            error={
              !!(
                createIngredientFetcher?.data?.errors?.newIngredientAmount ??
                actionData?.errors?.newIngredientAmount
              )
            }
            value={ingredientAmount}
            onChange={(e) => setIngredientAmount(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                createIngredient();
              }
            }}
          />
          <FormError>
            {createIngredientFetcher?.data?.errors?.newIngredientAmount ??
              actionData?.errors?.newIngredientAmount}
          </FormError>
        </div>
        <div>
          <Input
            variant="bottom-border"
            type="text"
            autoComplete="off"
            name="newIngredientName"
            className="border-b-gray-200"
            error={
              !!(
                createIngredientFetcher?.data?.errors?.newIngredientName ??
                actionData?.errors?.newIngredientName
              )
            }
            value={ingredientName}
            onChange={(e) => setIngredientName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                createIngredient();
              }
            }}
          />
          <FormError>
            {createIngredientFetcher?.data?.errors?.newIngredientName ??
              actionData?.errors?.newIngredientName}
          </FormError>
        </div>
        <button
          name="_action"
          value="createIngredient"
          onClick={(e) => {
            e.preventDefault();
            createIngredient();
          }}
        >
          <SaveIcon />
        </button>
      </div>
      <label
        htmlFor="instructions"
        className="block font-bold text-sm pb-2 w-fit"
      >
        Instructions
      </label>
      <textarea
        key={data.recipe?.id}
        id="instructions"
        name="instructions"
        placeholder="instructions go here"
        defaultValue={data.recipe?.instructions}
        className={cn(
          "w-full h-56 rounded-md outline-none",
          "focus:border-2 focus:p-3 focus:border-primary duration-300",
          saveInstructionsFetcher?.data?.errors?.instructions ||
            actionData?.errors?.instructions
            ? "border-2 border-red-500 p-3"
            : ""
        )}
        onChange={(e) => saveInstructions(e.target.value)}
      />
      <FormError>
        {saveInstructionsFetcher?.data?.errors?.instructions ||
          actionData?.errors?.instructions}
      </FormError>
      <label
        htmlFor="image"
        className="block font-bold text-sm pb-2 w-fit mt-4"
      >
        Image
      </label>
      <input
        id="image"
        type="file"
        name="image"
        key={`${data.recipe?.id}.image`}
      />
      <hr className="my-4" />
      <div className="flex justify-between">
        <Button variant="delete" name="_action" value="deleteRecipe">
          Delete this recipe
        </Button>
        <Button variant="primary" name="_action" value="saveRecipe">
          <div className="flex flex-col justify-center h-full">Save</div>
        </Button>
      </div>
    </Form>
  );
};

interface IngredientRowProps {
  ingredient: RenderedIngredient;
  amountError?: string;
  nameError?: string;
}

const IngredientRow = ({
  ingredient,
  amountError,
  nameError,
}: IngredientRowProps) => {
  const saveIngredientAmountFetcher = useFetcher<typeof action>();
  const saveIngredientNameFetcher = useFetcher<typeof action>();
  const deleteIngredientFetcher = useFetcher<typeof action>();

  const saveIngredientAmount = useDebouncedFunction((amount: string) => {
    saveIngredientAmountFetcher.submit(
      {
        _action: "saveIngredientAmount",
        id: ingredient.id,
        amount,
      },
      { method: "post" }
    );
  }, 1000);

  const saveIngredientName = useDebouncedFunction((name: string) => {
    saveIngredientNameFetcher.submit(
      {
        _action: "saveIngredientName",
        id: ingredient.id,
        name,
      },
      { method: "post" }
    );
  }, 1000);

  const amountFetcherError = saveIngredientAmountFetcher?.data?.errors?.amount;
  const nameFetcherError = saveIngredientNameFetcher?.data?.errors?.name;

  return deleteIngredientFetcher.state === "idle" ? (
    <Fragment>
      <input type="hidden" name="ingredientIds[]" value={ingredient.id} />
      <div>
        <Input
          variant="bottom-border"
          type="text"
          autoComplete="off"
          name="ingredientAmounts[]"
          defaultValue={ingredient.amount ?? ""}
          error={!!(amountError ?? amountFetcherError)}
          disabled={ingredient.isOptimistic}
          onChange={(e) => saveIngredientAmount(e.target.value)}
        />
        <FormError>{amountFetcherError ?? amountError}</FormError>
      </div>
      <div>
        <Input
          variant="bottom-border"
          type="text"
          autoComplete="off"
          name="ingredientNames[]"
          defaultValue={ingredient.name}
          error={!!(nameError ?? nameFetcherError)}
          disabled={ingredient.isOptimistic}
          onChange={(e) => saveIngredientName(e.target.value)}
        />
        <FormError>{nameFetcherError ?? nameError}</FormError>
      </div>
      <button
        name="_action"
        value={`deleteIngredient.${ingredient.id}`}
        onClick={(e) => {
          e.preventDefault();
          deleteIngredientFetcher.submit(
            {
              _action: `deleteIngredient.${ingredient.id}`,
            },
            { method: "post" }
          );
        }}
      >
        <DeleteIcon />
      </button>
    </Fragment>
  ) : null;
};

interface RenderedIngredient {
  id: string;
  name: string;
  amount: string | null;
  isOptimistic?: boolean;
}

const useOptimisticIngredients = (
  savedIngredients: RenderedIngredient[],
  createIngredientState: "idle" | "submitting" | "loading"
) => {
  const [optimisticIngredients, setOptimisticIngredients] = useState<
    RenderedIngredient[]
  >([]);
  const renderedIngredients = [...savedIngredients, ...optimisticIngredients];

  // we want useLayoutEffect here because useEffect gets called *after* the UI
  // is rendered to the screen, which means we'll get flickers when savedItems
  // is updated.
  useServerLayoutEffect(() => {
    if (createIngredientState === "idle") {
      setOptimisticIngredients([]);
    }
  }, [createIngredientState]);

  const addIngredient = (amount: string | null, name: string) => {
    setOptimisticIngredients((ingredients) => [
      ...ingredients,
      { name, id: createTemporaryId(), amount, isOptimistic: true },
    ]);
  };

  return { renderedIngredients, addIngredient };
};

const createTemporaryId = () => {
  return `tmp-${Math.round(Math.random() * 1000000)}`;
};

export const ErrorBoundary = () => {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return (
      <div className="bg-red-600 text-white rounded-md p-4">
        <HandledError
          error={error}
          reroute="app/recipes"
          rerouteMessage="Return to Recipes"
        />
      </div>
    );
  }
  return <UnhandledError error={error} />;
};

export default RecipeDetail;
