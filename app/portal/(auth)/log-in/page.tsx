"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { startNavigationLoading } from "../../../-components/startNavigationLoading";
import StudentDataPrivacyNotice from "../../../-components/StudentDataPrivacyNotice";

export default function Portal() {
  const [showPassword, setShowPassword] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [isPrivacyNoticeOpen, setIsPrivacyNoticeOpen] = useState(false);
  const [hasAcknowledgedPrivacyNotice, setHasAcknowledgedPrivacyNotice] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const shakeForm = () => {
    const form = formRef.current;
    if (!form) return;

    form.classList.remove("login-form-shake");
    void form.offsetWidth;
    form.classList.add("login-form-shake");
  };

  const showLoginError = (message: string) => {
    setErrorMessage(message);
    shakeForm();
  };

  const handleStaffModeChange = (staff: boolean) => {
    setIsStaff(staff);
    setErrorMessage("");
  };

  const closePrivacyNotice = () => setIsPrivacyNoticeOpen(false);

  const acknowledgePrivacyNotice = () => {
    setHasAcknowledgedPrivacyNotice(true);
    closePrivacyNotice();
  };

  useEffect(() => {
    document.cookie = "audit_user=; path=/; max-age=0; SameSite=Strict";

    if (formRef.current) {
      (formRef.current.elements.namedItem("username") as HTMLInputElement).value = "";
      (formRef.current.elements.namedItem("password") as HTMLInputElement).value = "";
    }
  }, [isStaff]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const form = e.target as HTMLFormElement;
    const username = (form.elements.namedItem("username") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value.trim();

    if (!username || !password) {
      showLoginError("Please enter your login ID and password.");
      return;
    }

    const expectedUserType = isStaff ? "staff" : "student";

    try {
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
        showLoginError(data.message || "Something went wrong.");
        return;
      }

      document.cookie = `audit_user=${encodeURIComponent(username)}; path=/; max-age=28800; SameSite=Strict`;
      document.cookie = `username=${encodeURIComponent(username)}; path=/; max-age=28800; SameSite=Strict`;
      if (isStaff) {
        if (username.toUpperCase().startsWith("ADM")) {
          startNavigationLoading("/portal/admin/dashboard");
          router.push("/portal/admin/dashboard");
        } else if (username.toUpperCase().startsWith("TCH")) {
          startNavigationLoading("/portal/teachers/dashboard");
          router.push("/portal/teachers/dashboard");
        } else if (username.toUpperCase().startsWith("REG")) {
          startNavigationLoading("/portal/registrar/dashboard");
          router.push("/portal/registrar/dashboard");
        } else {
          showLoginError("Invalid Employee ID format. Use ADM-XXXX for Admin or TCH-XXXX for Teacher or REG-XXXX for Registar.");
        }
      } else {
        startNavigationLoading("/portal/students/dashboard");
        router.push("/portal/students/dashboard");
      }

    } catch (err) {
      showLoginError("Cannot connect to the server. Please check your network connection.");
    }
  };

  return (
    <div className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden p-5">
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_68%_42%,#28599B_0%,#17427F_46%,#062755_100%)] transition-opacity duration-700 ease-in-out motion-reduce:transition-none ${isStaff ? "opacity-100" : "opacity-0"}`}
      >
        <div className="absolute -left-40 -top-48 h-[440px] w-[440px] rounded-full bg-[#0A3674]/75" />
        <div className="absolute -left-36 -top-44 h-[270px] w-[270px] rounded-full bg-[radial-gradient(circle_at_35%_35%,#FFD466_0%,#FFC107_72%,#FFB300_100%)]" />
        <div className="absolute -left-[230px] -top-[230px] h-[460px] w-[460px] rounded-full border-[3px] border-[#FFC107]/90" />
        <div className="absolute -bottom-[330px] -left-[220px] h-[570px] w-[570px] rounded-full bg-[#2D5FA1]/35" />
        <div className="absolute -bottom-[380px] -left-[190px] h-[550px] w-[550px] rounded-full border-[3px] border-[#FFC107]/75" />
        <div className="absolute -bottom-[310px] -right-[180px] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_70%_35%,#FFD15C_0%,#FFC107_58%,#FFB300_100%)]" />
        <div className="absolute -bottom-[370px] -right-[245px] h-[570px] w-[570px] rounded-full border-[3px] border-[#FFC107]/85" />
        <div className="absolute left-[8%] top-[5%] h-32 w-24 opacity-95" style={{ backgroundImage: "radial-gradient(circle, #FFC107 2.5px, transparent 3px)", backgroundSize: "28px 28px" }} />
        <div className="absolute bottom-[30%] right-[1%] h-32 w-24 opacity-95" style={{ backgroundImage: "radial-gradient(circle, #FFC107 2.5px, transparent 3px)", backgroundSize: "28px 28px" }} />
      </div>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-700 ease-in-out motion-reduce:transition-none ${isStaff ? "opacity-0" : "opacity-100"}`}
        style={{
          backgroundImage:
            "linear-gradient(105deg, #FF6500 0%, #FF9100 22%, #FFD000 46%, #FFF078 68%, #FFF9E9 100%)",
        }}
      >
        <div className="absolute -left-40 -top-48 h-[440px] w-[440px] rounded-full bg-[#FFD466]/80" />
        <div className="absolute -left-36 -top-44 h-[270px] w-[270px] rounded-full bg-[radial-gradient(circle_at_35%_35%,#28599B_0%,#17427F_72%,#062755_100%)]" />
        <div className="absolute -left-[230px] -top-[230px] h-[460px] w-[460px] rounded-full border-[3px] border-[#0A3674]/90" />
        <div className="absolute -bottom-[330px] -left-[220px] h-[570px] w-[570px] rounded-full bg-[#17427F]/25" />
        <div className="absolute -bottom-[380px] -left-[190px] h-[550px] w-[550px] rounded-full border-[3px] border-[#0A3674]/60" />
        <div className="absolute -bottom-[310px] -right-[180px] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_70%_35%,#28599B_0%,#17427F_58%,#062755_100%)]" />
        <div className="absolute -bottom-[370px] -right-[245px] h-[570px] w-[570px] rounded-full border-[3px] border-[#0A3674]/75" />
        <div className="absolute left-[8%] top-[5%] h-32 w-24 opacity-95" style={{ backgroundImage: "radial-gradient(circle, #0A3674 2.5px, transparent 3px)", backgroundSize: "28px 28px" }} />
        <div className="absolute bottom-[30%] right-[1%] h-32 w-24 opacity-95" style={{ backgroundImage: "radial-gradient(circle, #0A3674 2.5px, transparent 3px)", backgroundSize: "28px 28px" }} />
      </div>
      <div className="relative z-10 w-full max-w-[450px] rounded-[30px] bg-[#FFFCF5] p-10 text-center shadow-[0_15px_35px_rgba(0,0,0,0.2)]">

        <Link
          href="/Home"
          className={`absolute left-5 top-5 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#082B49]/20 bg-white text-[#082B49] shadow-sm transition-[transform,background-color,color,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#082B49] focus-visible:ring-offset-2 ${
            isStaff
              ? "hover:bg-[#17427F] hover:text-white"
              : "hover:bg-[#FFC107]"
          }`}
          aria-label="Home"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 10 9-7 9 7" />
            <path d="M5 9v11h14V9M9 20v-6h6v6" />
          </svg>
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
        <div className="flex justify-center items-center mb-6 w-fit mx-auto rounded-2xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => handleStaffModeChange(false)}
            className={`cursor-pointer rounded-xl px-6 py-2 text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183B56] focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 ${!isStaff ? "bg-white text-[#6a11cb] shadow-sm hover:bg-white" : "text-gray-500 hover:bg-white/70 hover:text-[#6a11cb]"
              }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => handleStaffModeChange(true)}
            className={`cursor-pointer rounded-xl px-6 py-2 text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#183B56] focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 ${isStaff ? "bg-white text-[#2575fc] shadow-sm hover:bg-white" : "text-gray-500 hover:bg-white/70 hover:text-[#2575fc]"
              }`}
          >
            Faculty
          </button>
        </div>

        {/* Login Form */}
        <form
          className="text-left"
          onSubmit={handleLogin}
          onInvalidCapture={shakeForm}
          ref={formRef}
        >
          {errorMessage && (
            <div
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
              className="login-error-notification mb-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-left text-sm font-medium text-red-600"
            >
              {errorMessage}
            </div>
          )}

          <div className="mb-5">
            <label className="block mb-2 text-[#444] font-semibold text-sm" htmlFor="username">
              {isStaff ? "Employee ID" : "Student Number"}
            </label>
            <input
              className="w-full rounded-xl border-2 border-gray-200 bg-white p-3.5 text-base transition-all focus:border-[#2575fc] focus:outline-none focus:ring-4 focus:ring-[#2575fc]/10"
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
              className="w-full rounded-xl border-2 border-gray-200 bg-white p-3.5 text-base transition-all focus:border-[#2575fc] focus:outline-none focus:ring-4 focus:ring-[#2575fc]/10"
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

          {!isStaff && (
            <div className="mb-6 flex items-center">
              <input
                type="checkbox"
                id="privacyPolicy"
                className="mr-2 h-4 w-4 shrink-0 cursor-pointer accent-[#2575fc]"
                checked={hasAcknowledgedPrivacyNotice}
                required
                onClick={(event) => {
                  if (!hasAcknowledgedPrivacyNotice) {
                    event.preventDefault();
                    setIsPrivacyNoticeOpen(true);
                  }
                }}
                onChange={(event) => {
                  setHasAcknowledgedPrivacyNotice(event.target.checked);
                }}
              />
              <label htmlFor="privacyPolicy" className="text-sm text-[#444]">
                I agree to the
              </label>
              <button
                type="button"
                className="ml-1 text-sm text-[#2575fc] hover:underline"
                onClick={() => setIsPrivacyNoticeOpen(true)}
              >
                Data Privacy Policy
              </button>
            </div>
          )}

          <button
            type="submit"
            className={`w-full cursor-pointer rounded-xl p-4 text-lg font-bold shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:brightness-110 hover:shadow-xl active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none ${
              isStaff
                ? "bg-[#FFC728] text-[#0D2B45] shadow-[#D89B00]/30 hover:bg-[#FF9100] focus-visible:ring-[#D89B00]"
                : "bg-[linear-gradient(to_right,#17427F,#28599B)] text-white shadow-blue-900/30 hover:bg-[linear-gradient(to_right,#28599B,#3E78C5)] focus-visible:ring-[#28599B]"
            }`}
          >
            {isStaff ? "Staff Login" : "Student Login"}
          </button>
        </form>
        <div className="mt-6 flex h-8 items-center justify-center">
          {isStaff ? (
            <p className="text-center text-xs leading-4 font-medium text-[#666]">
              Need to reset your password? Ask the Admin to send the link
            </p>
          ) : (
            <Link
              href="/portal/forgot-password"
              className="text-sm text-[#2575fc] hover:underline"
            >
              Forgot Password?
            </Link>
          )}
        </div>

      </div>
      {isPrivacyNoticeOpen && (
        <StudentDataPrivacyNotice
          onAcknowledge={acknowledgePrivacyNotice}
          onClose={closePrivacyNotice}
        />
      )}
    </div>
  );
}
