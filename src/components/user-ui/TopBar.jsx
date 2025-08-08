import {
  BadgeCheck,
  Bell,
  CreditCard,
  Heart,
  LogOut,
  MenuIcon,
  Moon,
  Search,
  Settings,
  Sun,
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
import { useTheme } from "../theme-provider";

function TopBar({ currentUserProfile }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const { pageTitle } = usePageTitle(); // Get the current page title from context
  // * Determine the profile photo source
  const profilePhotoIDs = currentUserProfile?.profilePhotoID || [];
  const profilePhotoURLs = currentUserProfile?.profilePhotoURL || [];

  const userAvatarSrc = profilePhotoIDs[0]
    ? storage.getFileView(appwriteConfig.photoBucket, profilePhotoIDs[0]).href
    : profilePhotoURLs[0];

  const userAvatarFallback = currentUserProfile?.name
    ? currentUserProfile.name.charAt(0).toUpperCase()
    : "CN";
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
              className="self-center size-8"
              fill="#fd356e"
              stroke="var(--foreground)"
              strokeWidth={1.5}
            />
          </div>
        </a>
        <h1 className="text-lg font-medium hidden md:flex">{pageTitle}</h1>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex md:gap-4 gap-3 items-center">
            {/* theme toggle */}
            <ModeToggle />
            {/* <Button
              variant="ghost"
              onClick={""}
              size={"icon"}
              className="text-muted-foreground hover:bg-tranparent hover:text-accent-foreground active:scale-90 transition-all"
            >
              <Bell className="cursor-pointer size-7" />
            </Button> */}

            <Button variant="outline" asChild size="sm" className="">
              <a
                href="#"
                rel="noopener noreferrer"
                target="_blank"
                className="dark:text-foreground text-sm"
              >
                Upgrade
              </a>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                className={"md:hidden active:scale-90 transition-all"}
              >
                {/* <Avatar
                  className={
                    "cursor-pointer border border-ring h-9 w-9 rounded-full"
                  }
                >
                  <AvatarImage
                    src={userAvatarSrc}
                    alt={currentUserProfile?.name || "user"}
                    className={"object-cover w-full"}
                  />

                  <AvatarFallback className="rounded-lg bg-gray-200 text-gray-500 text-lg">
                    {userAvatarFallback}
                  </AvatarFallback>
                </Avatar> */}
                <Button
                  variant="ghost"
                  onClick={""}
                  size={"icon"}
                  className="text-muted-foreground hover:bg-tranparent hover:text-accent-foreground active:scale-90 transition-all"
                >
                  <MenuIcon className="cursor-pointer size-7.5" />
                </Button>
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
                        <Avatar className="h-8 w-8 rounded-full border border-ring">
                          <AvatarImage
                            src={userAvatarSrc}
                            className={""}
                            alt={currentUserProfile?.name || "user"}
                          />

                          <AvatarFallback className="rounded-lg">
                            {userAvatarFallback}
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
                        {/* <ModeToggle /> */}
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
                    <DropdownMenuSeparator />
                  </>
                )}
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
