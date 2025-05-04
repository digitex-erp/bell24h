import { User } from "@shared/schema";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, StarHalf } from "lucide-react";

interface SupplierCardProps {
  supplier: Omit<User, "password">;
  category: string;
  description: string;
  rating: number;
  reviewCount: number;
}

export default function SupplierCard({ 
  supplier, 
  category, 
  description, 
  rating, 
  reviewCount 
}: SupplierCardProps) {
  // Function to render star ratings
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-5 w-5 text-yellow-400" fill="currentColor" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-5 w-5 text-yellow-400" fill="currentColor" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-5 w-5 text-gray-300" />);
    }

    return stars;
  };

  // Generate a simple "image" based on first letters of name or company
  const getInitials = () => {
    if (supplier.company) {
      return supplier.company.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
    }
    if (supplier.name) {
      return supplier.name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
    }
    return 'SU';
  };

  return (
    <Card className="bg-white overflow-hidden shadow rounded-lg">
      <div className="h-48 bg-gray-300 flex items-center justify-center">
        <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 text-5xl font-bold">
          {getInitials()}
        </div>
      </div>
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {supplier.company || supplier.name || "Company Name"}
          </h3>
          {supplier.gstVerified && (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              GST Verified
            </Badge>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-500">{category}</p>
        <div className="mt-3 flex items-center">
          <div className="flex items-center">
            {renderStars(rating)}
          </div>
          <p className="ml-2 text-sm text-gray-500">
            {rating.toFixed(1)} ({reviewCount} reviews)
          </p>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          {description}
        </p>
        <div className="mt-4">
          <Link href={`/suppliers/${supplier.id}`}>
            <a className="text-sm font-medium text-primary hover:text-primary-500">
              View Profile <span aria-hidden="true">&rarr;</span>
            </a>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
