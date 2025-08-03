import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarIcon, LoaderCircleIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import * as select from "@/components/ui/select";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner"; // For toast notifications
// Assuming these are configured correctly
import { appwriteConfig, databases } from "@/lib/appwrite";
import { CardContent } from "@/components/ui/card";

// --- External data imports (assuming they are in the specified paths) ---
import marathiCastes from "@/auth/forms/data/marathiCastes";
import religions from "@/auth/forms/data/religions";
import {
  heightOptions,
  maritalStatuses,
} from "@/auth/forms/data/personalDetailsOptions";
import {
  getAllStates,
  getDistrictsByState,
  getCitiesByDistrict,
} from "@/auth/forms/data/locations";
import {
  employmentOptions,
  highestEducationOptions,
  occupationOptions,
} from "@/auth/forms/data/professionalDetails";

// --- Define your Enum Options (These should match your Appwrite attributes) ---
// Note: These are not used in the final code but are here for reference from your original code.
const bodyTypeOptions = ["Slim", "Athletic", "Average", "Heavy"];
const maritalStatusOptions = [
  "Never Married",
  "Divorced",
  "Widowed",
  "Separated",
  "Annulled",
];
const employedInOptions = [
  "Government",
  "Private",
  "Business",
  "Not Employed",
  "Student",
  "Retired",
];

// --- Zod Schema for Personal Information Form ---
const personalInfoSchema = (gender) => {
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
      // Added name field to the schema
      name: z
        .string()
        .min(1, "Name cannot be empty.")
        .max(100, "Name too long"),
      dob: z
        .date({
          required_error: "A date of birth is required.",
        })
        .refine((date) => date <= maxAllowedBirthDate, {
          message: `You must be at least ${requiredAge} years old.`,
        }),
      height: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z
          .number()
          .min(50, "Minimum height 50cm")
          .max(300, "Maximum height 300cm")
      ),
      weight: z
        .string()
        .max(3, "Weight cannot be more than 2 digits.") // Limits the string length
        .regex(/^\d+$/, "Weight must be a positive number.") // Ensures only digits are entered
        .refine((val) => {
          const num = Number(val);
          return val === "" || (num >= 20 && num <= 150);
        }, "Weight must be between 20kg and 150kg.")
        .optional(),
      bodyType: z
        .enum(bodyTypeOptions, {
          errorMap: (issue, ctx) => {
            if (issue.code === z.ZodIssueCode.invalid_enum_value) {
              return { message: "Please select a valid body type." };
            }
            return { message: ctx.defaultError };
          },
        })
        .optional(),
      motherTongue: z.string().max(50, "Mother tongue too long"),
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
      // Your location fields are now part of the schema
      state: z.string().nonempty("Please select your state."),
      district: z.string().nonempty("Please select your district."),
      city: z.string().nonempty("Please select your city."),
      religion: z.string().max(50, "Religion name too long").optional(),
      caste: z.string().max(100, "Caste name too long").optional(),
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
      organization: z
        .string()
        .max(200, "Organization name too long")
        .optional(),
    })
    .superRefine((data, ctx) => {
      // Validate that selected district belongs to the selected state
      const districtsForSelectedState = getDistrictsByState(data.state);
      if (
        data.state &&
        data.district &&
        !districtsForSelectedState.some((d) => d.value === data.district)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Selected district is not valid for the chosen state.",
          path: ["district"],
        });
      }

      // Validate that selected city belongs to the selected district
      const citiesForSelectedDistrict = getCitiesByDistrict(
        data.state,
        data.district
      );
      if (
        data.state &&
        data.district &&
        data.city &&
        !citiesForSelectedDistrict.some((c) => c.value === data.city)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Selected city is not valid for the chosen district.",
          path: ["city"],
        });
      }
    });
};

