"use client";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

interface NudgeBannerProps {
  message: string;
  actions?: { label: string; onClick: () => void }[];
  variant?: "warning" | "info" | "suggestion";
}

export function NudgeBanner({ message, actions, variant = "warning" }: NudgeBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  
  if (dismissed) return null;

  const bgColor = variant === "warning" ? "bg-amber-50 border-amber-200" : variant === "info" ? "bg-blue-50 border-blue-200" : "bg-purple-50 border-purple-200";
  const textColor = variant === "warning" ? "text-amber-800" : variant === "info" ? "text-blue-800" : "text-purple-800";
  const iconColor = variant === "warning" ? "text-amber-500" : variant === "info" ? "text-blue-500" : "text-purple-500";

  return (
    <div className={`flex items-start gap-2 p-3 rounded-lg border ${bgColor} ${textColor} text-sm`}>
      <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${iconColor}`} />
      <div className="flex-1">
        <p>{message}</p>
        {actions && actions.length > 0 && (
          <div className="flex gap-2 mt-2">
            {actions.map((a, i) => (
              <button
                key={i}
                onClick={a.onClick}
                className="text-xs font-medium px-2 py-1 rounded bg-white border border-current/20 hover:bg-gray-50 transition-colors"
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <button onClick={() => setDismissed(true)} className="text-gray-400 hover:text-gray-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
