// src/auth/layouts/MainRegistrationLayout.jsx
import { useEffect } from "react";
import { useMultiStepForm } from "../auth/context/MultiStepFormContext";
import { useNavigate } from "react-router-dom"; // For redirection

//form components for each step
import EmailPasswordForm from "../auth/forms/EmailPasswordForm"; // Step 2 form
import { Heart } from "lucide-react";
import PersonalDetailsForm from "./forms/PersonalDetailsForm";
import ProfessionalDetailsForm from "./forms/ProfessionalDetailsForm";
import AboutForm from "./forms/AboutForm";
import ChurchDetailsForm from "./forms/ChurchDetailsForm";
import CircularProgressBar from "@/components/CircularProgressBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EmailVerification from "./forms/EmailVerification";
import { ModeToggle } from "@/components/mode-toggle";
// import MobileVerification from "./forms/MobileVerification";

function MainRegistrationLayout() {
  const { currentStep, resetForm } = useMultiStepForm();
  const navigate = useNavigate();

  console.log("MainRegistrationLayout: currentStep on render =", currentStep);

  const allSteps = [
    { name: "Register", component: null }, // Step 1 is the initial registration page
    { name: "Email & Password", component: <EmailPasswordForm /> },
    { name: "Personal Details", component: <PersonalDetailsForm /> },
    { name: "Professional Details", component: <ProfessionalDetailsForm /> },
    { name: "About Yourself", component: <AboutForm /> },
    { name: "Church Details", component: <ChurchDetailsForm /> },
    { name: "Mobile Verification", component: <EmailVerification /> },
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
        return <EmailVerification />;
      case 1:
        return null;
      default:
        // This case should ideally not be hit if useEffect handles step 1
        // For now, let's just show a message or redirect to home if somehow here
        return (
          <Card className={"flex justify-center items-center"}>
            <div className="flex flex-col justify-center items-center text-center text-lg bg-background text-foreground font-googleFont p-6">
              <h3 className="text-2xl font-bold">Invalid registration step.</h3>
              <br />
              <Button
                onClick={() => {
                  resetForm();
                  navigate("/register");
                }}
                className="shadcn cursor-pointer"
              >
                Start Over
              </Button>
            </div>
          </Card>
        );
    }
  };

  return (
    // ⭐ Use bg-background and text-foreground for theme-aware background and default text
    <div className="flex flex-col min-h-svh scrollbar bg-background text-foreground">
      <nav className="flex justify-between sticky top-0 z-50 w-full pt-3 pb-3 p-5 md:pl-12 md:pr-12 md:pt-4 md:pb-4.5 backdrop-blur-sm bg-background/10 inset-shadow-black border-1 border-border shadow-xs md:shadow-transparent">
        {" "}
        {/* ⭐ Changed bg-white/10 to bg-background/10 */}
        <div className="flex items-center gap-2">
          <a
            href="#"
            className="flex items-center gap-1 font-medium text-foreground justify-center text-center"
          >
            <div className="flex items-center justify-center rounded-md pl-1 pr-1">
              <Heart
                className="self-center size-8"
                fill="#fd356e" // ⭐ Use theme primary color
                stroke="var(--foreground)" // ⭐ Use theme foreground color
                strokeWidth={1.5}
              />
            </div>
            <h3 className="md:text-[26px] text-xl font-bold ">Rename</h3>
          </a>
        </div>
        <div className="flex items-center md:gap-6 gap-3">
          {/* ⭐ Mode Toggle Button */}
          <ModeToggle />
          <CircularProgressBar percentage={completionPercentage} />
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
