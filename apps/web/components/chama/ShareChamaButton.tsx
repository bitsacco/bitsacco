"use client";

import { useState } from "react";
import { Button } from "@bitsacco/ui";
import { ShareNetworkIcon, CheckIcon } from "@phosphor-icons/react";
import { Routes } from "@/lib/routes";

interface ShareChamaButtonProps {
  chamaId: string;
  chamaName: string;
  variant?: "tealPrimary" | "tealOutline" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  showLabel?: boolean;
}

export function ShareChamaButton({
  chamaId,
  chamaName,
  variant = "outline",
  size = "sm",
  className = "",
  showLabel = true,
}: ShareChamaButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const joinUrl = `${window.location.origin}${Routes.JOIN_CHAMA(chamaId)}`;

    try {
      // Try using the Web Share API first (for mobile)
      if (navigator.share) {
        await navigator.share({
          title: `Join ${chamaName} on Bitsacco`,
          text: `You've been invited to join ${chamaName} on Bitsacco. Click the link to join and start saving together!`,
          url: joinUrl,
        });
      } else {
        // Fallback to clipboard copy
        await navigator.clipboard.writeText(joinUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // If share fails, try copying to clipboard
      try {
        await navigator.clipboard.writeText(joinUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Silently fail if both methods don't work
        console.error("Failed to share or copy link");
      }
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      className={`flex items-center gap-2 ${className}`}
      title="Share chama invite link"
    >
      {copied ? (
        <CheckIcon size={16} weight="bold" className="text-teal-400" />
      ) : (
        <ShareNetworkIcon size={16} weight="bold" />
      )}
      {showLabel && (copied ? "Link Copied!" : "Share Invite")}
    </Button>
  );
}
