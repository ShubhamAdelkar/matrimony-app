// src/auth/forms/ChurchDetailsForm.jsx

import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Image, Info, LoaderCircleIcon, X } from "lucide-react";

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

// --- Zod Schema for Church Details Form ---
const churchDetailsSchema = z
  .object({
    churchName: z
      .string()
      .min(2, "Church name must be at least 2 characters")
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
      .max(15, "Phone number must not exceed 15 digits")
      .regex(/^[+]?[\d\s()-]+$/, "Please enter a valid phone number")
      .refine((val) => {
        const digitsOnly = val.replace(/\D/g, "");
        return digitsOnly.length >= 10 && digitsOnly.length <= 15;
      }, "Phone number must contain 10-15 digits"),

    churchServicePhotos: z
      // ⭐ Changed from z.instanceof(File) to z.any() and added a refine for File properties
      .array(z.any())
      .max(3, "Maximum 3 photos allowed")
      .refine(
        (files) =>
          files.every(
            (file) =>
              file &&
              typeof file === "object" &&
              "name" in file &&
              "size" in file &&
              "type" in file
          ),
        "Invalid file type provided. Please upload actual image files."
      )
      .refine(
        (files) => files.every((file) => file.size <= 5 * 1024 * 1024), // 5MB per file
        "Each photo must be smaller than 5MB"
      )
      .refine(
        (files) =>
          files.every((file) =>
            ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
              file.type
            )
          ),
        "Only JPEG, PNG, and WebP image formats are allowed"
      )
      .optional(),
    skipPhotos: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    // Conditional validation for churchServicePhotos
    if (
      !data.skipPhotos &&
      (!data.churchServicePhotos || data.churchServicePhotos.length < 2)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Please upload at least 2 church service photos or check 'I'll add later'.",
        path: ["churchServicePhotos"],
      });
    }
  });

function ChurchDetailsForm() {
  const { formData, updateFormData, nextStep, prevStep } = useMultiStepForm();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const form = useForm({
    resolver: zodResolver(churchDetailsSchema),
    mode: "onChange",
    defaultValues: {
      churchName: formData.churchName || "",
      churchLocation: formData.churchLocation || "",
      pastorName: formData.pastorName || "",
      pastorPhone: formData.pastorPhone || "",
      churchServicePhotos: [], // Always start empty on mount/remount
      skipPhotos: formData.skipPhotos || false,
    },
  });

  const skipPhotosChecked = form.watch("skipPhotos");

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const combinedFiles = [...selectedFiles, ...files].slice(0, 3);
    setSelectedFiles(combinedFiles);

    // ⭐ IMPORTANT: Ensure form.setValue triggers validation for the field
    form.setValue("churchServicePhotos", combinedFiles, {
      shouldValidate: true,
    });

    // Generate preview URLs
    const urls = combinedFiles.map((file) => URL.createObjectURL(file));
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls(urls);

    event.target.value = ""; // Clear the file input value to allow re-selecting the same files
  };

  // Remove a specific file
  const removeFile = (indexToRemove) => {
    const newFiles = selectedFiles.filter(
      (_, index) => index !== indexToRemove
    );
    setSelectedFiles(newFiles);

    // ⭐ IMPORTANT: Ensure form.setValue triggers validation for the field
    form.setValue("churchServicePhotos", newFiles, { shouldValidate: true });

    const newUrls = newFiles.map((file) => URL.createObjectURL(file));
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls(newUrls);
  };

  // Cleanup on unmount (important for revoking Object URLs)
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  async function onSubmit(values) {
    setIsLoading(true);
    console.log("Church Details Form data submitted:", values);

    // ⭐ DEBUG: Log form state and errors before processing
    console.log("Form is valid before onSubmit:", form.formState.isValid);
    console.log("Form errors before onSubmit:", form.formState.errors);
    console.log(
      "churchServicePhotos in form values:",
      values.churchServicePhotos
    );
    console.log(
      "churchServicePhotos length:",
      values.churchServicePhotos?.length
    );
    console.log("skipPhotosChecked:", values.skipPhotos);

    const dataToSubmit = { ...values };
    if (dataToSubmit.skipPhotos) {
      dataToSubmit.churchServicePhotos = []; // Ensure empty array if skipped
    }

    const updatedFormData = { ...formData, ...dataToSubmit };
    console.log(
      "Combined form data after Church Details Form:",
      updatedFormData
    );

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      updateFormData(dataToSubmit); // Update context with the processed data
      nextStep();
      console.log("ChurchDetailsForm: Moved to next step.");
    } catch (error) {
      console.error("Error submitting church details:", error);
      form.setError("root.serverError", {
        message: "Failed to save church details: " + error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <Card className="liquid-glass-card">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Church Details</CardTitle>
          <CardDescription>
            Please provide your church information to complete your profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)} // form.handleSubmit will only call onSubmit if form is valid
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
                          className={`size-5 ${skipPhotosChecked ? "text-gray-400" : "text-black"} `}
                        />
                        <Input
                          id="church-photos"
                          type="file"
                          className="cursor-pointer text-sm border-0 translate-x-[-4px] text-gray-500"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          multiple
                          onChange={handleFileSelect}
                          disabled={
                            selectedFiles.length >= 3 || skipPhotosChecked
                          }
                        />
                      </div>

                      {/* Preview Grid */}
                      {selectedFiles.length > 0 && !skipPhotosChecked && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                          {previewUrls.map((url, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={url}
                                alt={`Church service ${index + 1}`}
                                className="w-full h-36 object-cover rounded-lg"
                              />
                              {/* Remove button */}
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
                              >
                                <X className="size-5" />
                              </button>
                              <div className="absolute bottom-0 left-0 right-0 bg-black/5 shadow-lg backdrop-blur-sm text-white text-xs p-1 pl-1.5 rounded-b-lg truncate">
                                {selectedFiles[index].name}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Upload Status */}
                      {!skipPhotosChecked && (
                        <div className="text-sm">
                          <span
                            className={`font-medium ${selectedFiles.length >= 2 ? "text-green-600" : "text-orange-600"}`}
                          >
                            {selectedFiles.length}/3 photos selected
                          </span>
                          {selectedFiles.length < 2 && (
                            <span className="text-red-500 ml-2">
                              (At least 2 photos required)
                            </span>
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
                <FormItem className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-gray-300 has-[[aria-checked=true]]:bg-blue-50">
                  <FormControl>
                    <Checkbox
                      className={"cursor-pointer border-gray-300"}
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked) {
                          form.setValue("churchServicePhotos", [], {
                            shouldValidate: true,
                          });
                          setSelectedFiles([]);
                          setPreviewUrls([]);
                        }
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className={"text-sm text-gray-700"}>
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

export default ChurchDetailsForm;
