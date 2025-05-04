import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { BellSoundEffects, useAudio, initializeAudio } from '@/lib/audio';

/**
 * Audio Testing Page
 * 
 * This page allows testing of the Bell24h sound effect system
 */
export default function AudioTestPage() {
  const { toast } = useToast();
  const [volume, setVolume] = useState<number>(0.5);
  const [initialized, setInitialized] = useState<boolean>(false);
  const audio = useAudio();

  // Initialize audio system on first user interaction
  const handleInitialize = () => {
    initializeAudio();
    setInitialized(true);
    toast({
      title: "Audio Initialized",
      description: "Sound system is now ready to use",
    });
  };

  // Play success sound with current volume
  const playSuccess = () => {
    if (!initialized) {
      handleInitialize();
    }
    audio.success(volume);
    toast({
      title: "Success Sound",
      description: `Played at volume: ${Math.round(volume * 100)}%`,
    });
  };

  // Play notification sound with current volume
  const playNotification = () => {
    if (!initialized) {
      handleInitialize();
    }
    audio.notification(volume);
    toast({
      title: "Notification Sound",
      description: `Played at volume: ${Math.round(volume * 100)}%`,
    });
  };
  
  // Play RFQ received sound with current volume
  const playRfqReceived = () => {
    if (!initialized) {
      handleInitialize();
    }
    audio.rfqReceived(volume);
    toast({
      title: "RFQ Received Sound",
      description: `Played at volume: ${Math.round(volume * 100)}%`,
    });
  };
  
  // Play match found sound with current volume
  const playMatchFound = () => {
    if (!initialized) {
      handleInitialize();
    }
    audio.matchFound(volume);
    toast({
      title: "Match Found Sound",
      description: `Played at volume: ${Math.round(volume * 100)}%`,
    });
  };
  
  // Play transaction complete sound with current volume
  const playTransactionComplete = () => {
    if (!initialized) {
      handleInitialize();
    }
    audio.transactionComplete(volume);
    toast({
      title: "Transaction Complete Sound",
      description: `Played at volume: ${Math.round(volume * 100)}%`,
    });
  };

  // Use the static class methods
  const playStaticSuccess = () => {
    if (!initialized) {
      handleInitialize();
    }
    BellSoundEffects.success();
    toast({
      title: "Static Success Sound",
      description: "Played using BellSoundEffects class",
    });
  };

  // Handle volume change
  const handleVolumeChange = (newValue: number[]) => {
    setVolume(newValue[0]);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Audio System Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Bell24h Sound Effects</CardTitle>
            <CardDescription>
              Test the audio notification system for Bell24h
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2 font-medium">Volume: {Math.round(volume * 100)}%</p>
              <Slider
                defaultValue={[0.5]}
                max={1}
                step={0.1}
                value={[volume]}
                onValueChange={handleVolumeChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={handleInitialize}
                variant={initialized ? "outline" : "default"}
              >
                {initialized ? "Reactivate Audio" : "Initialize Audio"}
              </Button>
              
              <Button 
                onClick={playSuccess}
                variant="default"
              >
                Play Success
              </Button>
              
              <Button 
                onClick={playNotification}
                variant="default"
              >
                Play Notification
              </Button>
              
              <Button 
                onClick={playRfqReceived}
                variant="default"
              >
                RFQ Received
              </Button>
              
              <Button 
                onClick={playMatchFound}
                variant="default"
              >
                Match Found
              </Button>
              
              <Button 
                onClick={playTransactionComplete}
                variant="default"
              >
                Transaction Complete
              </Button>
              
              <Button
                onClick={playStaticSuccess}
                variant="outline"
              >
                Static Success
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Audio System Information</CardTitle>
            <CardDescription>
              Details about the Bell24h audio notification system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">System Status</h3>
              <p className="text-sm text-muted-foreground">
                Audio System: <span className={initialized ? "text-green-500" : "text-amber-500"}>
                  {initialized ? "Initialized" : "Not Initialized"}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                Sound Effects Available: Success, Notification, RFQ Received, Match Found, Transaction Complete
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">About Bell24h Audio</h3>
              <p className="text-sm text-muted-foreground">
                The Bell24h platform uses custom sound effects for marketplace 
                interactions, including notifications, success events, RFQ receipt,
                buyer-supplier matches, and transaction completions. This creates a more 
                engaging and responsive user experience throughout the trading process.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Different sound types instantly convey different actions in the marketplace:
              </p>
              <ul className="text-sm text-muted-foreground mt-1 list-disc pl-5 space-y-1">
                <li>Success sounds confirm general action completion</li>
                <li>Notification sounds alert users to system events</li>
                <li>RFQ sounds notify sellers of incoming opportunities</li>
                <li>Match sounds indicate buyer-supplier connections</li>
                <li>Transaction sounds confirm completed trades</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}