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
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { createUserAccount } from '../../lib/appwrite/client'; // <--- Import your Appwrite function here

// --- Dynamic Zod Schema Generation Function ---
// This function creates the Zod schema based on the provided gender.
const getStep2Schema = (gender) => {
  const today = new Date();
  let requiredAge = 0;

  // Determine the minimum required age based on gender
  if (gender === "Male") {
    requiredAge = 21;
  } else if (gender === "Female") {
    requiredAge = 18;
  } else {
    // Fallback if gender is undefined, null, or any unexpected value.
    // It's crucial to have a default to prevent schema creation errors.
    console.warn(
      "Gender not found or invalid in form data. Defaulting age requirement to 18."
    );
    requiredAge = 18; // Default to 18 if gender is unclear
  }

  // Calculate the maximum allowed birth date for the current required age
  const maxAllowedBirthDate = new Date(
    today.getFullYear() - requiredAge,
    today.getMonth(),
    today.getDate()
  );

  return (
    z
      .object({
        dob: z
          .date({
            required_error: "A date of birth is required.",
          })
          // Refine the date to ensure the user meets the age requirement
          .refine(
            (date) => date <= maxAllowedBirthDate, // Date must be on or before the max allowed date
            // Custom error message for age validation
            { message: `You must be at least ${requiredAge} years old.` }
          ),
        email: z
          .string()
          .email("Invalid email address.")
          .nonempty("Email is required."),
        password: z
          .string()
          .min(8, "Password must be at least 8 characters.")
          .nonempty("Password is required."),
        confirmPassword: z.string().nonempty("Confirm password is required."),
      })
      // Cross-field validation for password match
      .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match!",
        path: ["confirmPassword"], // Associate error with confirmPassword field
      })
  );
};

function EmailPasswordForm() {
  const { formData, updateFormData, nextStep, prevStep, resetForm } =
    useMultiStepForm();
  const [isLoading, setIsLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const navigate = useNavigate(); // For redirection

  // Get the gender from the form data
  const gender = formData.gender; // e.g., 'male' or 'female'

  // ⭐ Use the dynamic schema generator to create the schema based on gender
  const formSchema = getStep2Schema(gender);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dob: formData.dob || undefined,
      email: formData.email || "",
      password: formData.password || "",
      confirmPassword: formData.confirmPassword || "",
    },
  });

  // ⭐ Re-calculate maxAllowedBirthDate for Calendar's disabled prop.
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

      // Reset form context after successful registration
      // resetForm();

      // Redirect to a success page or dashboard
      navigate("/registration-success"); // You'll need to define this route
      console.log("EmailPasswordForm: Navigation to success page initiated.");
    } catch (error) {
      console.error("Account creation error:", error);
      form.setError("root.serverError", {
        message: "Account creation failed: " + error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Enter your basic details</CardTitle>
          <CardDescription></CardDescription>
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
                  <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal", // Ensures button spans full width
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
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
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
                        toYear={maxAllowedBirthDateForCalendar.getFullYear()} // Restrict dropdown end year (updates automatically)
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* religion */}
            <FormField
              control={form.control}
              name="religion"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>Religion</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="w-full"
                  >
                    <FormControl>
                      <SelectTrigger className={"w-full"}>
                        <SelectValue placeholder="Select select your religion" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Hindu">Hindu</SelectItem>
                      <SelectItem value="Muslim-Shia">Muslim</SelectItem>
                      <SelectItem value="Christian">Christian</SelectItem>
                      <SelectItem value="Sikh">Sikh</SelectItem>
                      <SelectItem value="Parsi">Parsi</SelectItem>
                      <SelectItem value="Buddhist">Buddhist</SelectItem>
                      <SelectItem value="Jain">Jain</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      placeholder="email@example.com"
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
                  <FormControl>
                    <Input type="password" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} disabled={isLoading} />
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

export default EmailPasswordForm;
