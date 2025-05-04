import React from 'react';
import { Route, Switch } from 'wouter';
import { useMobile } from './hooks/use-mobile';
import { 
  OnboardingProvider, 
  OnboardingTrigger, 
  OnboardingButton,
  OnboardingMenu,
  OnboardingNotificationsProvider
} from './components/onboarding';
import { NotificationsProvider } from './hooks/use-notifications';
import { NotificationCenter, AlertServiceConnector } from './components/notifications';

// Import pages
import ProcurementAssistantPage from './pages/procurement-assistant';
import ProcurementChallengesPage from './pages/procurement-challenges';
import NotFoundPage from './pages/not-found';
// import Dashboard from './pages/dashboard';
// import Suppliers from './pages/suppliers';

// Import icons
import {
  FileText,
  BarChart4,
  TrendingUp,
  Shield,
  Mic,
  Brain,
  HelpCircle,
  Award,
  Menu as MenuIcon
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';

// Home page
const Home = () => {
  const isMobile = useMobile();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <header className="w-full max-w-6xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Bell24h</h1>
        <div className="flex items-center space-x-2">
          <OnboardingButton 
            flowId="main-onboarding" 
            withTooltip={true}
            tooltipText="Start a guided tour of Bell24h"
          >
            <HelpCircle className="h-4 w-4 mr-1" />
            Help
          </OnboardingButton>
          
          <NotificationCenter />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MenuIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Quick Navigation</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <a href="/rfqs" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  RFQ Management
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href="/suppliers" className="flex items-center">
                  <BarChart4 className="h-4 w-4 mr-2" />
                  Supplier Directory
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href="/procurement-assistant" className="flex items-center">
                  <Brain className="h-4 w-4 mr-2" />
                  AI Assistant
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href="/dashboard" className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Dashboard
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href="/procurement-challenges" className="flex items-center">
                  <Award className="h-4 w-4 mr-2" />
                  Procurement Challenges
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      <p className="text-gray-600 mb-8">
        Welcome to Bell24h - Your AI-Powered Procurement Platform
        <span className="text-xs text-gray-400 ml-2">
          ({isMobile ? "Mobile" : "Desktop"} version)
        </span>
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl">
        <OnboardingTrigger id="supplier-matching" className="card p-6 bg-white shadow rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
          <FileText className="h-10 w-10 text-primary mb-3" />
          <h2 className="text-xl font-semibold mb-2">RFQ Management</h2>
          <p className="text-gray-600 mb-4">Create and manage request for quotes</p>
          <div className="flex flex-wrap gap-2">
            <a href="/rfqs" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              View RFQs
            </a>
            <OnboardingTrigger id="voice-rfq-trigger" className="inline-block">
              <a href="/voice-rfq" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 voice-rfq-button">
                <Mic className="h-4 w-4 mr-2" />
                Voice RFQ
              </a>
            </OnboardingTrigger>
          </div>
        </OnboardingTrigger>
        
        <OnboardingTrigger id="risk-scoring-intro" className="card p-6 bg-white shadow rounded-lg border border-gray-100 hover:shadow-md transition-shadow risk-scoring-intro">
          <BarChart4 className="h-10 w-10 text-orange-500 mb-3" />
          <h2 className="text-xl font-semibold mb-2">Supplier Risk Scoring</h2>
          <p className="text-gray-600 mb-4">Evaluate suppliers with Aladin-inspired risk assessment</p>
          <a href="/risk-scoring" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            View Risk Scores
          </a>
        </OnboardingTrigger>
        
        <OnboardingTrigger id="market-insights-intro" className="card p-6 bg-white shadow rounded-lg border border-gray-100 hover:shadow-md transition-shadow market-insights">
          <TrendingUp className="h-10 w-10 text-green-500 mb-3" />
          <h2 className="text-xl font-semibold mb-2">Market Insights</h2>
          <p className="text-gray-600 mb-4">Real-time trends and predictions for your industry</p>
          <div className="space-y-2">
            <div className="price-forecast bg-gray-50 p-2 rounded-md text-sm text-gray-700">
              Steel Price Forecast: <span className="text-green-600">+2.8%</span>
            </div>
            <div className="supply-chain-status bg-gray-50 p-2 rounded-md text-sm text-gray-700">
              Supply Chain Status: <span className="text-primary-600">Stable</span>
            </div>
          </div>
          <div className="mt-3">
            <a href="/market-insights" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              View Full Insights
            </a>
          </div>
        </OnboardingTrigger>
        
        <OnboardingTrigger id="procurement-assistant" className="card p-6 bg-white shadow rounded-lg border border-gray-100 hover:shadow-md transition-shadow procurement-chatbot ai-assistant">
          <Brain className="h-10 w-10 text-rose-500 mb-3" />
          <h2 className="text-xl font-semibold mb-2">AI Procurement Assistant</h2>
          <p className="text-gray-600 mb-4">Get AI-powered procurement recommendations</p>
          <div className="assistant-query-box bg-gray-50 p-2 rounded-md text-sm text-gray-500 mb-3">
            Ask me anything about procurement...
          </div>
          <div className="assistant-tools flex gap-2 mb-3">
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20">RFQ Generator</span>
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20">Compare Suppliers</span>
          </div>
          <a href="/procurement-assistant" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            Open Assistant
          </a>
        </OnboardingTrigger>
        
        <OnboardingTrigger id="blockchain-payments" className="card p-6 bg-white shadow rounded-lg border border-gray-100 hover:shadow-md transition-shadow blockchain-payments blockchain-intro">
          <Shield className="h-10 w-10 text-blue-500 mb-3" />
          <h2 className="text-xl font-semibold mb-2">Blockchain Payments</h2>
          <p className="text-gray-600 mb-4">Manage secure blockchain transactions</p>
          <div className="milestone-creator bg-gray-50 p-2 rounded-md text-sm text-gray-700 mb-3">
            Active Milestones: <span className="text-primary-600">2</span>
          </div>
          <div className="flex flex-col space-y-2">
            <a href="/blockchain-payment" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              Payment Center
            </a>
            <a href="/milestone-approval" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 milestone-approval">
              Milestone Approvals
            </a>
          </div>
        </OnboardingTrigger>
        
        <OnboardingTrigger id="analytics-intro" className="card p-6 bg-white shadow rounded-lg border border-gray-100 hover:shadow-md transition-shadow analytics-dashboard">
          <BarChart4 className="h-10 w-10 text-violet-500 mb-3" />
          <h2 className="text-xl font-semibold mb-2">Analytics Dashboard</h2>
          <p className="text-gray-600 mb-4">Analyze your procurement metrics</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="rfq-metrics bg-gray-50 p-2 rounded-md text-sm text-gray-700">
              RFQ Success: <span className="text-green-600">78%</span>
            </div>
            <div className="supplier-metrics bg-gray-50 p-2 rounded-md text-sm text-gray-700">
              Suppliers: <span className="text-primary-600">42</span>
            </div>
            <div className="cost-savings bg-gray-50 p-2 rounded-md text-sm text-gray-700">
              Savings: <span className="text-green-600">₹2.3L</span>
            </div>
            <div className="custom-reports bg-gray-50 p-2 rounded-md text-sm text-gray-700">
              Reports: <span className="text-primary-600">7</span>
            </div>
          </div>
          <a href="/dashboard" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            View Dashboard
          </a>
        </OnboardingTrigger>
        
        <OnboardingTrigger id="procurement-challenges-intro" className="card p-6 bg-white shadow rounded-lg border border-gray-100 hover:shadow-md transition-shadow procurement-challenges">
          <Award className="h-10 w-10 text-amber-500 mb-3" />
          <h2 className="text-xl font-semibold mb-2">Procurement Challenges</h2>
          <p className="text-gray-600 mb-4">Test your procurement skills with interactive challenges</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="challenge-metrics bg-gray-50 p-2 rounded-md text-sm text-gray-700">
              Your Points: <span className="text-amber-600">2,500</span>
            </div>
            <div className="ranking-metrics bg-gray-50 p-2 rounded-md text-sm text-gray-700">
              Ranking: <span className="text-primary-600">#4</span>
            </div>
            <div className="completed-metrics bg-gray-50 p-2 rounded-md text-sm text-gray-700">
              Completed: <span className="text-green-600">2</span>
            </div>
            <div className="available-metrics bg-gray-50 p-2 rounded-md text-sm text-gray-700">
              Available: <span className="text-primary-600">6</span>
            </div>
          </div>
          <a href="/procurement-challenges" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            Start Challenges
          </a>
        </OnboardingTrigger>
      </div>
      
      <div className="mt-8 p-6 border rounded-lg bg-white shadow max-w-6xl w-full">
        <h3 className="text-lg font-semibold mb-4">Guided Platform Tours</h3>
        <p className="text-gray-600 mb-4">
          New to Bell24h? Take our interactive guided tours to learn about the platform's features.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <OnboardingButton 
            flowId="main-onboarding" 
            variant="default"
            className="justify-start"
          >
            <FileText className="h-4 w-4 mr-2" />
            Platform Overview
          </OnboardingButton>
          <OnboardingButton 
            flowId="voice-rfq-tutorial" 
            variant="outline"
            className="justify-start"
          >
            <Mic className="h-4 w-4 mr-2" />
            Voice RFQ Guide
          </OnboardingButton>
          <OnboardingButton 
            flowId="blockchain-tutorial" 
            variant="outline"
            className="justify-start"
          >
            <Shield className="h-4 w-4 mr-2" />
            Blockchain Payments
          </OnboardingButton>
          <OnboardingButton 
            flowId="risk-scoring-tutorial" 
            variant="outline"
            className="justify-start"
          >
            <BarChart4 className="h-4 w-4 mr-2" />
            Risk Scoring Guide
          </OnboardingButton>
          <OnboardingButton 
            flowId="market-insights-tutorial" 
            variant="outline"
            className="justify-start"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Market Insights
          </OnboardingButton>
          <OnboardingButton 
            flowId="ai-assistant-tutorial" 
            variant="outline"
            className="justify-start"
          >
            <Brain className="h-4 w-4 mr-2" />
            AI Assistant Guide
          </OnboardingButton>
          <OnboardingButton 
            flowId="procurement-challenges-tutorial" 
            variant="outline"
            className="justify-start"
          >
            <Award className="h-4 w-4 mr-2" />
            Procurement Challenges
          </OnboardingButton>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <NotificationsProvider>
      <OnboardingProvider>
        <div className="app">
          <div className="fixed top-4 right-4 z-50">
            <OnboardingMenu 
              compact={true} 
              title="Guided Tours" 
            />
          </div>
          
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/procurement-assistant" component={ProcurementAssistantPage} />
            <Route path="/procurement-challenges" component={ProcurementChallengesPage} />
            <Route component={NotFoundPage} />
          </Switch>
          
          {/* Toast notifications */}
          <Toaster />
          
          {/* Connect AlertService to Notifications */}
          <AlertServiceConnector />
          
          {/* Connect Onboarding with Notifications */}
          <OnboardingNotificationsProvider />
        </div>
      </OnboardingProvider>
    </NotificationsProvider>
  );
};

export default App;