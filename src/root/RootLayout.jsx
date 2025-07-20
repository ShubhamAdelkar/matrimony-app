import { useAuth } from "@/auth/context/AuthContext";
import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Loader2 } from "lucide-react";
import { Outlet, Navigate } from "react-router-dom";

function RootLayout() {
  // ⭐ Destructure userRole from useAuth
  const { isAuthenticated, isLoadingAuth, userRole } = useAuth();

  // Determine if the current user is an admin
  const isAdmin = userRole === "admin";

  // Show loading state while authentication is being checked
  if (isLoadingAuth) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-background text-foreground">
        <div className="flex justify-center gap-2 md:justify-start">
          <Loader2 className="animate-spin size-9 text-primary" />
        </div>
      </div>
    );
  }

  // If the user is NOT authenticated, redirect them to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the main application content
  return isAdmin ? (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 justify-between p-4">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 cursor-pointer" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <ModeToggle />
        </header>
        <div
          className={`flex flex-1 flex-col bg-background text-foreground ${
            isAdmin ? "" : ""
          } `}
        >
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 md:gap-6">
              <Outlet />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  ) : (
    <div className={`flex flex-1 flex-col bg-background text-foreground`}>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 md:gap-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default RootLayout;
