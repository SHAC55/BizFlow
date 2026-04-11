import { useEffect, useState } from "react";
import { loadingTips } from "../../constants/loadingTips";

export default function LoadingTips() {
  const [index, setIndex] = useState(
    Math.floor(Math.random() * loadingTips.length),
  );
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % loadingTips.length);
        setIsVisible(true);
      }, 400);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-8 w-full max-w-sm">
      <div className={`
        transition-all duration-500 ease-in-out transform
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}
      `}>
        {/* Creative tip card with light blue theme */}
        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-300 to-sky-300 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
          
          {/* Card content */}
          <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-100 shadow-lg">
            <div className="flex items-start gap-3">
              {/* Creative icon container */}
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center animate-soft-pulse">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                {/* Small decorative dot */}
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-ping-slow"></div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                    Did you know?
                  </span>
                  <div className="h-1 w-1 bg-blue-300 rounded-full"></div>
                  <span className="text-xs text-blue-400">💡 Tip</span>
                </div>
                
                <p key={index} className="text-sm text-gray-700 leading-relaxed">
                  {loadingTips[index]}
                </p>
                
                {/* Decorative line */}
                <div className="mt-2 flex gap-1">
                  <div className="h-0.5 w-4 bg-blue-200 rounded-full"></div>
                  <div className="h-0.5 w-2 bg-blue-300 rounded-full"></div>
                  <div className="h-0.5 w-1 bg-blue-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}