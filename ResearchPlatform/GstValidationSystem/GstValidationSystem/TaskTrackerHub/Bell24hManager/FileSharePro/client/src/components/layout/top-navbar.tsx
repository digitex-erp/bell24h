import { Bell } from "lucide-react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopNavbar() {
  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-secondary-100">
      <Button 
        variant="ghost" 
        size="icon"
        className="lg:hidden px-4 text-secondary-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Open sidebar</span>
      </Button>

      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex items-center">
          <h1 className="text-xl font-semibold text-secondary-900">Bell24h Deployment Assistant</h1>
        </div>
        <div className="ml-4 flex items-center md:ml-6">
          <Button 
            variant="ghost" 
            size="icon"
            className="bg-white p-1 rounded-full text-secondary-500 hover:text-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <Bell className="h-6 w-6" />
            <span className="sr-only">View notifications</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
