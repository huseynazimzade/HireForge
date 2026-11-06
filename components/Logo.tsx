"use client";

import React, { useState } from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  linkHome?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  size = "md",
  linkHome = true,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  const textSize =
    size === "lg"
      ? "text-3xl md:text-5xl"
      : size === "sm"
      ? "text-lg"
      : "text-2xl md:text-3xl";

  const imgHeight =
    size === "lg"
      ? "h-14 sm:h-16 md:h-20"
      : size === "sm"
      ? "h-7 sm:h-8"
      : "h-9 sm:h-10 md:h-11";

  const content = (
    <div className={`flex items-center select-none ${className}`}>
      {!imgFailed ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src="/logo.png"
          alt="HireForge"
          className={`${imgHeight} w-auto object-contain transition-all`}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span className={`${textSize} font-extrabold tracking-tight inline-block`}>
          <span className="text-[#4F46E5]">Hire</span>
          <span className="text-[#F97316]">Forge</span>
        </span>
      )}
    </div>
  );

  if (linkHome) {
    return (
      <Link href="/" className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
};
