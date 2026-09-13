"use client";
import { useState } from 'react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);

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
            onClick={() => setNotifications(!notifications)}
            className={`w-12 h-6 rounded-full transition-colors ${notifications ? 'bg-blue-600' : 'bg-gray-300'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-transform transform ${notifications ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}