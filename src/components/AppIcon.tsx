import React from 'react';

interface AppIconProps {
  size?: number;
  className?: string;
}

export function AppIcon({ size = 64, className = "" }: AppIconProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* App background with gradient */}
        <rect
          width="64"
          height="64"
          rx="12"
          fill="url(#gradient)"
          className="drop-shadow-md"
        />
        
        {/* Graduation cap icon */}
        <g transform="translate(16, 16)">
          {/* Cap base */}
          <path
            d="M16 10L4 6L16 2L28 6L16 10Z"
            fill="white"
            fillOpacity="0.9"
          />
          
          {/* Cap top */}
          <path
            d="M16 10L28 6V12C28 16 22 18 16 18C10 18 4 16 4 12V6L16 10Z"
            fill="white"
            fillOpacity="0.7"
          />
          
          {/* Tassel */}
          <circle
            cx="22"
            cy="8"
            r="1.5"
            fill="white"
            fillOpacity="0.8"
          />
          <line
            x1="22"
            y1="9.5"
            x2="22"
            y2="14"
            stroke="white"
            strokeWidth="1"
            strokeOpacity="0.8"
          />
          
          {/* Book/document lines */}
          <rect
            x="8"
            y="20"
            width="16"
            height="10"
            rx="2"
            fill="white"
            fillOpacity="0.6"
          />
          <line
            x1="10"
            y1="23"
            x2="22"
            y2="23"
            stroke="#3b82f6"
            strokeWidth="1"
            strokeOpacity="0.8"
          />
          <line
            x1="10"
            y1="25"
            x2="20"
            y2="25"
            stroke="#3b82f6"
            strokeWidth="1"
            strokeOpacity="0.8"
          />
          <line
            x1="10"
            y1="27"
            x2="18"
            y2="27"
            stroke="#3b82f6"
            strokeWidth="1"
            strokeOpacity="0.8"
          />
        </g>
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#1e40af" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}