"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface NavigationLoaderProps {
  message?: string;
}

export const NavigationLoader = ({
  message = "Loading Portal...",
}: NavigationLoaderProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Trigger loader on route or searchParam change
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400); // Short smooth delay to prevent flickering

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FFFDF0]/80 backdrop-blur-xs transition-all duration-300">
      <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-[#FFD700] flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-200">
        {/* Spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-[#FFD700]/30 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-[#28a745] border-t-transparent animate-spin"></div>
        </div>
        
        {/* Text */}
        <div className="text-center">
          <p className="font-black text-[#856404] text-sm tracking-wide">
            {message}
          </p>
          <p className="text-[11px] text-gray-400 font-medium mt-0.5">
            Please wait a moment
          </p>
        </div>
      </div>
    </div>
  );
};

export default NavigationLoader;