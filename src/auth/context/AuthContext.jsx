import { createContext, useContext, useState, useEffect } from "react";
import { account, databases } from "../../lib/appwrite";
import { appwriteConfig } from "../../lib/appwrite";
import { useMultiStepForm } from "./MultiStepFormContext"; // Assuming this path is correct
import { Query } from "appwrite"; // ⭐ Import Query for checking document existence

const AuthContext = createContext(null);

// eslint-disable-next-line react/prop-types
export const AuthProvider = ({ children }) => {
  const { resetForm } = useMultiStepForm();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [user, setUser] = useState(null);
  // ⭐ New state for user role
  const [userRole, setUserRole] = useState(null); // 'admin', 'user', or null

  // Helper function to determine role
  const determineUserRole = async (userId) => {
    if (!userId) return "user"; // Default to user if no ID

    try {
      // ⭐ Check if a document exists in the adminUsersCollection with this userId
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.adminsCollectionId,
        [Query.equal("userId", userId)] // Query by the userId attribute
      );

      if (response.documents.length > 0) {
        return "admin";
      } else {
        return "user";
      }
    } catch (error) {
      console.error("Error checking admin role:", error);
      // If there's an error (e.g., collection not found, permissions), default to 'user'
      return "user";
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoadingAuth(true);
      try {
        const currentUser = await account.get();
        if (currentUser) {
          setIsAuthenticated(true);
          setUser(currentUser);
          // ⭐ Determine role based on admin collection
          const role = await determineUserRole(currentUser.$id);
          setUserRole(role);
          console.log(
            "AuthContext: User is authenticated:",
            currentUser.$id,
            "Role:",
            role
          );
        } else {
          setIsAuthenticated(false);
          setUser(null);
          setUserRole(null);
          console.log("AuthContext: No active user session.");
        }
      } catch (error) {
        console.warn(
          "AuthContext: Error checking auth status (expected for unauthenticated):",
          error.message
        );
        setIsAuthenticated(false);
        setUser(null);
        setUserRole(null);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (userId = null) => {
    setIsLoadingAuth(true);
    try {
      let currentUser = null;
      if (userId) {
        currentUser = { $id: userId };
        setIsAuthenticated(true);
        setUser(currentUser);
        // ⭐ Determine role after login
        const role = await determineUserRole(userId);
        setUserRole(role);
        console.log(
          "AuthContext: Login successful (direct update with userId):",
          userId,
          "Role:",
          role
        );
      } else {
        currentUser = await account.get();
        if (currentUser) {
          setIsAuthenticated(true);
          setUser(currentUser);
          // ⭐ Determine role after login
          const role = await determineUserRole(currentUser.$id);
          setUserRole(role);
          console.log(
            "AuthContext: Login successful (fetched user):",
            currentUser.$id,
            "Role:",
            role
          );
        } else {
          setIsAuthenticated(false);
          setUser(null);
          setUserRole(null);
          console.warn(
            "AuthContext: Login attempted, but no user found after session creation."
          );
        }
      }
    } catch (error) {
      console.error("AuthContext: Error during login process:", error);
      setIsAuthenticated(false);
      setUser(null);
      setUserRole(null);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = async () => {
    setIsLoadingAuth(true);
    try {
      await account.deleteSession("current");
      setIsAuthenticated(false);
      setUser(null);
      setUserRole(null); // Clear role on logout
      resetForm();
      console.log("AuthContext: Logout successful.");
    } catch (error) {
      console.error("AuthContext: Error during logout:", error);
      setIsAuthenticated(false);
      setUser(null);
      setUserRole(null);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoadingAuth,
        user,
        userRole,
        isAdmin: userRole === "admin",
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
