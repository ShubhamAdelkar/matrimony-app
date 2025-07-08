// src/auth/layouts/MainRegistrationLayout.jsx
import React, { useEffect } from "react";
import { useMultiStepForm } from "../auth/context/MultiStepFormContext";
import { useNavigate } from "react-router-dom"; // For redirection

//form components for each step
import EmailPasswordForm from "../auth/forms/EmailPasswordForm"; // Step 2 form
import { GalleryVerticalEnd } from "lucide-react";

function MainRegistrationLayout() {
  const { currentStep, setCurrentStep, resetForm } = useMultiStepForm();
  const navigate = useNavigate();

  console.log("MainRegistrationLayout: currentStep on render =", currentStep);

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
      // case 3:
      //   return <PhoneVerificationForm />;
      // case 4:
      //   return <ProfileDetailsForm />;
      // case 5:
      //   return <OnboardingComplete />;
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
    <div className="grid min-h-svh">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Matrimony App
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col w-full max-w-md gap-2">
            <h3 className="mt-6 text-center font-medium">
              Step {currentStep} of 2
            </h3>
            {renderStepComponent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainRegistrationLayout;
