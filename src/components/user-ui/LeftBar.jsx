import { navMain } from "@/app/data";
import {
  Bell,
  Command,
  Heart,
  Menu,
  Moon,
  Settings,
  Sun,
  User,
  UserCog2,
  UserPen,
} from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { useTheme } from "@/components/theme-provider";
import { Button } from "../ui/button";
import { useNavSource } from "@/context/NavSourceContext";
import { useAuth } from "@/auth/context/AuthContext";

function LeftBar({ isAdmin, currentUserProfile, ...props }) {
  const { logout } = useAuth();
  const { pathname } = useLocation();
  const { setTheme } = useTheme();
  const navigate = useNavigate();
  const { activeNavSource, setActiveNavSource } = useNavSource();
  return (
    <Sidebar
      variant="inset"
      {...props}
      className={`${isAdmin ? "w-62" : "w-18"}`}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className={
                "flex items-center justify-center hover:bg-transparent active:bg-transparent active:scale-90 transition-[scale]"
              }
            >
              <a href="#" className="">
                <div className="flex aspect-square size-10 items-center justify-center">
                  <Heart
                    className="self-center size-7"
                    fill="#fd356e"
                    stroke="var(--foreground)"
                    strokeWidth={1.5}
                  />
                </div>
                {/* <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Acme Inc</span>
                </div> */}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className={"flex flex-col items-center justify-around"}>
        <ul className="flex flex-col gap-4 justify-center items-center overflow-x-hidden w-full">
          {navMain.map((link) => {
            // Check if the current pathname is one of the main navigation links
            const isCurrentPathAMainNavLink = navMain.some(
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
                  return `
                          `;
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
                    <Tooltip delayDuration={500}>
                      <TooltipTrigger asChild>
                        <li
                          name={link.title}
                          id={link.title}
                          className={`px-[16px] py-[10px] rounded-lg hover:bg-[#F5F5F5] dark:hover:bg-sidebar active:scale-90 transition-all`}
                        >
                          {link.icon && (
                            <link.icon
                              className={`size-6.5 ${finalIsActiveForIcon ? "dark:text-foreground text-foreground" : "text-[#737373]"} cursor-pointer`}
                            />
                          )}
                        </li>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{link.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                }}
              </NavLink>
            );
          })}
        </ul>
      </SidebarContent>
      <SidebarFooter
        className={"flex flex-col items-center gap-3 justify-center"}
      >
        {/* theme toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild className={"cursor-pointer shadow-sm"}>
            <Button variant="outline" size="icon" className={""}>
              <Sun className="h-[1.5rem] w-[1.5rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-120" />
              <Moon className="absolute h-[1.5rem] w-[1.5rem] scale-0 rotate-120 transition-all dark:scale-100 dark:rotate-0" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} side="right">
            <DropdownMenuItem
              onClick={() => setTheme("light")}
              className={"cursor-pointer"}
            >
              Light
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("dark")}
              className={"cursor-pointer"}
            >
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("system")}
              className={"cursor-pointer"}
            >
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* user profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild className={""}>
            <Avatar
              className={
                "cursor-pointer border-2 border-foreground h-9 w-9 rounded-full active:scale-90 transition-all"
              }
            >
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback className="rounded-lg">CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-54 rounded-lg md:min-w-56 backdrop-blur-xl bg-background/70"
            align="end"
            side="right"
            sideOffset={8}
          >
            {/* Conditional rendering added here */}
            {currentUserProfile && (
              <>
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-full">
                      <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt="user"
                      />
                      <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {currentUserProfile.name}
                      </span>
                      <span className="truncate text-xs">
                        {currentUserProfile.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className={"cursor-pointer"}
                    onClick={() => navigate("/edit-profile")}
                  >
                    <UserPen />
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className={"cursor-pointer"}>
                    <UserCog2 />
                    Edit Preference
                  </DropdownMenuItem>
                  <DropdownMenuItem className={"cursor-pointer"}>
                    <Settings />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className={
                "cursor-pointer text-destructive hover:text-destructive"
              }
            >
              <LogOut />
              <button type="button" onClick={logout} className="cursor-pointer">
                Log out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default LeftBar;
