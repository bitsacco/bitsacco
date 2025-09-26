"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";

export type PhoneValidationContext =
  | "general" // General phone validation
  | "mpesa" // M-Pesa: Kenya Safaricom only
  | "strict"; // Strict validation for specific region

export interface PhoneValidationResult {
  isValid: boolean;
  error?: string;
  formatted?: string;
}

export interface PhoneValidationOptions {
  context?: PhoneValidationContext;
  regionCode?: PhoneRegionCode;
}

export enum PhoneRegionCode {
  Kenya = "KE",
  Uganda = "UG",
  Nigeria = "NG",
  Tanzania = "TZ",
  SouthAfrica = "ZA",
  UnitedStates = "US",
  Canada = "CA",
  Mexico = "MX",
  Jamaica = "JM",
}

interface Country {
  code: PhoneRegionCode;
  name: string;
  dialCode: string;
}

const countries: Country[] = [
  // East Africa
  { code: PhoneRegionCode.Kenya, name: "Kenya", dialCode: "254" },
  { code: PhoneRegionCode.Uganda, name: "Uganda", dialCode: "256" },
  { code: PhoneRegionCode.Tanzania, name: "Tanzania", dialCode: "255" },

  // West Africa
  { code: PhoneRegionCode.Nigeria, name: "Nigeria", dialCode: "234" },

  // Southern Africa
  { code: PhoneRegionCode.SouthAfrica, name: "South Africa", dialCode: "27" },

  // North America
  { code: PhoneRegionCode.Canada, name: "Canada", dialCode: "1" },
  { code: PhoneRegionCode.UnitedStates, name: "United States", dialCode: "1" },
  { code: PhoneRegionCode.Mexico, name: "Mexico", dialCode: "52" },

  // Caribbean
  { code: PhoneRegionCode.Jamaica, name: "Jamaica", dialCode: "1876" },
];

const DEFAULT_COUNTRY = countries[0];

const getFlagEmoji = (countryCode: string) => {
  const codePoints = Array.from(countryCode.toUpperCase()).map(
    (char) => 127397 + char.charCodeAt(0),
  );
  return String.fromCodePoint(...codePoints);
};

// TODO: Implement strict Safaricom phone number validation for M-Pesa
// This would require validating specific Safaricom prefixes:
// - 07XX series (701-799)
// - 01XX series (for some regions)
// - Other Safaricom-specific prefixes
// For now, we validate Kenya region only which covers most M-Pesa use cases

const validatePhoneNumber = (
  phone: string,
  options: PhoneValidationOptions = {},
): PhoneValidationResult => {
  const { context = "general", regionCode } = options;

  if (!phone || phone.length < 4) {
    return { isValid: false };
  }

  // Simple phone validation without external library
  const cleanPhone = phone.replace(/[^+\d]/g, "");

  if (cleanPhone.length < 10) {
    return {
      isValid: false,
      error: "Invalid phone number format",
    };
  }

  // Contextual validation
  switch (context) {
    case "mpesa": {
      // M-Pesa validation: Kenya region only (simplified)
      // TODO: Add strict Safaricom prefix validation in the future
      const kenyaPattern = /^(\+254|254|0)?[17]\d{8}$/;
      if (!kenyaPattern.test(cleanPhone.replace(/^\+254/, "254"))) {
        return {
          isValid: false,
          error: "M-Pesa only supports Kenyan phone numbers",
        };
      }

      return {
        isValid: true,
        formatted: cleanPhone,
      };
    }

    case "strict": {
      // Strict validation for specific region
      if (regionCode && cleanPhone.length > 15) {
        const countryName =
          countries.find((c) => c.code === regionCode)?.name || regionCode;
        return {
          isValid: false,
          error: `Phone number must be from ${countryName}`,
        };
      }

      return {
        isValid: true,
        formatted: cleanPhone,
      };
    }

    case "general":
    default: {
      return {
        isValid: true,
        formatted: cleanPhone,
      };
    }
  }
};

export interface PhoneInputProps {
  phone: string;
  setPhone: (phone: string) => void;
  regionCode?: PhoneRegionCode;
  setRegionCode?: (code: PhoneRegionCode) => void;
  placeholder?: string;
  showCountryCode?: boolean;
  selectCountryCode?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  className?: string;
  validationContext?: PhoneValidationContext;
  onValidationChange?: (result: PhoneValidationResult) => void;
  showValidationIcon?: boolean;
}

