"use client";

import { useState } from "react";


export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Password reset link has been sent to ${email}`);
    setEmail("");
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-red-600 to-lime-400">
      <div className="w-full max-w-md text-center bg-white rounded-2xl p-10 shadow-2xl">
        
        <div className="text-5xl mb-4">🔑</div>

        <h1 className="text-3xl font-bold text-slate-800 relative mb-3">
          Forgot Password
          <span className="block w-24 h-1 bg-gradient-to-r from-red-600 to-lime-400 mx-auto mt-2 rounded-full"></span>
        </h1>

        <p className="text-gray-500 mb-6">
          Reset your account password
        </p>


        <div className="bg-blue-50 text-blue-700 border-l-4 border-blue-500 p-4 rounded-lg text-sm mb-6 text-left">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </div>

        <form onSubmit={handleSubmit} className="text-left">
          <label className="block mb-2 font-medium text-slate-700">
            Email Address
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your registered email"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition mb-5"
          />

          <button
            type="submit"
            className="w-full py-3 rounded-full text-white font-medium bg-blue-600 shadow-lg hover:bg-blue-700 hover:-translate-y-1 transition"
          >
            Send Reset Link
          </button>
        </form>

        {/* Back link */}
        <a
          href="/portal/log-in"
          className="inline-block mt-4 text-blue-500 hover:underline font-medium"
        >
          ← Back to Login
        </a>

      </div>
    </main>
  );
}