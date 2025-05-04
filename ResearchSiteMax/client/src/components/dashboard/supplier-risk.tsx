import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowDown, 
  ArrowUp, 
  ChevronRight, 
  SquareSplitHorizontal 
} from "lucide-react";
import { SupplierRiskItem } from "@/types";

interface SupplierRiskProps {
  suppliers: SupplierRiskItem[];
}

export function SupplierRisk({ suppliers }: SupplierRiskProps) {
  return (
    <Card>
      <CardHeader className="px-6 py-5 border-b border-gray-200">
        <CardTitle className="text-lg font-medium leading-6 text-gray-900">
          Top Supplier Risk Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-5">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Factors
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-lg font-medium text-primary-500">
                          {supplier.name.split(" ").map(part => part[0]).join("")}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{supplier.company}</div>
                        <div className="text-sm text-gray-500">{supplier.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{supplier.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium
                        ${supplier.riskScore >= 80 ? "bg-green-100 text-green-800" : 
                          supplier.riskScore >= 70 ? "bg-yellow-100 text-yellow-800" : 
                          "bg-red-100 text-red-800"}`}
                      >
                        {supplier.riskScore}
                      </span>
                      {supplier.riskTrend === "up" && (
                        <ArrowUp className="ml-2 h-5 w-5 text-green-500" />
                      )}
                      {supplier.riskTrend === "down" && (
                        <ArrowDown className="ml-2 h-5 w-5 text-red-500" />
                      )}
                      {supplier.riskTrend === "stable" && (
                        <SquareSplitHorizontal className="ml-2 h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-col">
                      {supplier.factors.map((factor, index) => (
                        <div key={index} className="flex items-center">
                          <span className={`inline-block w-2 h-2 rounded-full mr-2
                            ${factor.indicator === "green" ? "bg-green-500" : 
                              factor.indicator === "yellow" ? "bg-yellow-500" : 
                              "bg-red-500"}`}
                          ></span>
                          <span>{factor.name}: {factor.value}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="link" size="sm" className="text-primary-500">
                      View details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-right">
          <Button variant="link" className="text-sm font-medium text-primary-500 p-0">
            View full supplier risk analysis →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
