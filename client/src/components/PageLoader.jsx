import React from "react";

const PageLoader = () => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
    </div>
  );
};

export default PageLoader;
