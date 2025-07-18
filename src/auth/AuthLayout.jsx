import { Heart, Loader2 } from "lucide-react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { ModeToggle } from "@/components/mode-toggle";

function AuthLayout() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  // If authentication is still being checked, show a loading state
  // This prevents flickering where the auth layout briefly appears before redirecting
  if (isLoadingAuth) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-background text-foreground">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <Loader2
              className="animate-spin size-10"
              stroke="var(--foreground)"
            />
          </a>
        </div>
      </div>
    );
  }

  // If the user IS authenticated, redirect them away from auth pages (e.g., to home)
  if (isAuthenticated) {
    return <Navigate to="/" replace />; // 'replace' prevents going back to the auth page with browser back button
  }
  return (
    <div className="grid min-h-svh xl:grid-cols-2 bg-background text-foreground">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center w-full gap-4 justify-between">
          {" "}
          {/* ⭐ Added flex and items-center for toggle alignment */}
          <a
            href="#"
            // ⭐ Changed text-black to text-foreground for theme awareness
            className="flex items-center gap-1 font-medium text-foreground justify-center text-center"
          >
            <div className="flex items-center justify-center rounded-md pl-1 pr-1">
              <Heart
                className="self-center size-8"
                fill="#fd356e" // ⭐ Use theme primary color
                stroke="var(--foreground)" // ⭐ Use theme foreground color
                strokeWidth={1.5}
              />
            </div>
            <h3 className="md:text-[26px] text-xl font-bold ">Rename</h3>
          </a>
          {/* ⭐ Mode Toggle Button */}
          <ModeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </div>
      {/* bg-muted will automatically pick up theme's muted color */}
      <div className="relative hidden xl:block">
        <img
          src="https://i.pinimg.com/736x/55/9f/b4/559fb4b5b9a9f561c0ff8aea681b156a.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full select-none object-cover"
        />
      </div>
    </div>
  );
}

export default AuthLayout;
