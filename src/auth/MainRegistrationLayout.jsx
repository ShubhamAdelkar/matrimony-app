// src/auth/layouts/MainRegistrationLayout.jsx
import React, { useEffect } from "react";
import { useMultiStepForm } from "../auth/context/MultiStepFormContext";
import { useNavigate } from "react-router-dom"; // For redirection

//form components for each step
import EmailPasswordForm from "../auth/forms/EmailPasswordForm"; // Step 2 form
import { GalleryVerticalEnd } from "lucide-react";
import PersonalDetailsForm from "./forms/PersonalDetailsForm";
import ProfessionalDetailsForm from "./forms/ProfessionalDetailsForm";
import AboutForm from "./forms/AboutForm";
import MobileVerification from "./forms/MobileVerification";
import ChurchDetailsForm from "./forms/ChurchDetailsForm";
import CircularProgressBar from "@/components/CircularProgressBar";

function MainRegistrationLayout() {
  const { currentStep, setCurrentStep, resetForm } = useMultiStepForm();
  const navigate = useNavigate();

  console.log("MainRegistrationLayout: currentStep on render =", currentStep);

  const allSteps = [
    { name: "Register", component: null }, // Step 1 is the initial registration page
    { name: "Email & Password", component: <EmailPasswordForm /> },
    { name: "Personal Details", component: <PersonalDetailsForm /> },
    { name: "Professional Details", component: <ProfessionalDetailsForm /> },
    { name: "About Yourself", component: <AboutForm /> },
    { name: "Church Details", component: <ChurchDetailsForm /> },
    { name: "Mobile Verification", component: <MobileVerification /> },
  ];

  const totalSteps = allSteps.length; // This will be 7

  // Calculate completion percentage
  // If currentStep is 1 (Register page), percentage is 0.
  // For subsequent steps, it's (currentStep - 1) / (totalSteps - 1) * 100
  const completionPercentage =
    currentStep === 1 ? 0 : ((currentStep - 1) / (totalSteps - 1)) * 100;

  // Optional: Redirect if currentStep is 1 (meaning they should be on /register)
  useEffect(() => {
    if (currentStep === 1) {
      navigate("/register", { replace: true }); // Redirect to step 1 if they land here directly
    }
  }, [currentStep, navigate]);

  // Function to render the correct form component based on the current step
  const renderStepComponent = () => {
    switch (currentStep) {
      case 2:
        return <EmailPasswordForm />;
      case 3:
        return <PersonalDetailsForm />;
      case 4:
        return <ProfessionalDetailsForm />;
      case 5:
        return <AboutForm />;
      case 6:
        return <ChurchDetailsForm />;
      case 7:
        return <MobileVerification />;
      case 1:
        return null;
      default:
        // This case should ideally not be hit if useEffect handles step 1
        // For now, let's just show a message or redirect to home if somehow here
        return (
          <div className="text-center text-lg text-red-500">
            Invalid registration step. <br />
            <button
              onClick={() => {
                resetForm();
                navigate("/register");
              }}
              className="text-blue-500 underline mt-4"
            >
              Start Over
            </button>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-svh">
      <nav className="flex justify-between sticky top-0 z-50 w-full p-3.5 md:p-6 backdrop-blur-sm bg-white/10 glass-effect-layer inset-shadow-black">
        <div className="flex items-center gap-2">
          <a
            href="#"
            className="flex items-center gap-2 font-medium text-black justify-center text-center"
          >
            <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <h3 className="text-xl font-bold">NLGM Matrimony</h3>
          </a>
        </div>
        <div className="">
          <CircularProgressBar
            percentage={completionPercentage}
            progressColor="black"
            strokeWidth={"3"}
          />
        </div>
      </nav>
      <div className="flex flex-col gap-4 p-4 md:pt-2 md:p-10 flex-1 items-center justify-center">
        <div className="flex flex-col w-full max-w-xl gap-2">
          {renderStepComponent()}
        </div>
      </div>
    </div>
  );
}

export default MainRegistrationLayout;
