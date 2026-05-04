import { Search, X, Loader2, PackageSearch } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface BatchSearchBarProps {
  onSearch: (bucketNumber: string) => void;
  isLoading: boolean;
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
}

export default function BatchSearchBar({
  onSearch,
  isLoading,
  value,
  onChange,
  onClear,
}: BatchSearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim()) {
      onSearch(value.trim());
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-indigo-600 rounded-md">
          <PackageSearch className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Search Shipment Batch</h2>
          <p className="text-xs text-gray-500">Enter a batch number to load and record a tracking scan event</p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            id="batch-search-input"
            placeholder="e.g. 10270504"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="pl-10 pr-10 h-11 border-gray-300 text-base font-mono focus-visible:ring-indigo-600 focus-visible:border-indigo-600"
          />
          {value && (
            <button
              onClick={onClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          id="batch-search-btn"
          onClick={() => value.trim() && onSearch(value.trim())}
          disabled={isLoading || !value.trim()}
          className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>
    </div>
  );
}
