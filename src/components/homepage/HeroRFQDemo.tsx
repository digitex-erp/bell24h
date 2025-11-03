"use client";

import { useState } from 'react';
import { Mic, Video, FileText, Send, CheckCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function HeroRFQDemo() {
  const [activeTab, setActiveTab] = useState<'voice' | 'video' | 'text'>('voice');
  return (
    <section className="relative bg-blue-600 py-24 md:py-32">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white text-sm font-semibold mb-6">
            <TrendingUp className="w-4 h-4" />
            India's First Multi-Modal B2B Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            Post RFQs in Seconds,
            <br />
            Not Hours
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
            Voice, Video, or Text - Choose your style. Connect with verified suppliers instantly.
          </p>
          <div className="flex flex-wrap justify-center gap-12 mb-16">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">10,000+</div>
              <div className="text-white/80">Active Suppliers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">50+</div>
              <div className="text-white/80">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">&lt;60s</div>
              <div className="text-white/80">Avg Response</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-4 mb-8 justify-center">
            <button onClick={() => setActiveTab('voice')} className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all ${activeTab === 'voice' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              <Mic className="w-5 h-5" />
              Voice RFQ
            </button>
            <button onClick={() => setActiveTab('video')} className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all ${activeTab === 'video' ? 'bg-purple-600 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              <Video className="w-5 h-5" />
              Video RFQ
            </button>
            <button onClick={() => setActiveTab('text')} className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all ${activeTab === 'text' ? 'bg-green-600 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              <FileText className="w-5 h-5" />
              Text RFQ
            </button>
          </div>
          <div className="min-h-[400px]">
            {activeTab === 'voice' && (
              <div>
                <div className="bg-blue-50 rounded-xl p-8 border-2 border-blue-100">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                      <Mic className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-2xl text-gray-900">Record Your RFQ</h3>
                      <p className="text-gray-600">Speak naturally, we'll handle the rest</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl p-8 shadow-sm">
                      <div className="flex items-center justify-center mb-6">
                        <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center cursor-pointer">
                          <Mic className="w-12 h-12 text-white" />
                        </div>
                      </div>
                      <p className="text-center text-gray-700 text-lg mb-4">"I need 500 kg of steel rods for construction in Mumbai. Quality should be Grade 60. Delivery needed by next week."</p>
                      <div className="flex items-center justify-center gap-2 text-gray-500">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>00:12 • Recording...</span>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="flex items-start gap-3"><CheckCircle className="w-6 h-6 text-green-600" /><div><div className="font-bold text-gray-900 mb-1">Auto-transcribed</div><div className="text-sm text-gray-600">AI converts to text</div></div></div>
                      <div className="flex items-start gap-3"><CheckCircle className="w-6 h-6 text-green-600" /><div><div className="font-bold text-gray-900 mb-1">10+ Languages</div><div className="text-sm text-gray-600">Hindi, English & more</div></div></div>
                      <div className="flex items-start gap-3"><CheckCircle className="w-6 h-6 text-green-600" /><div><div className="font-bold text-gray-900 mb-1">Instant Post</div><div className="text-sm text-gray-600">Live in 30 seconds</div></div></div>
                    </div>
                    <Link href="/rfq/voice" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg">
                      Try Voice RFQ Free
                      <Send className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'video' && (
              <div>
                <div className="bg-purple-50 rounded-xl p-8 border-2 border-purple-100">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                      <Video className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-2xl text-gray-900">Show, Don't Just Tell</h3>
                      <p className="text-gray-600">Record a video of your requirements</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl p-8 shadow-sm">
                      <div className="aspect-video bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                        <div className="text-center">
                          <Video className="w-20 h-20 text-purple-600 mx-auto mb-4" />
                          <p className="text-gray-700 font-semibold text-lg">Record or Upload Video</p>
                          <p className="text-gray-500 mt-2">Show product specs, defects, or samples</p>
                        </div>
                      </div>
                    </div>
                    <Link href="/rfq/video" className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 shadow-lg">
                      Try Video RFQ Free
                      <Send className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'text' && (
              <div>
                <div className="bg-green-50 rounded-xl p-8 border-2 border-green-100">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-2xl text-gray-900">Classic Text RFQ</h3>
                      <p className="text-gray-600">Traditional form with smart assistance</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl p-8 shadow-sm space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Product/Service</label>
                        <input type="text" placeholder="e.g., Industrial Steel Rods" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                        <input type="text" placeholder="e.g., 500 kg" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Requirements</label>
                        <textarea placeholder="Describe your specific requirements..." rows={3} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none" />
                      </div>
                    </div>
                    <Link href="/rfq/create" className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg">
                      Try Text RFQ Free
                      <Send className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-16 text-center">
          <p className="text-white/80 mb-6 text-lg">Trusted by leading businesses across India</p>
          <div className="flex flex-wrap justify-center gap-12 items-center">
            <div className="text-white font-bold text-xl opacity-80">Tata Group</div>
            <div className="text-white font-bold text-xl opacity-80">Reliance</div>
            <div className="text-white font-bold text-xl opacity-80">L&T</div>
            <div className="text-white font-bold text-xl opacity-80">Mahindra</div>
            <div className="text-white font-bold text-xl opacity-80">Adani</div>
          </div>
        </div>
      </div>
    </section>
  );
}
