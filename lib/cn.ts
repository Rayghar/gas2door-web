import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ✅ NEW: Helper to extract arrays from unpredictable API responses
export function extractArray<T>(response: any): T[] {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  // Common backend pagination patterns
  if (Array.isArray(response.docs)) return response.docs;
  if (Array.isArray(response.orders)) return response.orders;
  if (Array.isArray(response.data)) return response.data;
  return [];
}

// ✅ NEW: Helper to safely get an ID
export function getId(item: any): string {
  return item?.id || item?._id || "";
}