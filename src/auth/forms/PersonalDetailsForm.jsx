// src/auth/forms/EmailPasswordForm.jsx
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
import religions from "./data/religions";
import marathiCastes from "./data/marathiCastes";
import * as RadioGroup from "@radix-ui/react-radio-group";
import {
  disabilityOptions,
  familyStatuses,
  familyTypes,
  heightOptions,
  maritalStatuses,
} from "./data/personalDetailsOptions";
// import { createUserAccount } from '../../lib/appwrite/client'; // <--- Import your Appwrite function here

// --- NEW Zod Schema for Personal Details ---
const personalDetailsSchema = z.object({
  maritalStatus: z.enum(
    maritalStatuses.map((s) => s.value),
    {
      errorMap: (issue, ctx) => {
        if (issue.code === z.ZodIssueCode.invalid_enum_value) {
          return { message: "Please select your marital status." };
        }
        return { message: ctx.defaultError };
      },
    }
  ),
  height: z.enum(
    heightOptions.map((h) => h.value),
    {
      errorMap: (issue, ctx) => {
        if (issue.code === z.ZodIssueCode.invalid_enum_value) {
          return { message: "Please select your height." };
        }
        return { message: ctx.defaultError };
      },
    }
  ),
  familyStatus: z.enum(
    familyStatuses.map((s) => s.value),
    {
      errorMap: (issue, ctx) => {
        if (issue.code === z.ZodIssueCode.invalid_enum_value) {
          return { message: "Please select your family status." };
        }
        return { message: ctx.defaultError };
      },
    }
  ),
  familyType: z.enum(
    familyTypes.map((t) => t.value),
    {
      errorMap: (issue, ctx) => {
        if (issue.code === z.ZodIssueCode.invalid_enum_value) {
          return { message: "Select your family type." };
        }
        return { message: ctx.defaultError };
      },
    }
  ),
  disability: z.enum(
    disabilityOptions.map((d) => d.value),
    {
      errorMap: (issue, ctx) => {
        if (issue.code === z.ZodIssueCode.invalid_enum_value) {
          return { message: "Please select your disability status." };
        }
        return { message: ctx.defaultError };
      },
    }
  ),
});

function PersonalDetailsForm() {
  const { formData, updateFormData, nextStep, prevStep } = useMultiStepForm();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // For redirection

  const form = useForm({
    resolver: zodResolver(personalDetailsSchema), // ⭐ Use the new schema
    mode: "onChange", // Dynamic validation
    defaultValues: {
      // ⭐ Initialize new fields from formData
      maritalStatus: formData.maritalStatus || "",
      height: formData.height || "",
      familyStatus: formData.familyStatus || "",
      familyType: formData.familyType || "",
      disability: formData.disability || "",
    },
  });

  async function onSubmit(values) {
    setIsLoading(true);
    console.log("Personal Details (Page 3) data submitted:", values);

    // Combine current step's data with existing form data
    const updatedFormData = { ...formData, ...values };
    console.log("Combined form data after Personal Details:", updatedFormData);

    try {
      // Simulate API call or processing for this step
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // ⭐ Update the global form data context
      updateFormData(values);

      // ⭐ Move to the next step in the multi-step form
      nextStep();
      console.log("PersonalDetailsForm: Moved to next step.");
    } catch (error) {
      console.error("Error submitting personal details:", error);
      form.setError("root.serverError", {
        message: "Failed to save personal details: " + error.message,
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
            Personal Details for Matches
          </CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-5 w-full"
          >
            {/* marital status */}
            <FormField
              control={form.control}
              name="maritalStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marital Status</FormLabel>
                  <FormControl>
                    <RadioGroup.Root
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="w-full grid grid-cols-3 gap-3"
                    >
                      {maritalStatuses.map((maritalStatus) => (
                        <RadioGroup.Item
                          key={maritalStatus.value}
                          value={maritalStatus.value}
                          className="ring-[1px] ring-border rounded py-1 px-2 data-[state=checked]:ring-2 data-[state=checked]:ring-blue-500 cursor-pointer"
                        >
                          <span className="tracking-tight text-sm">
                            {maritalStatus.label}
                          </span>
                        </RadioGroup.Item>
                      ))}
                    </RadioGroup.Root>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Height & Family Type*/}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Height Field */}
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Height</FormLabel>
                    <FormControl>
                      <select.Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <select.SelectTrigger className="w-full cursor-pointer">
                          <select.SelectValue placeholder="Select your height" />
                        </select.SelectTrigger>
                        <select.SelectContent>
                          {heightOptions.map((option) => (
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
              {/* Family Type Field */}
              <FormField
                control={form.control}
                name="familyType"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Family Type</FormLabel>
                    <FormControl>
                      <select.Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <select.SelectTrigger className="w-full cursor-pointer">
                          <select.SelectValue placeholder="Select family type" />
                        </select.SelectTrigger>
                        <select.SelectContent>
                          {familyTypes.map((option) => (
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
            </div>

            {/* Family Status */}
            <FormField
              control={form.control}
              name="familyStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Family Status</FormLabel>
                  <FormControl>
                    <RadioGroup.Root
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="w-full grid grid-cols-2 gap-3"
                    >
                      {familyStatuses.map((familyStatus) => (
                        <RadioGroup.Item
                          key={familyStatus.value}
                          value={familyStatus.value}
                          className="ring-[1px] ring-border rounded py-1 px-2 data-[state=checked]:ring-2 data-[state=checked]:ring-blue-500 cursor-pointer"
                        >
                          <span className="tracking-tight text-sm">
                            {familyStatus.label}
                          </span>
                        </RadioGroup.Item>
                      ))}
                    </RadioGroup.Root>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Any Disability */}
            <FormField
              control={form.control}
              name="disability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Any Disability</FormLabel>
                  <FormControl>
                    <RadioGroup.Root
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="w-full grid grid-cols-2 gap-3"
                    >
                      {disabilityOptions.map((disability) => (
                        <RadioGroup.Item
                          key={disability.value}
                          value={disability.value}
                          className="ring-[1px] ring-border rounded py-1 px-2 data-[state=checked]:ring-2 data-[state=checked]:ring-blue-500 cursor-pointer"
                        >
                          <span className="tracking-tight text-sm">
                            {disability.label}
                          </span>
                        </RadioGroup.Item>
                      ))}
                    </RadioGroup.Root>
                  </FormControl>
                  <FormMessage />
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

export default PersonalDetailsForm;
