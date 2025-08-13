import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Loader2,
  X,
  Info,
  LoaderCircleIcon,
  AlertCircleIcon,
  ImageIcon,
  UploadIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { databases, storage, ID, appwriteConfig } from "@/lib/appwrite";
import { useFileUpload } from "@/hooks/use-file-upload";

// --- Zod Schema for Church Details Form ---
const churchDetailsSchema = z.object({
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
  churchServicePhotos: z
    .array(z.any())
    .min(2, "At least 2 photos are required")
    .max(3, "Maximum 3 photos allowed"),
});

const EditChurchInfoForm = ({
  currentUserProfile,
  onSaveSuccess,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [isFetchingExistingPhotos, setIsFetchingExistingPhotos] =
    useState(true);

  const maxSizeMB = 5;
  const maxSize = maxSizeMB * 1024 * 1024; // 5MB
  const maxFiles = 3;

  // Convert existing photos to initial files format
  const initialFiles = useMemo(() => {
    if (
      currentUserProfile?.churchServicePhotos &&
      currentUserProfile.churchServicePhotos.length > 0
    ) {
      return currentUserProfile.churchServicePhotos.map((fileId, index) => {
        const imageUrlObject = storage.getFileView(
          appwriteConfig.photoBucket,
          fileId
        );
        const url = imageUrlObject ? imageUrlObject.toString() : "";

        return {
          id: fileId,
          name: `existing-church-photo-${index + 1}.jpg`,
          size: 0, // We don't know the actual size for existing files
          type: "image/jpeg",
          url: url,
          isExisting: true,
        };
      });
    }
    return [];
  }, [currentUserProfile?.churchServicePhotos]);

  // File upload hook with initial files
  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
      addFiles,
    },
  ] = useFileUpload({
    accept: "image/jpeg,image/jpg,image/png,image/webp",
    maxSize,
    multiple: true,
    maxFiles,
    initialFiles,
    onFilesChange: (updatedFiles) => {
      // Update form value when files change
      form.setValue("churchServicePhotos", updatedFiles, {
        shouldValidate: true,
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(churchDetailsSchema),
    mode: "onChange",
    defaultValues: {
      churchName: currentUserProfile?.churchName || "",
      churchLocation: currentUserProfile?.churchLocation || "",
      pastorName: currentUserProfile?.pastorName || "",
      pastorPhone: currentUserProfile?.pastorPhone || "",
      churchServicePhotos: initialFiles,
    },
  });

  // Handle loading state for existing photos
  useEffect(() => {
    if (initialFiles.length > 0) {
      setIsFetchingExistingPhotos(false);
    } else {
      setIsFetchingExistingPhotos(false);
    }
  }, [initialFiles]);

  // Reset form when currentUserProfile changes
  useEffect(() => {
    form.reset({
      churchName: currentUserProfile?.churchName || "",
      churchLocation: currentUserProfile?.churchLocation || "",
      pastorName: currentUserProfile?.pastorName || "",
      pastorPhone: currentUserProfile?.pastorPhone || "",
      churchServicePhotos: files,
    });
  }, [currentUserProfile, files, form]);

  // Handle file removal with Appwrite cleanup
  const handleRemoveFile = async (fileId) => {
    const fileToRemove = files.find((f) => f.id === fileId);

    if (fileToRemove?.isExisting) {
      // Delete existing file from Appwrite storage
      setIsLoading(true);
      try {
        await storage.deleteFile(appwriteConfig.photoBucket, fileId);

        // Update user profile to remove the file ID
        const remainingExistingFiles = files
          .filter((f) => f.id !== fileId && f.isExisting)
          .map((f) => f.id);

        const userId = currentUserProfile?.$id;
        if (userId) {
          await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.profilesCollectionId,
            userId,
            { churchServicePhotos: remainingExistingFiles }
          );
        }

        toast.success("Photo deleted successfully.");
      } catch (error) {
        console.error("Error deleting file:", error);
        toast.error("Failed to delete photo from storage.");
        setIsLoading(false);
        return; // Don't remove from UI if deletion failed
      } finally {
        setIsLoading(false);
      }
    }

    // Remove file from UI
    removeFile(fileId);
  };

  async function onSubmit(values) {
    setIsLoading(true);
    const userId = currentUserProfile?.$id;

    if (!userId) {
      toast.error("User ID not found. Cannot update profile.");
      setIsLoading(false);
      return;
    }

    // Separate existing and new files
    const existingFiles = files.filter((f) => f.isExisting);
    const newFiles = files.filter((f) => !f.isExisting);

    let uploadedFileIds = existingFiles.map((f) => f.id);

    // Upload new files if any
    if (newFiles.length > 0) {
      setIsUploadingPhotos(true);
      try {
        const uploadPromises = newFiles.map((fileObj) =>
          storage.createFile(
            appwriteConfig.photoBucket,
            ID.unique(),
            fileObj.file // This is now correct because only new files are in this array
          )
        );
        const uploadedFiles = await Promise.all(uploadPromises);
        const newFileIds = uploadedFiles.map((file) => file.$id);
        uploadedFileIds = [...uploadedFileIds, ...newFileIds];
        // toast.success("Photos uploaded successfully!");
      } catch (uploadError) {
        console.error("Error uploading photos:", uploadError);
        toast.error("Failed to upload photos. Please try again.");
        setIsLoading(false);
        setIsUploadingPhotos(false);
        return;
      } finally {
        setIsUploadingPhotos(false);
      }
    }

    try {
      const updatedProfile = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.profilesCollectionId,
        userId,
        {
          churchName: values.churchName,
          churchLocation: values.churchLocation,
          pastorName: values.pastorName,
          pastorPhone: values.pastorPhone,
          churchServicePhotos: uploadedFileIds,
        }
      );
      toast.success("Church details updated successfully!");
      onSaveSuccess(updatedProfile);
      onCancel();
    } catch (error) {
      console.error("Error updating church details:", error);
      let errorMessage = "Failed to save church details. Please try again.";
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
        {/* Church Name Field */}
        <FormField
          control={form.control}
          name="churchName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Church Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., The Redeemed Christian Church of God"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Church Location Field */}
        <FormField
          control={form.control}
          name="churchLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Church Location</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., 123 Main Street, City, State"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Pastor Name Field */}
        <FormField
          control={form.control}
          name="pastorName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pastor's Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Pastor John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Pastor Phone Field */}
        <FormField
          control={form.control}
          name="pastorPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pastor's Phone</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 08012345678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Church Service Photos Section - Using enhanced file upload */}
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
                    <p>
                      Select 2-3 photos (JPEG, PNG, WebP, max {maxSizeMB}MB
                      each)
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <FormControl>
                <div className="flex flex-col gap-2">
                  {/* Loading indicator for fetching existing photos */}
                  {isFetchingExistingPhotos && (
                    <div className="flex items-center gap-2 text-blue-500 text-sm mb-2">
                      <LoaderCircleIcon className="animate-spin size-4" />
                      <span>Loading existing photos...</span>
                    </div>
                  )}

                  {/* Enhanced Drop Area */}
                  <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    data-dragging={isDragging || undefined}
                    data-files={files.length > 0 || undefined}
                    className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors not-data-[files]:justify-center has-[input:focus]:ring-[3px]"
                  >
                    <input
                      {...getInputProps()}
                      className="sr-only"
                      aria-label="Upload church service photos"
                      disabled={
                        files.length >= maxFiles ||
                        isUploadingPhotos ||
                        isFetchingExistingPhotos
                      }
                    />

                    {files.length > 0 ? (
                      <div className="flex w-full flex-col gap-3">
                        <div className="flex items-center justify-between gap-2">
                          {/* <h3 className="truncate text-sm font-medium">
                            Church Photos ({files.length}/{maxFiles})
                          </h3> */}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={openFileDialog}
                            disabled={
                              files.length >= maxFiles ||
                              isUploadingPhotos ||
                              isFetchingExistingPhotos
                            }
                          >
                            <UploadIcon
                              className="-ms-0.5 size-3.5 opacity-60"
                              aria-hidden="true"
                            />
                            Add more
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                          {files.map((file, index) => (
                            <div
                              key={file.id}
                              className={`bg-accent relative aspect-square rounded-md ${
                                files.length === 3 && index === files.length - 1
                                  ? "col-span-2 md:col-span-1"
                                  : ""
                              }`}
                            >
                              <img
                                src={file.preview}
                                alt={file.name}
                                className="size-full rounded-[inherit] object-cover"
                                onError={(e) => {
                                  console.error(
                                    "Error loading image:",
                                    file.preview
                                  );
                                  e.target.style.display = "none";
                                }}
                              />
                              <Button
                                type="button"
                                onClick={() => handleRemoveFile(file.id)}
                                size="icon"
                                className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none"
                                aria-label="Remove image"
                                disabled={isLoading || isUploadingPhotos}
                              >
                                <X className="size-3.5" />
                              </Button>
                              {file.isExisting && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 pl-1.5 rounded-b-md truncate backdrop-blur-xs">
                                  Existing Photo
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Upload Status */}
                        <div className="text-sm">
                          {isUploadingPhotos ? (
                            <div className="flex items-center gap-2 text-blue-500">
                              <LoaderCircleIcon className="animate-spin size-4" />
                              <span>Uploading photos...</span>
                            </div>
                          ) : (
                            <>
                              <span
                                className={`font-normal ${
                                  files.length >= 2
                                    ? "text-green-600"
                                    : "text-orange-600"
                                }`}
                              >
                                {files.length}/{maxFiles} photos selected
                              </span>
                              {files.length < 2 && (
                                <span className="text-red-500 ml-2">
                                  (At least 2 photos required)
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                        <div
                          className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                          aria-hidden="true"
                        >
                          <ImageIcon className="size-4 opacity-60" />
                        </div>
                        <p className="mb-1.5 text-sm font-medium">
                          Drop your church photos here
                        </p>
                        <p className="text-muted-foreground text-xs">
                          JPEG, PNG, WebP (max. {maxSizeMB}MB each)
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-4"
                          onClick={openFileDialog}
                          disabled={
                            isUploadingPhotos || isFetchingExistingPhotos
                          }
                        >
                          <UploadIcon
                            className="-ms-1 opacity-60"
                            aria-hidden="true"
                          />
                          Select photos
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Error Display */}
                  {errors.length > 0 && (
                    <div
                      className="text-destructive flex items-center gap-1 text-xs"
                      role="alert"
                    >
                      <AlertCircleIcon className="size-3 shrink-0" />
                      <span>{errors[0]}</span>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Upload photos of your church services, worship, or gatherings
                (2-3 photos required)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || files.length < 2}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditChurchInfoForm;
