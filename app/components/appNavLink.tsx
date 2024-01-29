import { NavLink } from "@remix-run/react";
import { ReactNode } from "react";
import cn from "classnames";

interface AppNavLinkProps {
  to: string;
  children: ReactNode;
}

export const AppNavLink = (props: AppNavLinkProps) => {
  return (
    <li className="w-16">
      <NavLink to={props.to}>
        {({ isActive }) => (
          <div
            className={cn("py-4 flex justify-center hover:bg-primary-light", {
              "bg-primary-light": isActive,
            })}
          >
            {props.children}
          </div>
        )}
      </NavLink>
    </li>
  );
};
