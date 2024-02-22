import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import db from "~/db.server";
import { requireLoggedInUser } from "~/utils/auth.server";
import {
  RecipeDetailWrapper,
  RecipeListWrapper,
  RecipePageWrapper,
} from "~/components/recipes/wrappers";
import { RecipeCard } from "~/components/recipes/card";
import { SearchForm } from "~/components/forms/searchForm";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireLoggedInUser(request);
  const url = new URL(request.url);
  const query = url.searchParams.get("query");
  const recipes = await db.recipe.findMany({
    where: {
      userId: user.id,
      name: {
        contains: query ?? "",
        mode: "insensitive",
      },
    },
    select: { name: true, totalTime: true, imageUrl: true, id: true },
  });

  return json({ recipes });
};

const Recipes = () => {
  const data = useLoaderData<typeof loader>();
  return (
    <RecipePageWrapper>
      <RecipeListWrapper>
        <SearchForm placeholder="search recipes..." />
        <ul>
          {data?.recipes.map((recipe) => (
            <li className="my-4" key={recipe.id}>
              <NavLink reloadDocument to={recipe.id}>
                {({ isActive }) => (
                  <RecipeCard
                    name={recipe.name}
                    totalTime={recipe.totalTime}
                    imageUrl={recipe.imageUrl}
                    isActive={isActive}
                  />
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </RecipeListWrapper>
      <RecipeDetailWrapper>
        <Outlet />
      </RecipeDetailWrapper>
    </RecipePageWrapper>
  );
};

export default Recipes;
