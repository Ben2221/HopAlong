import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";

interface OTPInputProps {
  length: number;
  onComplete: (otp: string) => void;
  isDisabled?: boolean;
  error?: string;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onComplete,
  isDisabled = false,
  error,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;

    // Only allow one digit
    if (value.length > 1) return;

    // Allow only numbers
    if (value && !/^\d+$/.test(value)) return;

    // Update OTP state
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Check if input is filled and move to next input
    if (value !== "" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if OTP is complete
    const otpValue = newOtp.join("");
    if (otpValue.length === length) {
      onComplete(otpValue);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    // Handle backspace - move to previous input when current is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();

    // Check if pasted content is all numbers and correct length
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.slice(0, length).split("");
      const newOtp = [...otp];

      digits.forEach((digit, idx) => {
        if (idx < length) {
          newOtp[idx] = digit;
        }
      });

      setOtp(newOtp);

      // Focus on appropriate field
      if (digits.length < length) {
        inputRefs.current[digits.length]?.focus();
      } else {
        inputRefs.current[length - 1]?.focus();
        onComplete(newOtp.join(""));
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2 sm:gap-3">
        {Array.from({ length }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <input
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              type="text"
              maxLength={1}
              className={`w-10 h-14 sm:w-14 sm:h-16 flex items-center justify-center text-center text-xl font-bold border-2 rounded-lg 
                ${
                  isDisabled
                    ? "bg-gray-100 text-gray-400 border-gray-300"
                    : "text-gray-800 border-gray-300"
                } 
                ${
                  error
                    ? "border-red-400"
                    : "focus:border-yellow-500 focus:ring-yellow-500"
                }
                focus:outline-none focus:ring-2 transition`}
              value={otp[index]}
              onChange={(e) => {
                handleChange(e, index);
              }}
              onKeyDown={(e) => {
                handleKeyDown(e, index);
              }}
              onPaste={index === 0 ? handlePaste : undefined}
              disabled={isDisabled}
              autoComplete="one-time-code"
              inputMode="numeric"
            />
          </motion.div>
        ))}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-center text-sm"
        >
          {error}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-gray-500 text-sm"
      >
        {isDisabled
          ? "Verifying your code..."
          : "Enter the verification code sent to your email"}
      </motion.div>
    </div>
  );
};

export default OTPInput;
