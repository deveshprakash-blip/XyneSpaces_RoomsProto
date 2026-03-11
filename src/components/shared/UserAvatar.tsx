"use client";
import { cn, getInitials } from "@/lib/utils";
import { useUserStore } from "@/stores/userStore";

interface UserAvatarProps {
  userId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-6 h-6 text-[10px]",
  md: "w-8 h-8 text-xs",
  lg: "w-10 h-10 text-sm",
};

export function UserAvatar({ userId, size = "md", className }: UserAvatarProps) {
  const user = useUserStore((s) => s.getUserById(userId));
  
  if (userId === "ai-agent") {
    return (
      <div className={cn(
        "rounded-full flex items-center justify-center font-bold bg-purple-600 text-white flex-shrink-0",
        sizeClasses[size],
        className
      )}>
        🤖
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0",
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: user?.avatarColor || "#6b7280" }}
      title={user?.name || userId}
    >
      {getInitials(user?.name || "?")}
    </div>
  );
}
