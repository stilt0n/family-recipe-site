import { NavLink, Outlet } from "@remix-run/react";
import cn from "classnames";
import { ReactNode } from "react";

const App = () => {
  return (
    // making container into a flex container overrides margin collapes behavior
    <div className="flex flex-col h-full">
      <h1 className="text-2xl font-bold my-4">App</h1>
      <nav className="border-b-2 pb-2 mt-2">
        <StyledNavLink to="recipes">Recipes</StyledNavLink>
        <StyledNavLink to="pantry">Pantry</StyledNavLink>
      </nav>
      <div className="py-4 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

interface StyledNavLinkProps {
  to: string;
  children?: ReactNode;
}

const StyledNavLink = ({ to, children }: StyledNavLinkProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "hover:text-gray-500 pb-2.5 px-2 md:px-4",
          isActive ? "border-b-2 border-b-primary" : ""
        )
      }
    >
      {children}
    </NavLink>
  );
};

export default App;
