import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

// eslint-disable-next-line react/prop-types
export const AuthProvider = ({ children }) => {
  // Initialize state based on a quick check (e.g., if a token exists in localStorage)
  // In a real app, you'd verify the token or session with your backend.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // To prevent flickering on initial load

  useEffect(() => {
    // Simulate an asynchronous authentication check (e.g., checking a token with your backend)
    const checkAuthStatus = async () => {
      try {
        // Replace this with your actual authentication check
        // For example, if using Appwrite, it might look like:
        // const user = await appwrite.account.get();
        // setIsAuthenticated(!!user); // If user object exists, they are authenticated

        // Dummy check for demonstration:
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call delay
        const token = localStorage.getItem("authToken"); // Check for a dummy token
        setIsAuthenticated(!!token); // Set isAuthenticated based on token presence
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoadingAuth(false); // Authentication check is complete
      }
    };

    checkAuthStatus();
  }, []); // Run once on component mount

  const login = (token) => {
    localStorage.setItem("authToken", token); // Store token for persistence
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("authToken"); // Remove token on logout
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoadingAuth, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
