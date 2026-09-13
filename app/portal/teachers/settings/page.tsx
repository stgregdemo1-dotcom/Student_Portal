"use client";

import React, { useState, useEffect } from 'react';

const SettingsPage = () => {
  const [teacherId, setTeacherId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Helper function to read auth identity cookie
  const getCookie = (name: string): string => {
    if (typeof document === "undefined") return "";
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || "";
    return "";
  };

  // Extract logged-in teacher identity on mount
  useEffect(() => {
    const cachedUsername = getCookie("username");
    if (cachedUsername) {
      setTeacherId(cachedUsername);
    }
  }, []);

  // Fetch live profile details from database collection
  useEffect(() => {
    if (!teacherId) return;

    const fetchTeacherProfile = async () => {
      try {
        const response = await fetch(`/api/portal/teacher?action=profile&id=${teacherId}`);
        const result = await response.json();
        
        if (result && result.success && result.data) {
          // 🚀 LOGIC: Combine first_name and last_name safely
          const firstName = result.data.first_name || "";
          const lastName = result.data.last_name || "";
          const combinedName = `${firstName} ${lastName}`.trim();
          const profileEmail = result.data.email || result.data.teacher_email || result.data.email_address || "";
          
          setName(combinedName);
          setEmail(profileEmail);
        }
      } catch (error) {
        console.error("Error loading profile configuration parameters:", error);
      }
    };

    fetchTeacherProfile();
  }, [teacherId]);

  // 🚀 LOGIC: Update submission method handler
  const handleUpdateProfile = async () => {
    if (!teacherId) return alert("Error: Missing teacher identity session.");
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/portal/teacher`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateProfile",
          teacherId: teacherId,
          name: name,
          email: email
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        alert("Profile synchronized successfully!");
      } else {
        alert(result.message || "Failed to commit profile updates.");
      }
    } catch (error) {
      console.error("Mutation submission error:", error);
      alert("An error occurred while communicating with the data server.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Account Settings</h2>
      
      <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Profile Information</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Display Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
        </div>
        <button 
          onClick={handleUpdateProfile}
          disabled={isUpdating}
          className="bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition disabled:opacity-50"
        >
          {isUpdating ? "Updating..." : "Update Profile"}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;