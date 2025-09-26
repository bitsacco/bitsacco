"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Logo,
  Container,
  PhoneInput,
  PhoneRegionCode,
} from "@bitsacco/ui";
import { Role } from "@bitsacco/core/types";
import { PinInput } from "@/components/pin-input";
import { Routes } from "@/lib/routes";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"register" | "verify">("register");
  const [formData, setFormData] = useState({
    phone: "",
    pin: "",
    confirmPin: "",
    otp: "",
    name: "",
  });
  const [regionCode, setRegionCode] = useState<PhoneRegionCode>(
    PhoneRegionCode.Kenya,
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate PIN length and confirmation
    if (formData.pin.length !== 6) {
      setError("Please enter a complete 6-digit PIN");
      setIsLoading(false);
      return;
    }

    if (formData.pin !== formData.confirmPin) {
      setError("PINs do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(Routes.API.AUTH.REGISTER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pin: formData.pin,
          phone: formData.phone,
          name: formData.name,
          roles: [Role.Member],
        }),
      });

      if (response.ok) {
        setStep("verify");
        setSuccess("Verification code sent to your phone");
      } else {
        const data = await response.json();
        setError(data.message || "Registration failed");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(Routes.API.AUTH.VERIFY, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: formData.phone,
          otp: formData.otp,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // If we got auth tokens, the user is now authenticated
        if (data.accessToken && data.refreshToken) {
          // User is automatically logged in after verification
          router.push(Routes.MEMBERSHIP);
        } else {
          // Otherwise redirect to login
          router.push(Routes.LOGIN);
        }
      } else {
        const data = await response.json();
        setError(data.message || "Verification failed");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/20 via-slate-900 to-slate-900" />
      <Container className="max-w-lg relative z-10">
        <div className="space-y-8">
          <div>
            <div className="flex justify-center mb-8">
              <Logo className="h-12 w-auto text-white" />
            </div>
            <h2 className="text-center text-3xl font-bold text-gray-100">
              {step === "register"
                ? "Create your account"
                : "Verify your account"}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              {step === "register" ? (
                <>
                  Already have an account?{" "}
                  <Link
                    href={Routes.LOGIN}
                    className="font-medium text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    Sign in
                  </Link>
                </>
              ) : (
                "Enter the verification code sent to you"
              )}
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-slate-700">
            {step === "register" ? (
              <form onSubmit={handleRegister} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="mt-1 block w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-slate-900/70 transition-all"
                  />
                </div>

                <PhoneInput
                  phone={formData.phone}
                  setPhone={(phone) =>
                    setFormData((prev) => ({ ...prev, phone }))
                  }
                  regionCode={regionCode}
                  setRegionCode={setRegionCode}
                  label="Phone Number"
                  placeholder="Enter phone number"
                  required
                  error={
                    error && error.includes("phone")
                      ? "Please check your phone number"
                      : undefined
                  }
                  disabled={isLoading}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    Create a 6-digit PIN
                  </label>
                  <PinInput
                    value={formData.pin}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, pin: value }))
                    }
                    autoFocus={false}
                    error={!!error && error.includes("PIN")}
                    disabled={isLoading}
                  />
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    You&apos;ll use this PIN to access your account
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    Confirm your PIN
                  </label>
                  <PinInput
                    value={formData.confirmPin}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, confirmPin: value }))
                    }
                    autoFocus={false}
                    error={!!error && error.includes("match")}
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4">
                    <div className="text-sm text-red-400">{error}</div>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="tealPrimary"
                  size="lg"
                  fullWidth
                  loading={isLoading}
                  disabled={
                    !formData.name ||
                    !formData.phone ||
                    formData.pin.length !== 6 ||
                    formData.confirmPin.length !== 6
                  }
                  className="shadow-lg shadow-teal-500/20"
                >
                  Create Account
                </Button>
              </form>
            ) : (
              <form
                id="verify-form"
                onSubmit={handleVerify}
                className="space-y-6"
              >
                {success && (
                  <div className="rounded-lg bg-teal-500/10 border border-teal-500/30 p-4">
                    <div className="text-sm text-teal-400">{success}</div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    Enter verification code
                  </label>
                  <PinInput
                    value={formData.otp}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, otp: value }))
                    }
                    autoFocus={true}
                    error={!!error}
                    disabled={isLoading}
                    placeholder="0"
                    secure={false}
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4">
                    <div className="text-sm text-red-400">{error}</div>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="tealPrimary"
                  size="lg"
                  fullWidth
                  loading={isLoading}
                  disabled={formData.otp.length !== 6}
                  className="shadow-lg shadow-teal-500/20"
                >
                  Verify Account
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep("register")}
                    className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    Back to registration
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
