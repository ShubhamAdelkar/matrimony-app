import { navBottmBar } from "@/app/data";
import { useNavSource } from "@/context/NavSourceContext";
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function BottomBar() {
  const { pathname } = useLocation();
  const { activeNavSource, setActiveNavSource } = useNavSource();
  return (
    <nav className="">
      <div className="z-50 flex w-full fixed bottom-0 py-[5px] md:hidden bg-background/70 backdrop-blur-xl px-[5px]">
        <ul className="flex justify-between w-full">
          {navBottmBar.map((link) => {
            // Check if the current pathname is one of the main navigation links
            const isCurrentPathAMainNavLink = navBottmBar.some(
              (navLink) => navLink.url === pathname
            );

            return (
              <NavLink
                to={link.url}
                key={link.url}
                // When a NavLink is clicked, update the activeNavSource in the context
                onClick={() => setActiveNavSource(link.url)}
                // Use the className prop as a function to determine active state
                className={({ isActive: navLinkIsActive }) => {
                  let finalIsActive = false;

                  if (isCurrentPathAMainNavLink) {
                    // If the current URL is a direct main nav link (e.g., /home, /messages),
                    // use NavLink's default isActive behavior (exact match).
                    finalIsActive = navLinkIsActive;
                  } else {
                    // If the current URL is NOT a direct main nav link (e.g., /profile/:id),
                    // then the active link in the sidebar should be the one stored in activeNavSource.
                    finalIsActive = link.url === activeNavSource;
                  }
                  return ``;
                }}
              >
                {/* The render prop is still useful here to pass the calculated isActive state to the icon */}
                {({ isActive: navLinkIsActive }) => {
                  let finalIsActiveForIcon = false;
                  if (isCurrentPathAMainNavLink) {
                    finalIsActiveForIcon = navLinkIsActive;
                  } else {
                    finalIsActiveForIcon = link.url === activeNavSource;
                  }

                  return (
                    <div>
                      <li
                        name={link.title}
                        id={link.title}
                        className={`px-[16px] py-[9px] rounded-lg hover:bg-[#F5F5F5] dark:hover:bg-sidebar active:scale-98 transition-all`}
                      >
                        {link.icon && (
                          <link.icon
                            className={`${finalIsActiveForIcon ? "dark:text-foreground text-foreground" : "text-[#737373]"} cursor-pointer size-7`}
                          />
                        )}
                      </li>
                    </div>
                  );
                }}
              </NavLink>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export default BottomBar;
