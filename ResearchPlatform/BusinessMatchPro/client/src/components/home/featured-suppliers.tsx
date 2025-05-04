import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Star, StarHalf } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "@shared/schema";

export default function FeaturedSuppliers() {
  const { data: suppliers, isLoading, error } = useQuery<Omit<User, "password">[]>({
    queryKey: ["/api/suppliers"],
  });

  // Mock data for star ratings and descriptions
  const supplierExtras = [
    {
      id: 1,
      image: "electronics-manufacturing",
      category: "Electronics Manufacturing",
      rating: 4.0,
      reviewCount: 56,
      description: "Specializes in PCB manufacturing and electronic component assembly with 10+ years of experience.",
    },
    {
      id: 2,
      image: "textile-manufacturing",
      category: "Textile Manufacturing",
      rating: 5.0,
      reviewCount: 128,
      description: "Premium textile manufacturer specializing in organic cotton, linen, and sustainable fabrics.",
    },
    {
      id: 3,
      image: "chemical-manufacturing",
      category: "Chemical Manufacturing",
      rating: 5.0,
      reviewCount: 87,
      description: "Leading manufacturer of industrial chemicals, additives, and compounds for various industries.",
    },
  ];

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

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">
            Marketplace
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Featured Suppliers
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Discover top-rated suppliers from across the globe.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="h-48 bg-gray-300 animate-pulse" />
                <CardContent className="px-4 py-5 sm:p-6">
                  <div className="h-6 bg-gray-300 rounded animate-pulse mb-2 w-3/4" />
                  <div className="h-4 bg-gray-300 rounded animate-pulse mb-3 w-1/2" />
                  <div className="h-4 bg-gray-300 rounded animate-pulse mb-4 w-1/4" />
                  <div className="h-4 bg-gray-300 rounded animate-pulse mb-2 w-full" />
                  <div className="h-4 bg-gray-300 rounded animate-pulse mb-2 w-full" />
                  <div className="h-4 bg-gray-300 rounded animate-pulse w-2/3" />
                </CardContent>
              </Card>
            ))
          ) : error ? (
            <div className="col-span-full text-center text-red-500">
              Failed to load suppliers. Please try again later.
            </div>
          ) : suppliers && suppliers.length > 0 ? (
            suppliers.slice(0, 3).map((supplier, index) => {
              const extraData = supplierExtras[index % supplierExtras.length];
              
              return (
                <Card key={supplier.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="h-48 bg-gray-300 flex items-center justify-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <CardContent className="px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">{supplier.company || supplier.name || "Company Name"}</h3>
                      {supplier.gstVerified && (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          GST Verified
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{extraData.category}</p>
                    <div className="mt-3 flex items-center">
                      <div className="flex items-center">
                        {renderStars(extraData.rating)}
                      </div>
                      <p className="ml-2 text-sm text-gray-500">
                        {extraData.rating.toFixed(1)} ({extraData.reviewCount} reviews)
                      </p>
                    </div>
                    <p className="mt-3 text-sm text-gray-500">
                      {extraData.description}
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
            })
          ) : (
            <div className="col-span-full text-center text-gray-500">
              No suppliers found. Be the first to register as a supplier!
            </div>
          )}

          <div className="text-center col-span-1 sm:col-span-2 lg:col-span-3 mt-4">
            <Link href="/suppliers">
              <Button asChild>
                <a>View All Suppliers</a>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
