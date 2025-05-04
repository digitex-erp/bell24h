import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string, currency = "INR"): string {
  if (typeof amount === "string") {
    amount = parseFloat(amount);
  }
  
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
}

export function formatDate(date: Date | string): string {
  if (!date) return "";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(dateObj);
}

export function formatDatetime(date: Date | string): string {
  if (!date) return "";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

export function calculateDaysLeft(endDate: Date | string): number {
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;
  const now = new Date();
  
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

export function getStatusBadgeClass(status: string): string {
  const statusMap: Record<string, string> = {
    active: "status-badge-active",
    open: "status-badge-active",
    pending: "status-badge-pending",
    "in transit": "status-badge-active",
    processing: "status-badge-pending",
    delivered: "status-badge-completed",
    awarded: "status-badge-completed",
    closed: "status-badge-completed",
    cancelled: "status-badge-danger",
    rejected: "status-badge-danger",
    failed: "status-badge-danger",
  };
  
  return statusMap[status.toLowerCase()] || "status-badge-pending";
}

export function createWebSocketConnection(): WebSocket {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  return new WebSocket(wsUrl);
}
