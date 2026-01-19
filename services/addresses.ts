// services/addresses.ts
import { apiFetch } from "./api";

// -- Types --
export type PlacePrediction = {
  place_id: string; // Google returns 'place_id', not 'placeId'
  description: string;
};

export type ResolvedPlace = {
  fullAddress: string;
  street: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
};

export type CreateAddressPayload = {
  label: string;
  fullAddress: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  landmark?: string;
};

// -- Helper to parse Google Components --
function parseGooglePlace(result: any): ResolvedPlace {
  const addressComponents = result.address_components || [];
  const getComponent = (type: string) => 
    addressComponents.find((c: any) => c.types.includes(type))?.long_name || "";

  // Extract fields
  const streetNumber = getComponent("street_number");
  const route = getComponent("route");
  const street = streetNumber ? `${streetNumber} ${route}` : route;
  
  // Fallback for city: Locality -> Admin Level 2 (LGA)
  const city = getComponent("locality") || getComponent("administrative_area_level_2");
  const state = getComponent("administrative_area_level_1");
  const country = getComponent("country");

  return {
    fullAddress: result.formatted_address || "",
    street: street || result.name || "", // Fallback to place name if street is hidden
    city: city || "Lagos", // Default fallback if Google misses it
    state: state || "Lagos",
    country: country || "Nigeria",
    latitude: result.geometry?.location?.lat || 0,
    longitude: result.geometry?.location?.lng || 0,
  };
}

export const addressApi = {
  async create(payload: CreateAddressPayload): Promise<any> {
    return apiFetch("/addresses", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async list(): Promise<any[]> {
    return apiFetch("/addresses", { method: "GET" });
  },

  // ✅ FIX 1: Extract the 'predictions' array from the backend response object
  async autocomplete(input: string): Promise<PlacePrediction[]> {
    const q = input.trim();
    if (!q) return [];
    
    // The backend returns { predictions: [...] }
    const res = await apiFetch<any>(`/addresses/places/autocomplete?input=${encodeURIComponent(q)}`, { method: "GET" });
    
    // Return just the array. If empty or error, return [].
    return res.predictions || []; 
  },

  // ✅ FIX 2: Parse the raw Google result into our App's structure
  async details(placeId: string): Promise<ResolvedPlace> {
    // The backend returns the raw Google Place result object
    const res = await apiFetch<any>(`/addresses/places/details/${encodeURIComponent(placeId)}`, { method: "GET" });
    
    // Parse it
    return parseGooglePlace(res);
  },
};