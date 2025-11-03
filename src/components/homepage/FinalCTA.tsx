'use client';

import { Mic, Video, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function FinalCTA() {
  const ctas = [
    {
      icon: Mic,
      title: 'Try Voice RFQ',
      description: 'Speak your requirement in any language',
      link: '/rfq/create?type=voice',
      color: 'purple',
    },
    {
      icon: Video,
      title: 'Upload Video RFQ',
      description: 'Show us what you need via video',
      link: '/rfq/create?type=video',
      color: 'pink',
    },
    {
      icon: FileText,
      title: 'Post Text RFQ',
      description: 'Traditional text-based requirement',
      link: '/rfq/create?type=text',
      color: 'blue',
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Choose your preferred RFQ format and start connecting with verified suppliers today
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {ctas.map((cta, index) => {
            const Icon = cta.icon;
            return (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    <Icon className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-center">
                  {cta.title}
                </h3>
                <p className="text-blue-100 text-center mb-6">
                  {cta.description}
                </p>
                <Button
                  className="w-full bg-white text-blue-600 hover:bg-blue-50"
                  asChild
                >
                  <Link href={cta.link}>
                    Get Started
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-blue-100 mb-4">
            Or explore our demo RFQs to see how it works
          </p>
          <Button variant="outline" className="border-white text-white hover:bg-white/10" asChild>
            <Link href="/rfq/demo">
              View Demo RFQs
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

