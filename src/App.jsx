// App.jsx
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import "./App.css";
import React, { useState, useEffect } from "react";
import { ID } from "appwrite";

// Auth related imports
import AuthLayout from "./auth/AuthLayout";
import AuthRedirector from "./auth/pages/AuthRedirector";
import MainRegistrationLayout from "./auth/MainRegistrationLayout";
import LoginPage from "./auth/pages/LoginPage";
import RegisterPage from "./auth/pages/RegisterPage";
import { MultiStepFormProvider } from "./auth/context/MultiStepFormContext";
import EmailVerificationCallback from "./auth/forms/EmailVerificationCallback";

// Root/Authenticated related imports
import RootLayout from "./root/RootLayout";
import RegistrationSuccessPage from "./auth/pages/RegistrationSuccessPage";
import { AuthProvider, useAuth } from "./auth/context/AuthContext";
import HomePage from "./root/user/pages/HomePage";
import ProfilePage from "./root/user/pages/ProfilePage";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./components/theme-provider";
import InterestPage from "./root/user/pages/InterestPage";
import MessagePage from "./root/user/pages/MessagePage";
import PreferencePage from "./root/user/pages/PreferencePage";
import { databases, appwriteConfig, client } from "@/lib/appwrite";
import { Heart, Loader2 } from "lucide-react";

// ADMIN IMPORTS
import AdminDashboardPage from "./root/admin/pages/AdminDashboardPage";
import AdminUsersPage from "./root/admin/pages/AdminUsersPage";
import EditProfilePage from "./root/user/pages/EditProfilePage";
// ... add more admin page imports

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <MultiStepFormProvider>
          <AuthProvider>
            <AppContent />{" "}
            {/* AppContent handles global loading and initial routing */}
          </AuthProvider>
        </MultiStepFormProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

