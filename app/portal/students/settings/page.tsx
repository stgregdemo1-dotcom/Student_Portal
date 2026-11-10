"use client";

import { useState } from 'react';
import { useAuthGuard } from "@/app/hooks/useAuthGuard";

export default function SettingsPage() {
  const { isAuthenticated, loading: authLoading } = useAuthGuard({
    requiredPrefix: "ST",
    redirectTo: "/portal/log-in",
  });

  const [notifications, setNotifications] = useState(true);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 font-sans">
        <div className="text-center space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#082b49] border-t-transparent"></div>
          <p className="text-sm font-bold text-[#856404]">Verifying Security Credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl">
      <h3 className="text-xl font-bold mb-6">Account Settings</h3>

      <div className="space-y-6">
        <div className="flex items-center justify-between py-3 border-b">
          <div>
            <p className="font-medium">Email Notifications</p>
            <p className="text-sm text-gray-500">Receive weekly academic summaries</p>
          </div>
          <button
            type="button"
            aria-label="Email Notifications"
            aria-pressed={notifications}
            onClick={() => setNotifications(!notifications)}
            className={`h-7 w-14 cursor-pointer rounded-full border border-transparent shadow-inner transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d99a00] focus-visible:ring-offset-2 ${notifications ? 'bg-[#d99a00]' : 'bg-slate-400'}`}
          >
            <div className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${notifications ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        <button type="button" className="cursor-pointer rounded-lg bg-[#082b49] px-6 py-2 font-semibold text-white shadow-sm transition-all hover:bg-[#0b3b62] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d99a00] focus-visible:ring-offset-2 active:scale-[0.98]">
          Save Changes
        </button>
      </div>
    </div>
  );
}