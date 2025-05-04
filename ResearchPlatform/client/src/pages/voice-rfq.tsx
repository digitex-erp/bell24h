import { Helmet } from "react-helmet";
import VoiceRecorder from "@/components/voice-rfq/VoiceRecorder";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, HeadphonesIcon, Mic, Terminal, Volume2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function VoiceRfqPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Voice RFQ | Bell24h</title>
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Voice & Video RFQ System</h1>
        <p className="text-muted-foreground mt-2">
          Create RFQs using voice commands or process voice-based instructions
        </p>
      </div>
      
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Feature in Development</AlertTitle>
        <AlertDescription>
          Hindi language support is 75% complete and multi-language voice commands are 45% complete.
          Some functionality may be limited.
        </AlertDescription>
      </Alert>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mic className="h-5 w-5 mr-2" />
              Voice RFQ Creation
            </CardTitle>
            <CardDescription>Create detailed RFQs by simply speaking into your microphone</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground mb-4">
              <li>Describe product specifications, quantities, and delivery dates</li>
              <li>AI automatically extracts and formats your requirements</li>
              <li>Review and edit before submission</li>
              <li>Supports multiple languages including Hindi (75% complete)</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Terminal className="h-5 w-5 mr-2" />
              Voice Commands
            </CardTitle>
            <CardDescription>Control the platform using natural voice instructions</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground mb-4">
              <li>Use commands like "Create RFQ" or "Search Supplier"</li>
              <li>Navigate through the platform hands-free</li>
              <li>Issue complex instructions in a natural speaking style</li>
              <li>Multi-language support (45% complete)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <VoiceRecorder />
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Supported Languages</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md">English</CardTitle>
              <CardDescription>100% Complete</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Volume2 className="h-4 w-4 mr-1 text-green-600" />
                <span className="text-sm text-green-600">Fully Supported</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Hindi</CardTitle>
              <CardDescription>75% Complete</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Volume2 className="h-4 w-4 mr-1 text-amber-600" />
                <span className="text-sm text-amber-600">Partially Supported</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Spanish</CardTitle>
              <CardDescription>60% Complete</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Volume2 className="h-4 w-4 mr-1 text-amber-600" />
                <span className="text-sm text-amber-600">Partially Supported</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Arabic/Chinese</CardTitle>
              <CardDescription>30% Complete</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <HeadphonesIcon className="h-4 w-4 mr-1 text-red-600" />
                <span className="text-sm text-red-600">In Development</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
