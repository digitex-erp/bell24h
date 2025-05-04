import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RFQForm from '@/components/rfq/RFQForm';
import { useToast } from '@/hooks/use-toast';

const CreateRFQ: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [rfqType, setRfqType] = useState<'text' | 'video'>('text');

  // Get the query parameters
  const params = new URLSearchParams(window.location.search);
  const typeParam = params.get('type');

  // Set the RFQ type based on the query parameter if available
  React.useEffect(() => {
    if (typeParam === 'video') {
      setRfqType('video');
    }
  }, [typeParam]);

  const handleTypeChange = (value: string) => {
    setRfqType(value as 'text' | 'video');
  };

  const handleGoToVoiceRFQ = () => {
    setLocation('/voice-rfq');
  };

  const handleGoToVideoRFQ = () => {
    setLocation('/video-rfq');
  };

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Create New RFQ</h1>
          <div className="flex space-x-3">
            <button
              onClick={handleGoToVoiceRFQ}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent-500 hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
            >
              <i className="fas fa-microphone mr-2"></i>
              Switch to Voice RFQ
            </button>
            <button
              onClick={handleGoToVideoRFQ}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <i className="fas fa-video mr-2"></i>
              Switch to Video RFQ
            </button>
          </div>
        </div>

        <Card className="mt-6">
          <CardHeader className="bg-gradient-to-r from-primary-700 to-primary-900 text-white">
            <h2 className="text-xl font-semibold">
              {rfqType === 'text' ? 'Text RFQ Form' : 'Video RFQ Form'}
            </h2>
            <p className="text-sm text-primary-100">
              Fill out the form below to create a new Request for Quotation
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue={rfqType} className="w-full" onValueChange={handleTypeChange}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="text">Text RFQ</TabsTrigger>
                <TabsTrigger value="video">Video RFQ</TabsTrigger>
              </TabsList>
              <TabsContent value="text">
                <RFQForm rfqType="text" />
              </TabsContent>
              <TabsContent value="video">
                <RFQForm rfqType="video" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateRFQ;
