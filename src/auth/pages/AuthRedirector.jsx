import { LoaderCircleIcon } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AuthRedirector() {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  // Show a loading spinner while authentication status is being determined
  if (isLoadingAuth) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        <LoaderCircleIcon className="animate-spin size-9 text-black" />
      </div>
    );
  }
  return isAuthenticated ? (
    <Navigate to="/home" replace />
  ) : (
    <Navigate to="/login" replace />
  );
}

export default AuthRedirector;
