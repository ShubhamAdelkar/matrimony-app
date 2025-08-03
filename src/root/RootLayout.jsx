// root/RootLayout.jsx
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
import BottomBar from "@/components/user-ui/BottomBar";
import LeftBar from "@/components/user-ui/LeftBar";
import TopBar from "@/components/user-ui/TopBar";
import { Loader2, Home, Mail, Heart, Settings, User } from "lucide-react";
import { Outlet, Navigate, useLocation } from "react-router-dom"; // Import useLocation

import React, { useEffect } from "react";
import { PageTitleProvider, usePageTitle } from "@/context/PageTitleContext";
import { NavSourceProvider } from "@/context/NavSourceContext";

const navMain = [
  { url: "/home", title: "Home", icon: Home },
  { url: "/messages", title: "Messages", icon: Mail },
  { url: "/interest", title: "Interest", icon: Heart },
  { url: "/preference", title: "Preference", icon: Settings },
  { url: "/profile", title: "Profile", icon: User },
];

// Inner component to handle context consumption and logic
const RootLayoutContent = ({ currentUserProfile }) => {
  const {
    isLoading: isLoadingAuth, // Still consume for safety, but AppContent handles global loading
    isAdmin,
    isAuthenticated,
  } = useAuth();
  const { pathname } = useLocation();
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    const currentLink = navMain.find((link) => link.url === pathname);
    if (currentLink) {
      setPageTitle(currentLink.title);
    } else if (pathname.startsWith("/profile/")) {
      setPageTitle("Profile Details");
    } else if (pathname === "/registration-success") {
      setPageTitle("Registration Success");
    }
    // Add more specific route-to-title mappings here if needed
    else if (pathname.startsWith("/admin")) {
      // ⭐ Admin path title
      setPageTitle("Admin Dashboard"); // Or a more specific admin title based on sub-route
    } else {
      setPageTitle("Dashboard");
    }
  }, [pathname, setPageTitle]);

  // IMPORTANT: The global loading and unauthenticated redirection are now handled in AppContent.
  // RootLayoutContent assumes that if it's rendered, the user is authenticated and relevant data is loading or loaded.
  // We still keep a check for !isAuthenticated just in case, though AppContent should prevent this state.
  if (!isAuthenticated && !isLoadingAuth) {
    // Only redirect if not authenticated AND done loading auth
    return <Navigate to="/login" replace />;
  }

  // If isLoadingAuth is true here, it means AppContent is still in its initial loading phase.
  // This return might theoretically be hit briefly if RootLayout renders before AppContent
  // fully settles, but the primary global loader in AppContent should manage this.
  if (isLoadingAuth) {
    return null; // Let AppContent's loader handle it
  }

  return (
    <SidebarProvider isAdmin={isAdmin}>
      {isAdmin ? (
        <>
          <AppSidebar isAdmin={isAdmin} />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) fixed md:relative right-0 left-0 backdrop-blur-xl bg-background/70 rounded-t-2xl justify-between">
              <div className="flex w-full items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1 cursor-pointer" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
                {/* Admin breadcrumb - can be dynamic based on current admin route */}
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{setPageTitle}</BreadcrumbPage>{" "}
                      {/* Use the context page title here */}
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
                <div className="ml-auto flex items-center">
                  <ModeToggle />
                </div>
              </div>
            </header>
            <div className="flex flex-col gap-4 pt-16 md:gap-6 md:py-2 flex-1 pb-4">
              <Outlet /> {/* Renders the specific admin route component */}
            </div>
          </SidebarInset>
        </>
      ) : (
        <>
          <LeftBar
            isAdmin={isAdmin}
            navMain={navMain}
            currentUserProfile={currentUserProfile}
          />
          <SidebarInset>
            <TopBar currentUserProfile={currentUserProfile} />
            <div className="flex flex-1 flex-col min-h-[calc(100svh - var(--header-height))] bg-background text-foreground overflow-x-hidden">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-16 md:gap-6 md:py-0 md:pb-6">
                  <Outlet /> {/* Renders the specific user route component */}
                </div>
              </div>
            </div>
            <BottomBar />
          </SidebarInset>
        </>
      )}
    </SidebarProvider>
  );
};

function RootLayout({ currentUserProfile }) {
  return (
    <PageTitleProvider>
      <NavSourceProvider>
        <RootLayoutContent currentUserProfile={currentUserProfile} />
      </NavSourceProvider>
    </PageTitleProvider>
  );
}

export default RootLayout;
