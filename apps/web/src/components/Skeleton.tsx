import React from "react";

export type SkeletonProps = {
  height?: number;
  width?: string;
};

export const Skeleton = ({ height = 10, width = "100%" }: SkeletonProps) => {
  return (
    <div
      style={{
        height,
        width,
        borderRadius: 6,
        background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%)",
        backgroundSize: "400% 100%",
        animation: "niche-skeleton 1.4s ease infinite"
      }}
    >
      <style>{`@keyframes niche-skeleton { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }`}</style>
    </div>
  );
};
