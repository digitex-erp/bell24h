import { useState, useEffect } from "react";
import { User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Star, Shield, TrendingUp, MapPin, Award, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials, getRiskLevelColor } from "@/lib/utils";

interface SuppliersProps {
  user: User;
}

interface Supplier {
  id: number;
  name: string;
  company: string;
  avatar?: string;
  categories: string[];
  location: string;
  rating: number;
  riskLevel: "low" | "medium" | "high";
  matchScore?: number;
  certifications?: string[];
  yearFounded?: number;
  totalOrders?: number;
  specialties?: string[];
}

export default function Suppliers({ user }: SuppliersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  
  // Fetch suppliers and categories
  const { data: suppliersData, isLoading } = useQuery({
    queryKey: ["/api/suppliers"],
  });
  
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });
  
  // Initialize suppliers with mock data
  // In a real implementation, this would come from the API
  useEffect(() => {
    const mockSuppliers: Supplier[] = [
      {
        id: 1,
        name: "TechSupply Solutions",
        company: "TechSupply Solutions Ltd.",
        avatar: "https://ui-avatars.com/api/?name=TechSupply+Solutions&background=random",
        categories: ["Electronics", "Automation"],
        location: "Shanghai, China",
        rating: 4.8,
        riskLevel: "low",
        matchScore: 92,
        certifications: ["ISO 9001", "ISO 14001"],
        yearFounded: 2005,
        totalOrders: 1254,
        specialties: ["PCB Manufacturing", "Sensors", "Control Systems"]
      },
      {
        id: 2,
        name: "GlobalSemi Inc.",
        company: "GlobalSemi Incorporated",
        avatar: "https://ui-avatars.com/api/?name=GlobalSemi+Inc&background=random",
        categories: ["Electronics", "Semiconductors"],
        location: "Taiwan",
        rating: 4.5,
        riskLevel: "low",
        matchScore: 87,
        certifications: ["ISO 9001"],
        yearFounded: 2010,
        totalOrders: 876,
        specialties: ["Semiconductors", "Microchips", "Electronic Components"]
      },
      {
        id: 3,
        name: "ElectroTech",
        company: "ElectroTech Solutions",
        avatar: "https://ui-avatars.com/api/?name=ElectroTech&background=random",
        categories: ["Electronics", "IoT"],
        location: "Bangalore, India",
        rating: 4.2,
        riskLevel: "medium",
        matchScore: 84,
        certifications: ["ISO 9001"],
        yearFounded: 2015,
        totalOrders: 432,
        specialties: ["IoT Devices", "Sensors", "Embedded Systems"]
      },
      {
        id: 4,
        name: "EcoPackaging",
        company: "EcoPackaging Solutions",
        avatar: "https://ui-avatars.com/api/?name=EcoPackaging&background=random",
        categories: ["Packaging"],
        location: "Hamburg, Germany",
        rating: 4.7,
        riskLevel: "low",
        matchScore: 89,
        certifications: ["ISO 14001", "FSC"],
        yearFounded: 2008,
        totalOrders: 943,
        specialties: ["Sustainable Packaging", "Biodegradable Materials"]
      },
      {
        id: 5,
        name: "MetalWorks",
        company: "MetalWorks Industries",
        avatar: "https://ui-avatars.com/api/?name=MetalWorks&background=random",
        categories: ["Metals", "Manufacturing"],
        location: "Detroit, USA",
        rating: 4.4,
        riskLevel: "medium",
        matchScore: 82,
        certifications: ["ISO 9001", "OHSAS 18001"],
        yearFounded: 1998,
        totalOrders: 1876,
        specialties: ["Metal Fabrication", "CNC Machining", "Steel Components"]
      },
      {
        id: 6,
        name: "ChemSolutions",
        company: "ChemSolutions Inc.",
        avatar: "https://ui-avatars.com/api/?name=ChemSolutions&background=random",
        categories: ["Chemicals"],
        location: "Frankfurt, Germany",
        rating: 4.6,
        riskLevel: "high",
        matchScore: 76,
        certifications: ["ISO 9001", "REACH"],
        yearFounded: 2003,
        totalOrders: 764,
        specialties: ["Industrial Chemicals", "Specialty Polymers"]
      }
    ];
    
    setSuppliers(mockSuppliers);
    setFilteredSuppliers(mockSuppliers);
  }, []);
  
  // Apply filters when search or category changes
  useEffect(() => {
    let filtered = [...suppliers];
    
    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((supplier) => 
        supplier.categories.some(cat => 
          cat.toLowerCase() === categoryFilter.toLowerCase()
        )
      );
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((supplier) => 
        supplier.name.toLowerCase().includes(query) || 
        supplier.company.toLowerCase().includes(query) ||
        supplier.specialties?.some(s => s.toLowerCase().includes(query)) ||
        supplier.location.toLowerCase().includes(query)
      );
    }
    
    setFilteredSuppliers(filtered);
  }, [suppliers, categoryFilter, searchQuery]);
  
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
      />
    ));
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Suppliers</h1>
          <p className="text-neutral-500 mt-1">
            Find and connect with verified suppliers
          </p>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search suppliers by name, specialty, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Automation">Automation</option>
              <option value="Semiconductors">Semiconductors</option>
              <option value="IoT">IoT</option>
              <option value="Packaging">Packaging</option>
              <option value="Metals">Metals</option>
              <option value="Chemicals">Chemicals</option>
              <option value="Manufacturing">Manufacturing</option>
            </select>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Card key={item} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                  <div className="ml-3">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </CardContent>
              <CardFooter>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredSuppliers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={supplier.avatar} alt={supplier.name} />
                      <AvatarFallback>{getInitials(supplier.name)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <CardTitle className="text-md">{supplier.name}</CardTitle>
                      <CardDescription>{supplier.company}</CardDescription>
                    </div>
                  </div>
                  {supplier.matchScore && (
                    <Badge variant="outline" className="bg-primary-50 text-primary-700 hover:bg-primary-100">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {supplier.matchScore}% Match
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-2">
                  <div className="flex">
                    {renderStars(supplier.rating)}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">{supplier.rating}/5</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                  {supplier.location}
                </div>
                
                <div className="flex flex-wrap gap-1 mb-2">
                  {supplier.categories.map((category, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
                
                <div className="mt-3">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(supplier.riskLevel)}`}>
                    <Shield className="h-3 w-3 mr-1" />
                    {supplier.riskLevel.charAt(0).toUpperCase() + supplier.riskLevel.slice(1)} Risk
                  </div>
                </div>
                
                {supplier.specialties && (
                  <div className="mt-3 text-sm">
                    <span className="font-medium">Specialties: </span>
                    <span className="text-gray-600">{supplier.specialties.join(", ")}</span>
                  </div>
                )}
                
                {supplier.certifications && supplier.certifications.length > 0 && (
                  <div className="mt-1 text-sm">
                    <span className="font-medium">Certifications: </span>
                    <span className="text-gray-600">{supplier.certifications.join(", ")}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
                <Button size="sm">
                  Contact Supplier
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Suppliers Found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || categoryFilter !== "all"
              ? "No suppliers match your search criteria. Try adjusting your filters."
              : "We couldn't find any suppliers. Please try again later."}
          </p>
          <Button onClick={() => {
            setSearchQuery("");
            setCategoryFilter("all");
          }}>
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
