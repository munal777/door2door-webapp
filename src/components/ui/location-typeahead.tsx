import React, { useState, useEffect, useRef } from "react";
import { pricingService } from "@/services/pricingService";
import type { PublicLocation } from "@/types/pricing";
import { Input } from "./input";
import { Label } from "./label";
import { Loader2, MapPin, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationTypeaheadProps {
  id?: string;
  label?: string;
  value: string;
  onLocationSelect: (location: { city: string; state: string }) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
}

export const LocationTypeahead: React.FC<LocationTypeaheadProps> = ({
  id,
  label,
  value,
  onLocationSelect,
  placeholder = "Start typing city name...",
  required = false,
  disabled = false,
  className = "",
  inputClassName,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<PublicLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounced search
  useEffect(() => {
    const delayTimer = setTimeout(() => {
      if (inputValue.trim().length >= 2) {
        fetchLocations(inputValue.trim());
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayTimer);
  }, [inputValue]);

  const fetchLocations = async (searchTerm: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await pricingService.getPublicLocations({
        search: searchTerm,
      });

      if (response.IsSuccess && response.Result) {
        // Backend already filters for active locations
        setSuggestions(response.Result);
        setShowDropdown(response.Result.length > 0);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    } catch (err) {
      console.error("Failed to fetch locations:", err);
      setError("Failed to load locations");
      setSuggestions([]);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Clear the selection when user types
    if (newValue === "") {
      onLocationSelect({ city: "", state: "" });
    }
  };

  const handleSelectLocation = (location: PublicLocation) => {
    const displayValue = `${location.city}, ${location.state}`;
    setInputValue(displayValue);
    onLocationSelect({
      city: location.city,
      state: location.state,
    });
    setShowDropdown(false);
    setSuggestions([]);
  };

  return (
    <div ref={wrapperRef} className={cn("relative space-y-2", className)}>
      {label && (
        <Label htmlFor={id}>
          {label} {required && <span className="text-red-600">*</span>}
        </Label>
      )}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <MapPin size={16} />
        </div>
        <Input
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={cn("pl-10 pr-10", inputClassName)}
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Loader2 size={16} className="animate-spin" />
          </div>
        )}
        {error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
            <AlertCircle size={16} />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-border/70 bg-popover shadow-md">
          {suggestions.map((location, index) => (
            <button
              key={`${location.city}-${location.state}-${index}`}
              type="button"
              onClick={() => handleSelectLocation(location)}
              className="w-full border-b border-border/60 px-4 py-3 text-left transition-colors hover:bg-accent focus:bg-accent focus:outline-none last:border-b-0"
            >
              <div className="flex items-start gap-2">
                <MapPin
                  size={16}
                  className="mt-1 shrink-0 text-muted-foreground"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground">
                    {location.city}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {location.state}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showDropdown && suggestions.length === 0 && !isLoading && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border/70 bg-popover p-4 text-center text-sm text-muted-foreground shadow-md">
          No locations found for "{inputValue}"
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}

      {/* Hint text */}
      {!error &&
        !showDropdown &&
        inputValue.length > 0 &&
        inputValue.length < 2 && (
          <p className="mt-1 text-xs text-muted-foreground">
            Type at least 2 characters to search
          </p>
        )}
    </div>
  );
};

export default LocationTypeahead;
