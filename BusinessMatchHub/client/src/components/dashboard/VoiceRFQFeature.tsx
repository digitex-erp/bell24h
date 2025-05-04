import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const VoiceRFQFeature: React.FC = () => {
  return (
    <div className="mt-8">
      <Card>
        <CardHeader className="px-4 py-5 sm:px-6 bg-gradient-to-r from-primary-800 to-primary-900 text-white">
          <h3 className="text-lg leading-6 font-medium">Voice RFQ Submission</h3>
          <p className="mt-1 max-w-2xl text-sm text-primary-100">Create RFQs faster using your voice - powered by AI</p>
        </CardHeader>
        <CardContent className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">
                Speak your RFQ requirements into the microphone. Our AI will transcribe your speech and create a structured RFQ document.
              </p>
              <div className="mt-6 space-y-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <i className="fas fa-check text-success-500"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">Works with all major Indian languages and accents</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <i className="fas fa-check text-success-500"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">Automatically extracts key details like quantity, deadline, and specifications</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <i className="fas fa-check text-success-500"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">Review and edit before submitting</p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Link href="/voice-rfq">
                  <Button className="bg-accent-500 hover:bg-accent-600">
                    <i className="fas fa-microphone mr-2"></i>
                    Start Recording
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <div className="font-medium text-gray-900">Preview</div>
                <div className="text-sm text-gray-500">Sample RFQ</div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Title</div>
                  <div className="mt-1 text-gray-900">Supply of 5000 units of semiconductors</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Description</div>
                  <div className="mt-1 text-gray-900">
                    We need 5000 units of XYZ brand semiconductors for our manufacturing plant in Pune. The specifications are as follows: 7nm technology, 1.8V operating voltage. Delivery required within 45 days.
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Quantity</div>
                  <div className="mt-1 text-gray-900">5,000 units</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Deadline</div>
                  <div className="mt-1 text-gray-900">October 15, 2023</div>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button variant="default" size="sm">
                  Submit RFQ
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceRFQFeature;
