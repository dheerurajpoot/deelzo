"use client";

import { PHONE } from "@/lib/constant";
import Link from "next/link";
import { useEffect, useState } from "react";

export function WhatsAppButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasClosedTooltip, setHasClosedTooltip] = useState(false);

  useEffect(() => {
    // Show button after a small delay
    const showTimer = setTimeout(() => {
      setIsVisible(true);
      
      // Show tooltip after the button appears
      const tooltipTimer = setTimeout(() => {
        if (!hasClosedTooltip) {
          setShowTooltip(true);
          
          // Auto-hide tooltip after 8 seconds to be unobtrusive
          setTimeout(() => {
            setShowTooltip(false);
          }, 8000);
        }
      }, 1500);
      
      return () => clearTimeout(tooltipTimer);
    }, 500);
    
    return () => clearTimeout(showTimer);
  }, [hasClosedTooltip]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 md:bottom-10 right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none">
      {/* Tooltip */}
      <div 
        className={`relative rounded-2xl bg-white p-4 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border border-gray-100/50 pointer-events-auto origin-bottom-right ${
          showTooltip 
            ? "translate-y-0 opacity-100 scale-100" 
            : "translate-y-4 opacity-0 scale-90 pointer-events-none"
        }`}
      >
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowTooltip(false);
            setHasClosedTooltip(true);
          }}
          className="absolute text-gray-400 hover:text-gray-600 hover:bg-gray-100 -top-2 -right-2 bg-white rounded-full p-1.5 shadow-sm transition-colors z-10"
          aria-label="Close tooltip"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div className="pr-2">
            <p className="text-[15px] font-semibold text-gray-800 leading-tight">Need help?</p>
            <p className="text-[13px] text-gray-500 mt-0.5">Chat with our support team!</p>
          </div>
        </div>
      </div>

      {/* Button */}
      <Link
        href={`https://wa.me/${PHONE}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex h-[50px] w-[50px] cursor-pointer items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_25px_rgba(37,211,102,0.4)] transition-all duration-300 hover:scale-[1.08] hover:shadow-[0_12px_30px_rgba(37,211,102,0.6)] pointer-events-auto ml-auto"
        aria-label="Chat with us on WhatsApp"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className="absolute inset-0 block h-full w-full animate-ping rounded-full bg-[#25D366] opacity-30 group-hover:opacity-0 transition-opacity"></span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="34"
          height="34"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="relative z-10 transition-transform duration-300 group-hover:scale-110"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
      </Link>
    </div>
  );
}
