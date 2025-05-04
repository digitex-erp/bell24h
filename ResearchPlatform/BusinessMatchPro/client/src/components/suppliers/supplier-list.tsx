import { User } from "@shared/schema";
import SupplierCard from "@/components/suppliers/supplier-card";
import { Loader2 } from "lucide-react";

interface SupplierListProps {
  suppliers: Omit<User, "password">[];
  isLoading: boolean;
  error?: Error;
}

// Categories for mock data to make suppliers more realistic
const supplierCategories = [
  "Electronics Manufacturing",
  "Textile & Apparel",
  "Chemical Manufacturing",
  "Food Processing",
  "Machinery & Equipment",
  "Construction Materials",
  "Automotive Components",
  "Pharmaceuticals",
  "Packaging & Printing"
];

// Sample descriptions for more detailed supplier cards
const supplierDescriptions = [
  "Specializes in custom electronic components and PCB manufacturing with 10+ years of experience.",
  "Premium textile manufacturer specializing in organic cotton, linen, and sustainable fabrics.",
  "Leading manufacturer of industrial chemicals, additives, and compounds for various industries.",
  "Produces high-quality food packaging solutions with food-safe materials and innovative designs.",
  "Expert in precision machinery parts manufacturing with international quality certifications.",
  "Manufactures eco-friendly construction materials with modern technology and sustainable practices.",
  "Specializes in automotive component manufacturing with OEM quality standards and ISO certification."
];

export default function SupplierList({ suppliers, isLoading, error }: SupplierListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-gray-500">Loading suppliers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-2">Error loading suppliers</div>
        <p className="text-gray-600">{error.message}</p>
      </div>
    );
  }

  if (!suppliers.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
        <p className="text-gray-500">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {suppliers.map((supplier, index) => {
        // Assign a random category and description based on the index
        const categoryIndex = index % supplierCategories.length;
        const descriptionIndex = index % supplierDescriptions.length;
        
        return (
          <SupplierCard
            key={supplier.id}
            supplier={supplier}
            category={supplierCategories[categoryIndex]}
            description={supplierDescriptions[descriptionIndex]}
            rating={(3 + Math.floor(Math.random() * 20) / 10)} // Rating between 3.0 and 5.0
            reviewCount={5 + Math.floor(Math.random() * 200)} // Between 5 and 204 reviews
          />
        );
      })}
    </div>
  );
}
