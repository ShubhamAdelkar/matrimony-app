import {
  BadgeCheck,
  Bell,
  CreditCard,
  Heart,
  LogOut,
  Search,
  Settings,
  UserCog2,
  UserPen,
} from "lucide-react";
import { Button } from "../ui/button";
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
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ModeToggle } from "../mode-toggle";
import { SidebarTrigger } from "../ui/sidebar";
import { Separator } from "../ui/separator";
import { usePageTitle } from "@/context/PageTitleContext";
import { useAuth } from "@/auth/context/AuthContext";
import { useNavigate } from "react-router-dom";

function TopBar({ currentUserProfile }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { pageTitle } = usePageTitle(); // Get the current page title from context
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) fixed md:relative right-0 left-0 backdrop-blur-xl bg-background/70 rounded-t-2xl z-20">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="ml-1 hidden md:flex cursor-pointer" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4 hidden md:block"
        />
        <a
          href="/home"
          className="flex items-center gap-1 font-medium text-foreground justify-center text-center md:hidden active:scale-90 transition-all"
        >
          <div className="flex items-center justify-center rounded-md pl-1 pr-1">
            <Heart
              className="self-center size-7"
              fill="#fd356e"
              stroke="var(--foreground)"
              strokeWidth={1.5}
            />
          </div>
        </a>
        <h1 className="text-lg font-medium hidden md:flex">{pageTitle}</h1>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex md:gap-5 gap-3 items-center">
            <div className="flex gap-3 items-center">
              <a href="#" className="active:scale-90 transition-all">
                <Bell className="cursor-pointer size-6" />
              </a>
            </div>
            <Button variant="outline" asChild size="sm" className="">
              <a
                href="#"
                rel="noopener noreferrer"
                target="_blank"
                className="dark:text-foreground text-[13px]"
              >
                Upgrade
              </a>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                className={"md:hidden active:scale-90 transition-all"}
              >
                <Avatar
                  className={
                    "cursor-pointer border-2 border-foreground h-8 w-8 rounded-full"
                  }
                >
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="@shadcn"
                  />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-54 rounded-lg md:min-w-56"
                align="end"
                side="bottom"
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
                          <AvatarFallback className="rounded-lg">
                            CN
                          </AvatarFallback>
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
                  <button
                    type="button"
                    className="cursor-pointer"
                    onClick={logout}
                  >
                    Log out
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
