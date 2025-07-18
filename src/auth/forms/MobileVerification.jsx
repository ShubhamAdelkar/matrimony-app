// src/auth/forms/MobileVerification.jsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCheckIcon, LoaderCircleIcon, Smartphone } from "lucide-react"; // Changed icon to Smartphone
import { toast } from "sonner";
import * as z from "zod";

// ⭐ Import Appwrite services
import { account, databases } from "../../lib/appwrite"; // Ensure correct path
import { appwriteConfig } from "../../lib/appwrite"; // Ensure correct path

import { useMultiStepForm } from "../context/MultiStepFormContext";
import { useNavigate } from "react-router-dom";

// ⭐ Import InputOTP components
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

// ⭐ Zod schema for OTP input
const otpSchema = z.object({
  otp: z
    .string()
    .min(6, {
      message: "OTP must be 6 digits.",
    })
    .max(6, {
      message: "OTP must be 6 digits.",
    }),
});

function MobileVerification() {
  const { formData, updateFormData, prevStep, resetForm } = useMultiStepForm();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false); // Overall loading for form submission
  const [isSendingOtp, setIsSendingOtp] = useState(false); // For OTP send/resend
  const [isVerified, setIsVerified] = useState(
    formData.mobileVerified || false
  ); // Reflects formData.mobileVerified
  const [hasOtpBeenSent, setHasOtpBeenSent] = useState(false); // To track if OTP was sent
  const [verificationId, setVerificationId] = useState(""); // To store the verification ID from Appwrite

  const form = useForm({
    resolver: zodResolver(otpSchema),
    mode: "onChange",
    defaultValues: {
      otp: "",
    },
  });

  // ⭐ Function to send or resend the OTP
  const handleSendOrResendOtp = async () => {
    if (isSendingOtp || isVerified) return; // Prevent sending if already sending or verified

    setIsSendingOtp(true);
    try {
      // ⭐ Appwrite phone verification initiation
      // The phone number must be in E.164 format (e.g., +12345678900)
      const response = await account.createPhoneVerification(formData.phone);
      setVerificationId(response.$id); // Store the verification ID
      console.log(
        "OTP sent successfully to:",
        formData.phone,
        "Verification ID:",
        response.$id
      );

      toast.success(hasOtpBeenSent ? "OTP Resent!" : "OTP Sent!", {
        description: `An OTP has been sent to ${formData.phone}. Please enter it below.`,
        style: {
          background: "hsl(142.1 76.2% 36.3%)",
          color: "hsl(0 0% 98%)",
          fontWeight: "bold",
        },
      });
      setHasOtpBeenSent(true); // Mark that an OTP has been sent
      form.clearErrors("root.serverError"); // Clear any previous errors
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error(
        hasOtpBeenSent ? "Failed to Resend OTP" : "Failed to Send OTP",
        {
          description: `Could not send OTP to ${formData.phone}: ${error.message || "Please try again."}`,
          style: {
            background: "hsl(0 84.2% 60.2%)",
            color: "hsl(0 0% 98%)",
            fontWeight: "bold",
          },
        }
      );
      form.setError("root.serverError", {
        message: `Failed to send OTP: ${error.message}`,
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  // ⭐ Function to verify the OTP
  const handleVerifyOtp = async (values) => {
    setIsLoading(true);
    try {
      if (!verificationId) {
        toast.error("Verification Error", {
          description: "Please send an OTP first.",
          style: {
            background: "hsl(0 84.2% 60.2%)",
            color: "hsl(0 0% 98%)",
            fontWeight: "bold",
          },
        });
        setIsLoading(false);
        return;
      }

      // ⭐ Appwrite phone verification update
      await account.updatePhoneVerification(verificationId, values.otp);

      // If successful, update the user's profile document in Appwrite
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.profilesCollectionId,
        formData.userId, // Use the existing userId
        { mobileVerified: true }
      );

      updateFormData({ mobileVerified: true }); // Update context
      setIsVerified(true); // Update local state
      toast.success("Phone Verified!", {
        description: "Your phone number has been successfully verified.",
        style: {
          background: "hsl(142.1 76.2% 36.3%)",
          color: "hsl(0 0% 98%)",
          fontWeight: "bold",
        },
      });

      console.log("Appwrite profile updated: mobileVerified = true");

      // ⭐ Navigate to login and reset form after successful verification
      navigate("/login", { replace: true });
      resetForm();
    } catch (error) {
      console.error("Error verifying OTP:", error);
      let errorMessage = "Failed to verify OTP. Please try again.";
      if (error.code === 401) {
        errorMessage = "Invalid OTP. Please check and try again.";
      } else if (error.code === 409) {
        errorMessage =
          "This OTP has already been used or expired. Please request a new one.";
      }
      toast.error("Verification Failed", {
        description: errorMessage,
        style: {
          background: "hsl(0 84.2% 60.2%)",
          color: "hsl(0 0% 98%)",
          fontWeight: "bold",
        },
      });
      form.setError("root.serverError", {
        message: errorMessage,
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
            Phone Verified!
          </CardTitle>
          <CardDescription className="mt-2 text-lg">
            Your phone number has been successfully verified.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6 text-gray-700">You can now proceed to login.</p>
          <Button
            className="shad-button cursor-pointer"
            onClick={() => {
              navigate("/login", { replace: true });
              resetForm();
            }}
            disabled={isLoading}
          >
            Go to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <Card className={"md:border-0 md:shadow-transparent liquid-glass-card"}>
        {" "}
        {/* Added liquid-glass-card */}
        <CardHeader className="flex flex-col items-center text-center">
          <Smartphone size={62} className="text-foreground mb-2" />{" "}
          {/* ⭐ Changed icon color to text-foreground */}
          <CardTitle className="md:text-2xl text-xl">
            Verify Your Phone Number
          </CardTitle>
          <CardDescription className={"flex gap-1.5 justify-center"}>
            <p>
              An OTP will be sent to{" "}
              <span className="font-semibold  text-[#fd356e]">
                {" "}
                {/* ⭐ Changed color to text-primary */}
                {formData.phone || "your registered phone number"}
              </span>
              .
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="gap-4 flex flex-col">
            <div className="text-center text-md text-muted-foreground p-2">
              {" "}
              {/* ⭐ Changed color to text-foreground */}
              Please click the button below to send the OTP.
            </div>

            <div className="text-center text-sm">
              <Button
                type="button"
                onClick={handleSendOrResendOtp}
                disabled={isSendingOtp || isLoading}
                className="shad-button cursor-pointer p-6 text-lg md:mb-6 mb-4 bg-[#fd356e] hover:bg-[#fd356e]" // Using shad-button
              >
                {isSendingOtp ? (
                  <div className="flex flex-center gap-2">
                    <LoaderCircleIcon className="animate-spin size-5" />
                  </div>
                ) : hasOtpBeenSent ? (
                  "Resend OTP"
                ) : (
                  "Send OTP"
                )}
              </Button>
            </div>

            {hasOtpBeenSent && ( // Only show OTP input if OTP has been sent
              <FormField
                control={form.control}
                name="otp" // ⭐ Changed name from 'pin' to 'otp' to match schema
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormLabel>Enter OTP</FormLabel>
                    <FormControl>
                      {/* ⭐ Using Shadcn UI's InputOTP component for OTP */}
                      <InputOTP
                        maxLength={6}
                        {...field}
                        className="w-full flex justify-center"
                        inputMode="numeric"
                        pattern="[0-9]*"
                      >
                        <InputOTPGroup className="w-full space-x-2">
                          <InputOTPSlot
                            index={0}
                            className={
                              "bg-secondary rounded-md border-l border-gray-300 shadow-none font-semibold flex-1"
                            }
                          />
                          <InputOTPSlot
                            index={1}
                            className={
                              "bg-secondary rounded-md border-l border-gray-300 shadow-none font-semibold flex-1"
                            }
                          />
                          <InputOTPSlot
                            index={2}
                            className={
                              "bg-secondary rounded-md border-l border-gray-300 shadow-none font-semibold flex-1"
                            }
                          />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup className="w-full space-x-2">
                          <InputOTPSlot
                            index={3}
                            className={
                              "bg-secondary rounded-md border-l border-gray-300 shadow-none font-semibold flex-1"
                            }
                          />
                          <InputOTPSlot
                            index={4}
                            className={
                              "bg-secondary rounded-md border-l border-gray-300 shadow-none font-semibold flex-1"
                            }
                          />
                          <InputOTPSlot
                            index={5}
                            className={
                              "bg-secondary rounded-md border-l border-gray-300 shadow-none font-semibold flex-1"
                            }
                          />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {form.formState.errors.root?.serverError && (
              <p className="text-sm font-medium text-destructive text-center">
                {" "}
                {/* ⭐ Changed color to text-destructive */}
                {form.formState.errors.root.serverError.message}
              </p>
            )}

            <div className="flex gap-2 justify-between">
              <Button
                type="button"
                onClick={prevStep}
                className="shad-button-secondary cursor-pointer"
                disabled={isLoading || isSendingOtp}
              >
                Back
              </Button>
              <Button
                type="submit" // Changed to type="submit" to trigger form.handleSubmit
                onClick={form.handleSubmit(handleVerifyOtp)} // ⭐ Call handleSubmit with handleVerifyOtp
                className="shad-button cursor-pointer"
                disabled={
                  isLoading ||
                  isSendingOtp ||
                  !hasOtpBeenSent ||
                  !form.formState.isValid
                } // Disable if OTP not sent or form invalid
              >
                {isLoading ? (
                  <div className="flex flex-center gap-2">
                    <LoaderCircleIcon className="animate-spin size-5" />
                  </div>
                ) : (
                  "Verify" // Changed button text
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Form>
  );
}

export default MobileVerification;
