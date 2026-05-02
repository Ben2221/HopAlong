import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import Map from "../components/Map";
import { usePlaceSuggestions } from "../hooks/usePlaceSuggestions";
import PlaceAutocomplete from "../components/PlaceAutocomplete";
import DateTimePicker from "../components/DateTimePicker";
import Button from "../components/Button";
import { useRouteStore } from "../store/routeStore";

const CreateRide = () => {
  const navigate = useNavigate();
  const resetRouteStore = useRouteStore((state) => state.resetOnPageLoad);
  const storeFrom = useRouteStore((state) => state.from);
  const storeTo = useRouteStore((state) => state.to);
  const setRideDateTime = useRouteStore((state) => state.setRideDateTime);

  useEffect(() => {
    resetRouteStore();
  }, [resetRouteStore]);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [maxRiders, setMaxRiders] = useState(4);

  // Memoize expensive API calls and computations
  const { suggestions: fromSuggestions, isLoading: isLoadingFrom } =
    usePlaceSuggestions(fromQuery);

  const { suggestions: toSuggestions, isLoading: isLoadingTo } =
    usePlaceSuggestions(toQuery);

  // Memoize validation states
  const isLocationSelectionValid = useMemo(() => {
    return !!storeFrom && !!storeTo;
  }, [storeFrom, storeTo]);

  const isTimeSelectionValid = useMemo(() => {
    return !!selectedDateTime;
  }, [selectedDateTime]);

  // Handle input changes
  const handleFromChange = (value: string) => {
    setFrom(value);
    setFromQuery(value);
  };

  const handleToChange = (value: string) => {
    setTo(value);
    setToQuery(value);
  };

  const handleShowTimePicker = () => {
    setShowTimePicker(true);
  };

  const handleDateTimeSelected = useCallback((dateTime: Date | null) => {
    setSelectedDateTime(dateTime);
  }, []);

  const handleConfirmRide = () => {
    if (!selectedDateTime) return;

    setRideDateTime(selectedDateTime);
    useRouteStore.getState().setCarpoolOptions(isPublic, maxRiders);

    navigate("/finding-ride");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Section */}
      <motion.header
        className="bg-white shadow-md py-4 px-6 flex items-center justify-between flex-shrink-0"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
          >
            <Icon icon="mdi:account" className="text-white text-2xl" />
          </motion.div>
          <h1 className="text-xl font-bold text-gray-800">Create Ride</h1>
        </div>
      </motion.header>

      {/* Map Section - Make it grow to fill available space */}
      <div className="flex-1 flex min-h-[40vh]">
        <Map />
      </div>

      {/* Ride Details Section - Fixed height */}
      <motion.div
        className="bg-white shadow-lg p-6 flex-shrink-0"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {!showTimePicker ? (
              <motion.div
                key="location-selection"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <PlaceAutocomplete
                    label="From"
                    placeholder="Enter pickup location"
                    value={from}
                    onChange={handleFromChange}
                    suggestions={fromSuggestions}
                    isLoading={isLoadingFrom}
                    icon="mdi:map-marker-radius"
                    locationType="from"
                    delay={0.1}
                  />

                  <PlaceAutocomplete
                    label="To"
                    placeholder="Enter destination"
                    value={to}
                    onChange={handleToChange}
                    suggestions={toSuggestions}
                    isLoading={isLoadingTo}
                    icon="mdi:map-marker-check"
                    locationType="to"
                    delay={0.2}
                  />
                </div>

                <div className="flex justify-center my-8">
                  <Button
                    icon="mdi:clock-outline"
                    onClick={handleShowTimePicker}
                    disabled={!isLocationSelectionValid}
                  >
                    Choose time
                  </Button>
                </div>

                {/* Error message container - always present in DOM */}
                <div className="h-6 min-h-6">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isLocationSelectionValid ? 0 : 1 }}
                    style={{
                      visibility: isLocationSelectionValid
                        ? "hidden"
                        : "visible",
                    }}
                    className="text-center text-yellow-600 text-sm"
                  >
                    <Icon
                      icon="mdi:information"
                      className="inline-block mr-1"
                    />
                    Please select both pickup and destination locations
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="time-selection"
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <DateTimePicker onDateTimeSelected={handleDateTimeSelected} />

                <div className="bg-gray-50 p-4 rounded-xl mb-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-800">Public Ride (Carpool)</h4>
                      <p className="text-xs text-gray-500">Allow others to join and split the fare</p>
                    </div>
                    <button 
                      onClick={() => setIsPublic(!isPublic)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${isPublic ? 'bg-yellow-400' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isPublic ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  {isPublic && (
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <div>
                        <h4 className="font-bold text-gray-800">Max Passengers</h4>
                        <p className="text-xs text-gray-500">Maximum people in the car</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setMaxRiders(Math.max(1, maxRiders - 1))}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="font-bold w-4 text-center">{maxRiders}</span>
                        <button 
                          onClick={() => setMaxRiders(Math.min(6, maxRiders + 1))}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-center">
                  <Button
                    icon="mdi:check-circle"
                    onClick={handleConfirmRide}
                    disabled={!isTimeSelectionValid}
                  >
                    Confirm Ride
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateRide;
