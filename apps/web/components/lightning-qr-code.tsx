"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { CopyIcon, CheckIcon } from "@phosphor-icons/react";

interface LightningQRCodeProps {
  invoice: string;
  size?: number;
  className?: string;
  showTitle?: boolean;
  showInstructions?: boolean;
}

export function LightningQRCode({
  invoice,
  className = "",
  showTitle = true,
  showInstructions = true,
}: LightningQRCodeProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string>("");

  // Generate QR code when invoice changes
  useEffect(() => {
    if (!invoice) return;

    const generateQRCode = async () => {
      try {
        const url = await QRCode.toDataURL(invoice.toUpperCase(), {
          width: 256,
          margin: 2,
          color: {
            dark: "#1f2937",
            light: "#ffffff",
          },
          errorCorrectionLevel: "M",
        });
        setQrCodeDataUrl(url);
        setError("");
      } catch {
        setError("Failed to generate QR code");
      }
    };

    generateQRCode();
  }, [invoice]);

  const copyInvoice = async () => {
    try {
      await navigator.clipboard.writeText(invoice);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Failed to copy - silently handle
    }
  };

  if (error) {
    return (
      <div
        className={`flex items-center justify-center p-8 bg-red-500/10 border border-red-500/30 rounded-lg ${className}`}
      >
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (!qrCodeDataUrl) {
    return (
      <div
        className={`flex items-center justify-center p-8 bg-slate-900/50 rounded-lg ${className}`}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Optional Header */}
      {showTitle && (
        <div className="text-center space-y-2">
          <h4 className="text-lg font-medium text-gray-100">
            Scan to Pay with Lightning
          </h4>
        </div>
      )}

      {error ? (
        <div className="flex items-center justify-center p-8 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      ) : !qrCodeDataUrl ? (
        <div className="flex items-center justify-center p-8 bg-slate-900/50 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* QR Code - Clean and focused */}
          <div className="flex justify-center">
            <div
              className="p-4 bg-white rounded-xl cursor-pointer hover:shadow-lg transition-shadow"
              onClick={copyInvoice}
              style={{ width: "fit-content" }}
            >
              <Image
                src={qrCodeDataUrl}
                alt="Lightning Invoice QR Code"
                width={200}
                height={200}
                className="block"
                unoptimized
              />
            </div>
          </div>

          {/* Copy Button - Matches modal style */}
          <button
            onClick={copyInvoice}
            className="w-full flex items-center justify-center gap-2 p-3 bg-slate-900/50 border border-slate-700 rounded-lg text-gray-300 hover:bg-slate-800 hover:text-teal-400 transition-all"
          >
            {copied ? (
              <>
                <CheckIcon size={20} className="text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <CopyIcon size={20} />
                <span>Click to copy invoice</span>
              </>
            )}
          </button>

          {/* Optional Instructions */}
          {showInstructions && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <p className="text-blue-400 text-sm text-center">
                Scan the QR code with your Lightning wallet to complete the
                payment
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
