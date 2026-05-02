import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "motion/react";
import { Icon } from "@iconify/react";

interface DateTimePickerProps {
  onDateTimeSelected: (dateTime: Date | null) => void;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  onDateTimeSelected,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [timeError, setTimeError] = useState<string>("");
  const previousDateTime = useRef<{
    date: string;
    time: string;
    valid: boolean;
  }>({
    date: "",
    time: "",
    valid: false,
  });

  // Get current date in YYYY-MM-DD format for min attribute
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const isValidDateTime = useMemo(() => {
    if (!selectedDate || !selectedTime) return false;

    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
    const currentDateTime = new Date();

    return selectedDateTime > currentDateTime;
  }, [selectedDate, selectedTime]);

  // First useEffect: Handle validation and set error message
  useEffect(() => {
    if (selectedDate && selectedTime) {
      const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
      const currentDateTime = new Date();

      if (selectedDateTime <= currentDateTime) {
        setTimeError("Please select a future time");
      } else {
        setTimeError("");
      }
    } else {
      setTimeError("");
    }
  }, [selectedDate, selectedTime]);

  // Second useEffect: Only handle calling the callback when values actually change
  useEffect(() => {
    // Check if date/time/validity has actually changed before calling the callback
    const hasChanged =
      selectedDate !== previousDateTime.current.date ||
      selectedTime !== previousDateTime.current.time ||
      isValidDateTime !== previousDateTime.current.valid;

    if (hasChanged) {
      // Update the ref to track current values
      previousDateTime.current = {
        date: selectedDate,
        time: selectedTime,
        valid: isValidDateTime,
      };

      // Only call onDateTimeSelected if we have a valid date/time or to clear a previous value
      if (selectedDate && selectedTime) {
        if (isValidDateTime) {
          const [hours, minutes] = selectedTime.split(":").map(Number);
          const dateTime = new Date(selectedDate);
          dateTime.setHours(hours, minutes);
          onDateTimeSelected(dateTime);
        } else {
          onDateTimeSelected(null);
        }
      } else {
        onDateTimeSelected(null);
      }
    }
  }, [selectedDate, selectedTime, isValidDateTime, onDateTimeSelected]);

  // Handle time change without directly setting timeError here
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setSelectedTime(newTime);
  };

  return (
    <motion.div className="space-y-4">
      <h3 className="text-lg font-medium text-center text-gray-700">
        Schedule Your Ride
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <motion.input
              type="date"
              min={today}
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                // Reset time error when date changes
                if (timeError) setTimeError("");
              }}
              className="block w-full py-3 pl-10 pr-4 border rounded-lg border-gray-300 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200"
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
              required
            />
            <Icon
              icon="mdi:calendar"
              className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Time <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <motion.input
              type="time"
              value={selectedTime}
              onChange={handleTimeChange}
              className={`block w-full py-3 pl-10 pr-4 border rounded-lg border-gray-300 
                focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200
                ${timeError ? "border-red-500" : ""}`}
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
              required
            />
            <Icon
              icon="mdi:clock-outline"
              className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400"
            />
          </div>
          {/* Fixed height container for error message */}
          <div className="h-6 min-h-6">
            {timeError && <p className="text-red-500 text-xs">{timeError}</p>}
          </div>
        </div>
      </div>

      {/* Fixed height container for success message */}
      <div className="h-6 min-h-6">
        {isValidDateTime && (
          <motion.div
            className="text-green-600 text-sm text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Icon icon="mdi:check-circle" className="inline-block mr-1" />
            Your ride is scheduled for a future time
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DateTimePicker;
