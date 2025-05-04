import { useState } from 'react';
import { useRFQs } from '@/hooks/use-rfqs';
import { MainLayout } from '@/components/layout/main-layout';
import { RFQTable } from '@/components/dashboard/rfq-table';
import { CreateRFQForm } from '@/components/rfq/create-rfq-form';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Mic, Filter } from 'lucide-react';
import { RFQ } from '@shared/schema';

export default function RFQPage() {
  const { rfqs, isLoadingRFQs, voiceRFQMutation } = useRFQs();
  const [isCreateRFQOpen, setIsCreateRFQOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Recording state for voice RFQ
  const [isRecording, setIsRecording] = useState(false);
  
  // Handle voice RFQ recording
  const handleVoiceRFQ = () => {
    // This is a simplified implementation. In a real app, you would use
    // the Web Audio API to record audio and then convert it to base64
    alert('Voice recording feature would be implemented here with Web Audio API');
    
    // Mock recording behavior
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      alert('Recording complete. Processing...');
      
      // In a real implementation, you would have actual audio data to send
      // voiceRFQMutation.mutate(audioBase64);
    }, 3000);
  };
  
  // Filter RFQs based on active tab
  const getFilteredRFQs = (): RFQ[] => {
    switch (activeTab) {
      case 'draft':
        return rfqs.filter(rfq => rfq.status === 'draft');
      case 'open':
        return rfqs.filter(rfq => rfq.status === 'open');
      case 'in_review':
        return rfqs.filter(rfq => rfq.status === 'in_review');
      case 'awarded':
        return rfqs.filter(rfq => rfq.status === 'awarded');
      case 'closed':
        return rfqs.filter(rfq => rfq.status === 'closed');
      default:
        return rfqs;
    }
  };

  return (
    <MainLayout
      title="Request for Quotes (RFQs)"
      description="Create, manage, and track your RFQs in one place."
    >
      <div className="flex justify-between items-center mb-6">
        <div className="space-x-2">
          <Button 
            onClick={() => setIsCreateRFQOpen(true)}
            className="bg-primary-600 hover:bg-primary-700"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New RFQ
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleVoiceRFQ} 
            disabled={isRecording}
            className={isRecording ? 'animate-pulse text-red-500' : ''}
          >
            <Mic className="mr-2 h-4 w-4" />
            {isRecording ? 'Recording...' : 'Voice RFQ'}
          </Button>
        </div>
        
        <Button variant="ghost">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>
      
      <Tabs 
        defaultValue="all" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="all">All RFQs</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="in_review">In Review</TabsTrigger>
          <TabsTrigger value="awarded">Awarded</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          <RFQTable 
            rfqs={getFilteredRFQs()} 
            title={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} RFQs`}
            onCreateNew={() => setIsCreateRFQOpen(true)}
          />
        </TabsContent>
      </Tabs>
      
      {/* Create RFQ Modal */}
      <CreateRFQForm
        isOpen={isCreateRFQOpen}
        onClose={() => setIsCreateRFQOpen(false)}
      />
    </MainLayout>
  );
}
