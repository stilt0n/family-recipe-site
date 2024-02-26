// When a route needs to have a dynamic name, you can name the route file starting with a dollar sign

import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import db from "~/db.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const recipe = await db.recipe.findUnique({
    // The name `recipeId` here comes from the file name
    where: { id: params.recipeId },
  });
  // cache data for 10 seconds before looking again
  return json({ recipe }, { headers: { "Cache-Control": "max-age=10" } });
};

const RecipeDetail = () => {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>{data.recipe?.name}</h1>
    </div>
  );
};

export default RecipeDetail;
