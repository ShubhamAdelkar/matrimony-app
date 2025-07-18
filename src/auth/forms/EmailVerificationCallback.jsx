// src/auth/forms/EmailVerificationCallback.jsx
import { useEffect, useState, useRef } from "react"; // ⭐ Import useRef
import { useNavigate, useSearchParams } from "react-router-dom";
import { account, databases, appwriteConfig } from "../../lib/appwrite"; // Import Appwrite services
import { useMultiStepForm } from "../context/MultiStepFormContext";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { LoaderCircleIcon, CheckCheckIcon, XCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

function EmailVerificationCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updateFormData, resetForm } = useMultiStepForm(); // Get updateFormData and resetForm from context
  const [status, setStatus] = useState("verifying"); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState("Verifying your email address...");

  // ⭐ Use a ref to ensure the verification logic runs only once
  const hasVerifiedRef = useRef(false);

  useEffect(() => {
    // ⭐ Check the ref. If verification has already been attempted, do nothing.
    if (hasVerifiedRef.current) {
      return;
    }

    const userId = searchParams.get("userId");
    const secret = searchParams.get("secret");

    const finalizeVerification = async () => {
      // ⭐ Mark that verification has been initiated to prevent re-execution
      hasVerifiedRef.current = true;

      if (!userId || !secret) {
        setStatus("error");
        setMessage("Verification link is invalid or incomplete.");
        toast.error("Verification Failed", {
          description: "Invalid or incomplete verification link.",
          style: {
            background: "hsl(0 84.2% 60.2%)",
            color: "hsl(0 0% 98%)",
            fontWeight: "bold",
          },
        });
        return;
      }

      try {
        // ⭐ Call Appwrite's updateVerification to confirm the email
        await account.updateVerification(userId, secret);

        // If successful, update the user's profile document in Appwrite
        // This is important to persist the 'emailVerified' status in your database
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.profilesCollectionId,
          userId, // Use the userId from the URL as the document ID
          { emailVerified: true }
        );

        setStatus("success");
        setMessage(
          "Your email has been successfully verified! Redirecting to homepage..."
        ); // ⭐ Changed message to reflect homepage redirect
        toast.success("Email Verified!", {
          description: "Your email address has been successfully verified.",
          style: {
            background: "hsl(142.1 76.2% 36.3%)",
            color: "hsl(0 0% 98%)",
            fontWeight: "bold",
          },
        });

        // Update context to reflect email is verified
        updateFormData({ emailVerified: true, userId: userId }); // Ensure userId is also set if not already

        // Redirect to homepage after a short delay
        setTimeout(() => {
          navigate("/login", { replace: true }); // ⭐ Changed to /home as per your routing
          resetForm();
        }, 3000);
      } catch (error) {
        console.error("Appwrite Email Verification Error:", error);
        setStatus("error");
        let errorMessage = "Failed to verify email. Please try again.";
        if (
          error.code === 400 &&
          error.message.includes("Invalid verification token")
        ) {
          errorMessage =
            "The verification link is invalid or has expired. Please request a new one.";
        } else if (error.code === 404) {
          errorMessage =
            "Verification session not found. This link might be old or used.";
        } else if (error.code === 409) {
          // Common error if link is used multiple times
          errorMessage = "This verification link has already been used.";
        }
        setMessage(errorMessage);
        toast.error("Verification Failed", {
          // ⭐ Changed toast title to be consistent
          description: errorMessage, // ⭐ Using the specific errorMessage
          style: {
            background: "hsl(0 84.2% 60.2%)",
            color: "hsl(0 0% 98%)",
            fontWeight: "bold",
          },
        });
      }
    };

    finalizeVerification();
  }, [searchParams, navigate, updateFormData, resetForm]); // Dependencies are correct

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary text-foreground">
      <Card className="w-full max-w-md p-6 text-center shadow-lg rounded-lg">
        <CardHeader>
          {status === "verifying" && (
            <LoaderCircleIcon
              className="animate-spin mx-auto h-10 w-10"
              stroke="var(--foreground)"
            />
          )}
          {status === "success" && (
            <CheckCheckIcon className="mx-auto h-10 w-10 text-green-500" />
          )}
          {status === "error" && (
            <XCircleIcon className="mx-auto h-10 w-10 text-red-500" />
          )}
          <CardTitle className="mt-4 text-2xl font-bold">
            {status === "verifying"
              ? "Verifying..."
              : status === "success"
                ? "Verification Successful!"
                : "Verification Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-gray-700 mb-4 dark:text-white">
            {message}
          </CardDescription>
          {status === "error" && (
            <Button
              onClick={() => navigate("/register")}
              className="mt-4 cursor-pointer"
            >
              Go to Registration
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default EmailVerificationCallback;
