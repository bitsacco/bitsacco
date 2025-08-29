"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Logo, Container } from "@bitsacco/ui";
import { PinInput } from "@/components/pin-input";

export default function RecoverPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"request" | "verify" | "reset">("request");
  const [formData, setFormData] = useState({
    phone: "",
    otp: "",
    newPin: "",
    confirmPin: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/recover/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: formData.phone,
        }),
      });

      if (response.ok) {
        setStep("verify");
        setSuccess("Verification code sent to your phone");
      } else {
        const data = await response.json();
        setError(data.message || "Request failed");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToReset = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate OTP format
    if (formData.otp.length !== 6) {
      setError("Please enter a complete 6-digit code");
      return;
    }

    // Move to PIN reset step
    setStep("reset");
    setError("");
    setSuccess("Enter your new PIN");
  };

  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate PIN length and confirmation
    if (formData.newPin.length !== 6) {
      setError("Please enter a complete 6-digit PIN");
      setIsLoading(false);
      return;
    }

    if (formData.newPin !== formData.confirmPin) {
      setError("PINs do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/recover/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: formData.phone,
          otp: formData.otp,
          newPin: formData.newPin,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // If we got auth tokens, the user is now authenticated
        if (data.accessToken && data.refreshToken) {
          router.push("/dashboard");
        } else {
          // Otherwise redirect to login
          router.push("/auth/login");
        }
      } else {
        const data = await response.json();
        setError(data.message || "Reset failed");
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
              {step === "request"
                ? "Recover your account"
                : step === "verify"
                  ? "Verify your identity"
                  : "Create new PIN"}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              {step === "request" ? (
                <>
                  Remember your PIN?{" "}
                  <Link
                    href="/auth/login"
                    className="font-medium text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    Sign in
                  </Link>
                </>
              ) : step === "verify" ? (
                "Enter the code we sent you"
              ) : (
                "Choose a secure PIN you'll remember"
              )}
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-slate-700">
            {step === "request" ? (
              <form onSubmit={handleRequestOTP} className="space-y-6">
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+254712345678"
                    className="mt-1 block w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg placeholder-gray-500 text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-slate-900/70 transition-all"
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
                  className="shadow-lg shadow-teal-500/20"
                >
                  Send Recovery Code
                </Button>
              </form>
            ) : step === "verify" ? (
              <form onSubmit={handleProceedToReset} className="space-y-6">
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
                  Continue
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("request");
                      setFormData((prev) => ({ ...prev, otp: "" }));
                    }}
                    className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    Request new code
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPin} className="space-y-6">
                {success && (
                  <div className="rounded-lg bg-teal-500/10 border border-teal-500/30 p-4">
                    <div className="text-sm text-teal-400">{success}</div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    Create new 6-digit PIN
                  </label>
                  <PinInput
                    value={formData.newPin}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, newPin: value }))
                    }
                    autoFocus={true}
                    error={!!error && error.includes("PIN")}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    Confirm new PIN
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
                    formData.newPin.length !== 6 ||
                    formData.confirmPin.length !== 6
                  }
                  className="shadow-lg shadow-teal-500/20"
                >
                  Reset PIN
                </Button>
              </form>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
