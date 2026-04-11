import LoadingTips from "./LoadingTips";

export default function PageLoader() {
  return (
    <div className="relative flex flex-col w-full md:ml-24 items-center justify-center min-h-screen bg-white">
      {/* Floating bubbles animation - uncomment if needed */}
      {/* <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-blue-200/40 to-sky-200/40 animate-float"
            style={{
              width: `${Math.random() * 100 + 20}px`,
              height: `${Math.random() * 100 + 20}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 7}s`,
            }}
          />
        ))}
      </div> */}

      {/* Decorative waves at bottom - uncomment if needed */}
      {/* <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg className="relative w-full h-32 text-blue-200/30" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="currentColor"/>
        </svg>
      </div> */}

      {/* Main loader container */}
      <div className="relative z-10 flex flex-col items-center justify-center p-8 max-w-md mx-4">
        {/* Loading text with creative styling */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold text-black">
            Preparing Your Dashboard
          </h2>

          {/* <p className="text-blue-500/70 text-sm">Please wait while we get everything ready</p> */}

          {/* Animated progress bar */}
          <div className="mt-4 w-64 mx-auto">
            <div className="h-1 bg-black rounded-full overflow-hidden">
              <div className="h-full bg-gray-300 rounded-full animate-loading-bar"></div>
            </div>
          </div>

          {/* Creative dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce-slow"></div>
            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce-slow [animation-delay:0.2s]"></div>
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce-slow [animation-delay:0.4s]"></div>
          </div>
        </div>

        <LoadingTips />
      </div>

      {/* Add custom CSS animations */}
      <style jsx>{`
        @keyframes loading-bar {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-6px);
            opacity: 1;
          }
        }

        @keyframes float {
          0% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0;
          }
          20% {
            opacity: 0.6;
          }
          80% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }

        .animate-loading-bar {
          animation: loading-bar 1.8s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 1.4s ease-in-out infinite;
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
