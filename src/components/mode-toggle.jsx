import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={"cursor-pointer"}>
        <Button variant="outline" size="icon" className={"shadow-sm"}>
          <Sun className="h-[1.5rem] w-[1.5rem] scale-120 rotate-0 transition-all dark:scale-0 dark:-rotate-120" />
          <Moon className="absolute h-[1.5rem] w-[1.5rem] scale-0 rotate-120 transition-all dark:scale-120 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4}>
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
  );
}
