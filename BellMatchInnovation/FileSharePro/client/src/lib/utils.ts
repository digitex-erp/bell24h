import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, formatString: string = "MMM dd, yyyy"): string {
  if (!date) return "";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, formatString);
}

export function formatCurrency(value: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function getInitials(name: string): string {
  if (!name) return "";
  
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  
  return `${text.substring(0, maxLength)}...`;
}

export function getRandomAvatar(seed: string | number): string {
  const id = typeof seed === "string" ? seed : seed.toString();
  // Use a consistent avatar service with seed to get reproducible avatars
  return `https://avatars.dicebear.com/api/initials/${encodeURIComponent(id)}.svg`;
}

export function getRiskLevelColor(level: string): string {
  switch (level?.toLowerCase()) {
    case "low": return "bg-green-100 text-green-800";
    case "medium": return "bg-yellow-100 text-yellow-800";
    case "high": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

export function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case "active": return "bg-green-100 text-green-800";
    case "pending": return "bg-amber-100 text-amber-800";
    case "draft": return "bg-gray-100 text-gray-800";
    case "closed": return "bg-blue-100 text-blue-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

export function parseWebSocketMessage(data: string): any {
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to parse WebSocket message:", error);
    return null;
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

export function calculateMatchColor(score: number): string {
  if (score >= 90) return "text-green-600";
  if (score >= 75) return "text-blue-600";
  if (score >= 60) return "text-yellow-600";
  return "text-gray-600";
}
