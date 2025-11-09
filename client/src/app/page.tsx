import HeroRFQDemo from '@/components/homepage/HeroRFQDemo';
import TrustIndicators from '@/components/homepage/TrustIndicators';
import CategoryGrid from '@/components/homepage/CategoryGrid';
import LiveRFQFeed from '@/components/homepage/LiveRFQFeed';
import RFQTypeShowcase from '@/components/homepage/RFQTypeShowcase';
import FeaturedDemoCarousel from '@/components/homepage/FeaturedDemoCarousel';
import AIFeaturesSection from '@/components/homepage/AIFeaturesSection';
import HowItWorks from '@/components/homepage/HowItWorks';
import FinalCTA from '@/components/homepage/FinalCTA';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a1128]">
      {/* Hero Section - Interactive RFQ Demo */}
      <HeroRFQDemo />

      {/* Trust Indicators - Stats Bar */}
      <TrustIndicators />

      {/* Main Content - 3 Column Layout */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Categories */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24">
              <CategoryGrid />
            </div>
          </aside>

          {/* Main Feed - Live RFQs */}
          <main className="lg:col-span-6">
            <LiveRFQFeed />
          </main>

          {/* Right Sidebar - Stats & Featured */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              {/* Quick Stats */}
              <div className="bg-gray-900/80 backdrop-blur border border-white/10 rounded-lg shadow-lg p-6">
                <h3 className="font-semibold text-lg mb-4 text-white">Platform Stats</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold text-cyan-400">10,000+</p>
                    <p className="text-sm text-gray-400">Verified Suppliers</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-400">₹500Cr+</p>
                    <p className="text-sm text-gray-400">Transaction Value</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-cyan-400">2,500+</p>
                    <p className="text-sm text-gray-400">Demo RFQs Available</p>
                  </div>
                </div>
              </div>

              {/* Featured Categories */}
              <div className="bg-gray-900/80 backdrop-blur border border-white/10 rounded-lg shadow-lg p-6">
                <h3 className="font-semibold text-lg mb-4 text-white">Trending This Week</h3>
                <div className="space-y-2">
                  <a href="/categories/steel" className="block p-3 hover:bg-white/10 rounded-lg transition-colors border border-white/5">
                    <p className="font-medium text-white">Steel & Metal</p>
                    <p className="text-sm text-gray-400">50+ active RFQs</p>
                  </a>
                  <a href="/categories/electronics" className="block p-3 hover:bg-white/10 rounded-lg transition-colors border border-white/5">
                    <p className="font-medium text-white">Electronics</p>
                    <p className="text-sm text-gray-400">35+ active RFQs</p>
                  </a>
                  <a href="/categories/textiles" className="block p-3 hover:bg-white/10 rounded-lg transition-colors border border-white/5">
                    <p className="font-medium text-white">Textiles</p>
                    <p className="text-sm text-gray-400">28+ active RFQs</p>
                  </a>
                </div>
              </div>
        </div>
          </aside>
        </div>
      </div>

      {/* RFQ Type Showcase */}
      <RFQTypeShowcase />

      {/* Featured Demo Carousel */}
      <FeaturedDemoCarousel />

      {/* AI Features Section */}
      <AIFeaturesSection />

      {/* How It Works */}
      <HowItWorks />

      {/* Final CTA */}
      <FinalCTA />
    </div>
  );
}
