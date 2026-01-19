"use client";

import React, { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/Input";
import { addressApi, type PlacePrediction, type ResolvedPlace } from "@/services/addresses";
import { Loader2, Search, MapPin } from "lucide-react";

type Props = {
  value: string;
  onResolved: (place: ResolvedPlace | null) => void;
  onChangeText: (text: string) => void;
  placeholder?: string;
  className?: string;
};

export default function AddressAutocomplete({
  value,
  onResolved,
  onChangeText,
  placeholder = "Search address...",
  className
}: Props) {
  // Local state for the input text
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // ✅ CRITICAL FIX 1: Sync local state when parent value updates
  // This ensures the box populates when you select an address
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    // Don't search if query matches the current value (prevents loop after selection)
    if (!query || query.length < 3 || query === value) {
      setResults([]);
      return;
    }

    const t = setTimeout(async () => {
      try {
        setLoading(true);
        const r = await addressApi.autocomplete(query);
        setResults(r || []);
        setShowDropdown(true);
      } catch (e) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(t);
  }, [query]); // Removed 'value' from dependency to avoid loop

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const txt = e.target.value;
    setQuery(txt);
    onChangeText(txt);
    onResolved(null); // Clear the pin if user edits manually
    setShowDropdown(true);
  };

  const handleSelect = async (p: PlacePrediction) => {
    try {
      setLoading(true);
      setShowDropdown(false);
      
      // Update UI immediately with the description
      setQuery(p.description);
      onChangeText(p.description);

      // Fetch lat/lng details
      const details = await addressApi.details(p.place_id);
      
      // ✅ CRITICAL FIX 2: Force update with full address from details
      if (details.fullAddress) {
        setQuery(details.fullAddress);
        onChangeText(details.fullAddress);
      }
      
      onResolved(details); 
    } catch (e) {
      console.error("Details error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative ${className || ""}`}>
      <div className="relative">
        <Input
          value={query}
          onChange={handleInputChange}
          onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
          onBlur={() => {
            // Delay closing so click can register
            setTimeout(() => setShowDropdown(false), 200);
          }}
          placeholder={placeholder}
          className="pl-10"
        />
        <div className="absolute left-3 top-3.5 text-slate-400">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-gas-teal" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </div>
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] shadow-2xl ring-1 ring-black/20">
          {results.map((r) => (
            <button
              key={r.place_id}
              type="button"
              // ✅ CRITICAL FIX 3: Use onMouseDown to prevent Blur from killing the click
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(r);
              }}
              className="flex w-full items-start gap-3 border-b border-white/5 px-4 py-3 text-left transition hover:bg-white/5 last:border-0"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gas-teal/70" />
              <span className="text-sm text-slate-300">{r.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}