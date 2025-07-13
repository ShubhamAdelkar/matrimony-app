import React, { useState, useEffect } from "react";
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
  FormDescription,
} from "@/components/ui/form";

import { useMultiStepForm } from "../context/MultiStepFormContext";
import { Link, useNavigate } from "react-router-dom";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { LoaderCircleIcon } from "lucide-react";
import { toast } from "sonner";

const mobileVerificationSchema = z.object({
  pin: z.string(),
});

function MobileVerification() {
  const { formData, updateFormData, nextStep, prevStep } = useMultiStepForm();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(mobileVerificationSchema), // ⭐ Use mobileVerificationSchema
    mode: "onChange",
    defaultValues: {
      pin: "", // Initialize OTP field
    },
  });

  // ⭐ Watch for the 'pin' field's value in real-time
  const pinValue = form.watch("pin");
  const isVerifyButtonDisabled = isLoading || pinValue.length !== 6;

  async function onSubmit(values) {
    setIsLoading(true);
    console.log("Attempting:", values);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (values.pin === "123456") {
        console.log("OTP Verified Successfully!");
        toast.success("Phone Verified!", {
          description: "Phone number has been successfully verified.",
          style: {
            background: "hsl(142.1 76.2% 36.3%)", // A shade of green that contrasts well
            color: "hsl(0 0% 98%)", // White text
            fontWeight: "bold",
            fontFamily: "googleFont",
            border: "1px solid hsl(142.1 76.2% 36.3%)", // Matching border
          },
        });
        updateFormData({ mobileVerified: true });
        form.setValue("pin", "");
      } else {
        // ⭐ DEBUG: Confirm this else block is hit
        console.log("OTP Verification Failed: Invalid OTP.");
        toast.error("Phone Verification Failed", {
          description: "The OTP entered is incorrect. try again.",
          style: {
            background: "hsl(0 84.2% 60.2%)", // A shade of red for error
            color: "hsl(0 0% 98%)", // White text
            fontWeight: "bold",
            fontFamily: "googleFont",
            border: "1px solid hsl(0 84.2% 60.2%)", // Matching border
          },
        });
        form.setError(
          "pin",
          {
            type: "manual",
            message: "Invalid OTP. Please try again.",
          },
          { shouldFocus: true }
        ); // ⭐ Added shouldFocus: true to focus the field with error
        form.setValue("pin", ""); // Clear the input for re-entry
      }
    } catch (error) {
      console.error("Error during OTP verification process:", error);
      // ⭐ Show error toast for general API/system error
      toast.error("Verification Error", {
        description: `Failed to verify OTP: ${error.message || "Please try again later."}`,
        style: {
          background: "hsl(0 84.2% 60.2%)", // A shade of red for error
          color: "hsl(0 0% 98%)", // White text
          fontFamily: "googleFont",
          fontWeight: "bold",
          border: "1px solid hsl(0 84.2% 60.2%)", // Matching border
        },
      });

      form.setError("root.serverError", {
        message:
          "Failed to verify OTP due to a system error. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Verify Your Phone Number</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-5 w-full"
          >
            <FormField
              control={form.control}
              name="pin"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  {/* ⭐ Removed text-center from FormLabel to align with centered input */}
                  <FormLabel>One-Time Password</FormLabel>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      {...field}
                      className="w-full flex justify-center"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    >
                      {/* InputOTPGroup and InputOTPSlot classes remain the same for internal distribution */}
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
                  <FormDescription className="text-center">
                    Please enter the OTP sent to your phone.
                  </FormDescription>
                  <FormMessage className="text-center" />
                </FormItem>
              )}
            />
            <div className="text-center text-sm">
              Didn&apos;t recieve code?{" "}
              <Link to="" className="underline underline-offset-4">
                Resend
              </Link>
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
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="shad-button cursor-pointer"
                disabled={isVerifyButtonDisabled}
              >
                {isLoading ? (
                  <div className="flex flex-center gap-2">
                    <LoaderCircleIcon className="animate-spin" />
                  </div>
                ) : (
                  "Verify"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Form>
  );
}

export default MobileVerification;
