import { Plus, Mic } from "lucide-react";
import { User } from "@shared/schema";
import { useState } from "react";
import CreateRFQDialog from "../rfq/CreateRFQDialog";
import VoiceRFQDialog from "../rfq/VoiceRFQDialog";
import { Button } from "@/components/ui/button";

interface WelcomeSectionProps {
  user: User;
  onRFQCreated?: () => void;
}

export default function WelcomeSection({ user, onRFQCreated }: WelcomeSectionProps) {
  const [createRFQOpen, setCreateRFQOpen] = useState(false);
  const [voiceRFQOpen, setVoiceRFQOpen] = useState(false);

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">
            Welcome back, {user.name ? user.name.split(" ")[0] : user.username.split(" ")[0]}!
          </h2>
          <p className="text-neutral-500 mt-1">
            Here's what's happening with your RFQs today.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => setCreateRFQOpen(true)}
            className="inline-flex items-center text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create RFQ
          </Button>
          <Button 
            onClick={() => setVoiceRFQOpen(true)}
            variant="outline"
            className="inline-flex items-center border border-gray-300 text-neutral-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Mic className="h-4 w-4 mr-2 text-primary-500" />
            Voice RFQ
          </Button>
        </div>
      </div>

      <CreateRFQDialog 
        open={createRFQOpen} 
        onOpenChange={setCreateRFQOpen} 
        onRFQCreated={() => {
          onRFQCreated?.();
        }}
      />

      <VoiceRFQDialog 
        open={voiceRFQOpen} 
        onOpenChange={setVoiceRFQOpen} 
        onRFQCreated={() => {
          onRFQCreated?.();
        }}
      />
    </div>
  );
}
