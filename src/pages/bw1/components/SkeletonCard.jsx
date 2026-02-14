import React from "react";

export default function SkeletonCard() {
  return (
    <div className="group bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-100 flex flex-col animate-pulse">
      {/* Image Skeleton */}
      <div className="relative h-64 bg-slate-200" />

      {/* Content Skeleton */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Price Skeleton */}
        <div className="h-8 bg-slate-200 rounded-lg w-1/2 mb-3" />

        {/* Title Skeleton */}
        <div className="h-6 bg-slate-200 rounded-lg w-4/5 mb-3" />

        {/* Location Skeleton */}
        <div className="h-4 bg-slate-200 rounded-lg w-3/5 mb-4" />

        {/* Features Skeleton */}
        <div className="grid grid-cols-3 gap-2 py-4 border-t border-slate-100 mb-4">
          <div className="h-12 bg-slate-200 rounded-lg" />
          <div className="h-12 bg-slate-200 rounded-lg" />
          <div className="h-12 bg-slate-200 rounded-lg" />
        </div>

        {/* Button Skeleton */}
        <div className="h-12 bg-slate-200 rounded-full w-full" />
      </div>
    </div>
  );
}
