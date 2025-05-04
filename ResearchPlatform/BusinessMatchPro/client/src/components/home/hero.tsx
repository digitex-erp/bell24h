import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, BarChart2, Shield, TrendingUp, 
  Users, PlayCircle, BriefcaseBusiness 
} from "lucide-react";
import { useState } from "react";

export default function Hero() {
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#007BFF] via-[#4C6FFF] to-[#2D59F5] text-white">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#FFC107] rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute top-40 -left-20 w-80 h-80 bg-[#28A745] rounded-full mix-blend-multiply filter blur-[100px] opacity-15 animate-blob animation-delay-4000"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 relative z-10">
        <div className="grid grid-cols-1 gap-16 items-center">
          <div>
            <div className="text-sm font-semibold text-white inline-flex items-center rounded-full px-3 py-1 border border-white border-opacity-30 bg-white bg-opacity-10 backdrop-blur-sm mb-4">
              <span>India's Premier B2B Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
              <span className="block">Streamline Your</span>
              <span className="block bg-gradient-to-r from-white to-[#FFC107] bg-clip-text text-transparent">
                Supply Chain with
              </span>
              <span className="block bg-gradient-to-r from-[#FFC107] to-white bg-clip-text text-transparent">
                AI-Powered RFQs
              </span>
            </h1>

            <p className="mt-6 text-xl text-white text-opacity-90 max-w-2xl">
              Bell24h connects Indian buyers with trusted suppliers through intelligent matching, secure transactions, and real-time communication.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href={user ? "/rfq" : "/auth"}>
                <Button 
                  size="lg" 
                  className="relative group overflow-hidden shadow-lg bg-gradient-to-r from-[#FFC107] to-[#FF9800] hover:from-[#FF9800] hover:to-[#FFC107] text-gray-900 border-0" 
                  asChild
                >
                  <a className="w-full px-8 py-5 text-lg font-semibold flex items-center justify-center">
                    Get Started
                    <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity"></span>
                  </a>
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-white border-opacity-50 text-white hover:bg-white hover:bg-opacity-10 hover:text-white" 
                asChild
                onClick={() => setIsPlaying(true)}
              >
                <a className="w-full px-8 py-5 text-lg font-semibold flex items-center justify-center">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Watch Demo
                </a>
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col items-center p-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl border border-white border-opacity-20 transform hover:-translate-y-1 transition-all duration-300 hover:bg-opacity-15">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-[#28A745] bg-opacity-20 text-white mb-3">
                  <Shield className="h-6 w-6" />
                </div>
                <p className="text-center text-base font-medium">GST Verified</p>
              </div>
              <div className="flex flex-col items-center p-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl border border-white border-opacity-20 transform hover:-translate-y-1 transition-all duration-300 hover:bg-opacity-15">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-[#FFC107] bg-opacity-20 text-white mb-3">
                  <BarChart2 className="h-6 w-6" />
                </div>
                <p className="text-center text-base font-medium">Financial Insights</p>
              </div>
              <div className="flex flex-col items-center p-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl border border-white border-opacity-20 transform hover:-translate-y-1 transition-all duration-300 hover:bg-opacity-15">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-[#DC3545] bg-opacity-20 text-white mb-3">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <p className="text-center text-base font-medium">Invoice Discounting</p>
              </div>
              <div className="flex flex-col items-center p-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl border border-white border-opacity-20 transform hover:-translate-y-1 transition-all duration-300 hover:bg-opacity-15">
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-[#007BFF] bg-opacity-20 text-white mb-3">
                  <BriefcaseBusiness className="h-6 w-6" />
                </div>
                <p className="text-center text-base font-medium">AI Matching</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Stats Counter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl border border-white border-opacity-20 p-6 transform hover:-translate-y-2 transition-all duration-300 hover:shadow-xl">
            <p className="text-5xl font-bold bg-gradient-to-r from-white to-[#FFC107] bg-clip-text text-transparent mb-2">500+</p>
            <p className="text-white text-opacity-80">Verified Suppliers</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl border border-white border-opacity-20 p-6 transform hover:-translate-y-2 transition-all duration-300 hover:shadow-xl">
            <p className="text-5xl font-bold bg-gradient-to-r from-white to-[#FFC107] bg-clip-text text-transparent mb-2">95%</p>
            <p className="text-white text-opacity-80">Match Accuracy</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl border border-white border-opacity-20 p-6 transform hover:-translate-y-2 transition-all duration-300 hover:shadow-xl">
            <p className="text-5xl font-bold bg-gradient-to-r from-white to-[#FFC107] bg-clip-text text-transparent mb-2">₹100M+</p>
            <p className="text-white text-opacity-80">Transaction Volume</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl border border-white border-opacity-20 p-6 transform hover:-translate-y-2 transition-all duration-300 hover:shadow-xl">
            <p className="text-5xl font-bold bg-gradient-to-r from-white to-[#FFC107] bg-clip-text text-transparent mb-2">24/7</p>
            <p className="text-white text-opacity-80">Expert Support</p>
          </div>
        </div>
      </div>

      {/* Wave divider at the bottom */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg className="w-full h-auto" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0L60 10C120 20 240 40 360 50C480 60 600 60 720 55C840 50 960 40 1080 35C1200 30 1320 30 1380 30L1440 30V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}