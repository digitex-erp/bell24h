import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import SupplierList from "@/components/suppliers/supplier-list";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { User } from "@shared/schema";

export default function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  
  const { data: suppliers, isLoading, error } = useQuery<Omit<User, "password">[]>({
    queryKey: ["/api/suppliers"],
  });
  
  const filteredSuppliers = suppliers?.filter(supplier => {
    const matchesSearch = supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.company?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         false;
    
    if (filter === "verified") {
      return matchesSearch && supplier.gstVerified;
    }
    
    return matchesSearch;
  });
  
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Find Verified Suppliers
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Connect with trusted suppliers from around the world, verified by Bell24h.
            </p>
          </div>
          
          <div className="mt-8 flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search suppliers by name or company..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64 flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <Select 
                value={filter} 
                onValueChange={setFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter suppliers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Suppliers</SelectItem>
                  <SelectItem value="verified">GST Verified Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <SupplierList 
            suppliers={filteredSuppliers || []} 
            isLoading={isLoading} 
            error={error instanceof Error ? error : undefined} 
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
