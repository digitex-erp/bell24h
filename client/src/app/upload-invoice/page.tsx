'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Download,
  Eye,
  Trash2
} from 'lucide-react';

export default function UploadInvoicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">
            Upload Invoice
          </h1>
          <p className="text-lg text-indigo-100 max-w-2xl mx-auto">
            Upload your invoices securely. Supported formats: JPG, PDF, PNG. 
            Track status and manage all your documents in one place.
          </p>
        </div>
      </section>

      {/* Upload Section */}
      <section className="py-16 -mt-10">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            
            {/* Upload Form */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-indigo-600">
                  <Upload className="h-6 w-6 mr-2" />
                  Upload Invoice
                </CardTitle>
                <p className="text-gray-600">
                  Drag and drop your invoice file or click to browse
                </p>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  
                  {/* File Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
                    <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                      <FileText className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Drop files here or click to upload
                    </h3>
                    <p className="text-gray-600 mb-4">
                      You can only upload .jpg, .pdf, or .png file
                    </p>
                    <Input 
                      type="file" 
                      accept=".jpg,.jpeg,.pdf,.png"
                      className="hidden"
                      id="invoice-upload"
                    />
                    <Button 
                      type="button" 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      onClick={() => document.getElementById('invoice-upload')?.click()}
                    >
                      <Upload className="h-5 w-5 mr-2" />
                      Choose File
                    </Button>
                    <div className="text-sm text-gray-500 mt-2">
                      Maximum file size: 10MB
                    </div>
                  </div>

                  {/* Invoice Details */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Invoice Number *
                      </label>
                      <Input 
                        type="text" 
                        placeholder="Enter invoice number"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Invoice Date *
                      </label>
                      <Input 
                        type="date" 
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vendor/Supplier Name *
                      </label>
                      <Input 
                        type="text" 
                        placeholder="Enter vendor name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount (INR) *
                      </label>
                      <Input 
                        type="number" 
                        placeholder="Enter invoice amount"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <Input 
                      type="text" 
                      placeholder="Brief description of the invoice"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Invoice
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Upload Guidelines */}
            <Card className="border-0 shadow-lg mt-8">
              <CardHeader>
                <CardTitle className="flex items-center text-emerald-600">
                  <CheckCircle className="h-6 w-6 mr-2" />
                  Upload Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Supported File Formats</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        JPG/JPEG images
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        PDF documents
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        PNG images
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">File Requirements</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Maximum size: 10MB
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Clear, readable text
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        High resolution preferred
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Uploads */}
            <Card className="border-0 shadow-lg mt-8">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <FileText className="h-6 w-6 mr-2" />
                  Recent Uploads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Sample Upload Entry */}
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <FileText className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Invoice-001.pdf</h4>
                        <p className="text-sm text-gray-600">Uploaded on Dec 15, 2024</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Processed
                      </span>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>

                  {/* Empty State */}
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No invoices uploaded yet</p>
                    <p className="text-sm">Upload your first invoice to get started</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Notice */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Secure Document Storage
                    </h3>
                    <p className="text-gray-600 mb-4">
                      All uploaded invoices are stored securely using enterprise-grade encryption. 
                      Your documents are protected with 256-bit SSL encryption and backed up regularly.
                    </p>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• 256-bit SSL encryption for all uploads</li>
                      <li>• Regular automated backups</li>
                      <li>• Access logs and audit trails</li>
                      <li>• GDPR compliant data handling</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
