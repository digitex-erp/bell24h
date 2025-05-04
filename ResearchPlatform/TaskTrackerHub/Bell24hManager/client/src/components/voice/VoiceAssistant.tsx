import React, { useState, useEffect, useRef } from 'react';
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
  Wifi,
  WifiOff
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { VoiceVisualizer } from './VoiceVisualizer';
import { 
  createProcurementCommands, 
  findMatchingCommand, 
  type VoiceCommand 
} from './ProcurementVoiceCommands';
import { useWebSocket, type WebSocketMessage } from '@/hooks/use-websocket';

interface VoiceAssistantProps {
  disabled?: boolean;
  compact?: boolean;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ 
  disabled = false,
  compact = false
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [showCommands, setShowCommands] = useState(false);
  const [recentCommand, setRecentCommand] = useState<string | null>(null);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [processingCommand, setProcessingCommand] = useState(false);
  const [volume, setVolume] = useState(30); // For visualizer
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [serverResponse, setServerResponse] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  
  // Set up WebSocket handlers and connection
  const handleWelcomeMessage = (message: WebSocketMessage) => {
    console.log('Connected to Bell24h WebSocket server:', message.data.sessionId);
  };
  
  const handleVoiceCommandResponse = (message: WebSocketMessage) => {
    console.log('Received voice command response:', message.data);
    setServerResponse(message.data.response);
    speakResponse(message.data.response);
  };
  
  // Set up websocket handlers
  const handlers = {
    welcome: handleWelcomeMessage,
    voice_command_received: (message: WebSocketMessage) => {
      console.log('Command acknowledged by server:', message.data.command);
    },
    voice_command_response: handleVoiceCommandResponse,
    pong: () => {}, // Ignore pong responses
  };
  
  // Initialize WebSocket connection
  const { 
    isConnected, 
    sendVoiceCommand, 
    status 
  } = useWebSocket(handlers);

  // Custom navigation function 
  const navigate = (path: string) => {
    window.location.href = path;
  };

  // Get procurement-specific voice commands
  const voiceCommands = createProcurementCommands(navigate);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Use window.SpeechRecognition or window.webkitSpeechRecognition based on browser support
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex;
          const result = event.results[current];
          const transcriptText = result[0].transcript;
          
          setTranscript(transcriptText);
          setConfidence(result[0].confidence * 100);
          
