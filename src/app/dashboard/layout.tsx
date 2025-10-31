import { DashboardLayout } from "lucide-react";\nimport DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
