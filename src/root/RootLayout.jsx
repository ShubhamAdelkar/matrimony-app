import { useAuth } from "@/auth/context/AuthContext";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header"; // Assuming SiteHeader is a separate component
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Loader2 } from "lucide-react";
import { Outlet, Navigate } from "react-router-dom";

function RootLayout() {
  // ⭐ Destructure userRole from useAuth
  const { isAuthenticated, isLoadingAuth, userRole } = useAuth();

  // Determine if the current user is an admin
  const isAdmin = userRole === "admin"; // Assuming 'admin' is the role for administrators

  // ⭐ Define dynamic header height based on isAdmin
  const headerHeight = isAdmin
    ? "calc(var(--spacing) * 14)" // Taller header for admin
    : "calc(var(--spacing) * 16)"; // Default header height for regular users

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
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)", // Example: 72 units * 4px/unit = 288px
        "--header-height": headerHeight, // Example: 12 units * 4px/unit = 48px
      }}
    >
      {/* ⭐ Conditionally render AppSidebar only for admins */}
      {isAdmin && <AppSidebar variant="inset" />}

      {/* SidebarInset wraps the main content area */}
      <SidebarInset>
        {/* SiteHeader component */}
        {/* SiteHeader needs to decide if it shows SidebarTrigger based on isAdmin */}
        <SiteHeader isAdmin={isAdmin} />
        {/* ⭐ Pass isAdmin prop to SiteHeader */}
        {/* Main content area for routes */}
        {/* ⭐ Adjust margin-left based on isAdmin to make space for the sidebar */}
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
  );
}

export default RootLayout;
