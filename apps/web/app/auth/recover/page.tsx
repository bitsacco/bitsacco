"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Logo, Container } from "@bitsacco/ui";

export default function RecoverPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"request" | "verify" | "reset">("request");
  const [activeTab, setActiveTab] = useState<"phone" | "nostr">("phone");
  const [formData, setFormData] = useState({
    phone: "",
    npub: "",
    otp: "",
    newPin: "",
    confirmPin: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/recover/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: activeTab === "phone" ? formData.phone : undefined,
          npub: activeTab === "nostr" ? formData.npub : undefined,
        }),
      });

      if (response.ok) {
        setStep("verify");
        setSuccess(
          `Verification code sent to your ${activeTab === "phone" ? "phone" : "Nostr account"}`,
        );
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

  const handleVerifyReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/recover/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: activeTab === "phone" ? formData.phone : undefined,
          npub: activeTab === "nostr" ? formData.npub : undefined,
          otp: formData.otp,
        }),
      });

      if (response.ok) {
        setStep("reset");
        setSuccess("Code verified. Create your new PIN.");
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

  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate PIN confirmation
    if (formData.newPin !== formData.confirmPin) {
      setError("PINs do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/recover/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: activeTab === "phone" ? formData.phone : undefined,
          npub: activeTab === "nostr" ? formData.npub : undefined,
          otp: formData.otp,
          newPin: formData.newPin,
        }),
      });

      if (response.ok) {
        router.push("/auth/login?message=PIN reset successfully");
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

  const getStepTitle = () => {
    switch (step) {
      case "request":
        return "Reset your PIN";
      case "verify":
        return "Enter verification code";
      case "reset":
        return "Create new PIN";
      default:
        return "Reset your PIN";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case "request":
        return "Enter your phone number or Nostr public key to receive a reset code";
      case "verify":
        return "Enter the verification code sent to your account";
      case "reset":
        return "Create a new secure PIN for your account";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Container className="max-w-md">
        <div className="space-y-8">
          <div>
            <div className="flex justify-center mb-8">
              <Logo size="lg" />
            </div>
            <h2 className="text-center text-3xl font-bold text-gray-900">
              {getStepTitle()}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {getStepDescription()}
            </p>
          </div>

          <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
            {step === "request" && (
              <>
                {/* Tab Navigation */}
                <div className="flex space-x-1 rounded-lg bg-gray-100 p-1 mb-6">
                  <button
                    type="button"
                    className={`w-full py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                      activeTab === "phone"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                    onClick={() => setActiveTab("phone")}
                  >
                    Phone
                  </button>
                  <button
                    type="button"
                    className={`w-full py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                      activeTab === "nostr"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                    onClick={() => setActiveTab("nostr")}
                  >
                    Nostr
                  </button>
                </div>

                <form onSubmit={handleRequestReset} className="space-y-6">
                  {activeTab === "phone" ? (
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700"
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
                        placeholder="+1234567890"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                      />
                    </div>
                  ) : (
                    <div>
                      <label
                        htmlFor="npub"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Nostr Public Key
                      </label>
                      <input
                        id="npub"
                        name="npub"
                        type="text"
                        required
                        value={formData.npub}
                        onChange={handleInputChange}
                        placeholder="npub1..."
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                      />
                    </div>
                  )}

                  {error && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                      <div className="text-sm text-red-700">{error}</div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="tealPrimary"
                    size="lg"
                    fullWidth
                    loading={isLoading}
                  >
                    Send Reset Code
                  </Button>

                  <div className="text-center">
                    <Link
                      href="/auth/login"
                      className="text-sm text-teal-600 hover:text-teal-500 transition-colors"
                    >
                      Back to sign in
                    </Link>
                  </div>
                </form>
              </>
            )}

            {step === "verify" && (
              <form onSubmit={handleVerifyReset} className="space-y-6">
                {success && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                    <div className="text-sm text-green-700">{success}</div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="otp"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Verification Code
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    value={formData.otp}
                    onChange={handleInputChange}
                    placeholder="Enter verification code"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isLoading}
                >
                  Verify Code
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep("request")}
                    className="text-sm text-orange-600 hover:text-orange-500"
                  >
                    Back to request
                  </button>
                </div>
              </form>
            )}

            {step === "reset" && (
              <form onSubmit={handleResetPin} className="space-y-6">
                {success && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                    <div className="text-sm text-green-700">{success}</div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="newPin"
                    className="block text-sm font-medium text-gray-700"
                  >
                    New PIN
                  </label>
                  <input
                    id="newPin"
                    name="newPin"
                    type="password"
                    required
                    value={formData.newPin}
                    onChange={handleInputChange}
                    placeholder="Enter new PIN"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPin"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm New PIN
                  </label>
                  <input
                    id="confirmPin"
                    name="confirmPin"
                    type="password"
                    required
                    value={formData.confirmPin}
                    onChange={handleInputChange}
                    placeholder="Confirm new PIN"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isLoading}
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
