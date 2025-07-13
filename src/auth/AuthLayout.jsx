import { Heart, Loader2 } from "lucide-react";
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
            {/* <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div> */}
            <Loader2 className="animate-spin size-9 text-black" />
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
          <a
            href="#"
            className="flex items-center gap-2 font-medium text-black justify-center text-center"
          >
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md pl-1 pr-1">
              <Heart className="size-5.5 self-center" />
            </div>
            <h3 className="text-xl font-bold">Rename</h3>
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
          src="https://i.pinimg.com/736x/55/9f/b4/559fb4b5b9a9f561c0ff8aea681b156a.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full select-none object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}

export default AuthLayout;
