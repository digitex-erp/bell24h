import React, { useState } from 'react';
import { VoiceAssistant } from './VoiceAssistant';
import { Button } from '@/components/ui/button';
import { Mic, X } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';

interface FloatingVoiceButtonProps {
  className?: string;
}

export const FloatingVoiceButton: React.FC<FloatingVoiceButtonProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating button in the corner */}
      <Button
        size="icon"
        className={`rounded-full h-12 w-12 fixed bottom-6 right-6 z-50 shadow-lg ${className}`}
        onClick={toggleDrawer}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </Button>

      {/* Dialog with voice assistant */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Voice Procurement Assistant</DialogTitle>
            <DialogDescription>
              Use voice commands to navigate the procurement platform
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 pt-0">
            <VoiceAssistant />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};