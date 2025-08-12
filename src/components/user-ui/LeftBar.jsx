import { navMain } from "@/app/data";
import { Heart, MenuIcon, Settings, UserCog2, UserPen } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { useNavSource } from "@/context/NavSourceContext";
import { useAuth } from "@/auth/context/AuthContext";

function LeftBar({ isAdmin, currentUserProfile, ...props }) {
  const { logout } = useAuth();
  const { pathname } = useLocation();

  const navigate = useNavigate();
  const { activeNavSource, setActiveNavSource } = useNavSource();

  // Determine the profile photo source
  const profilePhotoIDs = currentUserProfile?.profilePhotoID || [];
  const profilePhotoURLs = currentUserProfile?.profilePhotoURL || [];

  const userAvatarSrc = profilePhotoIDs[0]
    ? storage.getFileView(appwriteConfig.photoBucket, profilePhotoIDs[0]).href
    : profilePhotoURLs[0];

  const userAvatarFallback = currentUserProfile?.name
    ? currentUserProfile.name.charAt(0).toUpperCase()
    : "CN";
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
        <ul className="flex flex-col gap-4 justify-center items-center overflow-x-hidden w-full scrollbar-none">
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
                              className={`size-7 ${finalIsActiveForIcon ? "dark:text-foreground text-foreground" : "text-[#737373]"} cursor-pointer`}
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
      <SidebarFooter className={"flex flex-col items-center justify-center"}>
        {/* user profile */}
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            className={
              "mb-2 text-muted-foreground transition-all active:text-foreground hover:text-foreground"
            }
          >
            {/* <Avatar
              className={
                "cursor-pointer border-2 border-ring shadow-sm h-9 w-9 rounded-full "
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
            <MenuIcon className="cursor-pointer size-7" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-54 rounded-lg md:min-w-56"
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
                      {/* * FIX: Dynamically set AvatarImage src based on profile data */}
                      <AvatarImage
                        src={userAvatarSrc}
                        alt={currentUserProfile?.name || "user"}
                      />
                      {/* * FIX: Dynamically set AvatarFallback text based on user's name */}
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
