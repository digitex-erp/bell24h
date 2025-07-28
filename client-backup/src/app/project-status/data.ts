export interface StatusItem {
  name: string;
  status: "Complete" | "Partially Implemented" | "Minimal" | "Basic" | "Not Started";
  incomplete: number;
}

export interface ProjectData {
  features: StatusItem[];
  services: StatusItem[];
  apiEndpoints: StatusItem[];
  infrastructure: StatusItem[];
  testing: StatusItem[];
}

export const mockData: ProjectData = {
  features: [
    { name: "Escrow Functionality", status: "Complete", incomplete: 0 },
    { name: "Wallet System", status: "Partially Implemented", incomplete: 15 },
    { name: "API Endpoints", status: "Partially Implemented", incomplete: 20 },
    { name: "Testing Infrastructure", status: "Partially Implemented", incomplete: 40 },
    { name: "Database Schema", status: "Complete", incomplete: 0 },
    { name: "RBAC & Security", status: "Partially Implemented", incomplete: 20 },
    { name: "UI/Component Testing", status: "Partially Implemented", incomplete: 40 },
    { name: "Performance/Monitoring", status: "Not Started", incomplete: 100 }
  ],
  services: [
    { name: "EscrowService", status: "Complete", incomplete: 0 },
    { name: "WalletService", status: "Partially Implemented", incomplete: 15 },
    { name: "EmailService", status: "Minimal", incomplete: 80 },
    { name: "Logger/Utils", status: "Basic", incomplete: 50 }
  ],
  apiEndpoints: [
    { name: "/api/escrow/hold", status: "Complete", incomplete: 0 },
    { name: "/api/escrow/release", status: "Partially Implemented", incomplete: 20 },
    { name: "/api/escrow/refund", status: "Partially Implemented", incomplete: 20 },
    { name: "/api/wallet/*", status: "Partially Implemented", incomplete: 20 },
    { name: "Other APIs (General)", status: "Partially Implemented", incomplete: 30 }
  ],
  infrastructure: [
    { name: "Prisma/Database", status: "Complete", incomplete: 0 },
    { name: "Express Server", status: "Partially Implemented", incomplete: 20 },
    { name: "Environment Config", status: "Complete", incomplete: 0 }
  ],
  testing: [
    { name: "Unit Testing", status: "Partially Implemented", incomplete: 30 },
    { name: "Integration Testing", status: "Not Started", incomplete: 100 },
    { name: "E2E Testing", status: "Not Started", incomplete: 100 },
    { name: "Accessibility Testing", status: "Not Started", incomplete: 100 },
    { name: "Performance Testing", status: "Not Started", incomplete: 100 },
    { name: "Cross-Browser Testing", status: "Not Started", incomplete: 100 }
  ]
};
