"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Button,
  Logo,
  Container,
  PhoneInput,
  PhoneRegionCode,
} from "@bitsacco/ui";
import { PinInput } from "@/components/pin-input";
import { Routes } from "@/lib/routes";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    pin: "",
  });
  const [regionCode, setRegionCode] = useState<PhoneRegionCode>(
    PhoneRegionCode.Kenya,
  );
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear any previous errors first
    setError("");

    if (formData.pin.length !== 6) {
      setError("Please enter a complete 6-digit PIN");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn("phone-pin", {
        phone: formData.phone,
        pin: formData.pin,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials. Please try again.");
      } else {
        router.push(Routes.MEMBERSHIP);
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
              welcome back
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Don&apos;t have an account?{" "}
              <Link
                href={Routes.SIGNUP}
                className="font-medium text-teal-400 hover:text-teal-300 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-slate-700">
            <form id="login-form" onSubmit={handleSubmit} className="space-y-6">
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
                  error && error.includes("Invalid")
                    ? "Please check your phone number"
                    : undefined
                }
                disabled={isLoading}
              />

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Enter your 6-digit PIN
                </label>
                <PinInput
                  value={formData.pin}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, pin: value }))
                  }
                  autoFocus={false}
                  error={!!error && error.includes("Invalid")}
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
                disabled={!formData.phone || formData.pin.length !== 6}
                className="shadow-lg shadow-teal-500/20"
              >
                Sign In
              </Button>

              <div className="text-center">
                <Link
                  href={Routes.RECOVER}
                  className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
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
