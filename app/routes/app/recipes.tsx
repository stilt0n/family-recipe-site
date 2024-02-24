import {
  Form,
  NavLink,
  Outlet,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
  json,
} from "@remix-run/node";
import db from "~/db.server";
import { requireLoggedInUser } from "~/utils/auth.server";
import {
  RecipeDetailWrapper,
  RecipeListWrapper,
  RecipePageWrapper,
} from "~/components/recipes/wrappers";
import { RecipeCard } from "~/components/recipes/card";
import { SearchForm } from "~/components/forms/searchForm";
import { PlusIcon } from "~/components/icons";
import { Button } from "~/components/forms/button";

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
    orderBy: { createdAt: "desc" },
  });

  return json({ recipes });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await requireLoggedInUser(request);
  const url = new URL(request.url);
  const recipe = await db.recipe.create({
    data: {
      userId: user.id,
      name: "New Recipe",
      totalTime: "0 min",
      imageUrl: "https://via.placeholder.com/150?text=Remix+Recipes",
      instructions: "",
    },
  });
  url.pathname = `app/recipes/${recipe.id}`;
  return redirect(url.toString());
};

const Recipes = () => {
  const data = useLoaderData<typeof loader>();
  const location = useLocation();
  return (
    <RecipePageWrapper>
      <RecipeListWrapper>
        <SearchForm placeholder="search recipes..." />
        <Form method="post" className="mt-4">
          <Button variant="primary" className="flex w-full justify-center">
            <PlusIcon />
            <span className="ml-2">Create New Recipe</span>
          </Button>
        </Form>
        <ul>
          {data?.recipes.map((recipe) => (
            <li className="my-4" key={recipe.id}>
              <NavLink
                reloadDocument
                to={{ pathname: recipe.id, search: location.search }}
              >
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
