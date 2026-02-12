'use client';

import { useState } from 'react';
import CreateRFQForm from '@/components/rfq/CreateRFQForm';
import VoiceRFQForm from '@/components/rfq/VoiceRFQForm';
import VideoRFQForm from '@/components/rfq/VideoRFQForm';

type RFQType = 'text' | 'voice' | 'video';

export default function NewRFQPage() {
  const [activeTab, setActiveTab] = useState<RFQType>('text');

  const tabs = [
    { id: 'text' as RFQType, label: '📝 Text RFQ', color: 'blue' },
    { id: 'voice' as RFQType, label: '🎤 Voice RFQ', color: 'green' },
    { id: 'video' as RFQType, label: '🎥 Video RFQ', color: 'purple' },
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Create New RFQ</h1>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === tab.id
                ? `border-b-2 border-${tab.color}-600 text-${tab.color}-600`
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Help Text */}
      <div className="max-w-2xl mx-auto mb-6 p-4 bg-blue-50 rounded-lg">
        {activeTab === 'text' && (
          <p className="text-sm text-blue-800">
            <strong>Text RFQ:</strong> Fill out the form with your product/service requirements.
            Best for detailed specifications and formal requests.
          </p>
        )}
        {activeTab === 'voice' && (
          <p className="text-sm text-green-800">
            <strong>Voice RFQ:</strong> Record or upload an audio file describing your needs.
            Speak in any language - Hindi, Tamil, Telugu, English, etc.
          </p>
        )}
        {activeTab === 'video' && (
          <p className="text-sm text-purple-800">
            <strong>Video RFQ:</strong> Show us what you need via video. Great for complex products
            or when visual reference helps. Maximum 50MB.
          </p>
        )}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'text' && <CreateRFQForm />}
        {activeTab === 'voice' && <VoiceRFQForm />}
        {activeTab === 'video' && <VideoRFQForm />}
      </div>
    </div>
  );
}
