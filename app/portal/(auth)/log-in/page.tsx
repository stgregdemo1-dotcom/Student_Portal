"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Portal() {
  const [showPassword, setShowPassword] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); 
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Clear any leftover audit cookies immediately when landing on the login screen
    document.cookie = "audit_user=; path=/; max-age=0; SameSite=Strict";

    if (formRef.current) {
      (formRef.current.elements.namedItem("username") as HTMLInputElement).value = "";
      (formRef.current.elements.namedItem("password") as HTMLInputElement).value = "";
    }
    setErrorMessage(""); 
  }, [isStaff]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(""); 
    
    const form = e.target as HTMLFormElement;
    const username = (form.elements.namedItem("username") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value.trim();

    if (!username || !password) return;

    // Determine target user type string based on the active tab layout selection
    const expectedUserType = isStaff ? "staff" : "student";

    try {
      // UPDATED: Sending expectedUserType to the backend server route handler
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username, 
          password, 
          user_type: expectedUserType 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Something went wrong.");
        return;
      }

      // Save the validated username inside a secure cookie for auditing
      document.cookie = `audit_user=${encodeURIComponent(username)}; path=/; max-age=28800; SameSite=Strict`;
      document.cookie = `username=${encodeURIComponent(username)}; path=/; max-age=28800; SameSite=Strict`;
      if (isStaff) {
        if (username.toUpperCase().startsWith("ADM")) {
          router.push("/portal/admin/dashboard");
        } else if (username.toUpperCase().startsWith("TCH")) {
          router.push("/portal/teachers/dashboard");
        } else if (username.toUpperCase().startsWith("REG")) {
          router.push("/portal/registrar/dashboard");
        } else {
          setErrorMessage("Invalid Employee ID format. Use ADM-XXXX for Admin or TCH-XXXX for Teacher or REG-XXXX for Registar.");
        }
      } else {
        router.push("/portal/students/dashboard");
      }

    } catch (err) {
      setErrorMessage("Cannot connect to the server. Please check your network connection.");
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex justify-center items-center p-5 transition-all duration-500 ${
        isStaff
          ? "bg-[linear-gradient(135deg,#182848_0%,#4b6cb7_100%)]"
          : "bg-[linear-gradient(135deg,#f80c0c_0%,#b9da02_100%)]"
      }`}
    >
      <div className="relative w-full max-w-[450px] bg-white/95 backdrop-blur-[10px] rounded-[30px] shadow-[0_15px_35px_rgba(0,0,0,0.2)] p-10 text-center">

        <Link
          href="/Home"
          className="absolute top-5 left-5 flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200/50 transition-all z-50 text-gray-600"
          aria-label="Back to home"
        >
          <span className="text-2xl font-bold">←</span>
        </Link>

        {/* Header */}
        <div className="mb-6">
          <Image
            src="/logo1.jpg"
            className="block mx-auto rounded-full mb-4"
            alt="logo"
            width={100}
            height={100}
          />
          <h1 className="text-[#333] text-3xl font-bold mb-1">Saint Gregory</h1>
          <p className="text-[#666] text-base">College of Science and Technology</p>
        </div>

        {/* Toggle Switch */}
        <div className="flex justify-center items-center mb-6 bg-gray-100 p-1 rounded-2xl w-fit mx-auto">
          <button
            type="button"
            onClick={() => setIsStaff(false)}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              !isStaff ? "bg-white text-[#6a11cb] shadow-sm" : "text-gray-500"
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setIsStaff(true)}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              isStaff ? "bg-white text-[#2575fc] shadow-sm" : "text-gray-500"
            }`}
          >
            Faculty
          </button>
        </div>

        {/* Error Notification Alert Block */}
        {errorMessage && (
          <div className="mb-4 p-3.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-200 text-left">
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form className="text-left" onSubmit={handleLogin} ref={formRef}>

          <div className="mb-5">
            <label className="block mb-2 text-[#444] font-semibold text-sm" htmlFor="username">
              {isStaff ? "Employee ID" : "Student Number"}
            </label>
            <input
              className="w-full p-3.5 border-2 border-gray-200 rounded-xl text-base transition-all focus:border-[#2575fc] focus:outline-none focus:ring-4 focus:ring-[#2575fc]/10"
              type="text"
              id="username"
              name="username"
              placeholder={isStaff ? "Enter your Employee ID" : "Enter your Student Number"}
              required
            />
          </div>

          <div className="mb-5">
            <label className="block mb-2 text-[#444] font-semibold text-sm" htmlFor="password">
              Password
            </label>
            <input
              className="w-full p-3.5 border-2 border-gray-200 rounded-xl text-base transition-all focus:border-[#2575fc] focus:outline-none focus:ring-4 focus:ring-[#2575fc]/10"
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="flex items-center mb-4 cursor-pointer">
            <input
              type="checkbox"
              id="showPassword"
              className="w-4 h-4 mr-2 cursor-pointer accent-[#2575fc]"
              onChange={() => setShowPassword(!showPassword)}
            />
            <label htmlFor="showPassword" className="text-[#444] text-sm cursor-pointer">
              Show Password
            </label>
          </div>

          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="privacyPolicy"
              className="w-4 h-4 mr-2 cursor-pointer accent-[#2575fc]"
              required
            />
            <label htmlFor="privacyPolicy" className="text-[#444] text-sm cursor-pointer leading-tight">
              I agree to the{" "}
              <Link href="#" className="text-[#2575fc] hover:underline">
                Data Privacy Policy
              </Link>
            </label>
          </div>

          <button
            type="submit"
            className={`w-full p-4 text-white font-bold text-lg rounded-xl shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 ${
              isStaff
                ? "bg-[linear-gradient(to_right,#182848,#4b6cb7)] shadow-blue-900/20"
                : "bg-[linear-gradient(to_right,#6a11cb,#2575fc)] shadow-blue-500/30"
            }`}
          >
            {isStaff ? "Staff Login" : "Student Login"}
          </button>
        </form>

        <Link
          href="/portal/forgot-password"
          className="inline-block mt-6 text-[#2575fc] text-sm hover:underline"
        >
          Forgot Password?
        </Link>
      </div>
    </div>
  );
}