'use client';

import { useState } from 'react';
import { Mic, Video, FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import AudioPlayer from './AudioPlayer';
import VideoPlayer from './VideoPlayer';

type RFQType = 'text' | 'voice' | 'video';

export default function HeroRFQDemo() {
  const [activeType, setActiveType] = useState<RFQType>('voice');

  const demoContent = {
    text: {
      title: 'Type Your Requirement',
      description: 'Traditional text-based RFQ with full specifications',
      example: {
        product: 'Industrial LED Bulbs',
        quantity: '10,000 units',
        specs: '9W, Cool White, B22 Base, IP65 rated',
        budget: '₹2L - ₹3L',
        location: 'Bangalore',
      },
    },
    voice: {
      title: 'Speak Your Requirement',
      description: 'Just speak in any language - our AI understands 12 Indian languages',
      audioUrl: '/api/demo/audio/sample-voice-rfq.mp3',
      transcription: 'मुझे 5000 यूनिट स्टील पाइप चाहिए, ग्रेड 304, मुंबई में डिलीवरी',
      translation: 'I need 5000 units of steel pipes, Grade 304, delivery in Mumbai',
      aiAnalysis: {
        product: 'Steel Pipes',
        quantity: '5000 units',
        grade: 'Grade 304',
        location: 'Mumbai',
        language: 'Hindi',
      },
    },
    video: {
      title: 'Show Us via Video',
      description: 'Record or upload a video showing the product you need',
      videoUrl: 'https://res.cloudinary.com/dcwhgtqld/video/upload/v1234567890/demo-rfq-video.mp4',
      aiAnalysis: {
        detectedProduct: 'Industrial Machinery',
        confidence: '94%',
        extractedSpecs: ['Heavy-duty', 'Electric motor', 'Stainless steel'],
      },
    },
  };

  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered RFQ System</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Post RFQs in Seconds
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Choose how you want to create your RFQ - Text, Voice, or Video
          </p>
        </div>

        {/* Type Selector Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveType('text')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeType === 'text'
                ? 'bg-white text-blue-600 shadow-lg scale-105'
                : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Text RFQ</span>
          </button>
          <button
            onClick={() => setActiveType('voice')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeType === 'voice'
                ? 'bg-white text-purple-600 shadow-lg scale-105'
                : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'
            }`}
          >
            <Mic className="w-5 h-5" />
            <span>Voice RFQ</span>
          </button>
          <button
            onClick={() => setActiveType('video')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeType === 'video'
                ? 'bg-white text-pink-600 shadow-lg scale-105'
                : 'bg-white/10 backdrop-blur-sm hover:bg-white/20'
            }`}
          >
            <Video className="w-5 h-5" />
            <span>Video RFQ</span>
          </button>
        </div>

        {/* Demo Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
            <h3 className="text-2xl font-bold mb-2">{demoContent[activeType].title}</h3>
            <p className="text-blue-100 mb-6">{demoContent[activeType].description}</p>

            {/* Text Demo */}
            {activeType === 'text' && (
              <div className="bg-white/10 rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-blue-200 mb-1">Product</p>
                    <p className="font-medium">{demoContent.text.example.product}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200 mb-1">Quantity</p>
                    <p className="font-medium">{demoContent.text.example.quantity}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-blue-200 mb-1">Specifications</p>
                    <p className="font-medium">{demoContent.text.example.specs}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200 mb-1">Budget</p>
                    <p className="font-medium">{demoContent.text.example.budget}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200 mb-1">Location</p>
                    <p className="font-medium">{demoContent.text.example.location}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Voice Demo */}
            {activeType === 'voice' && (
              <div className="space-y-4">
                <AudioPlayer audioUrl={demoContent.voice.audioUrl} />
                
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-sm text-blue-200 mb-1">Original (Hindi)</p>
                  <p className="font-medium mb-3">{demoContent.voice.transcription}</p>
                  <p className="text-sm text-blue-200 mb-1">Translation (English)</p>
                  <p className="font-medium">{demoContent.voice.translation}</p>
                </div>

                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-sm text-blue-200 mb-2">AI Extracted Information</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-blue-200">Product:</span> {demoContent.voice.aiAnalysis.product}
                    </div>
                    <div>
                      <span className="text-blue-200">Quantity:</span> {demoContent.voice.aiAnalysis.quantity}
                    </div>
                    <div>
                      <span className="text-blue-200">Grade:</span> {demoContent.voice.aiAnalysis.grade}
                    </div>
                    <div>
                      <span className="text-blue-200">Location:</span> {demoContent.voice.aiAnalysis.location}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Video Demo */}
            {activeType === 'video' && (
              <div className="space-y-4">
                <VideoPlayer videoUrl={demoContent.video.videoUrl} />
                
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-sm text-blue-200 mb-2">AI Video Analysis</p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-blue-200">Detected Product:</span> {demoContent.video.aiAnalysis.detectedProduct}
                    </div>
                    <div>
                      <span className="text-blue-200">Confidence:</span> {demoContent.video.aiAnalysis.confidence}
                    </div>
                    <div>
                      <span className="text-blue-200">Extracted Specs:</span> {demoContent.video.aiAnalysis.extractedSpecs.join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mt-6">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50" asChild>
                <Link href={`/rfq/create?type=${activeType}`}>
                  Try {activeType.charAt(0).toUpperCase() + activeType.slice(1)} RFQ
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                <Link href="/rfq/demo/all">View All Demos</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-3xl font-bold mb-1">~800</p>
            <p className="text-sm text-blue-200">Text RFQs</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold mb-1">~300</p>
            <p className="text-sm text-blue-200">Voice RFQs</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold mb-1">~150</p>
            <p className="text-sm text-blue-200">Video RFQs</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold mb-1">12+</p>
            <p className="text-sm text-blue-200">Languages</p>
          </div>
        </div>
      </div>
    </section>
  );
}

