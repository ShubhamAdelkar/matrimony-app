import { navMain } from "@/app/data";
import { Bell, Heart, Menu } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { BadgeCheck, ChevronsUpDown, CreditCard, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ModeToggle } from "../mode-toggle";


function LeftBar() {
  const { pathname } = useLocation();

  return (
    <nav className="hidden md:flex py-3 px-2 flex-col bg-dark-2 justify-between items-center h-full fixed z-10 left-0">
      <a
        href="/home"
        className="flex items-center gap-1 font-medium text-foreground justify-center text-center cursor-pointer active:scale-90 transition-all"
      >
        <div className="flex items-center justify-center rounded-md pl-1 pr-1">
          <Heart
            className="self-center"
            size={34}
            fill="#fd356e"
            stroke="var(--foreground)"
            strokeWidth={1.5}
          />
        </div>
      </a>
      <div>
        <ul className="flex flex-col gap-4 items-center">
          {navMain.map((link) => {
            const isActive = pathname === link.url;
            return (
              <Tooltip>
                <TooltipTrigger>
                  <NavLink to={link.url}>
                    <li
                      name={link.title}
                      id={link.title}
                      key={link.url}
                      // ⭐ Original styling preserved
                      className={`px-[16px] py-[10px] rounded-lg hover:bg-[#F5F5F5] dark:hover:bg-sidebar active:scale-90 transition-all`}
                    >
                      {/* ⭐ Conditional rendering for icon or image, with original icon className */}
                      {link.icon && (
                        <link.icon
                          size={29}
                          className={`${isActive && "dark:text-foreground text-foreground"} text-[#b8b8b8]`}
                        />
                      )}
                    </li>
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{link.title}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </ul>
      </div>
      <div className="flex flex-col pb-6 items-center gap-4">
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            className={"active:scale-95 transition-all"}
          >
            <Avatar
              className={
                "cursor-pointer border-2 border-foreground h-10 w-10 rounded-full"
              }
            >
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback className="rounded-lg">CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-50 rounded-lg md:min-w-56"
            align="end"
            side="right"
            sideOffset={8}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-full">
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="@shadcn"
                  />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Shubham</span>
                  <span className="truncate text-xs">adelkar@gmail.com</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className={"cursor-pointer"}>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem className={"cursor-pointer"}>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem className={"cursor-pointer"}>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className={
                "cursor-pointer text-destructive hover:text-destructive"
              }
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}

export default LeftBar;
