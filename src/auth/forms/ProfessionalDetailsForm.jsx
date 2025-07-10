import React, { useState } from "react";
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

import { useMultiStepForm } from "../context/MultiStepFormContext";
import { useNavigate } from "react-router-dom"; // For redirection after success
import z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import * as select from "@/components/ui/select";
import * as RadioGroup from "@radix-ui/react-radio-group";
import {
  annualIncomeOptions,
  employmentOptions,
  highestEducationOptions,
  occupationOptions,
} from "./data/professionalDetails";
// import { createUserAccount } from '../../lib/appwrite/client'; // <--- Import your Appwrite function here

// --- NEW Zod Schema for Professional Details ---
const professionalDetailsSchema = z.object({
  highestEducation: z.enum(
    highestEducationOptions.map((e) => e.value),
    {
      errorMap: (issue, ctx) => {
        if (issue.code === z.ZodIssueCode.invalid_enum_value) {
          return { message: "Please select your highest education." };
        }
        return { message: ctx.defaultError };
      },
    }
  ),
  employedIn: z.enum(
    employmentOptions.map((e) => e.value),
    {
      errorMap: (issue, ctx) => {
        if (issue.code === z.ZodIssueCode.invalid_enum_value) {
          return { message: "Please select your employment status." };
        }
        return { message: ctx.defaultError };
      },
    }
  ),
  occupation: z.enum(
    occupationOptions.map((o) => o.value),
    {
      errorMap: (issue, ctx) => {
        if (issue.code === z.ZodIssueCode.invalid_enum_value) {
          return { message: "Please select your occupation." };
        }
        return { message: ctx.defaultError };
      },
    }
  ),
  annualIncome: z.enum(
    annualIncomeOptions.map((a) => a.value),
    {
      errorMap: (issue, ctx) => {
        if (issue.code === z.ZodIssueCode.invalid_enum_value) {
          return { message: "Please select your annual income." };
        }
        return { message: ctx.defaultError };
      },
    }
  ),
});

function ProfessionalDetailsForm() {
  // Exported as named export as per your previous code
  const { formData, updateFormData, nextStep, prevStep } = useMultiStepForm();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(professionalDetailsSchema), // ⭐ Using the new schema
    mode: "onChange",
    defaultValues: {
      // ⭐ Initialize new fields from formData
      highestEducation: formData.highestEducation || "",
      employedIn: formData.employedIn || "",
      occupation: formData.occupation || "",
      annualIncome: formData.annualIncome || "",
    },
  });

  async function onSubmit(values) {
    setIsLoading(true);
    console.log("Professional Details (Page 4) data submitted:", values);

    // Combine current step's data with existing form data
    const updatedFormData = { ...formData, ...values };
    console.log(
      "Combined form data after Professional Details:",
      updatedFormData
    );

    try {
      // Simulate API call or processing for this step
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // ⭐ Update the global form data context
      updateFormData(values);

      // ⭐ Move to the next step in the multi-step form
      nextStep();
      console.log("ProfessionalDetailsForm: Moved to next step.");
    } catch (error) {
      console.error("Error submitting professional details:", error);
      form.setError("root.serverError", {
        message: "Failed to save professional details: " + error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            Professional Details for Matches
          </CardTitle>
          <CardDescription>
            Share your work and education to find truly compatible connections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-5 w-full"
          >
            {/* highest education */}
            <FormField
              control={form.control}
              name="highestEducation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Highest Education</FormLabel>
                  <FormControl>
                    <select.Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <select.SelectTrigger className="w-full cursor-pointer">
                        <select.SelectValue placeholder="Select your highest education" />
                      </select.SelectTrigger>
                      <select.SelectContent>
                        {highestEducationOptions.map((option) => (
                          <select.SelectItem
                            className="cursor-pointer"
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </select.SelectItem>
                        ))}
                      </select.SelectContent>
                    </select.Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Employed In */}
            <FormField
              control={form.control}
              name="employedIn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employed In</FormLabel>
                  <FormControl>
                    <RadioGroup.Root
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="w-full grid grid-cols-1 gap-3 sm:grid-cols-2"
                    >
                      {employmentOptions.map((option) => (
                        <RadioGroup.Item
                          key={option.value}
                          value={option.value}
                          className="ring-[1px] ring-border rounded py-1 px-2 data-[state=checked]:ring-2 data-[state=checked]:ring-blue-500 cursor-pointer"
                        >
                          <span className="tracking-tight text-sm">
                            {option.label}
                          </span>
                        </RadioGroup.Item>
                      ))}
                    </RadioGroup.Root>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3"></div> */}

            {/* Occupation */}
            <FormField
              control={form.control}
              name="occupation"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Occupation</FormLabel>
                  <FormControl>
                    <select.Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <select.SelectTrigger className="w-full cursor-pointer">
                        <select.SelectValue placeholder="Select your occupation" />
                      </select.SelectTrigger>
                      <select.SelectContent>
                        {occupationOptions.map((option) => (
                          <select.SelectItem
                            className="cursor-pointer"
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </select.SelectItem>
                        ))}
                      </select.SelectContent>
                    </select.Select>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Annual Income */}
            <FormField
              control={form.control}
              name="annualIncome"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Annual Income</FormLabel>
                  <FormControl>
                    <select.Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <select.SelectTrigger className="w-full cursor-pointer">
                        <select.SelectValue placeholder="Select your annual income" />
                      </select.SelectTrigger>
                      <select.SelectContent>
                        {annualIncomeOptions.map((option) => (
                          <select.SelectItem
                            className="cursor-pointer"
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </select.SelectItem>
                        ))}
                      </select.SelectContent>
                    </select.Select>
                  </FormControl>
                </FormItem>
              )}
            />

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
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex flex-center gap-2">Loading...</div>
                ) : (
                  "Next"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Form>
  );
}

export default ProfessionalDetailsForm;
