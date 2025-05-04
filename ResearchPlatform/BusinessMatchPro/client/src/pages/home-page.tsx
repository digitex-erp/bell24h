import Hero from "@/components/home/hero";
import Features from "@/components/home/features";
import HowItWorks from "@/components/home/how-it-works";
import AiMatching from "@/components/home/ai-matching";
import RegistrationCta from "@/components/home/registration-cta";
import FeaturedSuppliers from "@/components/home/featured-suppliers";
import RfqForm from "@/components/rfq/rfq-form";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <RfqForm />
        <FeaturedSuppliers />
        <AiMatching />
        <RegistrationCta />
      </main>
      <Footer />
    </>
  );
}
