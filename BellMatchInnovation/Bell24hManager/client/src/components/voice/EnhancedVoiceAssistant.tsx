import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  AlertCircle, 
  CheckCircle, 
  PlayCircle, 
  StopCircle,
  HelpCircle,
  Settings,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { VoiceVisualizer } from './VoiceVisualizer';
import { VoiceWebSocketConnection } from './VoiceWebSocketConnection';
import { useWhisper } from '@/hooks/use-whisper';
import { useWebSocket } from '@/hooks/use-websocket';
import { 
  createProcurementCommands, 
  findMatchingCommand, 
  type VoiceCommand,
  enhanceVoiceCommand
} from './ProcurementVoiceCommands';
import { apiRequest } from '@/lib/queryClient';

interface EnhancedVoiceAssistantProps {
  disabled?: boolean;
  compact?: boolean;
}

/**
 * Enhanced Voice Assistant component with OpenAI Whisper integration
 * Provides improved speech recognition especially for Tier-2 Indian users
 */
export const EnhancedVoiceAssistant: React.FC<EnhancedVoiceAssistantProps> = ({ 
  disabled = false,
  compact = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recentCommand, setRecentCommand] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [processingCommand, setProcessingCommand] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [serverResponse, setServerResponse] = useState<string | null>(null);
  const [volume, setVolume] = useState(30); // For visualizer
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [enhancedCommand, setEnhancedCommand] = useState<{
    command: string;
    intent: string;
    confidence: number;
  } | null>(null);
  
  const { toast } = useToast();
  const { 
    isRecording: isTranscribing,
    isProcessing,
    volume: micVolume,
    error: recordingError,
    startRecording, 
    stopRecording 
  } = useWhisper({
    language: 'en',
    onTranscription: (text) => {
      console.log('Transcription received:', text);
      // Update transcript state
      setTranscript(text);
      setRecentCommand(text);
      setProcessingCommand(true);
      
      // Try to enhance the command using the voice API
      enhanceCommand(text).catch(err => {
        console.error('Failed to enhance command:', err);
      });
      
      // Process command
      handleVoiceCommand(text);
    },
    onError: (error) => {
      toast({
        title: 'Transcription Error',
        description: error,
        variant: 'destructive'
      });
    },
    recordingTimeLimit: 15000 // 15 seconds max recording time
  });
  
  // WebSocket setup for sending voice commands to server
  const handleWebSocketResponse = (message: any) => {
    setServerResponse(message.data.response);
    setProcessingCommand(false);
    speakResponse(message.data.response);
  };
  
  const webSocketHandlers = {
    voice_command_response: handleWebSocketResponse
  };
  
  const { 
    isConnected: isWebSocketConnected, 
    sendVoiceCommand 
  } = useWebSocket(webSocketHandlers);
  
  // Navigate function
  const navigate = (path: string) => {
    window.location.href = path;
  };
  
  // Get procurement-specific voice commands
  const voiceCommands = createProcurementCommands(navigate);
  
  // Enhance voice command using API
  const enhanceCommand = async (text: string) => {
    try {
      // First try to enhance through the ProcurementVoiceCommands utility
      const enhancedResult = await enhanceVoiceCommand(text);
      
      if (enhancedResult.confidence > 0.6) {
        // Use the enhanced results
        setEnhancedCommand({
          command: enhancedResult.enhancedText,
          intent: enhancedResult.category,
          confidence: enhancedResult.confidence
        });
        return enhancedResult;
      }
      
      // If confidence is low or enhancement fails, try server-side enhancement
      const response = await apiRequest<{
        command: string;
        intent: string;
        confidence: number;
      }>('/api/voice/enhance', {
        method: 'POST',
        body: JSON.stringify({ text }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setEnhancedCommand(response);
      return response;
    } catch (error) {
      console.error('Enhancement failed:', error);
      return null;
    }
  };
  
  // Toggle recording
  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      startRecording();
      toast({
        title: 'Recording Started',
        description: 'Speak your command clearly and I will process it with advanced AI recognition.',
      });
    } else {
      setIsRecording(false);
      stopRecording();
    }
  };
  
  // We're not using this effect anymore since we directly handle transcription
  // in the onTranscription handler from useWhisper hook
  /*
  useEffect(() => {
    if (transcript) {
      const commandText = enhancedCommand?.command || transcript;
      setRecentCommand(commandText);
      setProcessingCommand(true);
      
      // Process command
      handleVoiceCommand(commandText);
    }
  }, [transcript, enhancedCommand]);
  */
  
  // Handle voice command
  const handleVoiceCommand = (text: string) => {
    const lowerText = text.toLowerCase().trim();
    
    // Find matching command
    for (const command of voiceCommands) {
      const match = command.keywords.some(keyword => 
        lowerText.includes(keyword.toLowerCase())
      );
      
      if (match) {
        // Execute the command with a slight delay to show processing state
        setTimeout(() => {
          command.action();
          setProcessingCommand(false);
          
          // Also send the command to the server via WebSocket for logging/analytics
          if (isWebSocketConnected) {
            const confidence = enhancedCommand?.confidence || 0.7;
            sendVoiceCommand(lowerText, confidence);
          }
          
          toast({
            title: 'Command Executed',
            description: `Executing: "${lowerText}"`,
          });
        }, 800);
        
        return;
      }
    }
    
    // No matching command found locally, try server-side processing via WebSocket
    if (isWebSocketConnected) {
      const confidence = enhancedCommand?.confidence || 0.7;
      sendVoiceCommand(lowerText, confidence);
      
      // We'll wait for the server response
      toast({
        title: 'Processing Command',
        description: `Sending "${lowerText}" to server for processing...`,
      });
    } else {
      // No local match and WebSocket is not connected
      setProcessingCommand(false);
      toast({
        title: 'Unknown Command',
        description: `Sorry, I didn't understand "${lowerText}". Try saying "help" for a list of commands.`,
        variant: 'destructive'
      });
    }
  };
  
  // Speak a response using text-to-speech
  const speakResponse = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };
  
  // Filter commands by category
  const filteredCommands = filterCategory 
    ? voiceCommands.filter(cmd => cmd.category === filterCategory)
    : voiceCommands;
  
  // Simulate microphone volume levels for visualizer
  useEffect(() => {
    if (isRecording) {
      // Simulate microphone activity with random volume changes
      const volumeInterval = setInterval(() => {
        if (transcript) {
          // Higher volume when actively speaking
          setVolume(70 + Math.random() * 30);
        } else {
          // Lower volume when just listening
          setVolume(20 + Math.random() * 40);
        }
      }, 100);
      
      return () => clearInterval(volumeInterval);
    } else {
      setVolume(30);
    }
  }, [isRecording, transcript]);
  
  // Compact version for floating button only
  if (compact) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          variant={isRecording ? "destructive" : "default"}
          className="rounded-full h-14 w-14 shadow-lg flex items-center justify-center p-0"
          onClick={toggleRecording}
          disabled={disabled}
        >
          {isRecording ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className={`h-6 w-6 ${isRecording ? 'animate-pulse' : ''}`} />
          )}
        </Button>
        {(isRecording || isTranscribing) && (
          <div className="absolute -top-16 right-0 bg-white shadow-md rounded-md p-2 min-w-[200px]">
            <p className="text-xs text-gray-500">
              {isTranscribing ? "Processing..." : transcript || "Listening..."}
            </p>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="enhanced-voice-assistant">
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isRecording ? (
                <Mic className="h-5 w-5 text-blue-500 animate-pulse" />
              ) : (
                <MicOff className="h-5 w-5 text-gray-500" />
              )}
              Enhanced Voice Assistant
            </div>
            <div className="flex gap-1">
              <Badge variant={isRecording ? "default" : "outline"}>
                {isRecording ? "Recording" : "Inactive"}
              </Badge>
              
              {/* Whisper API status */}
              {isTranscribing && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-600">
                  Processing
                </Badge>
              )}
              
              {/* Show AI badge for enhanced commands */}
              {enhancedCommand && (
                <Badge variant="outline" className="bg-indigo-50 text-indigo-600">
                  AI Enhanced
                </Badge>
              )}
              
              {/* WebSocket connection status */}
              <VoiceWebSocketConnection onCommandResponse={setServerResponse} />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isRecording && (
            <VoiceVisualizer isListening={isRecording} volume={volume} />
          )}
          
          <div className="min-h-[80px] p-3 bg-gray-50 rounded-md mb-4 text-sm">
            {isRecording && transcript ? (
              <>
                <p className="font-medium mb-1">Heard:</p>
                <p>{transcript}</p>
                {enhancedCommand && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="font-medium text-xs text-gray-600 mb-1">AI Enhanced:</p>
                    <p className="text-sm">{enhancedCommand.command}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs bg-blue-50">
                        Intent: {enhancedCommand.intent}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-green-50">
                        Confidence: {Math.round(enhancedCommand.confidence * 100)}%
                      </Badge>
                    </div>
                  </div>
                )}
              </>
            ) : isRecording ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Listening... Speak now</p>
              </div>
            ) : recentCommand ? (
              <>
                <p className="font-medium mb-1">Last command:</p>
                <p className="flex items-center gap-1">
                  "{recentCommand}" 
                  {processingCommand ? (
                    <AlertCircle className="h-4 w-4 text-yellow-500 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </p>
                {/* Display server response when available */}
                {serverResponse && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="font-medium text-xs text-gray-600 mb-1">Server Response:</p>
                    <p className="text-sm">{serverResponse}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Click the mic button and speak a command</p>
              </div>
            )}
          </div>
          
          {showCommands && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md text-sm">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Available Commands:</h3>
                <div className="flex gap-2">
                  <div className="flex gap-1">
                    <Button 
                      variant={filterCategory === null ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setFilterCategory(null)}
                      className="text-xs py-1 px-2 h-auto"
                    >
                      All
                    </Button>
                    <Button 
                      variant={filterCategory === 'rfq' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setFilterCategory('rfq')}
                      className="text-xs py-1 px-2 h-auto"
                    >
                      RFQ
                    </Button>
                    <Button 
                      variant={filterCategory === 'supplier' ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setFilterCategory('supplier')}
                      className="text-xs py-1 px-2 h-auto"
                    >
                      Suppliers
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowCommands(false)}
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <ul className="space-y-2 max-h-[200px] overflow-y-auto">
                {filteredCommands.map((cmd, index) => (
                  <li key={index} className="pb-2 border-b border-blue-100 last:border-none">
                    <div className="font-medium flex justify-between">
                      {cmd.description}
                      <Badge variant="outline" className="text-xs">
                        {cmd.category}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Try saying: "{cmd.examples[0]}"
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant={isRecording ? "destructive" : "default"}
            onClick={toggleRecording}
            disabled={disabled}
            className="w-1/2 mr-2"
          >
            {isRecording ? (
              <>
                <StopCircle className="mr-2 h-4 w-4" /> Stop Recording
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" /> Start Recording
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowCommands(!showCommands)}
            className="w-1/2"
          >
            <HelpCircle className="mr-2 h-4 w-4" /> {showCommands ? 'Hide Commands' : 'Show Commands'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};