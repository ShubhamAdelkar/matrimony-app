// src/auth/forms/ChurchDetailsForm.jsx

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form"; // Corrected import path for useForm
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Church, Image, Info, LoaderCircleIcon, X } from "lucide-react";

import { useMultiStepForm } from "../context/MultiStepFormContext";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// ⭐ Import Appwrite services
import { databases, storage, ID } from "../../lib/appwrite";
import { appwriteConfig } from "../../lib/appwrite";

// --- Zod Schema for Church Details Form ---
const churchDetailsSchema = z
  .object({
    churchName: z
      .string()
      .min(4, "Church name must be at least 4 characters")
      .max(100, "Church name must not exceed 100 characters")
      .regex(
        /^[a-zA-Z\s'-]+$/,
        "Church name can only contain letters, spaces, hyphens, and apostrophes"
      ),

    churchLocation: z
      .string()
      .min(5, "Church location must be at least 5 characters")
      .max(200, "Church location must not exceed 200 characters")
      .regex(/^[a-zA-Z0-9\s,.-]+$/, "Please enter a valid location"),

    pastorName: z
      .string()
      .min(2, "Pastor name must be at least 2 characters")
      .max(50, "Pastor name must not exceed 50 characters")
      .regex(
        /^[a-zA-Z\s'-]+$/,
        "Pastor name can only contain letters, spaces, hyphens, and apostrophes"
      ),

    pastorPhone: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .max(10, "Phone number must not exceed 10 digits")
      .regex(/^[+]?[\d\s()-]+$/, "Please enter a valid phone number")
      .refine((val) => {
        const digitsOnly = val.replace(/\D/g, "");
        return digitsOnly.length >= 10 && digitsOnly.length <= 15;
      }, "Phone number must contain 10-15 digits"),

    // churchServicePhotos will now hold File objects (for new uploads) or an array of file IDs (for existing)
    // We'll handle the conversion and storage of IDs in the onSubmit logic.
    churchServicePhotos: z
      .array(z.any()) // Allow File objects initially, or strings (file IDs) if pre-filled
      .max(3, "Maximum 3 photos allowed")
      .optional(), // Make optional here, validation handled by superRefine and onSubmit

    skipPhotos: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    // Conditional validation for churchServicePhotos
    // Only validate if not skipping photos AND there are no existing photos from backend
    // If photos are skipped, or if there are existing photos (meaning user already uploaded some), no new upload is strictly required.
    if (
      !data.skipPhotos &&
      (!data.churchServicePhotos ||
        data.churchServicePhotos.length < 2 ||
        data.churchServicePhotos.some((file) => typeof file === "string")) // If any are strings, they are existing, so don't force new upload
    ) {
      // If no existing photos (all are File objects or empty) and not skipping, then require 2
      if (
        !data.churchServicePhotos ||
        data.churchServicePhotos.filter((file) => typeof file !== "string")
          .length < 2
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Please upload at least 2 church service photos or check 'I'll add later'.",
          path: ["churchServicePhotos"],
        });
      }
    }
  });

