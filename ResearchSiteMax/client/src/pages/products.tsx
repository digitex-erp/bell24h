import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { Box, Filter, Grid3X3, List, MoreHorizontal, Package, Plus, Search } from "lucide-react";

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("my_products");

  // Fetch products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products", activeTab, categoryFilter, searchTerm],
  });

  // Fetch categories for filter
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const filteredProducts = products;

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="px-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Product Catalog</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your product listings and catalog.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button className="inline-flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <Tabs defaultValue="my_products" onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="my_products">My Products</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Product Catalog</CardTitle>
            <CardDescription>
              Browse, filter, and manage your product listings.
            </CardDescription>
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <div className="flex gap-3">
                <Select value={categoryFilter} onValueChange={handleCategoryFilter}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>

                <div className="flex bg-gray-100 rounded-md p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TabsContent value="my_products" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-sm text-gray-500">Loading products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Package className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No Products Found</h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-md">
                    Add your first product by clicking the "Add Product" button above.
                  </p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map((product: any) => (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="aspect-w-4 aspect-h-3 bg-gray-100 flex items-center justify-center h-48">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0].imageUrl}
                            alt={product.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <Box className="h-12 w-12 text-gray-300" />
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900 text-sm">{product.name}</h3>
                            <p className="text-gray-500 text-xs mt-1">{product.category?.name || "Unknown"}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>Duplicate</DropdownMenuItem>
                              <DropdownMenuItem>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="font-medium text-gray-900 mt-2">{formatCurrency(product.price)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Min. Order: {product.minOrderQuantity} {product.unit}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Min. Order</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product: any) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.category?.name || "Unknown"}</TableCell>
                          <TableCell>{formatCurrency(product.price)}</TableCell>
                          <TableCell>{product.stock} {product.unit}</TableCell>
                          <TableCell>{product.minOrderQuantity} {product.unit}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${product.status === "active" ? "bg-green-100 text-green-800" : 
                                product.status === "inactive" ? "bg-gray-100 text-gray-800" : 
                                "bg-yellow-100 text-yellow-800"}`}
                            >
                              {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                <DropdownMenuItem>Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="marketplace" className="mt-0">
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <h3 className="text-lg font-medium text-gray-900">Marketplace Products</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-md">
                  Browse products from other suppliers in the marketplace.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="draft" className="mt-0">
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <h3 className="text-lg font-medium text-gray-900">Draft Products</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-md">
                  You have no draft products. Drafts are saved automatically when creating a product.
                </p>
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
