import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart4, Building2, CheckCircle2, Globe, HeadphonesIcon, Lock, MessageSquare, TrendingUp } from "lucide-react";
import { InteractiveButton, AnimatedSkeleton, SuccessAnimation } from "@/components/ui/micro-interactions";
import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const handleDemoClick = () => {
    setLoading(true);
    
    // Simulate loading state for 1.5 seconds
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      // Hide success animation after 2 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 2000);
    }, 1500);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Bell24h Marketplace</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          An advanced AI-powered RFQ marketplace revolutionizing global procurement through intelligent supplier matching, blockchain security, and intuitive user experience.
        </p>
        
        <div className="mt-6 flex items-center justify-center">
          <InteractiveButton 
            onClick={handleDemoClick} 
            isLoading={loading}
            loadingText="Processing..."
            className="mr-4"
          >
            Try Bell24h Demo
          </InteractiveButton>
          
          <div className="w-10 h-10 flex items-center justify-center">
            <SuccessAnimation isVisible={success} size="medium" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart4 className="h-5 w-5" />
              <span>Project Dashboard</span>
            </CardTitle>
            <CardDescription>Track project completion status and monitor high-priority tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm mb-4">
              <ul className="list-disc pl-5 space-y-1">
                <li>Overall project completion at 92%</li>
                <li>Monitor integration status for all APIs</li>
                <li>Track system health and active incidents</li>
                <li>View and manage high-priority tasks</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard">
              <InteractiveButton className="w-full">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </InteractiveButton>
            </Link>
          </CardFooter>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeadphonesIcon className="h-5 w-5" />
              <span>Voice/Video RFQ</span>
            </CardTitle>
            <CardDescription>Create RFQs using voice commands in multiple languages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm mb-4">
              <ul className="list-disc pl-5 space-y-1">
                <li>Submit RFQs using voice commands</li>
                <li>Multi-language support including Hindi (75% complete)</li>
                <li>Video-based RFQ submission</li>
                <li>AI-powered content extraction</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline" disabled>
              Coming Soon
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <span>Industry Trends</span>
            </CardTitle>
            <CardDescription>Generate comprehensive industry trend snapshots with AI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm mb-4">
              <ul className="list-disc pl-5 space-y-1">
                <li>One-click industry analysis</li>
                <li>Market size and growth projections</li>
                <li>Competitive landscape insights</li>
                <li>Emerging technology identification</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/industry-trends">
              <InteractiveButton className="w-full">
                Explore Industry Trends
                <ArrowRight className="ml-2 h-4 w-4" />
              </InteractiveButton>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <span>Blockchain Payments</span>
            </CardTitle>
            <CardDescription>Secure transactions with blockchain verification</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Our platform uses blockchain technology to secure milestone-based payments and contracts between buyers and suppliers.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <span>Financial Services</span>
            </CardTitle>
            <CardDescription>KredX and M1 Exchange integrations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Access invoice financing through KredX and early payment services via M1 Exchange to optimize your cash flow.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <span>Multi-language Support</span>
            </CardTitle>
            <CardDescription>Platform available in 5 languages</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Full platform support for English, Hindi, Spanish, Arabic, and Chinese to serve our global user base.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Project Completion</h2>
        <p className="text-muted-foreground">Overall progress: 92% complete</p>
        <div className="w-full bg-muted rounded-full h-4 my-4 max-w-2xl mx-auto">
          <div className="bg-primary h-4 rounded-full" style={{ width: "92%" }}></div>
        </div>
      </div>

      <div className="text-center flex flex-col md:flex-row items-center justify-center gap-4">
        <Link href="/dashboard">
          <Button size="lg">
            View Project Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <Link href="/industry-trends">
          <Button size="lg" variant="outline">
            Generate Industry Trends
            <TrendingUp className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
