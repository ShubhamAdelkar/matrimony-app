import {
  BadgeCheck,
  Bell,
  CreditCard,
  Heart,
  LogOut,
  Search,
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
import { ModeToggle } from "../mode-toggle";

function TopBar() {
  return (
    <div className="flex items-center w-full px-5 gap-4 justify-between py-3 top-0 fixed bg-background/70 backdrop-blur-xl z-10">
      <div className="flex gap-4 items-center">
        <a
          href="/home"
          className="flex items-center gap-1 font-medium text-foreground justify-center text-center md:hidden active:scale-90 transition-all"
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
      </div>

      <div className="flex md:gap-5 gap-3 items-center">
        <div className="flex gap-3 items-center">
          {/* <Search
            className="cursor-pointer active:scale-90 transition-all"
            size={29}
          /> */}
          <a href="#" className="active:scale-90 transition-all">
            <Bell className="cursor-pointer" size={29} />
          </a>
        </div>
        <Button className={"cursor-pointer active:scale-95 transition-all"}>
          Upgrade
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            className={"md:hidden active:scale-90 transition-all"}
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
            className="w-(--radix-dropdown-menu-trigger-width) min-w-54 rounded-lg md:min-w-56 backdrop-blur-xl bg-background/70"
            align="end"
            side="bottom"
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
                <ModeToggle side="" />
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
    </div>
  );
}

export default TopBar;
