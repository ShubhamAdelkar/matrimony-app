import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { navMain } from "@/app/data";

// Create the context
const NavSourceContext = createContext(null);

// Provider component
export const NavSourceProvider = ({ children }) => {
  // State to store the URL of the last clicked main navigation link
  // Default to '/home' so 'Home' is active on initial load if no specific path
  const [activeNavSource, setActiveNavSource] = useState("/home");
  const { pathname } = useLocation();

  // Effect to update activeNavSource when the URL changes to a main navigation path
  // This handles direct URL entries or refreshes on a main nav page
  useEffect(() => {
    const isMainNavLink = navMain.some((link) => link.url === pathname);
    if (isMainNavLink) {
      setActiveNavSource(pathname);
    }
    // If pathname is NOT a main nav link (e.g., /profile/:id),
    // we intentionally do NOT update activeNavSource here.
    // It should retain the value of the last *main* nav link clicked.
  }, [pathname]);

  const value = { activeNavSource, setActiveNavSource };

  return (
    <NavSourceContext.Provider value={value}>
      {children}
    </NavSourceContext.Provider>
  );
};

// Custom hook to easily consume the context
export const useNavSource = () => {
  const context = useContext(NavSourceContext);
  if (!context) {
    throw new Error("useNavSource must be used within a NavSourceProvider");
  }
  return context;
};
