import { useState, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { Button } from "@/components/ui/button";
import MultipleSelector from "@/components/ui/multiselect";
import { cn } from "@/lib/utils";
import prefCastes from "./data/prefCastes";
import {
  heightOptions,
  maritalStatuses,
  smokingHabitsOptions,
  drinkingHabitsOptions,
  motherTongueOptions,
  complexionOptions,
  physicalStatusOptions,
  highestEducationOptions,
  employmentOptions,
  occupationOptions,
  annualIncomeOptions,
  religions,
} from "./data/prefData";
import { appwriteConfig, databases } from "@/lib/appwrite";

// Add a generic 'Any' option for all multi-selects
const anyOption = { label: "Any", value: "any" };

// Generate age options (18 to 60)
const generateAgeOptions = () => {
  const ages = [];
  for (let i = 18; i <= 60; i++) {
    ages.push({ value: i.toString(), label: i.toString() });
  }
  return ages;
};
const ageOptions = generateAgeOptions();

// Helper function to normalize array values from currentUserProfile
const normalizeArrayValue = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
};

// Helper function to convert array of values to Option format for MultipleSelector
const convertToOptions = (values, optionsArray) => {
  if (!values || !Array.isArray(values)) return [];
  // Ensure we have a valid array of options to search from.
  const validOptions =
    optionsArray && Array.isArray(optionsArray) ? optionsArray : [];

  return values
    .map((value) => {
      const option = validOptions.find((opt) => opt.value === value);
      return option ? { value: option.value, label: option.label } : null;
    })
    .filter(Boolean);
};

// Define the Zod schema for partner preferences validation
const preferenceSchema = z.object({
  prefAgeMin: z.string().optional(),
  prefAgeMax: z.string().optional(),
  prefHeightMin: z.string().optional(),
  prefHeightMax: z.string().optional(),
  prefMaritalStatus: z.array(z.string()).optional(),
  prefMotherTongue: z.array(z.string()).optional(),
  prefComplexion: z.array(z.string()).optional(),
  prefSmokingHabits: z.array(z.string()).optional(),
  prefDrinkingHabits: z.array(z.string()).optional(),
  // UPDATED: Changed prefReligion to be a single string
  prefReligion: z.string().optional(),
  prefCaste: z.array(z.string()).optional(),
  prefEducationLevel: z.array(z.string()).optional(),
  prefEmployedIn: z.array(z.string()).optional(),
  prefOccupation: z.array(z.string()).optional(),
  prefAnnualIncome: z.array(z.string()).optional(),
});

