import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VoiceAssistant } from '@/components/voice/VoiceAssistant';
import { EnhancedVoiceAssistant } from '@/components/voice/EnhancedVoiceAssistant';
import { Badge } from '@/components/ui/badge';
import { InfoIcon, CheckCircleIcon, MicIcon, KeyboardIcon, WrenchIcon, Sparkles } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function VoiceAssistantPage() {
  const [useEnhanced, setUseEnhanced] = useState(true);
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Voice Procurement Assistant</h1>
          <p className="text-gray-500 mt-1">
            Use voice commands to navigate and manage your procurement workflow
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="use-enhanced"
              checked={useEnhanced}
              onCheckedChange={setUseEnhanced}
            />
            <Label htmlFor="use-enhanced" className="cursor-pointer">
              {useEnhanced ? (
                <span className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-1 text-indigo-500" />
                  AI Enhanced
                </span>
              ) : (
                <span>Standard</span>
              )}
            </Label>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            <InfoIcon className="h-4 w-4 mr-1" /> Beta Feature
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>
                {useEnhanced ? "AI-Powered Voice Assistant" : "Voice Assistant"}
              </CardTitle>
              <CardDescription>
                {useEnhanced ? 
                  "Interact with advanced AI-powered voice recognition optimized for Indian accents" : 
                  "Interact with the procurement system using natural voice commands"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {useEnhanced ? <EnhancedVoiceAssistant /> : <VoiceAssistant />}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MicIcon className="h-5 w-5 mr-2 text-blue-500" />
                How to Use
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 list-decimal pl-5">
                <li>Click the <strong>{useEnhanced ? "Start Recording" : "Start Listening"}</strong> button to activate voice recognition</li>
                <li>Speak a command clearly (examples: "create RFQ", "show analytics", "find suppliers")</li>
                <li>The assistant will process your command and execute the corresponding action</li>
                <li>For a list of available commands, say "What can I say?" or "Show commands"</li>
                {useEnhanced && (
                  <li className="text-indigo-700">
                    The enhanced assistant uses OpenAI's Whisper for improved recognition of 
                    regional accents and dialects, especially beneficial for Tier-2 Indian cities
                  </li>
                )}
              </ol>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <KeyboardIcon className="h-5 w-5 mr-2 text-green-500" />
                Example Commands
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="rfq">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="rfq">RFQ</TabsTrigger>
                  <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
                  <TabsTrigger value="general">General</TabsTrigger>
                </TabsList>
                <TabsContent value="rfq" className="pt-4">
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <div>
                        <div className="font-medium">"Create a new RFQ"</div>
                        <div className="text-sm text-gray-500">Navigate to RFQ creation page</div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <div>
                        <div className="font-medium">"Show my RFQs"</div>
                        <div className="text-sm text-gray-500">View list of your RFQs</div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <div>
                        <div className="font-medium">"Open RFQ 12345"</div>
                        <div className="text-sm text-gray-500">View details of specific RFQ</div>
                      </div>
                    </li>
                  </ul>
                </TabsContent>
                <TabsContent value="suppliers" className="pt-4">
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <div>
                        <div className="font-medium">"Find matching suppliers"</div>
                        <div className="text-sm text-gray-500">Search for suppliers matching criteria</div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <div>
                        <div className="font-medium">"Show supplier details"</div>
                        <div className="text-sm text-gray-500">View supplier profile information</div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <div>
                        <div className="font-medium">"Compare suppliers for RFQ 123"</div>
                        <div className="text-sm text-gray-500">View side-by-side comparison</div>
                      </div>
                    </li>
                  </ul>
                </TabsContent>
                <TabsContent value="general" className="pt-4">
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <div>
                        <div className="font-medium">"Go to dashboard"</div>
                        <div className="text-sm text-gray-500">Navigate to main dashboard</div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <div>
                        <div className="font-medium">"Show analytics"</div>
                        <div className="text-sm text-gray-500">View analytics dashboard</div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <div>
                        <div className="font-medium">"What can I say?"</div>
                        <div className="text-sm text-gray-500">Show list of available commands</div>
                      </div>
                    </li>
                  </ul>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <WrenchIcon className="h-5 w-5 mr-2 text-amber-500" />
                Tips & Troubleshooting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <InfoIcon className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                  <div className="text-sm">
                    Speak clearly and at a normal pace for best recognition
                  </div>
                </li>
                <li className="flex items-start">
                  <InfoIcon className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                  <div className="text-sm">
                    Use Chrome or Edge browsers for optimal voice recognition
                  </div>
                </li>
                <li className="flex items-start">
                  <InfoIcon className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                  <div className="text-sm">
                    Allow microphone access when prompted by your browser
                  </div>
                </li>
                <li className="flex items-start">
                  <InfoIcon className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                  <div className="text-sm">
                    {useEnhanced ? 
                      "The enhanced assistant works best with short, clear commands" : 
                      "If recognition stops, click \"Stop Listening\" and start again"
                    }
                  </div>
                </li>
                {useEnhanced && (
                  <li className="flex items-start">
                    <InfoIcon className="h-4 w-4 mr-2 mt-0.5 text-indigo-500" />
                    <div className="text-sm text-indigo-700">
                      Enhanced mode uses AI to better understand regional accents and dialects,
                      providing more accurate recognition for users in Tier-2 Indian cities
                    </div>
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}