import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import { databases, appwriteConfig } from "@/lib/appwrite";
import { familyTypes } from "@/auth/forms/data/personalDetailsOptions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the Zod schema for family information validation
const familyInfoSchema = z.object({
  familyType: z.string().optional(),
  fatherOccupation: z.string().optional(),
  motherOccupation: z.string().optional(),
  numberOfBrothers: z.string().optional(), // Use string to handle empty input
  numberOfSisters: z.string().optional(), // Use string to handle empty input
  familyLocation: z.string().optional(),
});

// The EditFamilyInfoForm component for updating family details
const EditFamilyInfoForm = ({
  currentUserProfile,
  onSaveSuccess,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Initialize the form with react-hook-form and Zod resolver
  const form = useForm({
    resolver: zodResolver(familyInfoSchema),
    mode: "onChange",
    defaultValues: {
      // Pre-fill form fields with current user profile data,
      // converting numbers to strings for input fields.
      familyType: currentUserProfile?.familyType || "",
      fatherOccupation: currentUserProfile?.fatherOccupation || "",
      motherOccupation: currentUserProfile?.motherOccupation || "",
      numberOfBrothers: currentUserProfile?.numberOfBrothers
        ? String(currentUserProfile.numberOfBrothers)
        : "",
      numberOfSisters: currentUserProfile?.numberOfSisters
        ? String(currentUserProfile.numberOfSisters)
        : "",
      familyLocation: currentUserProfile?.familyLocation || "",
    },
  });

  // Use useEffect to reset the form whenever the currentUserProfile prop changes,
  // ensuring the form always reflects the latest data.
  useEffect(() => {
    form.reset({
      familyType: currentUserProfile?.familyType || "",
      fatherOccupation: currentUserProfile?.fatherOccupation || "",
      motherOccupation: currentUserProfile?.motherOccupation || "",
      numberOfBrothers: currentUserProfile?.numberOfBrothers
        ? String(currentUserProfile.numberOfBrothers)
        : "",
      numberOfSisters: currentUserProfile?.numberOfSisters
        ? String(currentUserProfile.numberOfSisters)
        : "",
      familyLocation: currentUserProfile?.familyLocation || "",
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

      // Prepare values for Appwrite. Ensure numbers are converted back to integers.
      const formattedValues = {
        ...values,
        numberOfBrothers: values.numberOfBrothers
          ? parseInt(values.numberOfBrothers, 10)
          : null,
        numberOfSisters: values.numberOfSisters
          ? parseInt(values.numberOfSisters, 10)
          : null,
      };

      const updatedDocument = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.profilesCollectionId,
        currentUserProfile.$id,
        formattedValues
      );
      toast.success("Family information updated!");
      // Call the success handler with the updated document
      onSaveSuccess(updatedDocument);
    } catch (error) {
      console.error("Error updating family info:", error);
      let errorMessage = "Failed to update family info. Please try again.";
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
        {/* Family Type */}
        <FormField
          control={form.control}
          name="familyType"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Family Type</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-full cursor-pointer">
                    <SelectValue placeholder="Select family type" />
                  </SelectTrigger>
                  <SelectContent>
                    {familyTypes.map((option) => (
                      <SelectItem
                        className="cursor-pointer"
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />

        {/* Father's Occupation */}
        <FormField
          control={form.control}
          name="fatherOccupation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Father's Occupation</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Engineer, Doctor" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Mother's Occupation */}
        <FormField
          control={form.control}
          name="motherOccupation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mother's Occupation</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Homemaker, Teacher" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Number of Brothers */}
        <FormField
          control={form.control}
          name="numberOfBrothers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Brothers</FormLabel>
              <FormControl>
                <Input type="number" min="0" placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Number of Sisters */}
        <FormField
          control={form.control}
          name="numberOfSisters"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Sisters</FormLabel>
              <FormControl>
                <Input type="number" min="0" placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Family Location */}
        <FormField
          control={form.control}
          name="familyLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Family Location</FormLabel>
              <FormControl>
                <Input placeholder="e.g., London, UK" {...field} />
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

export default EditFamilyInfoForm;
