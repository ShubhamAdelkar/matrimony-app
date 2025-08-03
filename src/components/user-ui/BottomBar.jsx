import { navBottmBar } from "@/app/data";
import React from "react";
import { NavLink, useLocation } from "react-router-dom";

function BottomBar() {
  const { pathname } = useLocation();
  return (
    <nav className="">
      <div className="z-50 flex w-full fixed bottom-0 bg-dark-2 py-[6px] md:hidden bg-background/70 backdrop-blur-xl px-[4px]">
        <ul className="flex justify-between w-full">
          {navBottmBar.map((link) => {
            const isActive = pathname === link.url;
            return (
              <li
                name={link.title}
                id={link.title}
                key={link.url}
                // ⭐ Original styling preserved
                className={`px-[16px] py-[10px] rounded-lg hover:bg-[#F5F5F5] dark:hover:bg-sidebar active:scale-90 transition-all`}
              >
                <NavLink to={link.url}>
                  {/* ⭐ Conditional rendering for icon or image, with original icon className */}
                  {link.icon && (
                    <link.icon
                      size={29}
                      className={`${isActive && "dark:text-foreground text-foreground"} text-[#777777]`}
                    />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export default BottomBar;