function ChurchDetailsForm() {
  const { formData, updateFormData, nextStep, prevStep } = useMultiStepForm();
  const [isLoading, setIsLoading] = useState(false); // Overall form submission loading
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false); // For active photo uploads
  const [isFetchingExistingPhotos, setIsFetchingExistingPhotos] =
    useState(true); // For initial load of photos

  // selectedFiles will hold actual File objects for new uploads
  const [selectedFiles, setSelectedFiles] = useState([]);
  // previewUrls will hold Blob URLs for new files, or Appwrite preview URLs for existing files
  const [previewUrls, setPreviewUrls] = useState([]);
  // existingFileIds will hold the IDs of photos already uploaded to Appwrite
  const [existingFileIds, setExistingFileIds] = useState([]);

  const form = useForm({
    resolver: zodResolver(churchDetailsSchema),
    mode: "onChange",
    defaultValues: {
      churchName: formData.churchName || "",
      churchLocation: formData.churchLocation || "",
      pastorName: formData.pastorName || "",
      pastorPhone: formData.pastorPhone || "",
      churchServicePhotos: [], // This will be managed by selectedFiles/existingFileIds
      skipPhotos: formData.skipPhotos || false,
    },
  });

  const skipPhotosChecked = form.watch("skipPhotos");

  // ⭐ useEffect to load existing photos from Appwrite when component mounts
  useEffect(() => {
    const loadExistingPhotos = async () => {
      const userId = formData.userId;
      if (!userId) {
        console.warn(
          "No userId found in formData. Cannot load existing photos."
        );
        setIsFetchingExistingPhotos(false);
        return;
      }

      setIsFetchingExistingPhotos(true); // Start fetching
      try {
        const profile = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.profilesCollectionId,
          userId
        );

        if (
          profile.churchServicePhotos &&
          profile.churchServicePhotos.length > 0
        ) {
          const fetchedFileIds = profile.churchServicePhotos;
          setExistingFileIds(fetchedFileIds);

          // Generate preview URLs for existing files
          const urls = fetchedFileIds.map(
            (fileId) =>
              storage.getFilePreview(
                appwriteConfig.churchPhotosBucketId,
                fileId
              ).href
          );
          setPreviewUrls(urls);

          // Set the form field value with existing file IDs (as strings)
          form.setValue("churchServicePhotos", fetchedFileIds);
          console.log("Loaded existing church service photos:", fetchedFileIds);
        } else {
          // Explicitly clear if no photos found or attribute is empty
          setExistingFileIds([]);
          setPreviewUrls([]);
          form.setValue("churchServicePhotos", []);
        }
      } catch (error) {
        console.error("Error loading existing church service photos:", error);
        // On error, also ensure states are reset to empty/false
        setExistingFileIds([]);
        setPreviewUrls([]);
        form.setValue("churchServicePhotos", []);
      } finally {
        setIsFetchingExistingPhotos(false); // Always end fetching
      }
    };

    loadExistingPhotos();

    // Cleanup on unmount (important for revoking Object URLs)
    // This cleanup function uses the 'previewUrls' from the closure, not as a dependency for re-running the effect.
    return () => {
      // Only revoke URLs that were created by URL.createObjectURL
      // URLs from storage.getFilePreview do not need to be revoked.
      // This is a simplification; a more robust solution would track which URLs are Blob URLs.
      // For now, assuming previewUrls contains only Blob URLs from handleFileSelect.
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [formData.userId, form]); // ⭐ Removed previewUrls from dependency array

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Combine new files with existing files (if any) and limit to 3
    const combinedFiles = [...selectedFiles, ...files].slice(0, 3);
    setSelectedFiles(combinedFiles);

    // Generate preview URLs for *all* currently selected files (newly chosen + previously selected in this session)
    const urls = combinedFiles.map((file) => URL.createObjectURL(file));
    // Revoke old URLs before setting new ones to prevent memory leaks
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls(urls);

    // Update the form field value with the actual File objects
    form.setValue("churchServicePhotos", combinedFiles, {
      shouldValidate: true,
    });

    event.target.value = ""; // Clear the file input value to allow re-selecting the same files
  };

  // Remove a specific file (handles both new and existing files)
  const removeFile = useCallback(
    async (indexToRemove) => {
      // Determine if the file to remove is an existing one (from Appwrite) or a newly selected one
      const isExistingFile = indexToRemove < existingFileIds.length;
      const fileIdToRemove = isExistingFile
        ? existingFileIds[indexToRemove]
        : null;

      let newSelectedFiles = [...selectedFiles];
      let newExistingFileIds = [...existingFileIds];

      if (isExistingFile) {
        newExistingFileIds = existingFileIds.filter(
          (_, index) => index !== indexToRemove
        );
        setExistingFileIds(newExistingFileIds);
      } else {
        // Adjust index for selectedFiles as it comes after existingFileIds in the combined display
        newSelectedFiles = selectedFiles.filter(
          (_, index) => index !== indexToRemove - existingFileIds.length
        );
        setSelectedFiles(newSelectedFiles);
      }

      // Re-generate preview URLs for the remaining files
      const allRemainingFiles = [
        ...newExistingFileIds.map((fileId) => ({
          type: "existing",
          id: fileId,
        })), // Placeholder objects for existing files
        ...newSelectedFiles.map((file) => ({ type: "new", file: file })), // Actual File objects for new files
      ];

      const newPreviewUrls = allRemainingFiles.map((item) => {
        if (item.type === "existing") {
          return storage.getFilePreview(
            appwriteConfig.churchPhotosBucketId,
            item.id
          ).href;
        } else {
          return URL.createObjectURL(item.file);
        }
      });

      // Revoke old Blob URLs before setting new ones
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setPreviewUrls(newPreviewUrls);

      // Update the form field value with the current state of files (mix of IDs and File objects)
      form.setValue(
        "churchServicePhotos",
        [...newExistingFileIds, ...newSelectedFiles],
        { shouldValidate: true }
      );

      // ⭐ If it's an existing file (has an ID), delete it from Appwrite Storage
      if (fileIdToRemove) {
        setIsLoading(true); // Show overall loading for deletion
        try {
          await storage.deleteFile(
            appwriteConfig.churchPhotosBucketId,
            fileIdToRemove
          );
          console.log(`Deleted file ${fileIdToRemove} from Appwrite Storage.`);

          // The state (existingFileIds) is already updated above
          // Now update the profile document to remove the file ID
          const userId = formData.userId;
          if (userId) {
            await databases.updateDocument(
              appwriteConfig.databaseId,
              appwriteConfig.profilesCollectionId,
              userId,
              { churchServicePhotos: newExistingFileIds } // Send the updated list of existing IDs
            );
            console.log("Profile document updated after file deletion.");
          }
        } catch (error) {
          console.error(
            "Error deleting file from Appwrite Storage or updating profile:",
            error
          );
          form.setError("root.serverError", {
            message: "Failed to delete photo: " + error.message,
          });
        } finally {
          setIsLoading(false);
        }
      }
    },
    [selectedFiles, existingFileIds, previewUrls, form, formData.userId]
  );

  async function onSubmit(values) {
    setIsLoading(true); // Overall form submission loading

    console.log("Church Details Form data submitted:", values);

    const userId = formData.userId;
    if (!userId) {
      console.error("No userId found in formData. Cannot update profile.");
      form.setError("root.serverError", {
        message: "User not identified. Please go back to registration.",
      });
      setIsLoading(false);
      return;
    }

    let uploadedFileIds = [...existingFileIds]; // Start with existing IDs

    if (!values.skipPhotos && selectedFiles.length > 0) {
      setIsUploadingPhotos(true); // ⭐ Start photo upload loading here
      try {
        // ⭐ Upload new files to Appwrite Storage
        const uploadPromises = selectedFiles.map((file) =>
          storage.createFile(
            appwriteConfig.churchPhotosBucketId,
            ID.unique(),
            file
          )
        );
        const uploadedFiles = await Promise.all(uploadPromises);
        const newFileIds = uploadedFiles.map((file) => file.$id);
        uploadedFileIds = [...uploadedFileIds, ...newFileIds]; // Add new IDs
        console.log("New files uploaded to Appwrite Storage:", newFileIds);
      } catch (uploadError) {
        console.error("Error uploading church service photos:", uploadError);
        form.setError("root.serverError", {
          message: "Failed to upload photos: " + uploadError.message,
        });
        setIsLoading(false);
        setIsUploadingPhotos(false); // ⭐ Stop photo upload loading
        return;
      } finally {
        setIsUploadingPhotos(false); // ⭐ Ensure it stops even on success within this block
      }
    } else if (values.skipPhotos) {
      // If photos are skipped, ensure no photos are linked
      uploadedFileIds = [];
      // ⭐ If user previously uploaded photos and now skips, delete them
      if (existingFileIds.length > 0) {
        setIsUploadingPhotos(true); // ⭐ Start photo upload loading for deletion
        try {
          const deletePromises = existingFileIds.map((fileId) =>
            storage.deleteFile(appwriteConfig.churchPhotosBucketId, fileId)
          );
          await Promise.all(deletePromises);
          console.log(
            "Existing photos deleted due to 'skip photos' selection."
          );
        } catch (deleteError) {
          console.error(
            "Error deleting existing photos when skipping:",
            deleteError
          );
          // Don't block submission, but log the error
        } finally {
          setIsUploadingPhotos(false); // ⭐ Ensure it stops even on success within this block
        }
      }
    }

    try {
      // ⭐ Update the user profile document with church details and photo IDs
      const updatedProfile = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.profilesCollectionId,
        userId,
        {
          churchName: values.churchName,
          churchLocation: values.churchLocation,
          pastorName: values.pastorName,
          pastorPhone: values.pastorPhone,
          churchServicePhotos: uploadedFileIds, // ⭐ Store the array of file IDs
          skipPhotos: values.skipPhotos,
        }
      );

      console.log("Appwrite Profile Document Updated:", updatedProfile);

      // ⭐ Update the global form data context
      updateFormData({
        ...values,
        churchServicePhotos: uploadedFileIds, // Store IDs in context
      });

      nextStep();
      console.log("ChurchDetailsForm: Moved to next step.");
    } catch (error) {
      console.error("Error updating church details in Appwrite:", error);
      let errorMessage = "Failed to save church details. Please try again.";

      if (error.code === 404) {
        errorMessage =
          "User profile not found. Please re-register or contact support.";
      } else if (error.code === 401 || error.code === 403) {
        errorMessage =
          "You are not authorized to update this profile. Please log in again.";
      } else if (
        error.message &&
        error.message.includes("Invalid document structure")
      ) {
        errorMessage =
          "Data format error for church details. Please ensure your Appwrite profile attributes match the expected types.";
      }

      form.setError("root.serverError", {
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <Card className={"md:border-0 md:shadow-transparent"}>
        <CardHeader className="flex flex-col items-center text-center">
          <Church size={58} strokeWidth={1.5} />
          <CardTitle className="md:text-2xl text-xl">Church Details</CardTitle>
          <CardDescription>
            Please provide your church information to complete your profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-5 w-full"
          >
            {/* Church Name */}
            <FormField
              control={form.control}
              name="churchName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Church Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Grace Baptist Church"
                      {...field}
                      className={"text-sm"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Church Location */}
            <FormField
              control={form.control}
              name="churchLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Church Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="eg., Sawantwadi, Sindhudurg"
                      {...field}
                      className={"text-sm"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pastor Name */}
            <FormField
              control={form.control}
              name="pastorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pastor Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Rev. John Smith"
                      {...field}
                      className={"text-sm"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pastor Phone */}
            <FormField
              control={form.control}
              name="pastorPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pastor Contact Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter contact number"
                      {...field}
                      className={"text-sm"}
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Church Service Photos */}
            <FormField
              control={form.control}
              name="churchServicePhotos"
              render={({ fieldState }) => (
                <FormItem>
                  <div className="flex gap-2">
                    <FormLabel>Church Service Photos</FormLabel>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-3.5 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Select 2-3 photos (JPEG, PNG, WebP, max 5MB each)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <FormControl>
                    <div className="w-full space-y-4">
                      {/* File Input */}
                      <div className="flex w-full items-center border rounded-md pl-2">
                        <Image
                          className={`size-5 ${
                            selectedFiles.length + existingFileIds.length >=
                              3 ||
                            skipPhotosChecked ||
                            isUploadingPhotos ||
                            isFetchingExistingPhotos
                              ? "text-gray-400 "
                              : "text-black dark:text-white"
                          } `}
                        />
                        <Input
                          id="church-photos"
                          type="file"
                          className="cursor-pointer text-sm border-0 translate-x-[-4px] text-gray-500"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          multiple
                          onChange={handleFileSelect}
                          disabled={
                            selectedFiles.length + existingFileIds.length >=
                              3 ||
                            skipPhotosChecked ||
                            isUploadingPhotos ||
                            isFetchingExistingPhotos
                          }
                        />
                      </div>

                      {/* ⭐ New: Loading indicator for fetching existing photos */}
                      {isFetchingExistingPhotos &&
                        existingFileIds.length === 0 &&
                        selectedFiles.length === 0 &&
                        !skipPhotosChecked && (
                          <div className="flex items-center gap-2 text-blue-500 text-sm">
                            <LoaderCircleIcon className="animate-spin size-4" />
                            <span>Loading existing photos...</span>
                          </div>
                        )}

                      {/* Preview Grid */}
                      {(previewUrls.length > 0 || existingFileIds.length > 0) &&
                        !skipPhotosChecked && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                            {/* Existing Photos */}
                            {existingFileIds.map((fileId, index) => (
                              <div
                                key={`existing-${fileId}`}
                                className="relative group"
                              >
                                <img
                                  src={
                                    storage.getFilePreview(
                                      appwriteConfig.churchPhotosBucketId,
                                      fileId
                                    ).href
                                  }
                                  alt={`Existing Church service ${index + 1}`}
                                  className="w-full h-40 object-cover rounded-lg"
                                />
                                {/* Remove button for existing photos */}
                                <button
                                  type="button"
                                  onClick={() => removeFile(index)} // Pass index to remove
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
                                  disabled={isLoading || isUploadingPhotos} // Disable during any loading
                                >
                                  <X className="size-5" />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/5 shadow-lg backdrop-blur-sm text-white text-xs p-1 pl-1.5 rounded-b-lg truncate">
                                  Existing Photo
                                </div>
                              </div>
                            ))}
                            {/* Newly Selected Photos (if any) */}
                            {selectedFiles.map((file, index) => (
                              <div
                                key={`new-${file.name}-${index}`}
                                className="relative group"
                              >
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`New Church service ${index + 1}`}
                                  className="w-full h-40 object-cover rounded-lg"
                                />
                                {/* Remove button for new photos */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeFile(existingFileIds.length + index)
                                  } // Adjust index for new files
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
                                  disabled={isLoading || isUploadingPhotos} // Disable during any loading
                                >
                                  <X className="size-5" />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/5 shadow-lg backdrop-blur-sm text-white text-xs p-1 pl-1.5 rounded-b-lg truncate">
                                  {file.name}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                      {/* Upload Status */}
                      {!skipPhotosChecked && (
                        <div className="text-sm">
                          {isUploadingPhotos ? ( // ⭐ Show upload loading here
                            <div className="flex items-center gap-2 text-blue-500">
                              <LoaderCircleIcon className="animate-spin size-4" />
                              <span>Uploading photos...</span>
                            </div>
                          ) : (
                            <>
                              <span
                                className={`font-medium ${selectedFiles.length + existingFileIds.length >= 2 ? "text-green-600" : "text-orange-600"}`}
                              >
                                {selectedFiles.length + existingFileIds.length}
                                /3 photos selected
                              </span>
                              {selectedFiles.length + existingFileIds.length <
                                2 && (
                                <span className="text-red-500 ml-2">
                                  (At least 2 photos required)
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Upload photos of your church services, worship, or
                    gatherings
                  </FormDescription>
                  {fieldState.error && !skipPhotosChecked && <FormMessage />}
                </FormItem>
              )}
            />

            {/* "I'll add later" Checkbox for Photos */}
            <FormField
              control={form.control}
              name="skipPhotos"
              render={({ field }) => (
                <FormItem className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-gray-300 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:text-black">
                  <FormControl>
                    <Checkbox
                      className={"cursor-pointer border-gray-300"}
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked) {
                          // Clear selected files and previews if skipping
                          setSelectedFiles([]);
                          setPreviewUrls([]);
                          // Also clear existing files if user decides to skip them
                          setExistingFileIds([]);
                          // ⭐ Set form value to empty array for photos if skipping
                          form.setValue("churchServicePhotos", [], {
                            shouldValidate: true,
                          });
                        } else {
                          // If unchecking, try to load existing photos again
                          // This might be tricky if they were already removed from existingFileIds.
                          // A full reload of the form data might be better here, or re-fetching from DB.
                          // For simplicity, we'll just let the user re-upload if they uncheck.
                        }
                      }}
                      disabled={
                        isLoading ||
                        isUploadingPhotos ||
                        isFetchingExistingPhotos
                      } // Disable during any loading
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className={"text-sm"}>
                      I&apos;ll add photos later
                    </FormLabel>
                    <FormDescription className={"text-sm"}>
                      You can always add photos from your profile settings.
                    </FormDescription>
                  </div>
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
                disabled={
                  isLoading || isUploadingPhotos || isFetchingExistingPhotos
                } // Disable during any loading
              >
                Back
              </Button>

              <Button
                type="submit"
                className="shad-button cursor-pointer"
                disabled={
                  isLoading || isUploadingPhotos || isFetchingExistingPhotos
                } // Disable during any loading
              >
                {isLoading || isUploadingPhotos ? ( // Show loading if overall or photos are loading
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

export default ChurchDetailsForm;
