import { GalleryVerticalEnd } from "lucide-react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

function AuthLayout() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  // If authentication is still being checked, show a loading state
  // This prevents flickering where the auth layout briefly appears before redirecting
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

  // If the user IS authenticated, redirect them away from auth pages (e.g., to home)
  if (isAuthenticated) {
    return <Navigate to="/" replace />; // 'replace' prevents going back to the auth page with browser back button
  }
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Matrimony App
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="https://i.pinimg.com/736x/c7/54/e8/c754e82936060a83dbd53ba8287cca32.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}

export default AuthLayout;
