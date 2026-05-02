import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Icon } from "@iconify/react";
import { SuggestedPlace } from "../hooks/usePlaceSuggestions";
import { useRouteStore } from "../store/routeStore";

interface PlaceAutocompleteProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: SuggestedPlace[];
  isLoading: boolean;
  delay?: number;
  icon?: string;
  locationType: "from" | "to";
}

const PlaceAutocomplete = ({
  label,
  placeholder,
  value,
  onChange,
  suggestions,
  isLoading,
  delay = 0,
  icon = "mdi:map-marker",
  locationType,
}: PlaceAutocompleteProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFromSuggestion, setIsFromSuggestion] = useState(false);
  const { setFrom, setTo } = useRouteStore();
  const mouseDownOnSuggestion = useRef(false);

  // Memoize input validity check
  const isValidInput = useMemo(
    () => isFromSuggestion && value,
    [isFromSuggestion, value]
  );

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Memoize suggestion rendering logic to prevent unnecessary re-renders
  const handleSelectPlace = useCallback(
    (suggestion: SuggestedPlace) => {
      onChange(suggestion.formatted);
      setIsFromSuggestion(true);

      const locationData = {
        name: suggestion.name,
        formattedAddress: suggestion.formatted,
        latitude: suggestion.lat,
        longitude: suggestion.lon,
      };

      if (locationType === "from") {
        setFrom(locationData);
      } else {
        setTo(locationData);
      }

      setShowSuggestions(false);
    },
    [onChange, setFrom, setTo, locationType]
  );

  const renderedSuggestions = useMemo(() => {
    if (!showSuggestions || (!value && !suggestions.length)) return null;

    if (isLoading) {
      return (
        <div className="p-4 flex items-center justify-center text-gray-500">
          <Icon icon="mdi:loading" className="animate-spin mr-2" />
          <span>Searching places...</span>
        </div>
      );
    }

    if (suggestions.length > 0) {
      return suggestions.map((suggestion, index) => (
        <motion.div
          key={index}
          className="p-3 hover:bg-yellow-50 cursor-pointer flex items-center border-b border-gray-100 last:border-b-0"
          whileHover={{ backgroundColor: "#fef3c7" }}
          onMouseDown={() => {
            // Mark that we're clicking on a suggestion
            mouseDownOnSuggestion.current = true;
          }}
          onClick={() => {
            handleSelectPlace(suggestion);
          }}
        >
          <Icon icon="mdi:map-marker" className="mr-2 text-yellow-400" />
          <div className="flex flex-col">
            <span className="font-medium">{suggestion.name}</span>
            <span className="text-sm text-gray-500">
              {suggestion.formatted}
            </span>
          </div>
        </motion.div>
      ));
    }

    if (value) {
      return <div className="p-4 text-gray-500">No results found</div>;
    }

    return null;
  }, [showSuggestions, value, suggestions, isLoading, handleSelectPlace]);

  const clearInput = () => {
    onChange("");
    if (locationType === "from") {
      setFrom(null);
    } else {
      setTo(null);
    }
    setIsFromSuggestion(false);
  };

  const handleBlur = () => {
    setIsFocused(false);

    // Only clear if we're not clicking on a suggestion
    if (!mouseDownOnSuggestion.current && !isFromSuggestion && value) {
      // Give time for any click events to process
      setTimeout(() => {
        clearInput();
      }, 200);
    }

    // Reset the ref for next interaction
    mouseDownOnSuggestion.current = false;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsFromSuggestion(false);
  };

  return (
    <motion.div
      className="relative w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <label className="block text-gray-700 font-medium mb-2">
        {label}
        {isValidInput && (
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block ml-2 text-green-500"
          >
            <Icon icon="mdi:check-circle" className="inline text-sm" />
          </motion.span>
        )}
      </label>
      <div
        className={`relative flex items-center border-2 rounded-lg overflow-hidden 
          ${
            isFocused
              ? "border-yellow-400 ring-2 ring-yellow-200"
              : isValidInput
              ? "border-green-400"
              : "border-gray-300"
          }`}
        onClick={(e) => {
          e.stopPropagation();
          setShowSuggestions(true);
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute left-3 text-gray-500"
        >
          <Icon icon={icon} className="text-xl" />
        </motion.div>
        <input
          type="text"
          className="w-full py-3 px-10 outline-none bg-white text-gray-700"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            setIsFocused(true);
            setShowSuggestions(true);
          }}
          onBlur={handleBlur}
        />
        {value && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute right-3 text-gray-400 hover:text-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              clearInput();
            }}
          >
            <Icon icon="mdi:close-circle" />
          </motion.button>
        )}
      </div>

      {/* Fixed-height container for validation messages */}
      <div className="h-6 min-h-6">
        {!isFromSuggestion && value && (
          <div className="text-yellow-600 text-sm mt-1">
            <Icon icon="mdi:information" className="inline-block mr-1" />
            Please select a location from the suggestions
          </div>
        )}
      </div>

      <AnimatePresence>
        {showSuggestions && (value || suggestions.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
          >
            {renderedSuggestions}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default PlaceAutocomplete;
