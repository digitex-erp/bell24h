import { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { VoiceTutorial } from '@/components/voice/voice-tutorial';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Mic, 
  Lightbulb, 
  FileText, 
  Headphones, 
  Settings, 
  Globe, 
  ChevronRight 
} from 'lucide-react';

function VoiceTutorialPage() {
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  const openTutorial = (section: string) => {
    setActiveSection(section);
    setTutorialOpen(true);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Voice Features Tutorials & Onboarding</h1>
            <p className="text-muted-foreground mt-1">
              Learn how to use the voice-based RFQ features to get the most out of Bell24H
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {/* Left column - Tutorial Navigation */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Tutorials & Guides</CardTitle>
                  <CardDescription>
                    Step-by-step tutorials to help you master voice features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button 
                      variant="ghost" 
                      className="flex justify-between items-center w-full"
                      onClick={() => openTutorial('overview')}
                    >
                      <div className="flex items-center">
                        <Lightbulb className="mr-2 h-5 w-5 text-primary" />
                        <span>Getting Started</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className="flex justify-between items-center w-full"
                      onClick={() => openTutorial('submission')}
                    >
                      <div className="flex items-center">
                        <Mic className="mr-2 h-5 w-5 text-primary" />
                        <span>Voice RFQ Submission</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className="flex justify-between items-center w-full"
                      onClick={() => openTutorial('languages')}
                    >
                      <div className="flex items-center">
                        <Globe className="mr-2 h-5 w-5 text-primary" />
                        <span>Multilingual Support</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className="flex justify-between items-center w-full"
                      onClick={() => openTutorial('analytics')}
                    >
                      <div className="flex items-center">
                        <FileText className="mr-2 h-5 w-5 text-primary" />
                        <span>Voice Analytics</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    <Separator className="my-3" />
                    
                    <Button 
                      variant="ghost" 
                      className="flex justify-between items-center w-full"
                    >
                      <div className="flex items-center">
                        <Headphones className="mr-2 h-5 w-5 text-primary" />
                        <span>Audio Enhancement</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className="flex justify-between items-center w-full"
                    >
                      <div className="flex items-center">
                        <Settings className="mr-2 h-5 w-5 text-primary" />
                        <span>Advanced Settings</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <Button className="w-full" onClick={() => setTutorialOpen(true)}>
                      Launch Interactive Tutorial
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right column - Content */}
            <div className="md:col-span-3">
              <Tabs defaultValue="quick-start">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="quick-start">Quick Start</TabsTrigger>
                  <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
                  <TabsTrigger value="faq">FAQ</TabsTrigger>
                </TabsList>
                
                <TabsContent value="quick-start" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Start Guide</CardTitle>
                      <CardDescription>
                        Get started with voice-based RFQs in just a few minutes
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="bg-muted p-3 rounded-md flex items-start">
                          <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center mt-0.5">
                            1
                          </div>
                          <div className="ml-3">
                            <h3 className="font-medium">Navigate to the RFQ page</h3>
                            <p className="text-sm text-muted-foreground">
                              Go to the RFQ section and click on "Create New RFQ"
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-muted p-3 rounded-md flex items-start">
                          <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center mt-0.5">
                            2
                          </div>
                          <div className="ml-3">
                            <h3 className="font-medium">Select voice submission</h3>
                            <p className="text-sm text-muted-foreground">
                              Click on the microphone icon to switch to voice input mode
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-muted p-3 rounded-md flex items-start">
                          <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center mt-0.5">
                            3
                          </div>
                          <div className="ml-3">
                            <h3 className="font-medium">Record your request</h3>
                            <p className="text-sm text-muted-foreground">
                              Speak clearly, mentioning product details, quantity, and timeline
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-muted p-3 rounded-md flex items-start">
                          <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center mt-0.5">
                            4
                          </div>
                          <div className="ml-3">
                            <h3 className="font-medium">Review and submit</h3>
                            <p className="text-sm text-muted-foreground">
                              Check the transcription, edit if needed, and click Submit
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 flex justify-center">
                        <Button onClick={() => openTutorial('submission')}>
                          <Mic className="mr-2 h-4 w-4" />
                          Start Voice RFQ Tutorial
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Sample Voice Prompts</CardTitle>
                      <CardDescription>
                        Examples of effective voice RFQ submissions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="border rounded-md p-3">
                          <h3 className="font-medium mb-1">Manufacturing Example</h3>
                          <p className="text-sm bg-muted p-2 rounded">
                            "I need 500 units of 20mm carbon steel bolts with hexagonal heads. They should comply with ISO 898-1 standards for mechanical properties. We need delivery within 30 days, and our budget is approximately ₹50,000. Please provide a detailed quotation with technical specifications and quality certifications."
                          </p>
                        </div>
                        
                        <div className="border rounded-md p-3">
                          <h3 className="font-medium mb-1">Electronics Example</h3>
                          <p className="text-sm bg-muted p-2 rounded">
                            "We are looking for 200 pieces of 10-inch LCD displays for industrial control panels. They should have a resolution of at least 1280x800, operating temperature range of 0-50°C, and HDMI input. We need them delivered to our Mumbai facility within 45 days. Our budget is ₹2,00,000. Please quote including shipping and any applicable taxes."
                          </p>
                        </div>
                        
                        <div className="border rounded-md p-3">
                          <h3 className="font-medium mb-1">Textile Example</h3>
                          <p className="text-sm bg-muted p-2 rounded">
                            "I'm requesting quotes for 1,000 meters of cotton polyester blend fabric, 150 GSM, in navy blue color. We need this for manufacturing school uniforms. The fabric should be shrink-resistant and colorfast. Delivery is required within 3 weeks to our Delhi warehouse. Please provide samples with your quotation. Our budget range is ₹120-150 per meter."
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="best-practices" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Voice RFQ Best Practices</CardTitle>
                      <CardDescription>
                        Tips to improve voice transcription accuracy and response quality
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-medium">Environment</h3>
                          <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                            <li>Find a quiet location with minimal background noise</li>
                            <li>Avoid areas with echo or reverb</li>
                            <li>Close windows and doors to reduce outside noise</li>
                            <li>Turn off fans, air conditioners, or other noisy appliances nearby</li>
                          </ul>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="font-medium">Speaking Technique</h3>
                          <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                            <li>Speak clearly at a moderate pace</li>
                            <li>Enunciate technical terms and numbers precisely</li>
                            <li>Pause briefly between different information sections</li>
                            <li>Keep a consistent distance from your microphone</li>
                            <li>Avoid mumbling or speaking too quietly</li>
                          </ul>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="font-medium">Content Organization</h3>
                          <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                            <li>Start with a clear title for your RFQ</li>
                            <li>Follow a logical structure: product, specifications, quantity, timeline, budget</li>
                            <li>State numerical values clearly: "five hundred units" or "five zero zero units"</li>
                            <li>Spell out model numbers and part codes letter by letter</li>
                            <li>Summarize key points at the end</li>
                          </ul>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="font-medium">Multilingual Tips</h3>
                          <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                            <li>Choose the language you're most comfortable with</li>
                            <li>Specify at the beginning if using a particular language: "This RFQ is in Hindi"</li>
                            <li>For technical terms without direct translations, consider using English terms within your native language</li>
                            <li>Speak at a slightly slower pace when using non-English languages</li>
                            <li>Review the translation before submitting</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="faq" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Frequently Asked Questions</CardTitle>
                      <CardDescription>
                        Common questions about voice-based RFQ features
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-medium">What languages are supported?</h3>
                          <p className="text-sm text-muted-foreground">
                            Currently, we fully support English and Hindi, with automatic language detection. 
                            We're working on adding Bengali, Tamil, Telugu, and Gujarati in the near future.
                          </p>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <h3 className="font-medium">How long can my voice recording be?</h3>
                          <p className="text-sm text-muted-foreground">
                            Voice recordings can be up to 2 minutes long. For complex RFQs, we recommend 
                            focusing on the key information in your voice recording and then adding additional 
                            details in the editing stage.
                          </p>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <h3 className="font-medium">What if the transcription is inaccurate?</h3>
                          <p className="text-sm text-muted-foreground">
                            You'll always have a chance to review and edit the transcription before submitting 
                            your RFQ. If there are any inaccuracies, simply correct them in the editing interface.
                          </p>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <h3 className="font-medium">How does audio enhancement work?</h3>
                          <p className="text-sm text-muted-foreground">
                            Our audio enhancement technology uses AI to reduce background noise, improve voice clarity, 
                            and enhance overall audio quality. This is especially useful when recording in noisy environments.
                          </p>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <h3 className="font-medium">Can I use voice features on mobile devices?</h3>
                          <p className="text-sm text-muted-foreground">
                            Yes, voice features work on both desktop and mobile devices. Make sure to grant microphone 
                            permissions when prompted by your browser.
                          </p>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <h3 className="font-medium">How can I view analytics for my voice RFQs?</h3>
                          <p className="text-sm text-muted-foreground">
                            Visit the Voice Analytics dashboard to see detailed statistics about your voice RFQ submissions, 
                            including language distribution, transcription quality, and submission trends.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      
      {/* Interactive Tutorial Dialog */}
      <VoiceTutorial 
        isOpen={tutorialOpen} 
        onOpenChange={setTutorialOpen} 
        showTrigger={false}
      />
    </MainLayout>
  );
}

export default VoiceTutorialPage;