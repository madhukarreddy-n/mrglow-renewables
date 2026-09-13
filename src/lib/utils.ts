import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatInr(amount: number, compact = false) {
  if (compact && Math.abs(amount) >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (compact && Math.abs(amount) >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: amount >= 100 ? 0 : 2,
  }).format(amount);
}

export function formatNumber(n: number, digits = 0) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(n);
}

export function whatsappLink(phone: string, text?: string) {
  const digits = phone.replace(/\D/g, "");
  const withCc = digits.length === 10 ? `91${digits}` : digits;
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${withCc}${q}`;
}

export function telLink(phone: string) {
  return `tel:+91${phone.replace(/\D/g, "").slice(-10)}`;
}

