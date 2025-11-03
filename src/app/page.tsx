import HeroRFQDemo from '@/components/homepage/HeroRFQDemo';
import CategoryGrid from '@/components/homepage/CategoryGrid';
import LiveRFQFeed from '@/components/homepage/LiveRFQFeed';
import FinalCTA from '@/components/homepage/FinalCTA';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <HeroRFQDemo />
      <CategoryGrid />
      <LiveRFQFeed />
      <FinalCTA />
    </main>
  );
}