// The EditPreferenceForm component for updating partner preferences
const EditPreferenceForm = ({
  currentUserProfile,
  onSaveSuccess,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Initialize the form with react-hook-form and Zod resolver
  const form = useForm({
    resolver: zodResolver(preferenceSchema),
    mode: "onChange",
    defaultValues: {
      prefAgeMin: currentUserProfile?.prefAgeMin
        ? String(currentUserProfile.prefAgeMin)
        : "",
      prefAgeMax: currentUserProfile?.prefAgeMax
        ? String(currentUserProfile.prefAgeMax)
        : "",
      prefHeightMin: currentUserProfile?.prefHeightMinCm
        ? heightOptions.find(
            (h) => h.cmValue === currentUserProfile.prefHeightMinCm
          )?.value || ""
        : "",
      prefHeightMax: currentUserProfile?.prefHeightMaxCm
        ? heightOptions.find(
            (h) => h.cmValue === currentUserProfile.prefHeightMaxCm
          )?.value || ""
        : "",
      prefMaritalStatus: normalizeArrayValue(
        currentUserProfile?.prefMaritalStatus
      ),
      prefMotherTongue: normalizeArrayValue(
        currentUserProfile?.prefMotherTongue
      ),
      prefComplexion: normalizeArrayValue(currentUserProfile?.prefComplexion),
      prefSmokingHabits: normalizeArrayValue(
        currentUserProfile?.prefSmokingHabits
      ),
      prefDrinkingHabits: normalizeArrayValue(
        currentUserProfile?.prefDrinkingHabits
      ),
      // UPDATED: prefReligion is now a string, so no normalization is needed.
      prefReligion: currentUserProfile?.prefReligion || "",
      prefCaste: normalizeArrayValue(currentUserProfile?.prefCaste),
      prefEducationLevel: normalizeArrayValue(
        currentUserProfile?.prefEducationLevel
      ),
      prefEmployedIn: normalizeArrayValue(currentUserProfile?.prefEmployedIn),
      prefOccupation: normalizeArrayValue(currentUserProfile?.prefOccupation),
      prefAnnualIncome: normalizeArrayValue(
        currentUserProfile?.prefAnnualIncome
      ),
    },
  });

  // Watch form values for dynamic options
  const watchedMinAge = form.watch("prefAgeMin");
  const watchedMinHeight = form.watch("prefHeightMin");

  // Dynamic age options for maximum age
  const maxAgeOptions = useMemo(() => {
    if (!watchedMinAge) return ageOptions;
    const minAgeNum = parseInt(watchedMinAge, 10);
    return ageOptions.filter((age) => parseInt(age.value, 10) > minAgeNum);
  }, [watchedMinAge]);

  // Dynamic height options for maximum height
  const maxHeightOptions = useMemo(() => {
    if (!watchedMinHeight) return heightOptions;
    const minHeightIndex = heightOptions.findIndex(
      (h) => h.value === watchedMinHeight
    );
    if (minHeightIndex === -1) return heightOptions;
    return heightOptions.slice(minHeightIndex + 1);
  }, [watchedMinHeight]);

  // Handle form submission
  async function onSubmit(values) {
    setIsLoading(true);
    try {
      if (!currentUserProfile?.$id) {
        toast.error("User ID not found. Cannot update profile.");
        console.error("No user ID available for profile update.");
        return;
      }

      // Convert height values to cm for storage
      const formattedValues = {
        ...values,
        prefAgeMin: values.prefAgeMin ? parseInt(values.prefAgeMin, 10) : null,
        prefAgeMax: values.prefAgeMax ? parseInt(values.prefAgeMax, 10) : null,
        prefHeightMinCm: values.prefHeightMin
          ? heightOptions.find((h) => h.value === values.prefHeightMin)
              ?.cmValue || null
          : null,
        prefHeightMaxCm: values.prefHeightMax
          ? heightOptions.find((h) => h.value === values.prefHeightMax)
              ?.cmValue || null
          : null,
      };

      // Remove the height string values and keep only cm values
      delete formattedValues.prefHeightMin;
      delete formattedValues.prefHeightMax;

      const updatedDocument = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.profilesCollectionId,
        currentUserProfile.$id,
        formattedValues
      );

      toast.success("Partner preferences updated!");
      onSaveSuccess(updatedDocument);
    } catch (error) {
      console.error("Error updating partner preferences:", error);
      let errorMessage =
        "Failed to update partner preferences. Please try again.";
      if (error.code === 404) {
        errorMessage =
          "Profile document not found. Please ensure you have a profile.";
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

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
          </Button>
        ))}
      </div>
    );
  };

  // --- REFACTORED MULTI-SELECT OPTIONS ---
  // Define a single, static options list for each multi-select to prevent dynamic filtering issues
  const prefCasteOptionsWithAny = useMemo(() => [anyOption, ...prefCastes], []);
  const prefMotherTongueOptionsWithAny = useMemo(
    () => [anyOption, ...motherTongueOptions],
    []
  );
  const prefComplexionOptionsWithAny = useMemo(
    () => [anyOption, ...complexionOptions],
    []
  );
  const prefEducationOptionsWithAny = useMemo(
    () => [anyOption, ...highestEducationOptions],
    []
  );
  const prefEmploymentOptionsWithAny = useMemo(
    () => [anyOption, ...employmentOptions],
    []
  );
  const prefOccupationOptionsWithAny = useMemo(
    () => [anyOption, ...occupationOptions],
    []
  );
  const prefAnnualIncomeOptionsWithAny = useMemo(
    () => [anyOption, ...annualIncomeOptions],
    []
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Age Range - Single selects with dynamic max options */}
        <div className="flex gap-6 flex-col justify-between">
          <FormField
            control={form.control}
            name="prefAgeMin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Age</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className={"w-full"}>
                      <SelectValue placeholder="Select minimum age" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ageOptions.map((age) => (
                      <SelectItem key={age.value} value={age.value}>
                        {age.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="prefAgeMax"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Age</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className={"w-full"}>
                      <SelectValue placeholder="Select maximum age" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {maxAgeOptions.map((age) => (
                      <SelectItem key={age.value} value={age.value}>
                        {age.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Height Range - Single selects with dynamic max options */}
        <div className="flex gap-6 flex-col justify-between">
          <FormField
            control={form.control}
            name="prefHeightMin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Height</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className={"w-full"}>
                      <SelectValue placeholder="Select minimum height" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {heightOptions.map((height) => (
                      <SelectItem key={height.value} value={height.value}>
                        {height.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="prefHeightMax"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Height</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className={"w-full"}>
                      <SelectValue placeholder="Select maximum height" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {maxHeightOptions.map((height) => (
                      <SelectItem key={height.value} value={height.value}>
                        {height.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Religion - Single selects & Caste */}
        <FormField
          control={form.control}
          name="prefReligion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Religion</FormLabel>
              <FormControl>
                <RadioGroup.Root
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-3 gap-3"
                >
                  {/* UPDATED: Correctly mapping the religions array of objects */}
                  {religions.map((religion) => (
                    <RadioGroup.Item
                      key={religion.value}
                      value={religion.value}
                      className="ring-[1px] ring-border rounded py-1 px-2 data-[state=checked]:ring-2 data-[state=checked]:ring-blue-500 cursor-pointer data-[state=checked]:text-muted-foreground"
                    >
                      <span className="font-semibold tracking-tight">
                        {/* UPDATED: Using the 'label' for display */}
                        {religion.label}
                      </span>
                    </RadioGroup.Item>
                  ))}
                </RadioGroup.Root>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="prefCaste"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Caste</FormLabel>
                <FormControl>
                  <MultipleSelector
                    commandProps={{
                      label: "Select caste preferences",
                    }}
                    value={convertToOptions(
                      field.value,
                      prefCasteOptionsWithAny
                    )}
                    onChange={(selected) => {
                      const selectedValues = selected.map(
                        (option) => option.value
                      );
                      if (selectedValues.includes("any")) {
                        field.onChange(["any"]);
                      } else {
                        field.onChange(selectedValues);
                      }
                    }}
                    defaultOptions={prefCasteOptionsWithAny}
                    placeholder="Select caste preferences"
                    hideClearAllButton={false}
                    hidePlaceholderWhenSelected
                    emptyIndicator={
                      <p className="text-center text-sm">No results found</p>
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Multi-select fields using MultipleSelector */}
        <FormField
          control={form.control}
          name="prefMotherTongue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mother Tongue</FormLabel>
              <FormControl>
                <MultipleSelector
                  commandProps={{
                    label: "Select mother tongue preferences",
                  }}
                  value={convertToOptions(
                    field.value,
                    prefMotherTongueOptionsWithAny
                  )}
                  onChange={(selected) => {
                    const selectedValues = selected.map(
                      (option) => option.value
                    );
                    if (selectedValues.includes("any")) {
                      field.onChange(["any"]);
                    } else {
                      field.onChange(selectedValues);
                    }
                  }}
                  defaultOptions={prefMotherTongueOptionsWithAny}
                  placeholder="Select mother tongue preferences"
                  hideClearAllButton={false}
                  hidePlaceholderWhenSelected
                  emptyIndicator={
                    <p className="text-center text-sm">No results found</p>
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="prefComplexion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Complexion</FormLabel>
              <FormControl>
                <MultipleSelector
                  commandProps={{
                    label: "Select complexion preferences",
                  }}
                  value={convertToOptions(
                    field.value,
                    prefComplexionOptionsWithAny
                  )}
                  onChange={(selected) => {
                    const selectedValues = selected.map(
                      (option) => option.value
                    );
                    if (selectedValues.includes("any")) {
                      field.onChange(["any"]);
                    } else {
                      field.onChange(selectedValues);
                    }
                  }}
                  defaultOptions={prefComplexionOptionsWithAny}
                  placeholder="Select complexion preferences"
                  hideClearAllButton={false}
                  hidePlaceholderWhenSelected
                  emptyIndicator={
                    <p className="text-center text-sm">No results found</p>
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="prefEducationLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Education Level</FormLabel>
              <FormControl>
                <MultipleSelector
                  commandProps={{
                    label: "Select education level preferences",
                  }}
                  value={convertToOptions(
                    field.value,
                    prefEducationOptionsWithAny
                  )}
                  onChange={(selected) => {
                    const selectedValues = selected.map(
                      (option) => option.value
                    );
                    if (selectedValues.includes("any")) {
                      field.onChange(["any"]);
                    } else {
                      field.onChange(selectedValues);
                    }
                  }}
                  defaultOptions={prefEducationOptionsWithAny}
                  placeholder="Select education level preferences"
                  hideClearAllButton={false}
                  hidePlaceholderWhenSelected
                  emptyIndicator={
                    <p className="text-center text-sm">No results found</p>
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="prefEmployedIn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employment Type</FormLabel>
              <FormControl>
                <MultipleSelector
                  commandProps={{
                    label: "Select employment type preferences",
                  }}
                  value={convertToOptions(
                    field.value,
                    prefEmploymentOptionsWithAny
                  )}
                  onChange={(selected) => {
                    const selectedValues = selected.map(
                      (option) => option.value
                    );
                    if (selectedValues.includes("any")) {
                      field.onChange(["any"]);
                    } else {
                      field.onChange(selectedValues);
                    }
                  }}
                  defaultOptions={prefEmploymentOptionsWithAny}
                  placeholder="Select employment type preferences"
                  hideClearAllButton={false}
                  hidePlaceholderWhenSelected
                  emptyIndicator={
                    <p className="text-center text-sm">No results found</p>
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="prefOccupation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Occupation</FormLabel>
              <FormControl>
                <MultipleSelector
                  commandProps={{
                    label: "Select occupation preferences",
                  }}
                  value={convertToOptions(
                    field.value,
                    prefOccupationOptionsWithAny
                  )}
                  onChange={(selected) => {
                    const selectedValues = selected.map(
                      (option) => option.value
                    );
                    if (selectedValues.includes("any")) {
                      field.onChange(["any"]);
                    } else {
                      field.onChange(selectedValues);
                    }
                  }}
                  defaultOptions={prefOccupationOptionsWithAny}
                  placeholder="Select occupation preferences"
                  hideClearAllButton={false}
                  hidePlaceholderWhenSelected
                  emptyIndicator={
                    <p className="text-center text-sm">No results found</p>
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="prefAnnualIncome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Annual Income</FormLabel>
              <FormControl>
                <MultipleSelector
                  commandProps={{
                    label: "Select annual income preferences",
                  }}
                  value={convertToOptions(
                    field.value,
                    prefAnnualIncomeOptionsWithAny
                  )}
                  onChange={(selected) => {
                    const selectedValues = selected.map(
                      (option) => option.value
                    );
                    if (selectedValues.includes("any")) {
                      field.onChange(["any"]);
                    } else {
                      field.onChange(selectedValues);
                    }
                  }}
                  defaultOptions={prefAnnualIncomeOptionsWithAny}
                  placeholder="Select annual income preferences"
                  hideClearAllButton={false}
                  hidePlaceholderWhenSelected
                  emptyIndicator={
                    <p className="text-center text-sm">No results found</p>
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Multi-select fields using button */}
        <FormField
          control={form.control}
          name="prefMaritalStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Marital Status</FormLabel>
              <FormControl>
                <MultiSelectButtonGroup
                  options={maritalStatuses}
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="prefSmokingHabits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Smoking Habits</FormLabel>
              <FormControl>
                <MultiSelectButtonGroup
                  options={smokingHabitsOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="prefDrinkingHabits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Drinking Habits</FormLabel>
              <FormControl>
                <MultiSelectButtonGroup
                  options={drinkingHabitsOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4">
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
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditPreferenceForm;
