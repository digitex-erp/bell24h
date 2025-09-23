'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Home, 
  Users, 
  Briefcase, 
  Factory, 
  ShoppingBag,
  Wrench,
  Heart,
  GraduationCap,
  Stethoscope,
  Car,
  Laptop,
  Shirt,
  Utensils,
  Palette,
  FileText,
  MessageSquare,
  TrendingUp,
  Shield,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';

interface BusinessCategory {
  id: string;
  name: string;
  type: 'B2B' | 'B2C' | 'Home Service' | 'Service Industry';
  icon: any;
  description: string;
  features: string[];
  registrationType: string[];
  pricing: string;
  examples: string[];
  color: string;
}

const businessCategories: BusinessCategory[] = [
  {
    id: 'b2b-manufacturing',
    name: 'B2B Manufacturing',
    type: 'B2B',
    icon: Factory,
    description: 'Industrial manufacturing, production, and supply chain businesses',
    features: ['Bulk orders', 'Custom manufacturing', 'Supply chain management', 'Quality assurance'],
    registrationType: ['Udyam Aadhaar (Mandatory)', 'GST Registration', 'Factory License'],
    pricing: 'Free - Premium Plans',
    examples: ['Steel production', 'Textile manufacturing', 'Chemical processing', 'Food processing'],
    color: 'blue'
  },
  {
    id: 'b2b-services',
    name: 'B2B Services',
    type: 'B2B',
    icon: Briefcase,
    description: 'Professional services for businesses and enterprises',
    features: ['Consulting', 'IT services', 'Logistics', 'Professional support'],
    registrationType: ['Udyam Aadhaar (Mandatory)', 'GST Registration', 'Professional License'],
    pricing: 'Free - Premium Plans',
    examples: ['IT consulting', 'Logistics services', 'Marketing agencies', 'Financial services'],
    color: 'green'
  },
  {
    id: 'b2c-products',
    name: 'B2C Products',
    type: 'B2C',
    icon: ShoppingBag,
    description: 'Consumer products and retail businesses',
    features: ['Direct sales', 'Customer support', 'Retail management', 'E-commerce'],
    registrationType: ['GST Registration', 'Shop & Establishment', 'Trade License'],
    pricing: 'Free - Premium Plans',
    examples: ['Electronics retail', 'Fashion & apparel', 'Home appliances', 'Beauty products'],
    color: 'purple'
  },
  {
    id: 'home-services',
    name: 'Home Services',
    type: 'Home Service',
    icon: Home,
    description: 'Home-based businesses and local service providers',
    features: ['Flexible hours', 'Local market', 'Low overhead', 'Personal touch'],
    registrationType: ['URD Registration', 'Home Business License', 'Local Authority Registration'],
    pricing: 'Free - Basic Plans',
    examples: ['Home tutoring', 'Freelance writing', 'Handicrafts', 'Online consulting'],
    color: 'orange'
  },
  {
    id: 'service-industry',
    name: 'Service Industry',
    type: 'Service Industry',
    icon: Users,
    description: 'Service providers and professional service businesses',
    features: ['Service delivery', 'Customer relationship', 'Skill-based', 'Consultation'],
    registrationType: ['Udyam Aadhaar', 'GST Registration', 'Professional License'],
    pricing: 'Free - Premium Plans',
    examples: ['Healthcare services', 'Education & training', 'Legal services', 'Creative services'],
    color: 'indigo'
  },
  {
    id: 'electronics-it',
    name: 'Electronics & IT',
    type: 'B2B',
    icon: Laptop,
    description: 'Technology, electronics, and IT services',
    features: ['Tech solutions', 'Software development', 'Hardware supply', 'IT support'],
    registrationType: ['Udyam Aadhaar', 'GST Registration', 'STPI Registration'],
    pricing: 'Free - Premium Plans',
    examples: ['Software development', 'Electronics trading', 'IT consulting', 'Tech support'],
    color: 'blue'
  },
  {
    id: 'textiles-apparel',
    name: 'Textiles & Apparel',
    type: 'B2B',
    icon: Shirt,
    description: 'Textile manufacturing and apparel businesses',
    features: ['Fabric supply', 'Garment manufacturing', 'Fashion design', 'Textile trading'],
    registrationType: ['Udyam Aadhaar', 'GST Registration', 'Textile License'],
    pricing: 'Free - Premium Plans',
    examples: ['Fabric manufacturing', 'Garment production', 'Fashion retail', 'Textile trading'],
    color: 'pink'
  },
  {
    id: 'healthcare-pharma',
    name: 'Healthcare & Pharma',
    type: 'Service Industry',
    icon: Stethoscope,
    description: 'Healthcare services and pharmaceutical businesses',
    features: ['Medical services', 'Pharma supply', 'Healthcare consulting', 'Medical equipment'],
    registrationType: ['Udyam Aadhaar', 'GST Registration', 'Medical License'],
    pricing: 'Premium Plans Only',
    examples: ['Medical clinics', 'Pharmaceutical trading', 'Healthcare consulting', 'Medical equipment'],
    color: 'red'
  },
  {
    id: 'food-beverages',
    name: 'Food & Beverages',
    type: 'B2C',
    icon: Utensils,
    description: 'Food production, processing, and retail',
    features: ['Food production', 'Restaurant services', 'Food trading', 'Catering'],
    registrationType: ['FSSAI License', 'GST Registration', 'Trade License'],
    pricing: 'Free - Premium Plans',
    examples: ['Food manufacturing', 'Restaurant business', 'Food retail', 'Catering services'],
    color: 'yellow'
  },
  {
    id: 'education-training',
    name: 'Education & Training',
    type: 'Service Industry',
    icon: GraduationCap,
    description: 'Educational services and training providers',
    features: ['Course delivery', 'Skill training', 'Educational consulting', 'Online learning'],
    registrationType: ['Udyam Aadhaar', 'GST Registration', 'Educational License'],
    pricing: 'Free - Premium Plans',
    examples: ['Training institutes', 'Online courses', 'Educational consulting', 'Skill development'],
    color: 'green'
  },
  {
    id: 'automotive-transport',
    name: 'Automotive & Transport',
    type: 'B2B',
    icon: Car,
    description: 'Automotive industry and transportation services',
    features: ['Vehicle supply', 'Transport services', 'Auto parts', 'Logistics'],
    registrationType: ['Udyam Aadhaar', 'GST Registration', 'Transport License'],
    pricing: 'Free - Premium Plans',
    examples: ['Auto parts trading', 'Transport services', 'Vehicle dealership', 'Logistics'],
    color: 'gray'
  },
  {
    id: 'consulting-professional',
    name: 'Consulting & Professional',
    type: 'Service Industry',
    icon: FileText,
    description: 'Professional consulting and advisory services',
    features: ['Business consulting', 'Legal services', 'Financial advisory', 'Management consulting'],
    registrationType: ['Udyam Aadhaar', 'GST Registration', 'Professional License'],
    pricing: 'Premium Plans Only',
    examples: ['Business consulting', 'Legal services', 'Financial advisory', 'Management consulting'],
    color: 'indigo'
  }
];

