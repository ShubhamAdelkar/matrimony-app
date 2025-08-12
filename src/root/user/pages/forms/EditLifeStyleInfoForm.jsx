import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { databases, appwriteConfig } from "@/lib/appwrite";
import { cn } from "@/lib/utils";

// --- Options for lifestyle fields ---
const smokingOptions = [
  { value: "Non-smoker", label: "Non-smoker" },
  { value: "Occasional", label: "Occasional Smoker" },
  { value: "Regular", label: "Regular Smoker" },
];

const drinkingOptions = [
  { value: "Non-drinker", label: "Non-drinker" },
  { value: "Socially", label: "Social Drinker" },
  { value: "Regular", label: "Regular Drinker" },
];

// --- New predefined options for hobbies and interests ---
const hobbiesInterestsOptions = [
  { value: "Reading", label: "Reading" },
  { value: "Hiking", label: "Hiking" },
  { value: "Cooking", label: "Cooking" },
  { value: "Gaming", label: "Gaming" },
  { value: "Music", label: "Music" },
  { value: "Traveling", label: "Traveling" },
  { value: "Photography", label: "Photography" },
  { value: "Sports", label: "Sports" },
  { value: "Movies", label: "Movies" },
  { value: "Drawing", label: "Drawing" },
  { value: "Programming", label: "Programming" },
];

// --- Zod schema for lifestyle information validation ---
const lifestyleSchema = z.object({
  smokingHabits: z.array(z.string()).optional(),
  drinkingHabits: z.array(z.string()).optional(),
  // Updated schema to expect an array of strings
  hobbiesInterests: z.array(z.string()).optional(),
});

/**
 * Custom Multi-Select component using buttons.
 * This is a clean way to handle array-based selections without
 * relying on an external library.
 */
const MultiSelectButtonGroup = ({ options, value, onChange }) => {
  const toggleOption = (optionValue) => {
    if (value.includes(optionValue)) {
      // If the value is already selected, remove it
      onChange(value.filter((v) => v !== optionValue));
    } else {
      // Otherwise, add it
      onChange([...value, optionValue]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant={value.includes(option.value) ? "default" : "outline"}
          onClick={() => toggleOption(option.value)}
          size={"sm"}
          className={cn(
            "rounded-full transition-colors duration-200 font-light",
            value.includes(option.value) &&
              "bg-primary text-primary-foreground font-medium"
          )}
        >
          {option.label}
          {value.includes(option.value)}
        </Button>
      ))}
    </div>
  );
};

// --- The main form component ---
const EditLifeStyleInfoForm = ({
  currentUserProfile,
  onSaveSuccess,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Initialize the form with react-hook-form and Zod resolver
  const form = useForm({
    resolver: zodResolver(lifestyleSchema),
    mode: "onChange",
    defaultValues: {
      // Pre-fill form fields with current user profile data
      smokingHabits: currentUserProfile?.smokingHabits || [],
      drinkingHabits: currentUserProfile?.drinkingHabits || [],
      // Changed to use the array directly
      hobbiesInterests: currentUserProfile?.hobbiesInterests || [],
    },
  });

  // Reset the form whenever the currentUserProfile prop changes
  useEffect(() => {
    form.reset({
      smokingHabits: currentUserProfile?.smokingHabits || [],
      drinkingHabits: currentUserProfile?.drinkingHabits || [],
      // Changed to use the array directly
      hobbiesInterests: currentUserProfile?.hobbiesInterests || [],
    });
  }, [currentUserProfile, form]);

  // Handle form submission
  async function onSubmit(values) {
    setIsLoading(true);
    try {
      if (!currentUserProfile?.$id) {
        toast.error("User ID not found. Cannot update profile.");
        console.error("No user ID available for profile update.");
        return;
      }

      // No need to format the hobbies/interests anymore, as they are already an array
      const updatedDocument = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.profilesCollectionId,
        currentUserProfile.$id,
        {
          smokingHabits: values.smokingHabits,
          drinkingHabits: values.drinkingHabits,
          hobbiesInterests: values.hobbiesInterests,
        }
      );

      console.log("Lifestyle Info updated successfully:", updatedDocument);
      toast.success("Lifestyle information updated!");
      onSaveSuccess(updatedDocument);
    } catch (error) {
      console.error("Error updating lifestyle info:", error);
      let errorMessage = "Failed to update lifestyle info. Please try again.";
      if (error.code === 404) {
        errorMessage =
          "Profile document not found. Please ensure you have a profile.";
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Smoking Habits Field */}
        <FormField
          control={form.control}
          name="smokingHabits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Smoking Habits</FormLabel>
              <FormControl>
                <MultiSelectButtonGroup
                  options={smokingOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Drinking Habits Field */}
        <FormField
          control={form.control}
          name="drinkingHabits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Drinking Habits</FormLabel>
              <FormControl>
                <MultiSelectButtonGroup
                  options={drinkingOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Hobbies and Interests Field - Now a Multi-Select */}
        <FormField
          control={form.control}
          name="hobbiesInterests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hobbies & Interests</FormLabel>
              <FormControl>
                <MultiSelectButtonGroup
                  options={hobbiesInterestsOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditLifeStyleInfoForm;
