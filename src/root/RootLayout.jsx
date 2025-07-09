// src/_root/RootLayout.jsx (Create this file if it doesn't exist, or adapt your existing one)
import { useAuth } from "@/auth/context/AuthContext";
import { GalleryVerticalEnd } from "lucide-react";
import React from "react";
import { Outlet, Navigate } from "react-router-dom";

function RootLayout() {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  // Show loading state while authentication is being checked
  if (isLoadingAuth) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Loading...
          </a>
        </div>
      </div>
    );
  }

  // If the user is NOT authenticated, redirect them to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the main application content (e.g., sidebar, navbar, actual page)
  return (
    <div className="w-full md:flex">
      {/* Example of a basic structure for authenticated users */}
      {/* <Sidebar /> */}
      <main className="flex flex-1 h-full">
        <Outlet />{" "}
        {/* This is where your HomePage, Profile, etc. will render */}
      </main>
      {/* <Bottombar /> */}
    </div>
  );
}

export default RootLayout;