export default function BusinessCategoriesPage() {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'B2B':
        return 'bg-blue-100 text-blue-800';
      case 'B2C':
        return 'bg-purple-100 text-purple-800';
      case 'Home Service':
        return 'bg-orange-100 text-orange-800';
      case 'Service Industry':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-600';
      case 'green':
        return 'bg-green-100 text-green-600';
      case 'purple':
        return 'bg-purple-100 text-purple-600';
      case 'orange':
        return 'bg-orange-100 text-orange-600';
      case 'indigo':
        return 'bg-indigo-100 text-indigo-600';
      case 'pink':
        return 'bg-pink-100 text-pink-600';
      case 'red':
        return 'bg-red-100 text-red-600';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-600';
      case 'gray':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Business Categories" />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">All Business Categories</h1>
            <p className="text-xl text-gray-600 mb-8">
              Bell24h supports ALL types of businesses - from large B2B enterprises to home-based services
            </p>
            
            {/* Business Type Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-blue-800">B2B</h3>
                <p className="text-sm text-blue-600">Business to Business</p>
                <p className="text-xs text-blue-500 mt-1">Manufacturing, Services, Trading</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <ShoppingBag className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-purple-800">B2C</h3>
                <p className="text-sm text-purple-600">Business to Consumer</p>
                <p className="text-xs text-purple-500 mt-1">Retail, Products, Services</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Home className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="font-semibold text-orange-800">Home Services</h3>
                <p className="text-sm text-orange-600">Home-based Businesses</p>
                <p className="text-xs text-orange-500 mt-1">Freelance, Local Services</p>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-indigo-800">Service Industry</h3>
                <p className="text-sm text-indigo-600">Professional Services</p>
                <p className="text-xs text-indigo-500 mt-1">Consulting, Healthcare, Education</p>
              </div>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businessCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card key={category.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-12 h-12 ${getCategoryColor(category.color)} rounded-lg flex items-center justify-center`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <Badge className={getTypeColor(category.type)}>
                        {category.type}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{category.name}</CardTitle>
                    <p className="text-gray-600 text-sm">{category.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Key Features:</h4>
                      <ul className="space-y-1">
                        {category.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Registration Required:</h4>
                      <div className="space-y-1">
                        {category.registrationType.slice(0, 2).map((reg, index) => (
                          <div key={index} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                            {reg}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Examples:</h4>
                      <div className="flex flex-wrap gap-1">
                        {category.examples.slice(0, 3).map((example, index) => (
                          <span key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {example}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-sm font-semibold text-green-600">{category.pricing}</span>
                      <Button asChild size="sm">
                        <Link href={`/registration?category=${category.id}`}>
                          Register Now
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Registration Support */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Your Business Journey?</h2>
                <p className="text-lg text-gray-600 mb-6">
                  Whether you're a large manufacturer, a home-based service provider, or anything in between, 
                  Bell24h has the right tools and support for your business.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/registration">
                      <Users className="h-5 w-5 mr-2" />
                      Start Registration
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/legal/msme-registration">
                      <FileText className="h-5 w-5 mr-2" />
                      MSME Guide
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/legal/escrow-services">
                      <Shield className="h-5 w-5 mr-2" />
                      Escrow Services
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Need Help Choosing?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Not sure which category fits your business? Our team can help you choose the right path.
                </p>
                <Button variant="outline" size="sm">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Growth Support</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Start small and scale up. Upgrade your plan as your business grows.
                </p>
                <Button variant="outline" size="sm">
                  View Plans
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Compliance Made Easy</h3>
                <p className="text-gray-600 text-sm mb-4">
                  We guide you through all registration and compliance requirements.
                </p>
                <Button variant="outline" size="sm">
                  Compliance Guide
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
