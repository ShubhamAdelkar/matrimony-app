import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "./mode-toggle";

export function SiteHeader({ isAdmin }) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 dark:text-white">
        {/* ⭐ Conditionally render SidebarTrigger only if isAdmin is true */}
        {isAdmin && (
          <SidebarTrigger className="-ml-1 dark:text-white cursor-pointer text-black" />
        )}
        {/* ⭐ Conditionally render Separator only if isAdmin is true, or adjust margin if no trigger */}
        {isAdmin && (
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
        )}
        {/* Adjust margin-left if no sidebar trigger is present */}
        <h1
          className={`text-base font-medium dark:text-white text-black ${!isAdmin ? "ml-0" : ""}`}
        >
          {/* ⭐ Changed "Documents" to "Dashboard" or a more generic app title */}
          Dashboard
        </h1>
        <div className="ml-auto dark:text-white flex items-center gap-2 text-black">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
