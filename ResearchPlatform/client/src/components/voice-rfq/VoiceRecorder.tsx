import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Brain,
  Building,
  Calendar,
  CheckCircle,
  Headphones,
  Languages,
  Loader2,
  Mic,
  PieChart,
  Square,
  Star,
  StopCircle,
  Tag,
  User,
  Volume2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  startRecording,
  stopRecording,
  transcribeVoiceAudio,
  createRfqFromVoice,
  processVoiceCommand,
  getSupportedLanguages,
  extractBusinessEntities,
  analyzeSentiment,
  type Language,
  type RfqResult,
  type CommandResult,
  type EntityExtractionResult,
  type SentimentAnalysisResult,
} from "@/lib/openai";

type RecordingMode = "rfq" | "command" | "entities" | "sentiment";

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [supportedLanguages, setSupportedLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [result, setResult] = useState<RfqResult | CommandResult | EntityExtractionResult | SentimentAnalysisResult | null>(null);
  const [recordingMode, setRecordingMode] = useState<RecordingMode>("rfq");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Fetch supported languages on component mount
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const result = await getSupportedLanguages();
        setSupportedLanguages(result.languages);
        setSelectedLanguage(result.defaultLanguage);
      } catch (error) {
        console.error("Error fetching supported languages:", error);
        toast({
          title: "Error",
          description: "Failed to fetch supported languages.",
          variant: "destructive",
        });
      }
    };

    fetchLanguages();
  }, [toast]);

  // Clean up timer and audio URL on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleStartRecording = async () => {
    try {
      // Reset previous results
      setResult(null);
      setRecordingTime(0);
      
      // Start recording
      const mediaRecorder = await startRecording();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      
      // Create an audio preview URL for playback
      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          const audioBlob = new Blob([event.data], { type: "audio/mp3" });
          if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
          }
          setAudioUrl(URL.createObjectURL(audioBlob));
        }
      });
      
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone.",
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Recording failed",
        description: "Please make sure your microphone is connected and you've granted permission.",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = async () => {
    try {
      if (!mediaRecorderRef.current) {
        throw new Error("No active recording found");
      }
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      setIsRecording(false);
      setIsProcessing(true);
      
      // Stop recording and get audio data
      const audioBase64 = await stopRecording(mediaRecorderRef.current);
      
      // Process the audio based on mode
      let description = "";
      
      switch (recordingMode) {
        case "rfq":
          const rfqResult = await createRfqFromVoice(audioBase64, undefined, selectedLanguage);
          setResult(rfqResult);
          description = "RFQ has been extracted from your audio";
          break;
        
        case "command":
          const commandResult = await processVoiceCommand(audioBase64, selectedLanguage);
          setResult(commandResult);
          description = "Voice command has been processed";
          break;
          
        case "entities":
          const entityResult = await extractBusinessEntities(audioBase64, selectedLanguage);
          setResult(entityResult);
          description = "Business entities have been extracted from your audio";
          break;
          
        case "sentiment":
          const sentimentResult = await analyzeSentiment(audioBase64, selectedLanguage);
          setResult(sentimentResult);
          description = "Sentiment analysis has been completed on your audio";
          break;
      }
      
      setIsProcessing(false);
      
      toast({
        title: "Processing complete",
        description
      });
    } catch (error) {
      console.error("Error processing audio:", error);
      setIsProcessing(false);
      toast({
        title: "Processing failed",
        description: "Failed to process your recording. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play();
    }
  };

  const renderRfqResult = (rfqResult: RfqResult) => (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium mb-1">Transcription</h3>
        <p className="text-sm p-3 bg-muted rounded-md">{rfqResult.transcription}</p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-1">
          Extracted RFQ 
          <span className="ml-2 text-xs text-muted-foreground">
            (Confidence: {Math.round(rfqResult.confidence * 100)}%)
          </span>
        </h3>
        <div className="space-y-2 p-3 bg-muted rounded-md">
          <div>
            <span className="text-xs font-medium">Product/Service:</span>
            <p className="text-sm">{rfqResult.extractedRfq.productName || "Not specified"}</p>
          </div>
          <div>
            <span className="text-xs font-medium">Quantity:</span>
            <p className="text-sm">{rfqResult.extractedRfq.quantity || "Not specified"}</p>
          </div>
          <div>
            <span className="text-xs font-medium">Specifications:</span>
            <p className="text-sm">{rfqResult.extractedRfq.specifications || "Not specified"}</p>
          </div>
          <div>
            <span className="text-xs font-medium">Delivery Date:</span>
            <p className="text-sm">{rfqResult.extractedRfq.deliveryDate || "Not specified"}</p>
          </div>
          <div>
            <span className="text-xs font-medium">Budget:</span>
            <p className="text-sm">{rfqResult.extractedRfq.budget ? `₹${rfqResult.extractedRfq.budget}` : "Not specified"}</p>
          </div>
          <div>
            <span className="text-xs font-medium">Location:</span>
            <p className="text-sm">{rfqResult.extractedRfq.location || "Not specified"}</p>
          </div>
          <div>
            <span className="text-xs font-medium">Urgency:</span>
            <p className="text-sm">{rfqResult.extractedRfq.urgency ? 
              rfqResult.extractedRfq.urgency.charAt(0).toUpperCase() + rfqResult.extractedRfq.urgency.slice(1) 
              : "Not specified"}</p>
          </div>
          {rfqResult.extractedRfq.preferredSuppliers && rfqResult.extractedRfq.preferredSuppliers.length > 0 && (
            <div>
              <span className="text-xs font-medium">Preferred Suppliers:</span>
              <p className="text-sm">{rfqResult.extractedRfq.preferredSuppliers.join(", ")}</p>
            </div>
          )}
          <div>
            <span className="text-xs font-medium">Additional Requirements:</span>
            <p className="text-sm">{rfqResult.extractedRfq.additionalRequirements || "None"}</p>
          </div>
          {rfqResult.extractedRfq.contactInfo && (
            <div>
              <span className="text-xs font-medium">Contact Info:</span>
              <p className="text-sm">
                {rfqResult.extractedRfq.contactInfo.name ? `${rfqResult.extractedRfq.contactInfo.name}, ` : ""}
                {rfqResult.extractedRfq.contactInfo.email ? `${rfqResult.extractedRfq.contactInfo.email}, ` : ""}
                {rfqResult.extractedRfq.contactInfo.phone || ""}
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button size="sm" className="mr-2">Edit RFQ</Button>
        <Button size="sm">Submit RFQ</Button>
      </div>
    </div>
  );

  const renderCommandResult = (commandResult: CommandResult) => (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium mb-1">Detected Command</h3>
        <p className="text-sm p-3 bg-muted rounded-md">{commandResult.command}</p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-1">
          Action
          <span className="ml-2 text-xs text-muted-foreground">
            (Confidence: {Math.round(commandResult.confidence * 100)}%)
          </span>
        </h3>
        <div className="flex items-center">
          {commandResult.success ? (
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          )}
          <span>
            {commandResult.success 
              ? `${commandResult.action} command recognized` 
              : "Unrecognized command"}
          </span>
        </div>
      </div>
      
      {commandResult.success && (
        <div>
          <h3 className="text-sm font-medium mb-1">Parameters</h3>
          <div className="p-3 bg-muted rounded-md">
            <pre className="text-xs overflow-auto">
              {JSON.stringify(commandResult.parameters, null, 2)}
            </pre>
          </div>
        </div>
      )}
      
      <div className="flex justify-end">
        <Button 
          size="sm" 
          variant={commandResult.success ? "default" : "outline"}
          disabled={!commandResult.success}
        >
          Execute Command
        </Button>
      </div>
    </div>
  );
  
  const renderEntityResult = (entityResult: EntityExtractionResult) => (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium mb-1">Transcription</h3>
        <p className="text-sm p-3 bg-muted rounded-md">{entityResult.transcription}</p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-1">Extracted Business Entities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {entityResult.entities.organizations.length > 0 && (
            <div className="p-3 bg-muted rounded-md">
              <div className="flex items-center mb-2">
                <Building className="h-4 w-4 mr-2 text-blue-500" />
                <span className="text-xs font-medium">Organizations</span>
              </div>
              <ul className="text-sm space-y-1">
                {entityResult.entities.organizations.map((org, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-xs text-muted-foreground mr-2">{index + 1}.</span>
                    {org}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {entityResult.entities.products.length > 0 && (
            <div className="p-3 bg-muted rounded-md">
              <div className="flex items-center mb-2">
                <Tag className="h-4 w-4 mr-2 text-green-500" />
                <span className="text-xs font-medium">Products</span>
              </div>
              <ul className="text-sm space-y-1">
                {entityResult.entities.products.map((product, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-xs text-muted-foreground mr-2">{index + 1}.</span>
                    {product}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {entityResult.entities.locations.length > 0 && (
            <div className="p-3 bg-muted rounded-md">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span className="text-xs font-medium">Locations</span>
              </div>
              <ul className="text-sm space-y-1">
                {entityResult.entities.locations.map((location, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-xs text-muted-foreground mr-2">{index + 1}.</span>
                    {location}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {entityResult.entities.people.length > 0 && (
            <div className="p-3 bg-muted rounded-md">
              <div className="flex items-center mb-2">
                <User className="h-4 w-4 mr-2 text-violet-500" />
                <span className="text-xs font-medium">People</span>
              </div>
              <ul className="text-sm space-y-1">
                {entityResult.entities.people.map((person, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-xs text-muted-foreground mr-2">{index + 1}.</span>
                    {person}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {entityResult.entities.dates.length > 0 && (
            <div className="p-3 bg-muted rounded-md">
              <div className="flex items-center mb-2">
                <Calendar className="h-4 w-4 mr-2 text-amber-500" />
                <span className="text-xs font-medium">Dates</span>
              </div>
              <ul className="text-sm space-y-1">
                {entityResult.entities.dates.map((date, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-xs text-muted-foreground mr-2">{index + 1}.</span>
                    {date}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {entityResult.entities.amounts.length > 0 && (
            <div className="p-3 bg-muted rounded-md">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                <span className="text-xs font-medium">Amounts</span>
              </div>
              <ul className="text-sm space-y-1">
                {entityResult.entities.amounts.map((amount, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-xs text-muted-foreground mr-2">{index + 1}.</span>
                    {amount}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="mr-2">
          Export Data
        </Button>
        <Button size="sm">
          Create RFQ
        </Button>
      </div>
    </div>
  );
  
  const renderSentimentResult = (sentimentResult: SentimentAnalysisResult) => (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium mb-1">Transcription</h3>
        <p className="text-sm p-3 bg-muted rounded-md">{sentimentResult.transcription}</p>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-1">Sentiment Analysis</h3>
        <div className="p-4 bg-muted rounded-md">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-primary" />
              <span className="font-medium">Overall Rating</span>
            </div>
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < sentimentResult.sentiment.rating
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-2 text-sm font-medium">
                ({sentimentResult.sentiment.rating}/5)
              </span>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Confidence</span>
              <span>{Math.round(sentimentResult.sentiment.confidence * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${Math.round(sentimentResult.sentiment.confidence * 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Summary</h4>
            <p className="text-sm bg-primary/10 p-3 rounded-md">
              {sentimentResult.sentiment.summary}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="mr-2">
          Save Analysis
        </Button>
        <Button size="sm">
          Take Action
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Headphones className="h-5 w-5 mr-2" />
              Voice {
                recordingMode === "rfq" ? "RFQ Creation" : 
                recordingMode === "command" ? "Command" :
                recordingMode === "entities" ? "Entity Extraction" :
                "Sentiment Analysis"
              }
            </CardTitle>
            <CardDescription>
              {recordingMode === "rfq"
                ? "Create an RFQ by speaking into your microphone"
                : recordingMode === "command"
                ? "Control the application using voice commands"
                : recordingMode === "entities"
                ? "Extract business entities from your speech"
                : "Analyze the sentiment of your speech"
              }
            </CardDescription>
          </div>
          <Select value={recordingMode} onValueChange={(value) => setRecordingMode(value as RecordingMode)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rfq">RFQ Mode</SelectItem>
              <SelectItem value="command">Command Mode</SelectItem>
              <SelectItem value="entities">Entity Extraction</SelectItem>
              <SelectItem value="sentiment">Sentiment Analysis</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium flex items-center">
              <Languages className="h-4 w-4 mr-1" />
              Language
            </label>
            <Badge variant="outline" className="text-xs">
              {selectedLanguage === "hi" && "हिंदी (Hindi) Support: 75%"}
            </Badge>
          </div>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {supportedLanguages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mb-6 flex flex-col items-center justify-center">
          <div className="w-48 h-48 rounded-full bg-primary/10 flex items-center justify-center mb-4 relative">
            {isProcessing ? (
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            ) : isRecording ? (
              <>
                <div className="absolute inset-0 rounded-full border-4 border-primary animate-pulse"></div>
                <Mic className="h-16 w-16 text-primary" />
              </>
            ) : (
              <Mic className="h-16 w-16 text-primary/50" />
            )}
          </div>
          
          <div className="text-center mb-2">
            {isRecording ? (
              <p className="text-xl font-semibold">{formatTime(recordingTime)}</p>
            ) : isProcessing ? (
              <p className="text-sm text-muted-foreground">Processing your audio...</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {recordingMode === "rfq"
                  ? "Click record and speak your RFQ details"
                  : recordingMode === "command"
                  ? "Click record and speak your command"
                  : recordingMode === "entities"
                  ? "Click record and describe your business requirements"
                  : "Click record and express your opinion about a product/service"}
              </p>
            )}
          </div>
          
          <div className="flex justify-center">
            {!isRecording && !isProcessing ? (
              <Button 
                onClick={handleStartRecording}
                className="flex items-center"
              >
                <Mic className="mr-2 h-4 w-4" />
                Record
              </Button>
            ) : isRecording ? (
              <Button 
                onClick={handleStopRecording}
                variant="destructive"
                className="flex items-center"
              >
                <StopCircle className="mr-2 h-4 w-4" />
                Stop Recording
              </Button>
            ) : (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing
              </Button>
            )}
            
            {audioUrl && !isRecording && (
              <Button 
                variant="outline" 
                className="ml-2 flex items-center"
                onClick={playAudio}
              >
                <Volume2 className="mr-2 h-4 w-4" />
                Play
              </Button>
            )}
          </div>
        </div>

        {/* Help text based on mode */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
          <h4 className="font-medium mb-1">
            Sample {
              recordingMode === "rfq" ? "RFQ" : 
              recordingMode === "command" ? "Commands" :
              recordingMode === "entities" ? "Business Speech" :
              "Speech for Sentiment Analysis"
            }
          </h4>
          
          {recordingMode === "rfq" && (
            <p>
              "I need 500 units of 3mm stainless steel bolts with hexagonal heads. 
              We require delivery by June 15th. Please include certification for 
              material quality. Our budget is ₹25,000 and this is urgent."
            </p>
          )}
          
          {recordingMode === "command" && (
            <ul className="list-disc list-inside space-y-1">
              <li>
                <span className="font-medium">English:</span> "Create RFQ", "Search supplier", "Show status"
              </li>
              {selectedLanguage === "hi" && (
                <li>
                  <span className="font-medium">Hindi:</span> "आरएफक्यू बनाएं", "सप्लायर खोजें", "स्थिति दिखाएं"
                </li>
              )}
            </ul>
          )}
          
          {recordingMode === "entities" && (
            <p>
              "We're looking to place an order with Tata Steel for 200 tons of construction steel
              for our Mumbai project. The delivery needs to happen before January 15th, 2026.
              Contact Rahul Sharma at rahul@example.com if you need more details. Our budget is around ₹15 lakhs."
            </p>
          )}
          
          {recordingMode === "sentiment" && (
            <div className="space-y-2">
              <p>
                <span className="font-medium">Positive:</span> "We are extremely pleased with the quality of materials 
                delivered by your company. The timely delivery and excellent customer service exceeded our expectations."
              </p>
              <p>
                <span className="font-medium">Negative:</span> "The delivery was significantly delayed and the quality of the 
                products was below our standards. We're disappointed with the overall experience."
              </p>
            </div>
          )}
        </div>
        
        {/* Audio element for playback (hidden) */}
        <audio ref={audioRef} src={audioUrl || ""} />
      </CardContent>

      {result && (
        <CardFooter>
          <div className="w-full border-t pt-4 mt-2">
            <h3 className="font-medium mb-2">Results</h3>
            {recordingMode === "rfq" ? renderRfqResult(result as RfqResult) :
              recordingMode === "command" ? renderCommandResult(result as CommandResult) :
              recordingMode === "entities" ? renderEntityResult(result as EntityExtractionResult) :
              renderSentimentResult(result as SentimentAnalysisResult)
            }
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
