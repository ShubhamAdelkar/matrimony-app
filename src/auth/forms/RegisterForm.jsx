// src/auth/forms/RegisterForm.jsx
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { useMultiStepForm } from "../context/MultiStepFormContext"; // Import the custom hook
import z from "zod";
import { LoaderCircleIcon, UserPlus } from "lucide-react";

// For Page 1, we only need a subset of the schema for validation
const step1Schema = z.object({
  name: z
    .string()
    .min(4, "Name must be at least 4 characters.")
    .nonempty("Name is required.")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Name can only contain letters, spaces, hyphens, and apostrophes"
    ),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(10, "Phone number must not exceed 10 digits")
    .regex(/^[+]?[\d\s()-]+$/, "Please enter a valid phone number")
    .refine((val) => {
      const digitsOnly = val.replace(/\D/g, "");
      return digitsOnly.length >= 10 && digitsOnly.length <= 15;
    }, "Phone number must contain 10-15 digits"),
  gender: z.enum(["Male", "Female"], {
    errorMap: (issue, ctx) => {
      if (issue.code === z.ZodIssueCode.invalid_enum_value) {
        return { message: "Please select your gender." };
      }
      return { message: ctx.defaultError };
    },
  }),
});

function RegisterForm() {
  const { formData, updateFormData, nextStep } = useMultiStepForm(); // Use the context hook
  const navigate = useNavigate(); // Hook for programmatic navigation
  const [isLoading, setIsLoading] = useState(false); // Make isLoading a state variable

  const form = useForm({
    resolver: zodResolver(step1Schema), // Use a schema specific to this step
    mode: "onChange",
    defaultValues: {
      name: formData.name || "", // Populate from context if user goes back
      phone: formData.phone || "",
      gender: formData.gender || "",
    },
  });

  async function onSubmit(values) {
    setIsLoading(true); // Start loading for this step's processing
    console.log("Page 1 data submitted:", values);

    // Save data to context
    updateFormData(values);

    // Simulate any client-side processing before moving to next step
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Navigate to the next step's route
    nextStep();
    console.log(
      "RegisterForm: currentStep after nextStep call:",
      form.getValues()
    );
    navigate("/onboarding"); // <--- Navigate to the new route for subsequent steps

    setIsLoading(false); // End loading
  }

  return (
    <Form {...form}>
      <Card>
        <CardHeader className="flex flex-col items-center text-center">
          <UserPlus size={58} strokeWidth={1.5} />
          <CardTitle className="md:text-2xl text-xl">
            Register your account
          </CardTitle>
          <CardDescription>Enter your details to register</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-5 w-full"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="shad-input"
                      {...field}
                      placeholder="Enter your full name"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone no.</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your phone number"
                      {...field}
                      disabled={isLoading}
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl className="cursor-pointer">
                      <SelectTrigger className={"w-full"}>
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Male" className="cursor-pointer">
                        Male
                      </SelectItem>
                      <SelectItem value="Female" className="cursor-pointer">
                        Female
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="shad-button cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex flex-center gap-2">
                  <LoaderCircleIcon className="animate-spin size-5" />
                </div>
              ) : (
                "Next" // Change button text to "Next"
              )}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </Form>
  );
}

export default RegisterForm;