          if (result.isFinal) {
            handleVoiceCommand(transcriptText);
          }
        };
        
        recognitionRef.current.onend = () => {
          if (isListening) {
            // Restart if we're still in listening mode but recognition stopped
            recognitionRef.current.start();
          }
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          toast({
            title: 'Voice Recognition Error',
            description: `Error: ${event.error}. Please try again.`,
            variant: 'destructive'
          });
        };
      } else {
        setVoiceSupported(false);
        toast({
          title: 'Voice Recognition Not Supported',
          description: 'Your browser does not support speech recognition. Try using Chrome or Edge.',
          variant: 'destructive'
        });
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);

  // Toggle listening on/off
  const toggleListening = () => {
    if (!voiceSupported || disabled) return;
    
    if (!isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast({
          title: 'Listening',
          description: 'Voice assistant is active. Try saying "What can I say?" for help.',
        });
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        toast({
          title: 'Error',
          description: 'Failed to start voice recognition. Please try again.',
          variant: 'destructive'
        });
      }
    } else {
      recognitionRef.current.stop();
      setIsListening(false);
      setTranscript('');
      setConfidence(0);
    }
  };

  // Process the voice command
  const handleVoiceCommand = (text: string) => {
    const lowerText = text.toLowerCase().trim();
    
    // Find matching command
    for (const command of voiceCommands) {
      const match = command.keywords.some(keyword => 
        lowerText.includes(keyword.toLowerCase())
      );
      
      if (match) {
        setRecentCommand(lowerText);
        setProcessingCommand(true);
        
        // For commands that can be processed locally
        // Execute the command with a slight delay to show processing state
        setTimeout(() => {
          command.action();
          setProcessingCommand(false);
          
          // Also send the command to the server via WebSocket for logging/analytics
          if (isConnected) {
            sendVoiceCommand(lowerText, confidence / 100);
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
    if (isConnected) {
      sendVoiceCommand(lowerText, confidence / 100);
      setRecentCommand(lowerText);
      setProcessingCommand(true);
      
      // We'll wait for the server response
      toast({
        title: 'Processing Command',
        description: `Sending "${lowerText}" to server for processing...`,
      });
    } else {
      // No local match and WebSocket is not connected
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

  // Speech visualization
  const getConfidenceColor = () => {
    if (confidence > 80) return 'bg-green-500';
    if (confidence > 60) return 'bg-green-400';
    if (confidence > 40) return 'bg-yellow-400';
    if (confidence > 20) return 'bg-orange-400';
    return 'bg-red-500';
  };

  // Filter commands by category
  const filteredCommands = filterCategory 
    ? voiceCommands.filter(cmd => cmd.category === filterCategory)
    : voiceCommands;

  // Simulate microphone volume levels for visualizer
  useEffect(() => {
    if (isListening) {
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
  }, [isListening, transcript]);

  // Compact version for floating button only
  if (compact) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          variant={isListening ? "destructive" : "default"}
          className="rounded-full h-14 w-14 shadow-lg flex items-center justify-center p-0"
          onClick={toggleListening}
          disabled={!voiceSupported || disabled}
        >
          {isListening ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className={`h-6 w-6 ${isListening ? 'animate-pulse' : ''}`} />
          )}
        </Button>
        {isListening && (
          <div className="absolute -top-16 right-0 bg-white shadow-md rounded-md p-2 min-w-[200px]">
            <p className="text-xs text-gray-500">{transcript || "Listening..."}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="voice-assistant">
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isListening ? (
                <Mic className="h-5 w-5 text-blue-500 animate-pulse" />
              ) : (
                <MicOff className="h-5 w-5 text-gray-500" />
              )}
              Voice Procurement Assistant
            </div>
            <div className="flex gap-1">
              {voiceSupported ? (
                <Badge variant={isListening ? "default" : "outline"}>
                  {isListening ? "Listening" : "Inactive"}
                </Badge>
              ) : (
                <Badge variant="destructive">Not Supported</Badge>
              )}
              
              {/* WebSocket connection status */}
              {isConnected ? (
                <Badge variant="outline" className="flex items-center gap-1 bg-green-50">
                  <Wifi className="h-3 w-3 text-green-500" />
                  <span className="text-xs">Connected</span>
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1 bg-red-50">
                  <WifiOff className="h-3 w-3 text-red-500" />
                  <span className="text-xs">Offline</span>
                </Badge>
              )}
            </div>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isListening && (
            <>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Recognition Confidence</span>
                  <span className="text-sm">{Math.round(confidence)}%</span>
                </div>
                <Progress value={confidence} className={`h-2 ${getConfidenceColor()}`} />
              </div>
              <VoiceVisualizer isListening={isListening} volume={volume} />
            </>
          )}
          
          <div className="min-h-[80px] p-3 bg-gray-50 rounded-md mb-4 text-sm">
            {isListening && transcript ? (
              <>
                <p className="font-medium mb-1">Heard:</p>
                <p>{transcript}</p>
              </>
            ) : isListening ? (
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
            variant={isListening ? "destructive" : "default"}
            onClick={toggleListening}
            disabled={!voiceSupported || disabled}
            className="w-full"
          >
            {isListening ? (
              <>
                <StopCircle className="mr-2 h-4 w-4" /> Stop Listening
              </>
            ) : (
              <>
                <PlayCircle className="mr-2 h-4 w-4" /> Start Listening
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="ml-2 px-3"
            onClick={() => setShowCommands(!showCommands)}
            title="Show commands"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="ml-2 px-3"
            onClick={() => {
              // Test WebSocket if connected
              if (isConnected) {
                sendVoiceCommand("hello server", 1.0);
                toast({
                  title: "Testing WebSocket",
                  description: "Sent test message to server",
                });
              } else {
                toast({
                  title: "WebSocket Disconnected",
                  description: "Cannot send test message - WebSocket is not connected",
                  variant: "destructive"
                });
              }
            }}
            title="Test WebSocket"
          >
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
          </Button>
          <Button
            variant="outline"
            className="ml-2 px-3"
            onClick={() => speakResponse("Voice assistance is active. How can I help you with procurement today?")}
            title="Test speech"
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

// Declare the SpeechRecognition types for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    speechSynthesis: any;
  }
}