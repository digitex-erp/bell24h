'use client';

import React from 'react';
import VoiceRFQ from '@/components/VoiceRFQ';

export default function VoiceRFQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎤 Voice RFQ Creation
          </h1>
          <p className="text-xl text-gray-600">
            Create RFQs using your voice - Faster, easier, and more natural
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">How it works</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <span className="text-blue-600 text-lg">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Speak your requirements</h3>
                    <p className="text-gray-600">Simply describe what you need in natural language</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <span className="text-green-600 text-lg">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium">AI processes your voice</h3>
                    <p className="text-gray-600">Our AI extracts all the details automatically</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <span className="text-purple-600 text-lg">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Get structured RFQ</h3>
                    <p className="text-gray-600">Review and submit your professional RFQ</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <VoiceRFQ 
                onRFQCreated={(rfqData) => {
                  console.log('RFQ Created:', rfqData);
                  // Handle RFQ creation
                }}
                userId="demo_user_123"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold mb-6">Voice RFQ Examples</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-xl">
              <h3 className="font-semibold mb-2">Electronics</h3>
              <p className="text-gray-600 mb-3">"I need 5000 high-quality PCB components for my electronics manufacturing unit in Bangalore"</p>
              <div className="text-sm text-blue-600">
                → Extracts: Category, Quantity, Quality, Location
              </div>
            </div>
            <div className="bg-green-50 p-6 rounded-xl">
              <h3 className="font-semibold mb-2">Textiles</h3>
              <p className="text-gray-600 mb-3">"Looking for organic cotton fabric suppliers for sustainable clothing production in Mumbai"</p>
              <div className="text-sm text-green-600">
                → Extracts: Material, Sustainability, Industry, Location
              </div>
            </div>
            <div className="bg-purple-50 p-6 rounded-xl">
              <h3 className="font-semibold mb-2">Machinery</h3>
              <p className="text-gray-600 mb-3">"Need industrial automation equipment for automotive assembly line in Pune"</p>
              <div className="text-sm text-purple-600">
                → Extracts: Equipment Type, Industry, Application, Location
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