// AuthGuard component to protect routes based on authentication and role
function AuthGuard({ children, requiredAdmin = false }) {
  const { user, isAdmin, isLoadingAuth, isAuthenticated } = useAuth();
  const location = useLocation();

  // If AuthContext is still loading, don't render anything yet.
  // AppContent's global loader handles the overall loading screen.
  if (isLoadingAuth) {
    return null;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ⭐ NEW ADDITION: Redirect regular users from admin routes
  // This is crucial for preventing regular users from seeing admin content
  // and ensuring consistency if they try to directly access an admin URL.
  if (requiredAdmin && !isAdmin) {
    console.warn(
      "AuthGuard: Non-admin trying to access admin route, redirecting to /home."
    );
    return <Navigate to="/home" state={{ from: location }} replace />;
  }

  // ⭐ NEW ADDITION: Redirect admins from user-specific routes
  // This ensures admins are always directed to their dashboard if they land on a user page.
  // This specifically prevents admins from viewing HomePage etc.
  if (!requiredAdmin && isAdmin) {
    console.warn(
      "AuthGuard: Admin trying to access non-admin route, redirecting to /admin."
    );
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  // Authenticated and meets role requirements, render children
  return <>{children}</>;
}

// Main component to manage user data fetching and routing based on auth state
function AppContent() {
  const {
    user,
    isLoading: isLoadingAuth,
    isAdmin,
    isAuthenticated,
  } = useAuth();
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [isLoadingCurrentUserProfile, setIsLoadingCurrentUserProfile] =
    useState(true);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  const location = useLocation();

  // Helper function to update the user's lastActive timestamp
  // This is a common function that can be used by the session heartbeat.
  const updateLastActive = async (userId) => {
    if (!userId) return;
    try {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.profilesCollectionId,
        userId,
        { lastActive: new Date().toISOString() }
      );
      // console.log("Last active timestamp updated successfully.");
    } catch (error) {
      // console.error("Error updating last active timestamp:", error);
    }
  };

  // Effect to manage the current user's online session heartbeat
  // This is the core logic for the "session-based" last seen status
  useEffect(() => {
    // Only run this for authenticated, non-admin users
    if (isAuthenticated && !isAdmin && user) {
      const userId = user.$id;
      // Update the timestamp immediately to mark user as online
      updateLastActive(userId);

      // Set up a timer to update the timestamp periodically
      // This "heartbeat" signals that the user is still active in the app
      const intervalId = setInterval(() => {
        updateLastActive(userId);
      }, 345600000); // 4 days

      // Cleanup function to clear the interval when the component unmounts
      // This is crucial for marking the user as "offline" by stopping the heartbeat
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, isAdmin, user]); // Dependencies: runs when auth state changes

  // Effect to fetch the current user's full profile after authentication
  useEffect(() => {
    // Don't try to fetch profile if not authenticated or still loading auth
    if (!isAuthenticated || isLoadingAuth || !user) {
      setIsLoadingCurrentUserProfile(false);
      setCurrentUserProfile(null);
      setNeedsProfileCompletion(false);
      return;
    }

    // Admins typically don't have a 'user profile' document in the same collection
    // so we skip fetching it for them to avoid the 404 error.
    if (isAdmin) {
      setIsLoadingCurrentUserProfile(false);
      setCurrentUserProfile(null); // Explicitly null for admins
      setNeedsProfileCompletion(false);
      return;
    }

    setIsLoadingCurrentUserProfile(true); // Start loading profile data for regular users
    const fetchProfile = async () => {
      try {
        const fetchedProfile = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.profilesCollectionId,
          user.$id // Attempt to fetch using user ID
        );
        setCurrentUserProfile(fetchedProfile);
        setNeedsProfileCompletion(false); // Profile found
        // console.log(
        //   "AppContent: Current user profile fetched:",
        //   fetchedProfile
        // );
      } catch (err) {
        if (err.code === 404) {
          console.warn(
            "AppContent: User profile not found. User needs to complete profile."
          );
          setCurrentUserProfile(null); // No profile found
          setNeedsProfileCompletion(true); // Set flag to redirect to onboarding
        } else {
          console.error(
            "AppContent: Error fetching current user's profile:",
            err
          );
          setCurrentUserProfile(null);
          setNeedsProfileCompletion(false); // Other error, not a profile completion issue
        }
      } finally {
        setIsLoadingCurrentUserProfile(false);
      }
    };

    // Set up the real-time listener for the current user's profile
    // This allows the UI to update if the profile document changes from another tab or action
    const unsubscribe = client.subscribe(
      `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.profilesCollectionId}.documents.${user.$id}`,
      (response) => {
        if (response.payload) {
          setCurrentUserProfile(response.payload);
        }
      }
    );

    fetchProfile();

    return () => unsubscribe();
  }, [user, isLoadingAuth, isAuthenticated, isAdmin]); // Dependencies to re-run on relevant state changes

  // ⭐ GLOBAL LOADING SCREEN ⭐
  // Show a full-page loader while authentication or profile data is being fetched.
  if (isLoadingAuth || isLoadingCurrentUserProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Heart
          className="self-center size-8 animate-pulse"
          fill="#fd356e"
          stroke="var(--foreground)"
          strokeWidth={1.5}
        />
      </div>
    );
  }

  // ⭐ CENTRALIZED REDIRECTION LOGIC (After all loading is complete) ⭐
  // This ensures that `isAdmin` and `needsProfileCompletion` are fully resolved
  // before any navigation decision is made.
  if (isAuthenticated) {
    if (isAdmin) {
      // Admin is logged in. Redirect to /admin if not already on an admin path.
      if (!location.pathname.startsWith("/admin")) {
        console.log("AppContent: Authenticated admin, redirecting to /admin.");
        return <Navigate to="/admin" replace />;
      }
    } else {
      // User is authenticated but NOT an admin
      if (needsProfileCompletion) {
        // Regular user needs to complete profile. Redirect to /onboarding.
        // Ensure we don't redirect if already on /onboarding
        if (location.pathname !== "/onboarding") {
          // console.log(
          //   "AppContent: Authenticated user needs profile, redirecting to /onboarding."
          // );
          return <Navigate to="/onboarding" replace />;
        }
      } else {
        // Regular user is authenticated and profile is complete.
        // Ensure they are on a 'user' route or default to /home.
        const isUserSpecificRoute = [
          "/home",
          "/edit-profile",
          "/messages",
          "/interest",
          "/preference",
          "/profile",
        ].some((path) => location.pathname.startsWith(path));
        const isPublicAuthRoute = [
          "/login",
          "/register",
          "/registration-success",
          "/verify-email-callback",
        ].includes(location.pathname);

        // If not on a user-specific route AND not on a public/auth route, redirect to /home
        if (!isUserSpecificRoute && !isPublicAuthRoute) {
          // console.log(
          //   "AppContent: Authenticated regular user, redirecting to /home."
          // );
          return <Navigate to="/home" replace />;
        }
      }
    }
  } else {
    // User is NOT authenticated
    // If not authenticated and trying to access a protected route, redirect to login.
    const isPublicAuthRoute = [
      "/",
      "/login",
      "/register",
      "/registration-success",
      "/verify-email-callback",
      "/onboarding",
    ].includes(location.pathname);
    if (!isPublicAuthRoute) {
      console.log("AppContent: Not authenticated, redirecting to /login.");
      return <Navigate to="/login" replace />;
    }
  }

  // If we reach here, it means the user is either:
  // 1. Authenticated and on their correct role-based path (admin on /admin, user on /home/onboarding/etc.)
  // 2. Not authenticated and on a public/auth-related path.
  // Now, render the main Routes.
  return (
    <>
      <Toaster position="top-center" richColors />
      <Routes>
        {/* Public Routes - Accessible to all */}
        <Route path="/" element={<AuthRedirector />} />
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route
          path="/registration-success"
          element={<RegistrationSuccessPage />}
        />
        <Route
          path="/verify-email-callback"
          element={<EmailVerificationCallback />}
        />

        {/* Onboarding Route - Accessible if a user is logged in but profile is incomplete */}
        <Route path="/onboarding" element={<MainRegistrationLayout />} />

        {/* PROTECTED ROUTES - Wrapped by RootLayout */}
        <Route element={<RootLayout currentUserProfile={currentUserProfile} />}>
          {" "}
          {/* RootLayout dynamically renders admin/user layout */}
          {/* User-Specific Routes (Protected by AuthGuard) */}
          <Route
            path="/home"
            element={
              <AuthGuard>
                <HomePage currentUserProfile={currentUserProfile} />
              </AuthGuard>
            }
          />
          <Route
            path="/messages"
            element={
              <AuthGuard>
                <MessagePage />
              </AuthGuard>
            }
          />
          <Route
            path="/interest"
            element={
              <AuthGuard>
                <InterestPage />
              </AuthGuard>
            }
          />
          <Route
            path="/preference"
            element={
              <AuthGuard>
                <PreferencePage />
              </AuthGuard>
            }
          />
          <Route
            path="/edit-profile/"
            element={
              <AuthGuard>
                <EditProfilePage
                  currentUserProfile={currentUserProfile}
                  onProfileUpdate={setCurrentUserProfile}
                />
              </AuthGuard>
            }
          />
          <Route
            path="/profile/:profileId"
            element={
              <AuthGuard>
                <ProfilePage currentUserProfile={currentUserProfile} />
              </AuthGuard>
            }
          />
          {/* <Route path="/spotify-slider" element={<AuthGuard><SpotifySlider /></AuthGuard>} /> */}
          {/* --- ADMIN ROUTES (Protected by AuthGuard) --- */}
          {/* Changed to flat structure, each admin page directly wrapped by AuthGuard */}
          <Route
            path="/admin"
            element={
              <AuthGuard requiredAdmin={true}>
                <AdminDashboardPage />
              </AuthGuard>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AuthGuard requiredAdmin={true}>
                <AdminUsersPage />
              </AuthGuard>
            }
          />
          {/* Add more admin routes here, e.g.: */}
          {/* <Route path="/admin/settings" element={<AuthGuard requiredAdmin={true}><AdminSettingsPage /></AuthGuard>} /> */}
        </Route>

        {/* Catch-all route for unmatched paths */}
        {/* <Route
          path="*"
          element={
            <Navigate
              to={isAuthenticated ? (isAdmin ? "/admin" : "/home") : "/login"}
              replace
            />
          }
        /> */}
      </Routes>
    </>
  );
}
