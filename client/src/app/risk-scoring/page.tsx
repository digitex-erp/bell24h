'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle, TrendingUp, BarChart3 } from 'lucide-react';
import Header from '@/components/Header';

export default function RiskScoringPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Risk Scoring" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">AI-Powered Risk Assessment</h2>
          <p className="text-lg text-gray-600">Comprehensive risk scoring for suppliers and transactions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-green-600" />
                Supplier Risk Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">85/100</div>
              <p className="text-gray-600 mb-4">Low Risk - Excellent supplier profile</p>
              <Button className="w-full">View Details</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                Transaction Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600 mb-2">65/100</div>
              <p className="text-gray-600 mb-4">Medium Risk - Requires monitoring</p>
              <Button className="w-full">View Details</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
                Credit Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">92/100</div>
              <p className="text-gray-600 mb-4">Excellent - High creditworthiness</p>
              <Button className="w-full">View Details</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                Market Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 mb-2">78/100</div>
              <p className="text-gray-600 mb-4">Stable - Market conditions favorable</p>
              <Button className="w-full">View Details</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-orange-600" />
                Compliance Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 mb-2">88/100</div>
              <p className="text-gray-600 mb-4">Good - Meets regulatory requirements</p>
              <Button className="w-full">View Details</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-red-600" />
                Fraud Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 mb-2">95/100</div>
              <p className="text-gray-600 mb-4">Very Low - No fraud indicators</p>
              <Button className="w-full">View Details</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
