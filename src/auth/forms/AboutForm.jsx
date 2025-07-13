import { useState, useEffect } from "react"; // ⭐ Added useEffect
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
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import * as select from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// ⭐ Import location data and helper functions
import {
  getAllStates,
  getDistrictsByState,
  getCitiesByDistrict,
} from "./data/locations"; // Adjust path if needed
import { Checkbox } from "@/components/ui/checkbox";
import { LoaderCircleIcon } from "lucide-react";

// --- Zod Schema for About Form ---
const aboutSchema = z
  .object({
    bio: z.string().max(500, "Bio must not exceed 500 characters.").optional(), // ⭐ Make bio optional initially
    skipBio: z.boolean().default(false), // ⭐ New field for the checkbox
    state: z.string().nonempty("Please select your state."),
    district: z.string().nonempty("Please select your district."),
    city: z.string().nonempty("Please select your city."),
  })
  .superRefine((data, ctx) => {
    // ⭐ Conditional validation for bio
    if (!data.skipBio && (!data.bio || data.bio.length < 50)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Bio must be at least 50 characters or check 'I'll add later'.",
        path: ["bio"],
      });
    }
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

function AboutForm() {
  const { formData, updateFormData, nextStep, prevStep } = useMultiStepForm();
  const [isLoading, setIsLoading] = useState(false);

  // ⭐ State for dynamic options
  const [currentStates] = useState(getAllStates());
  const [currentDistricts, setCurrentDistricts] = useState([]);
  const [currentCities, setCurrentCities] = useState([]);

  const form = useForm({
    resolver: zodResolver(aboutSchema),
    mode: "onChange",
    defaultValues: {
      bio: formData.bio || "",
      skipBio: formData.skipBio || false, // ⭐ Initialize skipBio
      state: formData.state || "",
      district: formData.district || "",
      city: formData.city || "",
    },
  });

  // ⭐ Watch for changes in state and district fields
  const selectedState = form.watch("state");
  const selectedDistrict = form.watch("district");
  const skipBioChecked = form.watch("skipBio");

  // ⭐ Effect to update districts when state changes
  useEffect(() => {
    if (selectedState) {
      const districts = getDistrictsByState(selectedState);
      setCurrentDistricts(districts);
      // Reset district and city if the previously selected ones are no longer valid
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

  // ⭐ Effect to update cities when district changes
  useEffect(() => {
    if (selectedState && selectedDistrict) {
      const cities = getCitiesByDistrict(selectedState, selectedDistrict);
      setCurrentCities(cities);
      // Reset city if the previously selected one is no longer valid
      if (!cities.some((c) => c.value === form.getValues("city"))) {
        form.setValue("city", "");
      }
    } else {
      setCurrentCities([]);
      form.setValue("city", "");
    }
  }, [selectedState, selectedDistrict, form]);

  // ⭐ Effect to populate initial districts/cities if formData already has values
  useEffect(() => {
    if (formData.state && formData.district) {
      setCurrentDistricts(getDistrictsByState(formData.state));
      setCurrentCities(getCitiesByDistrict(formData.state, formData.district));
    } else if (formData.state) {
      setCurrentDistricts(getDistrictsByState(formData.state));
    }
  }, [formData.state, formData.district]); // Run only on initial mount or if formData changes

  async function onSubmit(values) {
    setIsLoading(true);
    console.log("About Form (Page 5) data submitted:", values);

    const updatedFormData = { ...formData, ...values };
    console.log("Combined form data after About Form:", updatedFormData);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      updateFormData(values);
      nextStep();
      console.log("AboutForm: Moved to next step.");

      // ⭐ IMPORTANT CHANGES HERE:
      // 1. Simulate successful login immediately after "user creation"
      //const dummyToken = "my_super_secret_dummy_auth_token_from_registration";
      //login(dummyToken); // Log the user in
    } catch (error) {
      console.error("Error submitting about details:", error);
      form.setError("root.serverError", {
        message: "Failed to save about details: " + error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">About Yourself</CardTitle>
          <CardDescription>
            Tell us something about yourself to get to know you better.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-5 w-full"
          >
            {/* Bio */}
            <FormField
              control={form.control}
              name="bio"
              render={(
                { field, fieldState } // ⭐ Added fieldState here
              ) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a little bit about yourself (e.g., your personality, and what you're looking for)..."
                      className="text-sm"
                      rows={5}
                      {...field}
                      disabled={skipBioChecked} // ⭐ Disable if checkbox is checked
                    />
                  </FormControl>
                  {/* ⭐ Conditional FormMessage for bio */}
                  {fieldState.error && !skipBioChecked && <FormMessage />}
                </FormItem>
              )}
            />

            {/* ⭐ "I'll add later" Checkbox for Bio */}
            <FormField
              control={form.control}
              name="skipBio"
              render={({ field }) => (
                <FormItem className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-gray-300 has-[[aria-checked=true]]:bg-blue-50">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      className="cursor-pointer border-gray-300"
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked) {
                          form.setValue("bio", ""); // Clear bio if skipping
                          form.clearErrors("bio"); // Clear bio errors
                        }
                      }}
                    />
                  </FormControl>
                  <div className="leading-none">
                    <FormLabel className={"text-sm text-gray-700"}>
                      I&apos;ll add this later
                    </FormLabel>
                    <FormDescription className={"text-sm"}>
                      You can always update your bio from your profile settings.
                    </FormDescription>
                  </div>
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

export default AboutForm;
