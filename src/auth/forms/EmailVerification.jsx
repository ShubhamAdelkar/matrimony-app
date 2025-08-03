import { useState } from "react";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  // Ensure all UI components are correctly imported
  Form,
} from "@/components/ui/form";

import { useMultiStepForm } from "../context/MultiStepFormContext";
import { useNavigate } from "react-router-dom"; // Correct: useNavigate is a hook for programmatic navigation
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCheckIcon, LoaderCircleIcon, MailCheck } from "lucide-react";
import { toast } from "sonner";

// ⭐ Import Appwrite services
import { account, databases } from "../../lib/appwrite";
import { appwriteConfig } from "../../lib/appwrite";

// ⭐ No Zod schema for OTP input needed for link-based email verification
// The form will primarily be for triggering resend.
const emailVerificationSchema = z.object({}); // Empty schema as no direct form fields for submission

function EmailVerification() {
  const { formData, updateFormData, prevStep, resetForm } = useMultiStepForm();
  const [isLoading, setIsLoading] = useState(false); // Overall loading for form submission
  const [isSendingEmail, setIsSendingEmail] = useState(false); // For email send/resend
  // ⭐ isVerified now reflects formData.emailVerified
  const [isVerified, setIsVerified] = useState(formData.emailVerified || false);
  // ⭐ New state to track if an email has been sent at least once by user action
  const [hasEmailBeenSent, setHasEmailBeenSent] = useState(false);

  // Main form for email verification (no direct fields for submission)
  const form = useForm({
    resolver: zodResolver(emailVerificationSchema),
    mode: "onChange",
    defaultValues: {}, // No default values for an empty schema
  });

  // ⭐ Initialize useNavigate hook
  const navigate = useNavigate();

  // ⭐ Function to send the verification email (handles both initial send and resend)
  const handleSendOrResendEmail = async () => {
    // Prevent sending if already sending or verified
    if (isSendingEmail || isVerified) return;

    setIsSendingEmail(true);
    try {
      // ⭐ Appwrite email verification initiation
      // The redirect URL is where Appwrite sends the user AFTER they click the link in the email.
      // This URL must be configured in your Appwrite project's "Auth -> Platforms -> Web -> Add redirect URL"
      // For development, it might be http://localhost:5173/verify-email-callback or similar.
      // For production, it would be your domain: https://yourdomain.com/verify-email-callback
      await account.createVerification(
        import.meta.env.VITE_APPWRITE_VERIFICATION_REDIRECT_URL // Using environment variable
      );
      console.log("Verification email sent successfully to:", formData.email);
      toast.success(
        hasEmailBeenSent
          ? "Verification Email Resent!"
          : "Verification Email Sent!",
        {
          description: `A verification link has been sent to ${formData.email}. Please check your inbox and spam folder.`,
          style: {
            background: "hsl(142.1 76.2% 36.3%)",
            color: "hsl(0 0% 98%)",
            fontWeight: "bold",
          },
        }
      );
      setHasEmailBeenSent(true); // Mark that an email has been sent
      form.clearErrors("root.serverError"); // Clear any previous errors
    } catch (error) {
      console.error("Error sending verification email:", error);
      toast.error(
        hasEmailBeenSent
          ? "Failed to Resend Verification Email"
          : "Failed to Send Verification Email",
        {
          description: `Could not send email to ${formData.email}: ${error.message || "Please try again."}`,
          style: {
            background: "hsl(0 84.2% 60.2%)",
            color: "hsl(0 0% 98%)",
            fontWeight: "bold",
          },
        }
      );
      form.setError("root.serverError", {
        message: `Failed to send email: ${error.message}`,
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  // ⭐ No useEffect for initial email send on mount. User clicks button.

  // ⭐ The "Next" button will simply move to the next step if email is verified.
  const handleNextStep = async () => {
    setIsLoading(true);
    try {
      // Re-fetch current user status to ensure emailVerified is up-to-date
      const currentUser = await account.get();
      if (currentUser.emailVerification) {
        updateFormData({ emailVerified: true });
        setIsVerified(true); // Update local state
        toast.success("Email Verified!", {
          description: "Your email address has been successfully verified.",
          style: {
            background: "hsl(142.1 76.2% 36.3%)",
            color: "hsl(0 0% 98%)",
            fontWeight: "bold",
          },
        });

        // ⭐ Update the user's profile document in Appwrite to mark email as verified
        // This is crucial if you rely on the profile document for this status
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.profilesCollectionId,
          formData.userId, // Use the existing userId
          { emailVerified: true }
        );
        console.log("Appwrite profile updated: emailVerified = true");

        // ⭐ Navigate to the homepage and reset the form
        navigate("/login", { replace: true });
        resetForm();
      } else {
        toast.error("Email Not Verified", {
          description:
            "Your email address is not yet verified. Please click the link in the email.",
          style: {
            background: "hsl(0 84.2% 60.2%)",
            color: "hsl(0 0% 98%)",
            fontWeight: "bold",
          },
        });
      }
    } catch (error) {
      console.error("Error checking email verification status:", error);
      toast.error("Error", {
        description: `Could not check verification status: ${error.message || "Please try again."}`,
        style: {
          background: "hsl(0 84.2% 60.2%)",
          color: "hsl(0 0% 98%)",
          fontWeight: "bold",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ⭐ Conditional rendering for the final success screen
  if (isVerified) {
    return (
      <Card className="liquid-glass-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-green-600">
            <CheckCheckIcon className="inline-block size-8 mr-2" />
            Email Verified!
          </CardTitle>
          <CardDescription className="mt-2 text-lg">
            Your email address has been successfully verified.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6 text-gray-700">
            You can now proceed to the next step of your registration.
          </p>
          <Button
            className="shad-button cursor-pointer"
            onClick={handleNextStep} // Proceed to next step (which now navigates to homepage)
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex flex-center gap-2">
                <LoaderCircleIcon className="animate-spin size-5" />
              </div>
            ) : (
              "Go to Homepage" // Changed button text
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <Card className={"md:border-0 md:shadow-transparent"}>
        <CardHeader className="flex flex-col items-center text-center">
          <MailCheck size={38} className="text-primary mb-2" />
          <CardTitle className="md:text-2xl text-xl">
            Verify Your Email Address
          </CardTitle>
          <CardDescription className={"flex gap-1.5 justify-center"}>
            <p>
              A verification link will be sent to{" "}
              <span className="font-semibold text-[#fd356e]">
                {formData.email || "your registered email address"}
              </span>
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="gap-4 flex flex-col">
            <div className="text-center text-md p-2 text-muted-foreground">
              Please click the button below to send the verification email.
              Then, check your inbox (and spam folder) for the link.
            </div>

            <div className="text-center text-sm">
              <Button
                type="button"
                onClick={handleSendOrResendEmail}
                disabled={isSendingEmail || isLoading}
                className="cursor-pointer p-6 text-lg md:mb-6 mb-4 bg-[#fd356e] hover:bg-[#fd356e]"
              >
                {isSendingEmail
                  ? "Loading..."
                  : hasEmailBeenSent
                    ? "Resend Verification Email"
                    : "Send Verification Email"}
              </Button>
            </div>

            {form.formState.errors.root?.serverError && (
              <p className="text-sm font-medium text-red-500 text-center">
                {form.formState.errors.root.serverError.message}
              </p>
            )}

            <div className="flex gap-2 justify-between">
              <Button
                type="button"
                onClick={prevStep}
                className="shad-button-secondary cursor-pointer"
                disabled={isLoading || isSendingEmail}
              >
                Back
              </Button>
              <Button
                type="button" // This button now checks status, not submits OTP
                onClick={handleNextStep}
                className="shad-button cursor-pointer"
                disabled={isLoading || isSendingEmail || !hasEmailBeenSent}
              >
                {isLoading ? (
                  <div className="flex flex-center gap-2">
                    <LoaderCircleIcon className="animate-spin size-5" />
                  </div>
                ) : (
                  "Check"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Form>
  );
}

export default EmailVerification;
