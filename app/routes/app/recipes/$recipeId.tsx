// When a route needs to have a dynamic name, you can name the route file starting with a dollar sign

import { Fragment } from "react";
import cn from "classnames";
import { LoaderFunctionArgs, ActionFunctionArgs, json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import db from "~/db.server";
import { Input } from "~/components/forms/input";
import { FormError } from "~/components/forms/formError";
import { DeleteIcon, TimeIcon } from "~/components/icons";
import { Button } from "~/components/forms/button";
import { z } from "zod";
import { sendErrors, validateForm } from "~/utils/validation";

const saveRecipeSchema = z.object({
  name: z.string().min(1, "Name cannot be blank"),
  totalTime: z.string().min(1, "Total time cannot be blank"),
  instructions: z.string().min(1, "Instructions cannot be blank"),
});

export const loader = async ({ params }: LoaderFunctionArgs) => {
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
      },
    },
  });
  // cache data for 10 seconds before looking again
  return json({ recipe }, { headers: { "Cache-Control": "max-age=10" } });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();
  switch (formData.get("_action")) {
    case "saveRecipe": {
      return validateForm(
        formData,
        saveRecipeSchema,
        (data) => db.recipe.update({ where: { id: params.recipeId }, data }),
        sendErrors
      );
    }
    default:
      return null;
  }
};

const RecipeDetail = () => {
  const data = useLoaderData<typeof loader>();
  return (
    <Form method="post">
      <div className="mb-2">
        <Input
          key={data.recipe?.id}
          variant="bottom-border"
          type="text"
          autoComplete="off"
          className="text-2xl font-extrabold"
          name="name"
          defaultValue={data.recipe?.name}
        />
        <FormError></FormError>
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
          />
          <FormError></FormError>
        </div>
      </div>
      <div className="grid grid-cols-[30%_auto_min-content] my-4 gap-2">
        <h2 className="font-bold text-sm pb-1">Amount</h2>
        <h2 className="font-bold text-sm pb-1">Name</h2>
        <div />
        {data.recipe?.ingredients.map((ingredient) => (
          <Fragment key={ingredient.id}>
            <div>
              <Input
                variant="bottom-border"
                type="text"
                autoComplete="off"
                name="ingredientAmount"
                defaultValue={ingredient.amount ?? ""}
              />
            </div>
            <div>
              <Input
                variant="bottom-border"
                type="text"
                autoComplete="off"
                name="ingredientName"
                defaultValue={ingredient.name}
              />
            </div>
            <button>
              <DeleteIcon />
            </button>
          </Fragment>
        ))}
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
          "focus:border-2 focus:p-3 focus:border-primary duration-300"
        )}
      />
      <FormError></FormError>
      <hr className="my-4" />
      <div className="flex justify-between">
        <Button variant="delete">Delete this recipe</Button>
        <Button variant="primary" name="_action" value="saveRecipe">
          <div className="flex flex-col justify-center h-full">Save</div>
        </Button>
      </div>
    </Form>
  );
};

export default RecipeDetail;
