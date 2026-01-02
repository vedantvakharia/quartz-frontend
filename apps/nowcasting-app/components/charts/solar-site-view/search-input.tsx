import React from "react";
import useGlobalState from "../../helpers/globalState";
import { AGGREGATION_LEVELS } from "../../../constant";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
}

export const SitesSearchInput: React.FC<SearchInputProps> = ({
  placeholder = "Search by DNO, GSP, or Client Site ID...",
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useGlobalState("sitesSearchTerm");
  const [, setAggregationLevel] = useGlobalState("aggregationLevel");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Auto-switch to Site view when user starts typing
    // This ensures GSP ID and Client Site ID searches work properly
    if (value.trim().length > 0) {
      setAggregationLevel(AGGREGATION_LEVELS.SITE);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 pr-10 bg-ocf-gray-800 text-white 
                   border border-ocf-gray-700 rounded-md 
                   focus:outline-none focus:ring-2 focus:ring-ocf-yellow-500 
                   placeholder-ocf-gray-400 text-sm"
        aria-label="Search solar sites"
      />
      {searchTerm && (
        <button
          onClick={handleClear}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 
                     text-ocf-gray-400 hover:text-white transition-colors"
          aria-label="Clear search"
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SitesSearchInput;
