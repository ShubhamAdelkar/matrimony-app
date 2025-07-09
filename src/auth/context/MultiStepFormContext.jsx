// src/auth/context/MultiStepFormContext.jsx
import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";

const MultiStepFormContext = createContext(undefined);

export const MultiStepFormProvider = ({ children }) => {
  // Initialize state from localStorage or default
  const [formData, setFormData] = useState(() => {
    try {
      const storedData = localStorage.getItem("multiStepFormData");
      return storedData
        ? JSON.parse(storedData)
        : {
            dob: "",
            religion: "",
            caste: "",
            name: "",
            phone: "",
            gender: "",
            email: "",
            password: "",
            confirmPassword: "",
            maritalStatus: "",
            height: "",
            familyStatus: "",
            familyType: "",
            disability: "",
          };
    } catch (error) {
      console.error("Failed to parse stored form data:", error);
      return {
        caste: "",
        dob: "",
        religion: "",
        name: "",
        phone: "",
        gender: "",
        email: "",
        password: "",
        confirmPassword: "",
        maritalStatus: "",
        height: "",
        familyStatus: "",
        familyType: "",
        disability: "",
      };
    }
  });

  const [currentStep, setCurrentStep] = useState(() => {
    try {
      const storedStep = localStorage.getItem("multiStepCurrentStep");
      return storedStep ? parseInt(storedStep, 10) : 1;
    } catch (error) {
      console.error("Failed to parse stored current step:", error);
      return 1;
    }
  });

  // Persist formData to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("multiStepFormData", JSON.stringify(formData));
    } catch (error) {
      console.error("Failed to save form data to local storage:", error);
    }
  }, [formData]);

  // Persist currentStep to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("multiStepCurrentStep", currentStep.toString());
    } catch (error) {
      console.error("Failed to save current step to local storage:", error);
    }
  }, [currentStep]);

  const updateFormData = useCallback((newData) => {
    setFormData((prevData) => ({ ...prevData, ...newData }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prevStep) => prevStep + 1);
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prevStep) => Math.max(1, prevStep - 1));
  }, []);

  // Function to reset the form data and step (e.g., after successful registration)
  const resetForm = useCallback(() => {
    setFormData({
      caste: "",
      dob: "",
      religion: "",
      name: "",
      phone: "",
      gender: "",
      email: "",
      password: "",
      confirmPassword: "",
      maritalStatus: "",
      height: "",
      familyStatus: "",
      familyType: "",
      disability: "",
    });
    setCurrentStep(1);
    try {
      localStorage.removeItem("multiStepFormData");
      localStorage.removeItem("multiStepCurrentStep");
    } catch (error) {
      console.error("Failed to clear local storage:", error);
    }
  }, []);

  return (
    <MultiStepFormContext.Provider
      value={{
        formData,
        updateFormData,
        currentStep,
        nextStep,
        prevStep,
        setCurrentStep,
        resetForm,
      }}
    >
      {children}
    </MultiStepFormContext.Provider>
  );
};

export const useMultiStepForm = () => {
  const context = useContext(MultiStepFormContext);
  if (context === undefined) {
    throw new Error(
      "useMultiStepForm must be used within a MultiStepFormProvider"
    );
  }
  return context;
};