function EditPersonalInfoForm({ currentUserProfile, onSaveSuccess, onCancel }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  // ⭐ State for dynamic options
  const [currentStates] = useState(getAllStates());
  const [currentDistricts, setCurrentDistricts] = useState([]);
  const [currentCities, setCurrentCities] = useState([]);

  const gender = currentUserProfile.gender;
  const formSchema = personalInfoSchema(gender);

  // Helper to convert ISO string to Date object for the form
  const getInitialDob = (dobString) => {
    if (!dobString) return undefined;
    try {
      return new Date(dobString);
    } catch (e) {
      console.error("Error creating Date object from dob:", dobString, e);
      return undefined;
    }
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      // FIX: Pre-fill form fields with current user profile data,
      // ensuring correct data types for the Zod schema.
      name: currentUserProfile?.name || "",
      dob: getInitialDob(currentUserProfile?.dob),
      height: currentUserProfile?.height || "",
      weight: currentUserProfile?.weight
        ? String(currentUserProfile.weight)
        : "",
      bodyType: currentUserProfile?.bodyType || undefined,
      motherTongue: currentUserProfile?.motherTongue?.[0] || "",
      maritalStatus: currentUserProfile?.maritalStatus || undefined,
      state: currentUserProfile?.state || "",
      district: currentUserProfile?.district || "",
      city: currentUserProfile?.city || "",
      religion: currentUserProfile?.religion || "",
      caste: currentUserProfile?.caste || "",
      casteNoBar: currentUserProfile?.casteNoBar || false,
      employedIn: currentUserProfile?.employedIn || undefined,
      highestEducation: currentUserProfile?.highestEducation || "",
      occupation: currentUserProfile?.occupation || "",
      collegeInstitution: currentUserProfile?.collegeInstitution || "",
      organization: currentUserProfile?.organization || "",
    },
  });

  // ⭐ WATCH for changes in the 'currentUserProfile' prop and reset the form.
  // This ensures that when the parent component updates the user data,
  // the form fields automatically get filled with the new values.
  useEffect(() => {
    form.reset({
      name: currentUserProfile?.name || "",
      dob: getInitialDob(currentUserProfile?.dob),
      height: currentUserProfile?.height || "",
      weight: currentUserProfile?.weight
        ? String(currentUserProfile.weight)
        : "",
      bodyType: currentUserProfile?.bodyType || undefined,
      motherTongue: currentUserProfile?.motherTongue?.[0] || "",
      maritalStatus: currentUserProfile?.maritalStatus || undefined,
      state: currentUserProfile?.state || "",
      district: currentUserProfile?.district || "",
      city: currentUserProfile?.city || "",
      religion: currentUserProfile?.religion || "",
      caste: currentUserProfile?.caste || "",
      casteNoBar: currentUserProfile?.casteNoBar || false,
      employedIn: currentUserProfile?.employedIn || undefined,
      highestEducation: currentUserProfile?.highestEducation || "",
      occupation: currentUserProfile?.occupation || "",
      collegeInstitution: currentUserProfile?.collegeInstitution || "",
      organization: currentUserProfile?.organization || "",
    });

    // Also re-populate dynamic dropdowns based on the new state/district
    if (currentUserProfile.state && currentUserProfile.district) {
      setCurrentDistricts(getDistrictsByState(currentUserProfile.state));
      setCurrentCities(
        getCitiesByDistrict(
          currentUserProfile.state,
          currentUserProfile.district
        )
      );
    } else if (currentUserProfile.state) {
      setCurrentDistricts(getDistrictsByState(currentUserProfile.state));
    }
  }, [currentUserProfile, form]); // Dependency array: run this effect whenever currentUserProfile changes.

  const selectedState = form.watch("state");
  const selectedDistrict = form.watch("district");

  useEffect(() => {
    if (selectedState) {
      const districts = getDistrictsByState(selectedState);
      setCurrentDistricts(districts);
      if (!districts.some((d) => d.value === form.getValues("district"))) {
        form.setValue("district", "");
        form.setValue("city", "");
      }
    } else {
      setCurrentDistricts([]);
      form.setValue("district", "");
      form.setValue("city", "");
    }
  }, [selectedState, form]);

  useEffect(() => {
    if (selectedState && selectedDistrict) {
      const cities = getCitiesByDistrict(selectedState, selectedDistrict);
      setCurrentCities(cities);
      if (!cities.some((c) => c.value === form.getValues("city"))) {
        form.setValue("city", "");
      }
    } else {
      setCurrentCities([]);
      form.setValue("city", "");
    }
  }, [selectedState, selectedDistrict, form]);

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
    try {
      if (!currentUserProfile?.$id) {
        toast.error("User ID not found. Cannot update profile.");
        console.error("No user ID available for profile update.");
        return;
      }

      const formattedValues = { ...values };
      if (formattedValues.dob) {
        formattedValues.dob = formattedValues.dob.toISOString();
      }

      if (formattedValues.motherTongue) {
        formattedValues.motherTongue = [formattedValues.motherTongue];
      }

      const updatedDocument = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.profilesCollectionId,
        currentUserProfile.$id,
        formattedValues
      );

      console.log("Personal Info updated successfully:", updatedDocument);
      toast.success("Personal information updated!");
      // ⭐ MODIFIED: Pass the newly updated document back to the parent.
      onSaveSuccess(updatedDocument);
    } catch (error) {
      console.error("Error updating personal info:", error);
      let errorMessage = "Failed to update personal info. Please try again.";
      if (error.code === 404) {
        errorMessage =
          "Profile document not found. Please ensure you have a profile.";
      } else if (error.code === 401 || error.code === 403) {
        errorMessage =
          "You are not authorized to update this profile. Please log in again.";
      }
      toast.error(errorMessage);
      form.setError("root.serverError", {
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pr-2">
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
                  placeholder={currentUserProfile.name}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        {/* Height */}
        <FormField
          control={form.control}
          name="height"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Height</FormLabel>
              <FormControl>
                <select.Select
                  // FIX: Set the value to the cmValue from the user's profile
                  onValueChange={(value) => {
                    const selectedHeight = heightOptions.find(
                      (opt) => opt.value === value
                    );
                    if (selectedHeight) {
                      field.onChange(selectedHeight.cmValue); // Pass the number to the form state
                    }
                  }}
                  // Use the user's current height in cm to find the correct label for display
                  value={
                    heightOptions.find((opt) => opt.cmValue === field.value)
                      ?.value || ""
                  }
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

        {/* Weight */}

        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight (kg)</FormLabel>
              <FormControl>
                <Input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="e.g., 70"
                  {...field}
                  // ⭐ THE FIX: Override the value and onChange from the spread operator
                  // Ensure the input's value is always a string, converting from number or undefined.
                  value={
                    field.value !== undefined && field.value !== null
                      ? String(field.value)
                      : ""
                  }
                  className="text-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  className="w-full grid grid-cols-2 gap-3"
                >
                  {maritalStatuses.map((maritalStatus) => (
                    <RadioGroup.Item
                      key={maritalStatus.value}
                      value={maritalStatus.value}
                      className="ring-[1px] ring-border rounded py-1 px-2 data-[state=checked]:ring-2 data-[state=checked]:ring-blue-500 cursor-pointer data-[state=checked]:text-muted-foreground"
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

        {/* Body Type */}
        <FormField
          control={form.control}
          name="bodyType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Body Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="text-sm w-full">
                    <SelectValue placeholder="Select your body type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {bodyTypeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Mother Tongue */}
        <FormField
          control={form.control}
          name="motherTongue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mother Tongue</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className={"text-sm w-full"}>
                    <SelectValue placeholder="Select a mother tongue" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="marathi">Marathi</SelectItem>
                  <SelectItem value="hindi">Hindi</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                </SelectContent>
              </Select>
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
                    <select.SelectValue
                      placeholder={currentUserProfile.religion}
                    />
                  </select.SelectTrigger>
                  <select.SelectContent>
                    {religions.map((religion, index) => (
                      <select.SelectItem
                        className="cursor-pointer"
                        key={index}
                        value={religion}
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
                    <select.SelectValue
                      placeholder={currentUserProfile.caste}
                    />
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
                  <select.SelectTrigger className="w-full cursor-pointer min-w-0">
                    <select.SelectValue
                      placeholder="Select your highest education"
                      className="truncate"
                    />
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

        <FormField
          control={form.control}
          name="organization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization</FormLabel>
              <FormControl>
                <Input
                  placeholder="eg., ABC Corp."
                  {...field}
                  type={"text"}
                  className={"text-sm"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* State */}
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>State</FormLabel>
              <FormControl>
                <select.Select
                  onValueChange={(value) => {
                    field.onChange(value); // Update form value
                    form.setValue("district", ""); // Reset district
                    form.setValue("city", ""); // Reset city
                    form.clearErrors(["district", "city"]); // Clear errors for dependent fields
                  }}
                  defaultValue={field.value}
                >
                  <select.SelectTrigger className="w-full cursor-pointer">
                    <select.SelectValue placeholder="Select your state" />
                  </select.SelectTrigger>
                  <select.SelectContent>
                    {currentStates.map(
                      (
                        option // ⭐ Use currentStates
                      ) => (
                        <select.SelectItem
                          className="cursor-pointer"
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </select.SelectItem>
                      )
                    )}
                  </select.SelectContent>
                </select.Select>
              </FormControl>
              <FormMessage /> {/* Keep FormMessage for state */}
            </FormItem>
          )}
        />

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
          {/* District */}
          <FormField
            control={form.control}
            name="district"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>District</FormLabel>
                <FormControl>
                  <select.Select
                    onValueChange={(value) => {
                      field.onChange(value); // Update form value
                      form.setValue("city", ""); // Reset city
                      form.clearErrors(["city"]); // Clear errors for dependent fields
                    }}
                    defaultValue={field.value}
                    disabled={!selectedState} // ⭐ Disable if no state selected
                  >
                    <select.SelectTrigger className="w-full cursor-pointer">
                      <select.SelectValue placeholder="Select your district" />
                    </select.SelectTrigger>
                    <select.SelectContent>
                      {/* ⭐ REMOVED the problematic conditional Select.Item */}
                      {currentDistricts.map((option) => (
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

          {/* City */}
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>City</FormLabel>
                <FormControl>
                  <select.Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!selectedDistrict} // ⭐ Disable if no district selected
                  >
                    <select.SelectTrigger className="w-full cursor-pointer">
                      <select.SelectValue placeholder="Select your city" />
                    </select.SelectTrigger>
                    <select.SelectContent>
                      {/* ⭐ REMOVED the problematic conditional Select.Item */}
                      {currentCities.map((option) => (
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

        {/* Server Error Message */}
        {form.formState.errors.root?.serverError && (
          <p className="text-sm font-medium text-red-500">
            {form.formState.errors.root.serverError.message}
          </p>
        )}

        {/* Dialog Footer Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className={"cursor-pointer"}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className={"cursor-pointer"}
          >
            {isLoading && (
              <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default EditPersonalInfoForm;
