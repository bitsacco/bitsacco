"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { UserIcon, PencilIcon, CameraIcon } from "@phosphor-icons/react";

interface ProfileAvatarProps {
  name?: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  editable?: boolean;
  onAvatarChange?: (file: File) => void;
  loading?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-20 h-20",
  xl: "w-32 h-32",
};

const iconSizes = {
  sm: 12,
  md: 18,
  lg: 32,
  xl: 48,
};

export function ProfileAvatar({
  name,
  avatarUrl,
  size = "lg",
  editable = false,
  onAvatarChange,
  loading = false,
}: ProfileAvatarProps) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name?: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getGradientFromName = (name?: string) => {
    if (!name) return "from-teal-500 to-teal-600";

    const gradients = [
      "from-teal-500 to-teal-600",
      "from-blue-500 to-blue-600",
      "from-purple-500 to-purple-600",
      "from-green-500 to-green-600",
      "from-orange-500 to-orange-600",
      "from-pink-500 to-pink-600",
      "from-indigo-500 to-indigo-600",
      "from-red-500 to-red-600",
    ];

    const hash = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 1024 * 1024) {
      alert("File size must be less than 1MB");
      return;
    }

    onAvatarChange?.(file);
  };

  const handleClick = () => {
    if (editable && !loading) {
      fileInputRef.current?.click();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (editable && !loading) {
      setDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className="relative">
      <div
        className={`
          ${sizeClasses[size]} 
          rounded-full 
          flex 
          items-center 
          justify-center 
          shadow-lg 
          transition-all 
          duration-200
          ${editable && !loading ? "cursor-pointer hover:shadow-xl hover:scale-105" : ""}
          ${dragOver ? "ring-2 ring-teal-400 ring-offset-2 ring-offset-slate-800" : ""}
          ${loading ? "opacity-50" : ""}
        `}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name || "Profile"}
            width={
              size === "xl" ? 128 : size === "lg" ? 80 : size === "md" ? 48 : 32
            }
            height={
              size === "xl" ? 128 : size === "lg" ? 80 : size === "md" ? 48 : 32
            }
            className={`${sizeClasses[size]} rounded-full object-cover`}
          />
        ) : (
          <div
            className={`${sizeClasses[size]} bg-gradient-to-br ${getGradientFromName(name)} rounded-full flex items-center justify-center`}
          >
            {name ? (
              <span
                className={`text-white font-semibold ${
                  size === "sm"
                    ? "text-xs"
                    : size === "md"
                      ? "text-sm"
                      : size === "lg"
                        ? "text-lg"
                        : "text-2xl"
                }`}
              >
                {getInitials(name)}
              </span>
            ) : (
              <UserIcon
                size={iconSizes[size]}
                weight="fill"
                className="text-white"
              />
            )}
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-slate-800/60 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Drag overlay */}
        {dragOver && (
          <div className="absolute inset-0 bg-teal-500/30 rounded-full flex items-center justify-center">
            <CameraIcon size={iconSizes[size] / 2} className="text-white" />
          </div>
        )}
      </div>

      {/* Edit button */}
      {editable && !loading && (
        <button
          onClick={handleClick}
          className="absolute -bottom-1 -right-1 bg-teal-500 hover:bg-teal-600 text-white rounded-full p-2 shadow-lg transition-colors duration-200 ring-2 ring-slate-800"
        >
          <PencilIcon size={12} weight="bold" />
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileSelect(file);
          }
        }}
      />
    </div>
  );
}
