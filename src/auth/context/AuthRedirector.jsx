// auth/pages/AuthRedirector.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Heart } from "lucide-react"; // Assuming you use this for loading

const AuthRedirector = () => {
  const { user, isAdmin, isLoadingAuth, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoadingAuth) {
      // Wait until auth state is fully loaded
      if (isAuthenticated) {
        // User is authenticated
        if (isAdmin) {
          console.log("AuthRedirector: User is admin, navigating to /admin");
          navigate("/admin", { replace: true });
        } else {
          console.log(
            "AuthRedirector: User is regular, navigating to /home",
            user.$id
          );
          // For regular users, we still need to check profile in AppContent
          // But AuthRedirector's job is just to land them on the default authenticated path
          navigate("/home", { replace: true });
        }
      } else {
        // User is NOT authenticated, redirect to login
        console.log("AuthRedirector: No user, navigating to /login");
        navigate("/login", { replace: true });
      }
    }
  }, [user, isAdmin, isLoadingAuth, isAuthenticated, navigate]);

  // Show a small loader while we determine where to redirect
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Heart
        fill="#fd356e"
        stroke="var(--foreground)"
        strokeWidth={1.5}
        className="self-center size-8 animate-pulse"
      />
      <p className="mt-4 text-gray-500">Preparing your experience...</p>
    </div>
  );
};

export default AuthRedirector;
