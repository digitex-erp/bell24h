import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";

// Common categories - these could come from an API
const COMMON_CATEGORIES = [
  "Electronics",
  "Industrial Equipment",
  "Raw Materials",
  "Textiles",
  "Chemicals",
  "Automotive Parts",
  "Construction Materials",
  "Food Processing",
  "Packaging Materials",
  "Medical Supplies",
  "Office Equipment",
  "IT Hardware",
  "Software Services",
  "Agricultural Products",
  "Furniture"
];

const BUSINESS_SCALES = [
  { label: "Small Business", value: "small" },
  { label: "Medium Enterprise", value: "medium" },
  { label: "Large Enterprise", value: "large" },
  { label: "Multinational", value: "multinational" }
];

const SUPPLIER_TYPES = [
  { label: "Manufacturer", value: "manufacturer" },
  { label: "Distributor", value: "distributor" },
  { label: "Wholesaler", value: "wholesaler" },
  { label: "Retailer", value: "retailer" },
  { label: "Service Provider", value: "service" }
];

interface PreferencesFormValues {
  preferredCategories: string[];
  preferredSupplierTypes: string[];
  preferredBusinessScale: string | null;
  priceRangeMin: string;
  priceRangeMax: string;
  qualityPreference: number;
  communicationPreference: string;
}

interface UserPreferencesEditorProps {
  userId: number;
  onPreferencesSaved?: () => void;
}

export function UserPreferencesEditor({ userId, onPreferencesSaved }: UserPreferencesEditorProps) {
  const { toast } = useToast();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSupplierTypes, setSelectedSupplierTypes] = useState<string[]>([]);
  
  const {
    preferences,
    isLoadingPreferences,
    errorMessage,
    updatePreferences,
    isUpdatingPreferences,
    generatePreferences,
    isGeneratingPreferences
  } = useUserPreferences(userId);

  const form = useForm<PreferencesFormValues>({
    defaultValues: {
      preferredCategories: [],
      preferredSupplierTypes: [],
      preferredBusinessScale: null,
      priceRangeMin: "",
      priceRangeMax: "",
      qualityPreference: 3,
      communicationPreference: "email",
    },
  });

  // Update form when preferences data is loaded
  useEffect(() => {
    if (preferences) {
      const priceRange = preferences.preferredPriceRange || { min: null, max: null };
      
      form.reset({
        preferredCategories: Array.isArray(preferences.preferredCategories) 
          ? preferences.preferredCategories as string[] 
          : [],
        preferredSupplierTypes: Array.isArray(preferences.preferredSupplierTypes)
          ? preferences.preferredSupplierTypes as string[]
          : [],
        preferredBusinessScale: preferences.preferredBusinessScale || null,
        priceRangeMin: priceRange.min !== null ? String(priceRange.min) : "",
        priceRangeMax: priceRange.max !== null ? String(priceRange.max) : "",
        qualityPreference: preferences.qualityPreference || 3,
        communicationPreference: preferences.communicationPreference || "email",
      });
      
      // Also update local state for checkboxes
      setSelectedCategories(Array.isArray(preferences.preferredCategories) 
        ? preferences.preferredCategories as string[] 
        : []);
      
      setSelectedSupplierTypes(Array.isArray(preferences.preferredSupplierTypes)
        ? preferences.preferredSupplierTypes as string[]
        : []);
    }
  }, [preferences, form]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => {
      const newSelection = prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category];
      
      form.setValue("preferredCategories", newSelection);
      return newSelection;
    });
  };

  const handleSupplierTypeToggle = (type: string) => {
    setSelectedSupplierTypes(prev => {
      const newSelection = prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type];
      
      form.setValue("preferredSupplierTypes", newSelection);
      return newSelection;
    });
  };

  const onSubmit = (data: PreferencesFormValues) => {
    // Convert string values to numbers for price range
    const priceRangeMin = data.priceRangeMin ? parseFloat(data.priceRangeMin) : null;
    const priceRangeMax = data.priceRangeMax ? parseFloat(data.priceRangeMax) : null;
    
    updatePreferences({
      preferredCategories: data.preferredCategories,
      preferredSupplierTypes: data.preferredSupplierTypes,
      preferredBusinessScale: data.preferredBusinessScale,
      preferredPriceRange: {
        min: priceRangeMin,
        max: priceRangeMax
      },
      qualityPreference: data.qualityPreference,
      communicationPreference: data.communicationPreference,
    }, {
      onSuccess: () => {
        toast({
          title: "Preferences updated",
          description: "Your preferences have been saved successfully.",
        });
        if (onPreferencesSaved) {
          onPreferencesSaved();
        }
      },
      onError: () => {
        toast({
          title: "Error",
          description: errorMessage || "Failed to update preferences. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  const handleGeneratePreferences = () => {
    generatePreferences(undefined, {
      onSuccess: (data) => {
        toast({
          title: "Preferences generated",
          description: "Preferences have been automatically generated based on your history.",
        });
        if (onPreferencesSaved) {
          onPreferencesSaved();
        }
      },
      onError: () => {
        toast({
          title: "Error",
          description: errorMessage || "Failed to generate preferences. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  if (isLoadingPreferences) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your preferences...</span>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your RFQ Preferences</CardTitle>
        <CardDescription>
          Customize your preferences to receive more relevant RFQ recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="preferredCategories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Categories</FormLabel>
                    <FormDescription>
                      Select categories you're most interested in
                    </FormDescription>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {COMMON_CATEGORIES.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category}`}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => handleCategoryToggle(category)}
                          />
                          <Label htmlFor={`category-${category}`}>{category}</Label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="priceRangeMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Budget</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Min"
                          type="number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priceRangeMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Budget</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Max"
                          type="number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="preferredBusinessScale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Business Scale</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select business scale" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No preference</SelectItem>
                        {BUSINESS_SCALES.map((scale) => (
                          <SelectItem key={scale.value} value={scale.value}>
                            {scale.label}
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
                name="preferredSupplierTypes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Supplier Types</FormLabel>
                    <FormDescription>
                      Select the types of suppliers you prefer to work with
                    </FormDescription>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {SUPPLIER_TYPES.map((type) => (
                        <div key={type.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`supplierType-${type.value}`}
                            checked={selectedSupplierTypes.includes(type.value)}
                            onCheckedChange={() => handleSupplierTypeToggle(type.value)}
                          />
                          <Label htmlFor={`supplierType-${type.value}`}>{type.label}</Label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="qualityPreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quality Preference</FormLabel>
                    <FormDescription>
                      {field.value < 3 ? "Prioritize lower costs over quality" : 
                       field.value === 3 ? "Balance between quality and cost" : 
                       "Prioritize quality over cost"}
                    </FormDescription>
                    <FormControl>
                      <div className="pt-2">
                        <Slider
                          value={[field.value]}
                          min={1}
                          max={5}
                          step={1}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Cost-focused</span>
                          <span>Balanced</span>
                          <span>Quality-focused</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="communicationPreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Communication Preference</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select communication preference" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="chat">In-app Chat</SelectItem>
                        <SelectItem value="call">Phone Call</SelectItem>
                        <SelectItem value="video">Video Conference</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button type="submit" disabled={isUpdatingPreferences}>
                {isUpdatingPreferences && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Preferences
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleGeneratePreferences}
                disabled={isGeneratingPreferences}
              >
                {isGeneratingPreferences ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Auto-Generate
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col text-sm text-muted-foreground">
        <p>Your preferences help us personalize recommendations and match you with the right suppliers.</p>
      </CardFooter>
    </Card>
  );
}