"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Sidebar } from "@/components/layout/Sidebar";

const TicketDetail = dynamic(() => import("@/components/board/TicketDetail").then(m => ({ default: m.TicketDetail })), { ssr: false });
const CreateTicketModal = dynamic(() => import("@/components/tickets/CreateTicketModal").then(m => ({ default: m.CreateTicketModal })), { ssr: false });
const LinkTicketModal = dynamic(() => import("@/components/tickets/LinkTicketModal").then(m => ({ default: m.LinkTicketModal })), { ssr: false });
const FeatureGraphModal = dynamic(() => import("@/components/tickets/FeatureGraphModal").then(m => ({ default: m.FeatureGraphModal })), { ssr: false });
const NotificationPanel = dynamic(() => import("@/components/notifications/NotificationPanel").then(m => ({ default: m.NotificationPanel })), { ssr: false });

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        {children}
      </main>

      {/* Global modals/panels */}
      <TicketDetail />
      <CreateTicketModal />
      <LinkTicketModal />
      <FeatureGraphModal />
      <NotificationPanel />
    </div>
  );
}