export const PhoneInput = React.memo(function PhoneInput({
  phone,
  setPhone,
  regionCode,
  setRegionCode,
  placeholder,
  showCountryCode = true,
  selectCountryCode = true,
  onKeyDown,
  disabled = false,
  error,
  label,
  required = false,
  className = "",
  validationContext = "general",
  onValidationChange,
  showValidationIcon = false,
}: PhoneInputProps) {
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find((c) => c.code === regionCode) || DEFAULT_COUNTRY,
  );
  const [localPhone, setLocalPhone] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [validationResult, setValidationResult] =
    useState<PhoneValidationResult>({ isValid: false });

  useEffect(() => {
    // Update local phone when parent phone changes
    const numericPhone = phone.replace(/\D/g, "");
    const countryCode = selectedCountry.dialCode;
    const localNumber = numericPhone.replace(countryCode, "");
    setLocalPhone(localNumber);
  }, [phone, selectedCountry]);

  const filteredCountries = useMemo(() => {
    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(search.toLowerCase()) ||
        country.dialCode.includes(search),
    );
  }, [search]);

  const handleCountrySelect = useCallback(
    (country: Country) => {
      setSelectedCountry(country);
      if (setRegionCode) {
        setRegionCode(country.code);
      }
      setPhone(`+${country.dialCode}`);
      setSearch("");
      setIsMenuOpen(false);

      // Reset validation when country changes
      const result = { isValid: false };
      setValidationResult(result);
      onValidationChange?.(result);
    },
    [setPhone, setRegionCode, onValidationChange],
  );

  const formatPhoneNumber = useCallback(
    (digits: string): string => {
      // Handle different input scenarios
      if (
        digits.startsWith(selectedCountry.dialCode) &&
        digits.length >= selectedCountry.dialCode.length + 3
      ) {
        // Remove country code prefix only after 3+ additional digits are typed
        return digits.slice(selectedCountry.dialCode.length);
      } else if (digits.startsWith("0") && digits.length >= 4) {
        // Remove leading 0 only after 3+ additional digits are typed (0 + 3 = 4 total)
        return digits.slice(1);
      }

      // Return as-is for other formats, but limit to 12 digits to accommodate full country code format
      return digits.slice(0, 12);
    },
    [selectedCountry.dialCode],
  );

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = (e.target as HTMLInputElement).value;
      const digits = value.replace(/\D/g, "");
      const formattedValue = formatPhoneNumber(digits);
      setLocalPhone(formattedValue);
      const fullNumber = `+${selectedCountry.dialCode}${formattedValue}`;
      setPhone(fullNumber);

      // Real-time validation
      if (fullNumber.length > 4) {
        const result = validatePhoneNumber(fullNumber, {
          context: validationContext,
          regionCode: selectedCountry.code,
        });
        setValidationResult(result);
        onValidationChange?.(result);
      } else {
        const result = { isValid: false };
        setValidationResult(result);
        onValidationChange?.(result);
      }
    },
    [
      setPhone,
      selectedCountry.dialCode,
      selectedCountry.code,
      formatPhoneNumber,
      validationContext,
      onValidationChange,
    ],
  );

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      <div className="relative flex">
        {showCountryCode && (
          <div className="relative">
            {selectCountryCode ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => !disabled && setIsMenuOpen(!isMenuOpen)}
                  disabled={disabled}
                  className={`
                    flex items-center gap-2 px-3 py-3 bg-slate-700/50 border border-slate-600 
                    rounded-l-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 
                    focus:border-teal-500 transition-colors duration-200 min-w-[100px]
                    ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-700/70 cursor-pointer"}
                    ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/50" : ""}
                  `}
                  aria-expanded={isMenuOpen}
                  aria-haspopup="listbox"
                >
                  <span className="text-base">
                    {getFlagEmoji(selectedCountry.code)}
                  </span>
                  <span className="text-sm font-medium text-gray-300">
                    +{selectedCountry.dialCode}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      isMenuOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown */}
                {isMenuOpen && (
                  <div className="absolute top-full left-0 z-50 w-80 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl max-h-72 overflow-hidden">
                    {/* Search */}
                    <div className="p-3 border-b border-slate-600">
                      <input
                        type="text"
                        value={search}
                        onChange={(e) =>
                          setSearch((e.target as HTMLInputElement).value)
                        }
                        placeholder="Search countries"
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 text-sm"
                      />
                    </div>

                    {/* Countries List */}
                    <div className="overflow-y-auto max-h-48">
                      {filteredCountries.map((country) => (
                        <button
                          key={country.code}
                          onClick={() => handleCountrySelect(country)}
                          className={`
                            w-full px-4 py-3 text-left hover:bg-slate-700/50 focus:bg-slate-700/50 
                            focus:outline-none transition-colors flex items-center justify-between gap-4
                            ${selectedCountry.code === country.code ? "bg-teal-500/20 text-teal-300" : "text-gray-100"}
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-base">
                              {getFlagEmoji(country.code)}
                            </span>
                            <span className="text-sm">{country.name}</span>
                          </div>
                          <span className="text-sm text-gray-400 font-mono">
                            +{country.dialCode}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-3 bg-slate-700/50 border border-slate-600 rounded-l-lg">
                <span className="text-base">
                  {getFlagEmoji(selectedCountry.code)}
                </span>
                <span className="text-sm font-medium text-gray-300">
                  +{selectedCountry.dialCode}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="relative flex-1">
          <input
            type="tel"
            placeholder={placeholder || "Enter phone number"}
            value={localPhone}
            onChange={handlePhoneChange}
            onKeyDown={onKeyDown}
            disabled={disabled}
            required={required}
            className={`
              w-full px-4 py-3 bg-slate-700/50 border border-slate-600 
              ${showCountryCode ? "rounded-r-lg border-l-0" : "rounded-lg"} 
              text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 
              focus:ring-teal-500/50 focus:border-teal-500 transition-colors duration-200
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              ${error || (!validationResult.isValid && validationResult.error) ? "border-red-500 focus:border-red-500 focus:ring-red-500/50" : ""}
              ${validationResult.isValid && phone.length > 6 ? "border-green-500/50" : ""}
              ${showValidationIcon ? "pr-10" : ""}
            `}
            autoComplete="tel"
          />

          {/* Validation Icon */}
          {showValidationIcon && phone.length > 6 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {validationResult.isValid ? (
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : validationResult.error ? (
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Show external error or validation error */}
      {(error || validationResult.error) && (
        <p className="text-sm text-red-400">
          {error || validationResult.error}
        </p>
      )}

      {/* Show validation success message for M-Pesa */}
      {validationContext === "mpesa" &&
        validationResult.isValid &&
        phone.length > 6 && (
          <p className="text-sm text-green-400">
            ✓ Valid Kenyan number for M-Pesa
          </p>
        )}
    </div>
  );
});
