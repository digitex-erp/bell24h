// Type definitions for modules

// For @/hooks/use-auth
declare module '@/hooks/use-auth' {
  export function useAuth(): any;
}

// For @/hooks/use-rfqs
declare module '@/hooks/use-rfqs' {
  export function useRFQs(): { rfqs: any[]; isLoadingRFQs: boolean };
}

// For @/hooks/use-messages
declare module '@/hooks/use-messages' {
  export function useMessages(): { getMessages: () => any[]; isLoadingMessages: boolean };
}

// For @/components/layout/main-layout
declare module '@/components/layout/main-layout' {
  import { ReactNode } from 'react';
  export const MainLayout: ({ children }: { children: ReactNode }) => JSX.Element;
}

// For @/components/dashboard/stats-card
declare module '@/components/dashboard/stats-card' {
  export const StatsCard: (props: any) => JSX.Element;
}

// For @/components/dashboard/rfq-table
declare module '@/components/dashboard/rfq-table' {
  export const RFQTable: (props: any) => JSX.Element;
}

// For @/components/dashboard/messages-list
declare module '@/components/dashboard/messages-list' {
  export const MessagesList: (props: any) => JSX.Element;
}

// For @/components/dashboard/supplier-risk-chart
declare module '@/components/dashboard/supplier-risk-chart' {
  export const SupplierRiskChart: (props: any) => JSX.Element;
}

// For @/components/dashboard/quick-actions
declare module '@/components/dashboard/quick-actions' {
  export const QuickActions: (props: any) => JSX.Element;
}

// For @/components/rfq/create-rfq-form
declare module '@/components/rfq/create-rfq-form' {
  export const CreateRFQForm: (props: any) => JSX.Element;
}

// For @/components/ui/skeleton
declare module '@/components/ui/skeleton' {
  export const Skeleton: (props: any) => JSX.Element;
}

// For lucide-react icons
declare module 'lucide-react' {
  export * from 'lucide-react';
}

// For wouter
declare module 'wouter' {
  export function useLocation(): [string, (to: string) => void];
  export function useRoute(pattern: string): [boolean, { [key: string]: string }];
  export function useRouter(): {
    push: (to: string) => void;
    replace: (to: string) => void;
  };
  export const Route: React.ComponentType<{ path: string; component: React.ComponentType }>;
  export const Link: React.ComponentType<{ to: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>>;
  export const Switch: React.ComponentType;
  export const useNavigate: () => (to: string, options?: { replace?: boolean }) => void;
}

// For @/components/ai/ExplanationCard
declare module '@/components/ai/ExplanationCard' {
  import { ReactNode } from 'react';
  
  interface ModelExplanation {
    // Define the shape of your explanation object here
    [key: string]: any;
  }
  
  interface ExplanationCardProps {
    explanation: ModelExplanation;
    loading?: boolean;
    error?: string | null;
    onExport?: (format: 'json' | 'csv' | 'pdf' | 'png') => void;
    className?: string;
  }
  
  const ExplanationCard: React.FC<ExplanationCardProps>;
  export default ExplanationCard;
}
