import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter } from "lucide-react";
import SupplierRiskScore from "@/components/suppliers/supplier-risk-score";
import ShapExplainer from "@/components/suppliers/shap-explainer";

export default function Suppliers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  
  // Fetch suppliers
  const { data: suppliers, isLoading } = useQuery({ 
    queryKey: ['/api/suppliers']
  });

  // Filter suppliers by search term
  const filteredSuppliers = suppliers?.filter(supplier => 
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected supplier details
  const selectedSupplier = suppliers?.find(supplier => supplier.id === selectedSupplierId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-heading text-dark-800">Suppliers</h1>
          <p className="mt-1 text-dark-500">Manage your suppliers and view their risk scores</p>
        </div>
        <Button className="bg-primary-600 hover:bg-primary-700">
          <Plus className="mr-2 h-4 w-4" /> Add Supplier
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 h-4 w-4" />
          <Input
            placeholder="Search suppliers..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" /> Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Suppliers List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Suppliers Directory</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading suppliers...</p>
              ) : filteredSuppliers?.length ? (
                <div className="space-y-4">
                  {filteredSuppliers.map(supplier => (
                    <div 
                      key={supplier.id}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-dark-50 transition-colors ${
                        selectedSupplierId === supplier.id ? 'border-primary-500 bg-primary-50' : 'border-dark-200'
                      }`}
                      onClick={() => setSelectedSupplierId(supplier.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-dark-100 text-dark-600 font-semibold">
                            {supplier.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <h3 className="font-medium text-dark-800">{supplier.name}</h3>
                            <p className="text-sm text-dark-500">{supplier.category}, {supplier.location}</p>
                          </div>
                        </div>
                        {supplier.riskScore && (
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50">
                            <span className={`text-xl font-bold ${
                              supplier.riskScore >= 80 ? 'text-green-600' :
                              supplier.riskScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {supplier.riskScore}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-dark-500">No suppliers found matching your search criteria.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Supplier Details */}
        <div className="space-y-6">
          {selectedSupplier ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Supplier Risk Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <SupplierRiskScore supplier={selectedSupplier} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>SHAP Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ShapExplainer supplierId={selectedSupplier.id} />
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-dark-500">
                <p>Select a supplier to view detailed risk analysis and SHAP explanation</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
