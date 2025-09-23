'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  Info, 
  CheckCircle,
  FileText,
  Building2,
  Users,
  Briefcase,
  Download,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';

export default function URDInformationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="URD Registration Information" />
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Important Notice */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-red-600 mt-0.5" />
              <div>
                <h2 className="text-xl font-bold text-red-800 mb-2">Important Clarification</h2>
                <p className="text-red-700 mb-3">
                  <strong>URD (Unregistered Registered Dealer) does NOT issue certificates.</strong> 
                  It's a simple registration process for businesses that don't require GST registration.
                </p>
                <p className="text-red-700">
                  URD provides basic business recognition without formal documentation or certificates.
                </p>
              </div>
            </div>
          </div>

          {/* What is URD */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-6 w-6 text-blue-600" />
                What is URD Registration?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Definition</h3>
                <p className="text-blue-700">
                  URD (Unregistered Registered Dealer) is a <strong>simple registration process</strong> 
                  for businesses that operate below the GST threshold and don't require formal GST registration.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">What URD IS:</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                      <span>Simple registration process</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                      <span>Basic business recognition</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                      <span>Local market access</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                      <span>Minimal compliance requirements</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">What URD is NOT:</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-1" />
                      <span>Not a certificate</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-1" />
                      <span>Not formal documentation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-1" />
                      <span>Not GST registration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-1" />
                      <span>Not mandatory for all businesses</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Eligibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-green-600" />
                Who Can Apply for URD Registration?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-green-700">Eligible Businesses:</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Annual turnover below ₹20 lakh</li>
                    <li>• Local business operations only</li>
                    <li>• Not engaged in interstate supply</li>
                    <li>• No manufacturing activities</li>
                    <li>• Service providers with limited scope</li>
                    <li>• Home-based businesses</li>
                    <li>• Freelancers and consultants</li>
                    <li>• Small retail businesses</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 text-red-700">Not Eligible:</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Businesses with GST registration</li>
                    <li>• Interstate suppliers</li>
                    <li>• Manufacturing businesses</li>
                    <li>• Export-import businesses</li>
                    <li>• Turnover above ₹20 lakh</li>
                    <li>• E-commerce platforms</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registration Process */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-purple-600" />
                URD Registration Process
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-yellow-800">Simple Process - No Complex Documentation</h3>
                      <p className="text-yellow-700 mt-1">
                        URD registration is much simpler than GST registration and doesn't require certificates or complex documentation.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <h3 className="font-semibold mb-2">Contact Local Office</h3>
                    <p className="text-sm text-gray-600">Visit your local commercial tax office or apply online</p>
                  </div>

                  <div className="text-center p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-green-600 font-bold">2</span>
                    </div>
                    <h3 className="font-semibold mb-2">Submit Basic Details</h3>
                    <p className="text-sm text-gray-600">Provide business name, address, and contact information</p>
                  </div>

                  <div className="text-center p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-purple-600 font-bold">3</span>
                    </div>
                    <h3 className="font-semibold mb-2">Pay Nominal Fee</h3>
                    <p className="text-sm text-gray-600">Pay a small registration fee (varies by state)</p>
                  </div>

                  <div className="text-center p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-orange-600 font-bold">4</span>
                    </div>
                    <h3 className="font-semibold mb-2">Get Registration Number</h3>
                    <p className="text-sm text-gray-600">Receive your URD registration number (not a certificate)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits and Limitations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-6 w-6 text-indigo-600" />
                URD Benefits and Limitations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-green-700">Benefits:</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Basic business recognition</li>
                    <li>• Local market access</li>
                    <li>• Simple compliance requirements</li>
                    <li>• Lower regulatory burden</li>
                    <li>• Entry-level business status</li>
                    <li>• No complex documentation</li>
                    <li>• Quick registration process</li>
                    <li>• Nominal registration fee</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 text-orange-700">Limitations:</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• No interstate business</li>
                    <li>• Limited to local operations</li>
                    <li>• No government tenders</li>
                    <li>• No formal certificates</li>
                    <li>• Limited business recognition</li>
                    <li>• Cannot claim input tax credit</li>
                    <li>• No export-import benefits</li>
                    <li>• Restricted growth potential</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* State-wise Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-teal-600" />
                State-wise URD Registration Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-teal-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-teal-800">Important Note</h3>
                    <p className="text-teal-700 mt-1">
                      URD registration requirements and processes vary by state. Contact your local commercial tax office for specific requirements.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Maharashtra</h4>
                  <p className="text-sm text-gray-600 mb-2">Registration fee: ₹500-1000</p>
                  <p className="text-sm text-gray-600">Contact: Local commercial tax office</p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Delhi</h4>
                  <p className="text-sm text-gray-600 mb-2">Registration fee: ₹300-500</p>
                  <p className="text-sm text-gray-600">Contact: Delhi commercial tax office</p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Karnataka</h4>
                  <p className="text-sm text-gray-600 mb-2">Registration fee: ₹400-800</p>
                  <p className="text-sm text-gray-600">Contact: Local VAT office</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/registration">
                <FileText className="h-5 w-5 mr-2" />
                Start Business Registration
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/legal/msme-registration">
                <Info className="h-5 w-5 mr-2" />
                MSME Registration Guide
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/business-categories">
                <Building2 className="h-5 w-5 mr-2" />
                Business Categories
              </Link>
            </Button>
          </div>

          {/* Contact Information */}
          <Card className="bg-gray-50">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-4">Need Help with URD Registration?</h3>
                <p className="text-gray-600 mb-4">
                  Our team can help you understand URD requirements and guide you through the registration process.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Contact Local Tax Office
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download URD Form
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
