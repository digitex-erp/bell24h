import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Volume2, Globe, Wand2, FileCheck, AlertTriangle, HelpCircle, Play, Pause } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface VoiceTutorialProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
  triggerText?: string;
}

export function VoiceTutorial({
  isOpen,
  onOpenChange,
  showTrigger = true,
  triggerText = 'Voice Feature Tutorial'
}: VoiceTutorialProps) {
  const [currentTab, setCurrentTab] = useState('overview');
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const maxSubmissionSteps = 5;
  
  const handleNextStep = () => {
    if (currentStep < maxSubmissionSteps) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const resetSteps = () => {
    setCurrentStep(1);
  };
  
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Reset steps when changing tabs
  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    resetSteps();
  };

  const DialogWrapper = ({ children }: { children: React.ReactNode }) => {
    if (isOpen !== undefined) {
      return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {children}
          </DialogContent>
        </Dialog>
      );
    }
    
    return (
      <Dialog>
        {showTrigger && (
          <DialogTrigger asChild>
            <Button variant="outline">
              <HelpCircle className="mr-2 h-4 w-4" />
              {triggerText}
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {children}
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <DialogWrapper>
      <DialogHeader>
        <DialogTitle className="text-2xl">Voice-Based RFQ Tutorial</DialogTitle>
        <DialogDescription>
          Learn how to effectively use voice features for RFQ submission and analysis.
        </DialogDescription>
      </DialogHeader>
      
      <Tabs defaultValue="overview" value={currentTab} onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="submission">Voice Submission</TabsTrigger>
          <TabsTrigger value="languages">Language Support</TabsTrigger>
          <TabsTrigger value="analytics">Voice Analytics</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center space-x-2">
                <Mic className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Voice-Based RFQ</CardTitle>
                  <CardDescription>Quick voice-based RFQ submission</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Submit RFQs by simply speaking into your device. Our AI will extract all relevant details
                  including product specifications, quantities, and delivery requirements.
                </p>
                <div className="flex justify-between items-center mt-4">
                  <Badge variant="outline">Time-saving</Badge>
                  <Button variant="outline" size="sm">Try it now</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center space-x-2">
                <Globe className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Multilingual Support</CardTitle>
                  <CardDescription>Submit in your preferred language</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Submit RFQs in multiple languages including Hindi and English. Automatic language detection
                  and translation ensure your requirements are understood accurately.
                </p>
                <div className="flex justify-between items-center mt-4">
                  <Badge variant="outline">Multilingual</Badge>
                  <Button variant="outline" size="sm" onClick={() => handleTabChange('languages')}>Learn more</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center space-x-2">
                <Wand2 className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>AI-Powered Enhancement</CardTitle>
                  <CardDescription>Noise reduction & clarity improvement</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Our audio enhancement algorithms improve recording quality by reducing background noise
                  and enhancing speech clarity for better transcription accuracy.
                </p>
                <div className="flex justify-between items-center mt-4">
                  <Badge variant="outline">Enhanced Quality</Badge>
                  <Button variant="outline" size="sm" onClick={() => handleTabChange('submission')}>Learn more</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center space-x-2">
                <FileCheck className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Comprehensive Analytics</CardTitle>
                  <CardDescription>Voice RFQ performance insights</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Gain insights into your voice RFQ submissions with language distribution, transcription confidence,
                  and performance metrics in the Voice Analytics dashboard.
                </p>
                <div className="flex justify-between items-center mt-4">
                  <Badge variant="outline">Data-driven</Badge>
                  <Button variant="outline" size="sm" onClick={() => handleTabChange('analytics')}>View analytics</Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-center mt-6">
            <Button onClick={() => handleTabChange('submission')}>Start Voice Submission Tutorial</Button>
          </div>
        </TabsContent>
        
        {/* Voice Submission Tab */}
        <TabsContent value="submission" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Step {currentStep} of {maxSubmissionSteps}: {
                currentStep === 1 ? 'Prepare Your Request' :
                currentStep === 2 ? 'Record Your Voice' :
                currentStep === 3 ? 'Review and Edit' :
                currentStep === 4 ? 'Enhanced Options' :
                'Submit Your RFQ'
              }</CardTitle>
              <CardDescription>
                {
                  currentStep === 1 ? 'Learn how to prepare for voice submissions' :
                  currentStep === 2 ? 'Record your voice clearly for best results' :
                  currentStep === 3 ? 'Review the AI transcription and make any needed edits' :
                  currentStep === 4 ? 'Explore enhancement and language options' :
                  'Submit your RFQ and track its progress'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Preparation Tips</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Find a quiet environment with minimal background noise</li>
                      <li>Prepare notes with key details: product specifications, quantities, delivery timeline</li>
                      <li>Think about budget constraints and quality requirements</li>
                      <li>Keep your speech clear, natural, and at a moderate pace</li>
                      <li>Organize thoughts in a logical sequence for the AI to understand</li>
                    </ul>
                    <div className="flex items-center p-3 bg-amber-50 text-amber-800 rounded-lg dark:bg-amber-900/20 dark:text-amber-400">
                      <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <p className="text-sm">Including specific numerical values (quantities, dimensions, budget) helps the AI extract accurate information.</p>
                    </div>
                  </div>
                )}
                
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Recording Your Voice RFQ</h3>
                    <p>Click the microphone button and clearly speak your request. Include:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Begin with a clear title for your RFQ</li>
                      <li>Specify the product or service you need</li>
                      <li>Mention quantity, dimensions, and specifications</li>
                      <li>Include quality standards and compliance requirements</li>
                      <li>State your preferred delivery timeline</li>
                      <li>Mention budget constraints if applicable</li>
                    </ul>
                    <div className="border rounded-lg p-4 flex flex-col items-center justify-center space-y-3">
                      <Button className="h-16 w-16 rounded-full" onClick={togglePlayPause}>
                        {isPlaying ? <Pause className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                      </Button>
                      <p className="text-sm text-center text-muted-foreground">
                        {isPlaying ? 'Recording... Click to stop' : 'Click to start recording'}
                      </p>
                      {isPlaying && (
                        <div className="w-full">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>0:00</span>
                            <span>2:00 max</span>
                          </div>
                          <Progress value={45} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Review and Edit Transcription</h3>
                    <p>After recording, the AI transcribes your audio and extracts key information:</p>
                    
                    <div className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Generated Transcription</h4>
                        <Button variant="ghost" size="sm" className="h-8">
                          <Play className="h-4 w-4 mr-1" /> Play original
                        </Button>
                      </div>
                      <div className="bg-muted p-3 rounded text-sm">
                        "I need 500 units of 20mm carbon steel bolts with hexagonal heads. They should comply with ISO 898-1 standards for mechanical properties. We need delivery within 30 days, and our budget is approximately ₹50,000. Please provide a detailed quotation with technical specifications and quality certifications."
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Extracted Information</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center">
                            <span className="text-muted-foreground w-20">Product:</span>
                            <span>Carbon steel bolts</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-muted-foreground w-20">Quantity:</span>
                            <span>500 units</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-muted-foreground w-20">Size:</span>
                            <span>20mm, hexagonal heads</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-muted-foreground w-20">Standard:</span>
                            <span>ISO 898-1</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-muted-foreground w-20">Timeline:</span>
                            <span>30 days</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-muted-foreground w-20">Budget:</span>
                            <span>₹50,000</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm">Edit Details</Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-3 bg-blue-50 text-blue-800 rounded-lg dark:bg-blue-900/20 dark:text-blue-400">
                      <HelpCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <p className="text-sm">You can edit any incorrect details before submitting your RFQ.</p>
                    </div>
                  </div>
                )}
                
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Enhanced Options</h3>
                    <p>Customize your voice RFQ experience with these additional options:</p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <div className="flex items-center">
                            <Volume2 className="h-4 w-4 mr-2 text-primary" />
                            <CardTitle className="text-base">Audio Enhancement</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            Automatically enhance audio quality by reducing background noise and improving voice clarity
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-muted-foreground">Recommended for noisy environments</span>
                            <Button variant="outline" size="sm">Enable</Button>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 mr-2 text-primary" />
                            <CardTitle className="text-base">Language Selection</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            Pre-select your preferred language or let the system auto-detect
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-muted-foreground">Current: Auto-detect</span>
                            <Button variant="outline" size="sm">Change</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="flex items-center p-3 bg-blue-50 text-blue-800 rounded-lg dark:bg-blue-900/20 dark:text-blue-400">
                      <HelpCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <p className="text-sm">These options can be changed before each voice RFQ submission.</p>
                    </div>
                  </div>
                )}
                
                {currentStep === 5 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Submit Your Voice RFQ</h3>
                    <p>Once you're satisfied with the extracted information and any edits:</p>
                    
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Click the "Submit RFQ" button to finalize your request</li>
                      <li>Your RFQ will be processed and added to your list of active RFQs</li>
                      <li>Suppliers will be able to view and respond to your request</li>
                      <li>You can track the status of your RFQ in the RFQ dashboard</li>
                      <li>View detailed analytics on your voice submissions in the Voice Analytics dashboard</li>
                    </ol>
                    
                    <div className="border rounded-lg p-4 mt-2 flex justify-center">
                      <Button>Submit RFQ</Button>
                    </div>
                    
                    <div className="flex items-center p-3 bg-green-50 text-green-800 rounded-lg dark:bg-green-900/20 dark:text-green-400">
                      <FileCheck className="h-5 w-5 mr-2 flex-shrink-0" />
                      <p className="text-sm">Your voice RFQ will be processed instantly and made available to potential suppliers.</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                {currentStep < maxSubmissionSteps ? (
                  <Button onClick={handleNextStep}>Next</Button>
                ) : (
                  <Button onClick={resetSteps}>Restart Tutorial</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Language Support Tab */}
        <TabsContent value="languages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Multilingual Voice Support</CardTitle>
              <CardDescription>
                Submit RFQs in your preferred language with our advanced language processing capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Supported Languages</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-3 flex items-center space-x-2">
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400">Primary</Badge>
                    <span>English</span>
                  </div>
                  <div className="border rounded-lg p-3 flex items-center space-x-2">
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400">Primary</Badge>
                    <span>Hindi</span>
                  </div>
                  <div className="border rounded-lg p-3 flex items-center space-x-2">
                    <Badge variant="outline">Coming Soon</Badge>
                    <span>Bengali</span>
                  </div>
                  <div className="border rounded-lg p-3 flex items-center space-x-2">
                    <Badge variant="outline">Coming Soon</Badge>
                    <span>Tamil</span>
                  </div>
                  <div className="border rounded-lg p-3 flex items-center space-x-2">
                    <Badge variant="outline">Coming Soon</Badge>
                    <span>Telugu</span>
                  </div>
                  <div className="border rounded-lg p-3 flex items-center space-x-2">
                    <Badge variant="outline">Coming Soon</Badge>
                    <span>Gujarati</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">How Language Detection Works</h3>
                <div className="border rounded-lg p-4 space-y-3">
                  <p className="text-sm">Our system automatically detects the language you're speaking and processes the request accordingly:</p>
                  
                  <ol className="list-decimal list-inside text-sm space-y-2">
                    <li>You submit a voice recording in any supported language</li>
                    <li>Our AI identifies the language being spoken</li>
                    <li>The system transcribes the audio in the original language</li>
                    <li>If the language is not English, the system translates the content while preserving the original text</li>
                    <li>The system extracts the RFQ information and creates a structured request</li>
                    <li>Suppliers can view both the original and translated versions</li>
                  </ol>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Language Preferences</h3>
                <div className="border rounded-lg p-4">
                  <p className="text-sm mb-4">You can set your language preferences for more accurate results:</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Auto-Detection</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">
                          The system will automatically detect the language you're speaking
                        </p>
                        <div className="flex justify-end mt-2">
                          <Button variant="outline" size="sm">Set as Default</Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Specific Language</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">
                          Pre-select your language for improved accuracy and faster processing
                        </p>
                        <div className="flex justify-end mt-2">
                          <Button variant="outline" size="sm">Select Language</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Voice Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Voice Analytics Dashboard</CardTitle>
              <CardDescription>
                Understand and optimize your voice RFQ performance with comprehensive analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Available Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Language Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        Visualize the distribution of languages used in your voice RFQ submissions
                      </p>
                      <div className="h-24 w-full bg-muted rounded-md flex items-center justify-center">
                        <span className="text-sm text-muted-foreground">Language distribution chart</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Submission Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        Track how your voice RFQ usage has evolved over time
                      </p>
                      <div className="h-24 w-full bg-muted rounded-md flex items-center justify-center">
                        <span className="text-sm text-muted-foreground">Submission trend chart</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Quality Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        Monitor transcription confidence scores and enhancement rates
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Transcription Confidence</span>
                          <span>87%</span>
                        </div>
                        <Progress value={87} className="h-2" />
                        
                        <div className="flex justify-between text-xs mt-2">
                          <span>Enhancement Rate</span>
                          <span>35%</span>
                        </div>
                        <Progress value={35} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Translation Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        See how often your submissions require translation services
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Submissions Requiring Translation</span>
                          <span>27%</span>
                        </div>
                        <Progress value={27} className="h-2" />
                        
                        <div className="flex justify-between text-xs mt-2">
                          <span>Translation Success Rate</span>
                          <span>94%</span>
                        </div>
                        <Progress value={94} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">How to Use Voice Analytics</h3>
                <div className="border rounded-lg p-4 space-y-3">
                  <p className="text-sm mb-2">Use your voice analytics to optimize your RFQ process:</p>
                  
                  <ul className="list-disc list-inside text-sm space-y-2">
                    <li>Track which languages are most frequently used by your team</li>
                    <li>Identify trends in voice RFQ submissions over time</li>
                    <li>Monitor transcription quality and identify areas for improvement</li>
                    <li>Understand how audio enhancement is impacting your transcription accuracy</li>
                    <li>Make data-driven decisions about voice RFQ usage in your organization</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex justify-center">
                <Button onClick={() => window.location.href = '/voice-analytics'}>
                  Visit Voice Analytics Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <DialogFooter className="pt-4">
        <Button variant="outline" onClick={onOpenChange ? () => onOpenChange(false) : undefined}>
          Close Tutorial
        </Button>
      </DialogFooter>
    </DialogWrapper>
  );
}