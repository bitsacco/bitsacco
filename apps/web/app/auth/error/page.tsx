"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button, Logo, Container } from "@bitsacco/ui";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = () => {
    switch (error) {
      case "CredentialsSignin":
        return "Invalid credentials. Please check your phone/Nostr key and PIN.";
      case "AccessDenied":
        return "Access denied. You may not have permission to sign in.";
      case "Configuration":
        return "Authentication service is temporarily unavailable.";
      case "Verification":
        return "Your account needs to be verified before you can sign in.";
      default:
        return "An unexpected error occurred during authentication.";
    }
  };

  const getErrorTitle = () => {
    switch (error) {
      case "CredentialsSignin":
        return "Invalid Credentials";
      case "AccessDenied":
        return "Access Denied";
      case "Configuration":
        return "Service Unavailable";
      case "Verification":
        return "Verification Required";
      default:
        return "Authentication Error";
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
          </div>

          <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
            <div className="text-center">
              {/* Error Icon */}
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {getErrorTitle()}
              </h2>

              <p className="text-gray-600 mb-6">{getErrorMessage()}</p>

              <div className="space-y-3">
                <Link href="/auth/login">
                  <Button variant="tealPrimary" size="lg" fullWidth>
                    Try Again
                  </Button>
                </Link>

                {error === "Verification" && (
                  <Link href="/auth/signup">
                    <Button variant="tealOutline" size="lg" fullWidth>
                      Complete Verification
                    </Button>
                  </Link>
                )}

                {error === "CredentialsSignin" && (
                  <Link href="/auth/recover">
                    <Button variant="tealOutline" size="lg" fullWidth>
                      Reset PIN
                    </Button>
                  </Link>
                )}

                <Link href="/">
                  <Button variant="tealGhost" size="lg" fullWidth>
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Need help? Contact our support team for assistance.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
