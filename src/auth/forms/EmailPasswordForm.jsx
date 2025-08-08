// src/auth/forms/EmailPasswordForm.jsx
import { useState } from "react";
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
import { useMultiStepForm } from "../context/MultiStepFormContext";
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
import {
  CalendarIcon,
  Contact,
  Eye,
  EyeOff,
  LoaderCircleIcon,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import * as select from "@/components/ui/select";
import religions from "./data/religions";
import marathiCastes from "./data/marathiCastes";
import { account, databases, ID, appwriteConfig } from "../../lib/appwrite";
import { toast } from "sonner"; // Import toast for user feedback

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
      religion: z.enum(religions, {
        errorMap: (issue, ctx) => {
          if (issue.code === z.ZodIssueCode.invalid_enum_value) {
            return { message: "Please select your religion." };
          }
          return { message: ctx.defaultError };
        },
      }),
      caste: z.enum(
        marathiCastes.map((e) => e.value),
        {
          errorMap: (issue, ctx) => {
            if (issue.code === z.ZodIssueCode.invalid_enum_value) {
              return { message: "Please select your caste." };
            }
            return { message: ctx.defaultError };
          },
        }
      ),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match!",
      path: ["confirmPassword"],
    });
};

function EmailPasswordForm() {
  const { formData, updateFormData, nextStep, prevStep } = useMultiStepForm();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const gender = formData.gender;

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

  const today = new Date();
  let calendarRequiredAge = 0;
  if (gender === "Male") {
    calendarRequiredAge = 21;
  } else if (gender === "Female") {
    calendarRequiredAge = 18;
  } else {
    calendarRequiredAge = 18;
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

    const combinedData = { ...formData, ...values };

    try {
      // ⭐ Step 1: Check for and delete any existing active session
      try {
        const currentSession = await account.get(); // Check if a session is active
        if (currentSession) {
          console.log(
            "Existing session found, attempting to log out:",
            currentSession.$id
          );
          await account.deleteSession("current"); // Log out the current session
          toast.info("Logged out existing session", {
            description:
              "An active session was found and logged out to proceed with new registration.",
          });
        }
        // eslint-disable-next-line no-unused-vars
      } catch (sessionError) {
        // This catch block handles cases where no session exists or it's invalid, which is fine.
        console.log(
          "No active session or session invalid, proceeding with new registration."
        );
      }

      // ⭐ Step 2: Create Appwrite User Account
      const newUserAccount = await account.create(
        ID.unique(),
        combinedData.email,
        combinedData.password,
        combinedData.name || combinedData.email.split("@")[0]
      );

      console.log("Appwrite User Account Created:", newUserAccount);

      // ⭐ Step 3: Log in the newly created user to establish a session
      // This will now only be called after any previous session is explicitly deleted or if none existed.
      await account.createEmailPasswordSession(
        combinedData.email,
        combinedData.password
      );
      console.log("User session created for new user.");

      // ⭐ Step 4: Create User Profile Document in Appwrite Database
      const newProfileDocument = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.profilesCollectionId,
        newUserAccount.$id, // Use the user's ID as the document ID
        {
          userId: newUserAccount.$id,
          email: combinedData.email,
          dob: combinedData.dob.toISOString(), // Store Date as ISO string
          religion: combinedData.religion,
          caste: combinedData.caste,
          mobileVerified: false, // Initial status: not verified
          gender: combinedData.gender,
          name:
            combinedData.name ||
            newUserAccount.name ||
            combinedData.email.split("@")[0],
          // Initialize other fields that might be empty at this stage but exist in schema
          bio: formData.bio || "",
          state: formData.state || "",
          district: formData.district || "",
          city: formData.city || "",
          maritalStatus: formData.maritalStatus || "",
          height: Number(formData.height), // Corrected: Explicitly convert to Number
          familyType: formData.familyType || "",
          disability: formData.disability || "",
          highestEducation: formData.highestEducation || "",
          employedIn: formData.employedIn || "",
          occupation: formData.occupation || "",
          annualIncome: formData.annualIncome || "",
          churchName: formData.churchName || "",
          churchLocation: formData.churchLocation || "",
          pastorName: formData.pastorName || "",
          pastorPhone: formData.pastorPhone || "",
          churchServicePhotos: formData.churchServicePhotos || [], // Ensure it's an array
          skipBio: formData.skipBio || false,
          skipPhotos: formData.skipPhotos || false,
          phone: formData.phone || "",
          emailVerified: formData.emailVerified || false,
          role: formData.role || "user",
          membershipTier: formData.membershipTier || ["Free"],
          isIDVerified: false,
        }
      );

      console.log("Appwrite Profile Document Created:", newProfileDocument);

      // ⭐ Step 5: Update MultiStepForm Context
      updateFormData({
        ...values, // Keep current page values
        userId: newUserAccount.$id, // Store the Appwrite User ID
        mobileVerified: false, // Initial status
      });

      // ⭐ Step 6: Set a flag in sessionStorage for one-time toast on MobileVerification page
      sessionStorage.setItem("registrationSuccess", "true");
      console.log(
        "EmailPasswordForm: Registration successful, flag set in sessionStorage."
      );

      // ⭐ Step 7: Proceed to the next step in the multi-step form flow
      nextStep();
    } catch (error) {
      console.error("Appwrite Account/Profile operation error:", error);
      let errorMessage = "Operation failed. Please try again.";

      // Handle specific Appwrite errors
      if (error.code === 409) {
        // 409 Conflict - User with this ID/email already exists
        errorMessage =
          "An account with this email already exists. Please try logging in or use a different email.";
      } else if (error.message && error.message.includes("Invalid password")) {
        errorMessage =
          "Password is too weak or invalid. Please choose a stronger password.";
      } else if (
        error.message &&
        error.message.includes(
          "Creation of a session is prohibited when a session is active."
        )
      ) {
        // This specific error should ideally be caught by the initial `account.get()` and `deleteSession` logic.
        // If it still occurs here, it indicates a very specific race condition or a scenario not fully covered.
        // For robustness, we'll keep this error message as a fallback.
        errorMessage =
          "You are already logged in. Please log out to register a new account, or proceed to your profile.";
      }

      form.setError("root.serverError", {
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const passwordValue = form.watch("password");
  const confirmPasswordValue = form.watch("confirmPassword");
  const confirmPasswordError = form.formState.errors.confirmPassword;

  const showPasswordMatchSuccess =
    passwordValue &&
    confirmPasswordValue &&
    passwordValue === confirmPasswordValue &&
    !confirmPasswordError;

  return (
    <Form {...form}>
      <Card className="md:border-0 md:shadow-transparent">
        <CardHeader className="flex flex-col items-center text-center">
          <Contact size={36} strokeWidth={1.5} />
          <CardTitle className="md:text-2xl text-xl">
            Basic Details for Your Match
          </CardTitle>
          <CardDescription>
            Your foundational information is crucial.
          </CardDescription>
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
                            "w-full justify-start text-left font-normal cursor-pointer",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a birth date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-90 dark:text-white" />
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
                        disabled={(date) =>
                          date > maxAllowedBirthDateForCalendar ||
                          date.getFullYear() < minAllowedYear
                        }
                        captionLayout="dropdown"
                        fromYear={minAllowedYear}
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
              <FormField
                control={form.control}
                name="religion"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Religion</FormLabel>
                    <select.Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <select.SelectTrigger className="w-full cursor-pointer">
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
                  </FormItem>
                )}
              />
              {/* caste */}
              <FormField
                control={form.control}
                name="caste"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Caste</FormLabel>
                    <select.Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <select.SelectTrigger className="w-full cursor-pointer">
                        <select.SelectValue placeholder="Select caste" />
                      </select.SelectTrigger>
                      <select.SelectContent>
                        {marathiCastes.map((caste) => (
                          <select.SelectItem
                            className="cursor-pointer"
                            key={caste.value}
                            value={caste.value}
                          >
                            {caste.label}
                          </select.SelectItem>
                        ))}
                      </select.SelectContent>
                    </select.Select>
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
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        {...field}
                        disabled={isLoading}
                        className="pr-10"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword((prev) => !prev)}
                      disabled={isLoading}
                    >
                      <span className="cursor-pointer">
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </span>
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
                    <FormControl>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        {...field}
                        disabled={isLoading}
                        className="pr-10"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
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
                  <div className="flex flex-center gap-2">
                    <LoaderCircleIcon className="animate-spin size-5" />
                  </div>
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
