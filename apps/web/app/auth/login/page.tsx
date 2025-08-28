"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button, Logo, Container } from "@bitsacco/ui";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"phone" | "nostr">("phone");
  const [formData, setFormData] = useState({
    phone: "",
    npub: "",
    pin: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const providerId = activeTab === "phone" ? "phone-pin" : "nostr-pin";
      const credentials =
        activeTab === "phone"
          ? { phone: formData.phone, pin: formData.pin }
          : { npub: formData.npub, pin: formData.pin };

      const result = await signIn(providerId, {
        ...credentials,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials. Please try again.");
      } else {
        router.push("/dashboard");
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Container className="max-w-md">
        <div className="space-y-8">
          <div>
            <div className="flex justify-center mb-8">
              <Logo />
            </div>
            <h2 className="text-center text-3xl font-bold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{" "}
              <Link
                href="/auth/signup"
                className="font-medium text-teal-600 hover:text-teal-500 transition-colors"
              >
                create a new account
              </Link>
            </p>
          </div>

          <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
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
                Phone & PIN
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
                Nostr & PIN
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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

              <div>
                <label
                  htmlFor="pin"
                  className="block text-sm font-medium text-gray-700"
                >
                  PIN
                </label>
                <input
                  id="pin"
                  name="pin"
                  type="password"
                  required
                  value={formData.pin}
                  onChange={handleInputChange}
                  placeholder="Enter your PIN"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                />
              </div>

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
                Sign In
              </Button>

              <div className="text-center">
                <Link
                  href="/auth/recover"
                  className="text-sm text-teal-600 hover:text-teal-500 transition-colors"
                >
                  Forgot your PIN?
                </Link>
              </div>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
}
