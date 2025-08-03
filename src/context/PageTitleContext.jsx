import React, { createContext, useContext, useState } from "react";

// Create the context
const PageTitleContext = createContext();

// Custom hook to use the page title context
export const usePageTitle = () => {
  const context = useContext(PageTitleContext);
  if (!context) {
    throw new Error("usePageTitle must be used within a PageTitleProvider");
  }
  return context;
};

// Provider component
export const PageTitleProvider = ({ children }) => {
  const [pageTitle, setPageTitle] = useState("Home"); // Default title

  const value = { pageTitle, setPageTitle };

  return (
    <PageTitleContext.Provider value={value}>
      {children}
    </PageTitleContext.Provider>
  );
};
