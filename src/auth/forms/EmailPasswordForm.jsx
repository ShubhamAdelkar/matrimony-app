// src/auth/forms/EmailPasswordForm.jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { registrationSchema } from "@/lib/validation"; // Full schema with all fields
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import * as select from "@/components/ui/select";
import religions from "./data/religions";
import marathiCastes from "./data/marathiCastes";
import { useAuth } from "../context/AuthContext";
// import { createUserAccount } from '../../lib/appwrite/client'; // <--- Import your Appwrite function here

// --- Dynamic Zod Schema Generation Function ---
const getStep2Schema = (gender) => {
  const today = new Date();
  let requiredAge = 18;

  if (gender === "male") {
    requiredAge = 21;
  } else if (gender === "female") {
    requiredAge = 18;
  }

  const maxAllowedBirthDate = new Date(
    today.getFullYear() - requiredAge,
    today.getMonth(),
    today.getDate()
  );

  return z
    .object({
      dob: z
        .date({
          required_error: "A date of birth is required.",
        })
        .refine((date) => date <= maxAllowedBirthDate, {
          message: `You must be at least ${requiredAge} years old.`,
        }),
      email: z
        .string()
        .email("Invalid email address.")
        .nonempty("Email is required."),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters.")
        .nonempty("Password is required."),
      confirmPassword: z.string().nonempty("Confirm password is required."),
      // ⭐ NEW: Religion field validation
      religion: z.enum(religions, {
        errorMap: (issue, ctx) => {
          if (issue.code === z.ZodIssueCode.invalid_enum_value) {
            return { message: "Please select your religion." };
          }
          return { message: ctx.defaultError };
        },
      }),
      // ⭐ NEW: Caste field validation
      caste: z.enum(marathiCastes, {
        errorMap: (issue, ctx) => {
          if (issue.code === z.ZodIssueCode.invalid_enum_value) {
            return { message: "Please select your caste." };
          }
          return { message: ctx.defaultError };
        },
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match!",
      path: ["confirmPassword"],
    });
};

function EmailPasswordForm() {
  const { formData, updateFormData, nextStep, prevStep, resetForm } =
    useMultiStepForm();
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth(); // ⭐ Import login from AuthContext
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const navigate = useNavigate(); // For redirection

  // Get the gender from the form data
  const gender = formData.gender; // e.g., 'male' or 'female'

  // ⭐ Use the dynamic schema generator to create the schema based on gender
  const formSchema = getStep2Schema(gender);

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      dob: formData.dob ? new Date(formData.dob) : undefined,
      religion: formData.religion || "",
      caste: formData.caste || "",
      email: formData.email || "",
      password: formData.password || "",
      confirmPassword: formData.confirmPassword || "",
    },
  });
  // This mirrors the logic in the Zod schema to ensure visual consistency.
  const today = new Date();
  let calendarRequiredAge = 0; // Separate variable for clarity in Calendar logic
  if (gender === "Male") {
    calendarRequiredAge = 21;
  } else if (gender === "Female") {
    calendarRequiredAge = 18;
  } else {
    calendarRequiredAge = 18; // Default for calendar as well
  }
  const maxAllowedBirthDateForCalendar = new Date(
    today.getFullYear() - calendarRequiredAge,
    today.getMonth(),
    today.getDate()
  );
  const minAllowedYear = 1970;

  async function onSubmit(values) {
    setIsLoading(true);
    console.log("Page 2 data submitted:", values);

    // Combine all data from context and current form
    const finalData = { ...formData, ...values };
    console.log("Final data for user creation:", finalData);

    try {
      // **THIS IS WHERE THE USER ACCOUNT IS ACTUALLY CREATED**
      // Replace with your actual Appwrite createUserAccount call
      // const newUser = await createUserAccount(finalData);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call

      // if (!newUser) {
      //     // Handle specific Appwrite error here if needed
      //     form.setError("root.serverError", {
      //         message: "Account creation failed. Please try again.",
      //     });
      //     return;
      // }

      updateFormData(values); // Save email/password to context as well

      nextStep();
      console.log(
        "RegisterForm: currentStep after nextStep call:",
        form.getValues()
      );

      // ⭐ IMPORTANT CHANGES HERE:
      // 1. Simulate successful login immediately after "user creation"
      //const dummyToken = "my_super_secret_dummy_auth_token_from_registration";
      //login(dummyToken); // Log the user in

      // 2. Reset the multi-step form data ONLY AFTER successful "creation" and login
      //resetForm(); // Clear the multi-step form data from context/localStorage

      // 3. Navigate to the Home Page (or a dashboard) directly,
      //    as the user is now logged in.
      //navigate("/"); // ⭐ Navigate to the authenticated home page
      // console.log(
      //   "EmailPasswordForm: Navigation to Home page initiated after registration and login."
      // );
    } catch (error) {
      console.error("Account creation error:", error);
      form.setError("root.serverError", {
        message: "Account creation failed: " + error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Watch the password and confirmPassword fields
  const passwordValue = form.watch("password");
  const confirmPasswordValue = form.watch("confirmPassword");
  const confirmPasswordError = form.formState.errors.confirmPassword;

  // ⭐ Determine if passwords match AND there's no validation error on the confirmPassword field
  const showPasswordMatchSuccess =
    passwordValue && // Ensure password field has content
    confirmPasswordValue && // Ensure confirmPassword field has content
    passwordValue === confirmPasswordValue && // Check if they are equal
    !confirmPasswordError;

  return (
    <Form {...form}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            Basic Details for Your Match
          </CardTitle>
          <CardDescription>This is crucial for profile</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-5 w-full"
          >
            {/* date of birth */}
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of birth</FormLabel>
                  <Popover
                    open={isPopoverOpen}
                    onOpenChange={setIsPopoverOpen}
                    className="cursor-pointer"
                  >
                    <PopoverTrigger asChild className="cursor-pointer">
                      <FormControl className="cursor-pointer">
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal cursor-pointer", // Ensures button spans full width
                            !field.value && "text-muted-foreground" // Styles placeholder text
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP") // Displays selected date
                          ) : (
                            <span>Pick a date</span> // Placeholder text
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 cursor-pointer"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        className="cursor-pointer"
                        selected={field.value}
                        onSelect={(selectedDate) => {
                          field.onChange(selectedDate);
                          setIsPopoverOpen(false);
                        }}
                        // ⭐ Apply dynamic disabled logic for the calendar
                        disabled={
                          (date) =>
                            date > maxAllowedBirthDateForCalendar ||
                            date.getFullYear() < minAllowedYear // Disable dates before 1970
                        }
                        captionLayout="dropdown"
                        fromYear={minAllowedYear} // Restrict dropdown start year
                        toYear={maxAllowedBirthDateForCalendar.getFullYear()}
                        reverseMonthAndYearDropdowns={true}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* religion & caste */}
            <div className="w-full grid grid-cols-2 gap-3">
              {" "}
              {/* ⭐ Changed from flex to grid, added gap */}
              <FormField
                control={form.control}
                name="religion"
                render={({ field }) => (
                  <FormItem className="w-full">
                    {" "}
                    {/* ⭐ Added w-full to FormItem */}
                    <FormLabel>Religion</FormLabel>
                    <select.Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <select.SelectTrigger className="w-full">
                        <select.SelectValue placeholder="Select religion" />
                      </select.SelectTrigger>
                      <select.SelectContent>
                        {religions.map((religion, index) => (
                          <select.SelectItem
                            className="cursor-pointer"
                            key={index}
                            value={religion.replace(/\s/g, "")}
                          >
                            {religion}
                          </select.SelectItem>
                        ))}
                      </select.SelectContent>
                    </select.Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* caste */}
              <FormField
                control={form.control}
                name="caste"
                render={({ field }) => (
                  <FormItem className="w-full">
                    {" "}
                    {/* ⭐ Added w-full to FormItem */}
                    <FormLabel>Caste</FormLabel>
                    <select.Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      // className="w-full" // This is already good
                    >
                      <select.SelectTrigger className="w-full">
                        {" "}
                        {/* ⭐ Added w-full to SelectTrigger */}
                        <select.SelectValue placeholder="Select caste" />
                      </select.SelectTrigger>
                      <select.SelectContent>
                        {marathiCastes.map((caste, index) => (
                          <select.SelectItem
                            className="cursor-pointer"
                            key={index}
                            value={caste.replace(/\s/g, "")}
                          >
                            {caste}
                          </select.SelectItem>
                        ))}
                      </select.SelectContent>
                    </select.Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Please enter your email"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <div className="relative">
                    {/* Wrapper for positioning */}
                    <FormControl>
                      <Input
                        // ⭐ Toggle type based on showPassword state
                        type={showPassword ? "text" : "password"}
                        {...field}
                        disabled={isLoading}
                        className="pr-10" // Add padding to make space for the icon
                      />
                    </FormControl>
                    <Button
                      type="button" // Important: Prevent this button from submitting the form
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword((prev) => !prev)} // Toggle state
                      disabled={isLoading}
                    >
                      <span className="cursor-pointer">
                        {" "}
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" /> // Show EyeOff when password is visible
                        ) : (
                          <Eye className="h-4 w-4" /> // Show Eye when password is hidden
                        )}
                      </span>

                      {/* For accessibility, screen readers should announce the state */}
                      <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* confirm password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <div className="relative">
                    {" "}
                    {/* Wrapper for positioning */}
                    <FormControl>
                      <Input
                        // ⭐ Toggle type based on showConfirmPassword state
                        type={showConfirmPassword ? "text" : "password"}
                        {...field}
                        disabled={isLoading}
                        className="pr-10" // Add padding to make space for the icon
                      />
                    </FormControl>
                    <Button
                      type="button" // Important: Prevent this button from submitting the form
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword((prev) => !prev)} // Toggle state
                      disabled={isLoading}
                    >
                      <span className="cursor-pointer">
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4 " />
                        )}
                      </span>

                      <span className="sr-only">
                        {showConfirmPassword
                          ? "Hide password"
                          : "Show password"}
                      </span>
                    </Button>
                  </div>
                  <FormMessage />
                  {showPasswordMatchSuccess && (
                    <p className="text-sm font-medium text-green-600">
                      Passwords match!
                    </p>
                  )}
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

export default EmailPasswordForm;
