"use client";

import {
  useRef,
  useState,
  useEffect,
  KeyboardEvent,
  ClipboardEvent,
} from "react";

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
  disabled?: boolean;
  error?: boolean;
  placeholder?: string;
  className?: string;
  secure?: boolean; // Add secure mode option
}

export function PinInput({
  value = "",
  onChange,
  onComplete,
  length = 6,
  autoFocus = false,
  disabled = false,
  error = false,
  placeholder = "•",
  className = "",
  secure = true, // Default to secure mode
}: PinInputProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [visibleDigits, setVisibleDigits] = useState<boolean[]>(
    new Array(length).fill(false),
  );
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const hideTimers = useRef<NodeJS.Timeout[]>([]);

  // Convert string value to array of digits
  const digits = value.split("").concat(Array(length - value.length).fill(""));

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  // Clean up timers on unmount
  useEffect(() => {
    const timers = hideTimers.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const handleChange = (index: number, digitValue: string) => {
    if (disabled) return;

    // Only allow digits
    const digit = digitValue.replace(/[^0-9]/g, "").slice(-1);

    const newDigits = [...digits];
    newDigits[index] = digit;

    // Remove trailing empty values
    const newValue = newDigits.join("").slice(0, length);
    onChange(newValue);

    // In secure mode, show the digit briefly then hide it
    if (secure && digit) {
      // Clear any existing timer for this index
      if (hideTimers.current[index]) {
        clearTimeout(hideTimers.current[index]);
      }

      // Show the digit temporarily
      setVisibleDigits((prev) => {
        const newVisible = [...prev];
        newVisible[index] = true;
        return newVisible;
      });

      // Hide the digit after 500ms
      hideTimers.current[index] = setTimeout(() => {
        setVisibleDigits((prev) => {
          const newVisible = [...prev];
          newVisible[index] = false;
          return newVisible;
        });
      }, 500);
    }

    // Auto-advance to next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete when all digits are filled
    if (digit && index === length - 1 && newValue.length === length) {
      onComplete?.(newValue);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    // Handle backspace
    if (e.key === "Backspace") {
      e.preventDefault();

      if (digits[index]) {
        // Clear current digit
        handleChange(index, "");
      } else if (index > 0) {
        // Move to previous input and clear it
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        onChange(newDigits.join("").slice(0, length));
      }
    }

    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }

    // Handle Enter key
    if (e.key === "Enter" && value.length === length) {
      onComplete?.(value);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;

    const pastedData = e.clipboardData
      .getData("text/plain")
      .replace(/[^0-9]/g, "");
    const pastedDigits = pastedData.slice(0, length).split("");

    const newValue = pastedDigits.join("");
    onChange(newValue);

    // In secure mode, don't show pasted values
    if (secure) {
      setVisibleDigits(new Array(length).fill(false));
    }

    // Focus the next empty input or the last one
    const nextEmptyIndex = Math.min(pastedDigits.length, length - 1);
    inputRefs.current[nextEmptyIndex]?.focus();

    // Call onComplete if fully filled
    if (newValue.length === length) {
      onComplete?.(newValue);
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
    // Select the content when focused
    inputRefs.current[index]?.select();
  };

  const handleBlur = () => {
    setFocusedIndex(null);
  };

  // Display value for each input field
  const getDisplayValue = (index: number) => {
    if (!digits[index]) return "";
    if (!secure || visibleDigits[index]) return digits[index];
    return placeholder;
  };

  return (
    <div className={`flex gap-2 sm:gap-3 justify-center ${className}`}>
      {Array.from({ length }, (_, index) => (
        <div key={index} className="relative">
          <input
            ref={(el) => {
              if (el) inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={getDisplayValue(index)}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => handleFocus(index)}
            onBlur={handleBlur}
            disabled={disabled}
            aria-label={`PIN digit ${index + 1}`}
            autoComplete="off"
            className={`
              w-12 h-14 sm:w-14 sm:h-16
              text-center text-2xl font-bold
              bg-slate-900/50 
              border-2 rounded-lg
              placeholder-gray-600
              text-gray-100
              transition-all duration-200
              ${
                error
                  ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  : focusedIndex === index
                    ? "border-teal-500 ring-2 ring-teal-500/20"
                    : digits[index]
                      ? "border-teal-500/50"
                      : "border-slate-600 hover:border-slate-500"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              focus:outline-none focus:bg-slate-900/70
              ${secure && digits[index] && !visibleDigits[index] ? "text-3xl" : ""}
            `}
            placeholder=""
          />
          {/* Optional: Add a dot indicator below each filled input */}
          {digits[index] && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Optional: Export a variant for OTP/verification codes
export function OtpInput(props: Omit<PinInputProps, "length">) {
  return <PinInput {...props} length={6} placeholder="0" />;
}
