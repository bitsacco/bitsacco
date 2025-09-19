"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { CopyIcon, CheckIcon } from "@phosphor-icons/react";

interface LightningQRCodeProps {
  invoice: string;
  size?: number;
  className?: string;
}

export function LightningQRCode({
  invoice,
  size = 256,
  className = "",
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
          width: size,
          margin: 2,
          color: {
            dark: "#1f2937", // Dark gray for better contrast
            light: "#ffffff",
          },
          errorCorrectionLevel: "M",
        });
        setQrCodeDataUrl(url);
        setError("");
      } catch (err) {
        console.error("Failed to generate QR code:", err);
        setError("Failed to generate QR code");
      }
    };

    generateQRCode();
  }, [invoice, size]);

  const copyInvoice = async () => {
    try {
      await navigator.clipboard.writeText(invoice);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy invoice:", err);
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
      {/* QR Code */}
      <div
        className="mx-auto p-4 bg-white rounded-xl cursor-pointer hover:shadow-lg transition-shadow"
        onClick={copyInvoice}
        style={{ width: "fit-content" }}
      >
        <Image
          src={qrCodeDataUrl}
          alt="Lightning Invoice QR Code"
          width={size}
          height={size}
          className="block"
          unoptimized // Required for data URLs
        />
      </div>

      {/* Copy Button */}
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
    </div>
  );
}
