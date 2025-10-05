import React from 'react';

export default function Loader() {
  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-600"></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}