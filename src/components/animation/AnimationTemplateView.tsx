import React, { useEffect, useRef } from 'react';
import type { AnimationTemplateType } from '../../types';

interface AnimationTemplateViewProps {
  type: AnimationTemplateType;
  label?: string;
  className?: string;
  slowMotion?: boolean;
}

export const AnimationTemplateView: React.FC<AnimationTemplateViewProps> = ({
  type,
  label,
  className = '',
  slowMotion = false
}) => {
  const speedClass = slowMotion ? 'duration-[3000ms]' : 'duration-[1500ms]';

  switch (type) {
    case 'elephant_trunk':
      return (
        <div className={`relative flex flex-col items-center justify-center p-4 ${className}`}>
          <svg viewBox="0 0 200 200" className="w-full h-full max-w-[280px] drop-shadow-md">
            {/* Soft background glow */}
            <circle cx="100" cy="100" r="90" fill="#f1f5f9" />
            {/* Ears */}
            <circle cx="45" cy="85" r="32" fill="#94a3b8" />
            <circle cx="45" cy="85" r="22" fill="#cbd5e1" />
            <circle cx="155" cy="85" r="32" fill="#94a3b8" />
            <circle cx="155" cy="85" r="22" fill="#cbd5e1" />
            {/* Head */}
            <circle cx="100" cy="95" r="55" fill="#64748b" />
            {/* Cheerful Eyes */}
            <ellipse cx="80" cy="85" rx="7" ry="10" fill="#0f172a" />
            <circle cx="82" cy="82" r="3" fill="#ffffff" />
            <ellipse cx="120" cy="85" rx="7" ry="10" fill="#0f172a" />
            <circle cx="122" cy="82" r="3" fill="#ffffff" />
            {/* Friendly Blush */}
            <circle cx="68" cy="105" r="8" fill="#fda4af" opacity="0.7" />
            <circle cx="132" cy="105" r="8" fill="#fda4af" opacity="0.7" />
            {/* Animated Trunk */}
            <g className={`origin-[100px_95px] animate-bounce ${speedClass}`}>
              <path
                d="M 94 95 Q 100 145 130 135 Q 145 125 130 110 Q 110 115 106 95 Z"
                fill="#475569"
              />
            </g>
            {/* Cute Bowtie */}
            <polygon points="90,155 110,155 100,165" fill="#ef4444" />
            <polygon points="90,175 110,175 100,165" fill="#ef4444" />
            <circle cx="100" cy="165" r="5" fill="#b91c1c" />
          </svg>
          {label && (
            <div className="mt-3 px-4 py-1.5 bg-slate-900/80 text-white font-bold text-lg rounded-xl shadow">
              {label}
            </div>
          )}
        </div>
      );

    case 'brushing_teeth':
      return (
        <div className={`relative flex flex-col items-center justify-center p-4 ${className}`}>
          <svg viewBox="0 0 240 200" className="w-full h-full max-w-[320px] drop-shadow-md">
            {/* Mouth / Smile Contour */}
            <rect width="240" height="200" rx="24" fill="#f0f9ff" />
            <path
              d="M 30 90 Q 120 155 210 90 Q 120 40 30 90 Z"
              fill="#fed7aa"
              stroke="#ea580c"
              strokeWidth="4"
            />
            {/* Gums & Teeth Area */}
            <path
              d="M 45 90 Q 120 140 195 90 Q 120 60 45 90 Z"
              fill="#fb7185"
            />
            {/* Upper Teeth */}
            <g fill="#ffffff" stroke="#cbd5e1" strokeWidth="2">
              <rect x="75" y="70" width="18" height="22" rx="4" />
              <rect x="97" y="70" width="20" height="24" rx="4" />
              <rect x="121" y="70" width="20" height="24" rx="4" />
              <rect x="145" y="70" width="18" height="22" rx="4" />
            </g>
            {/* Lower Teeth */}
            <g fill="#ffffff" stroke="#cbd5e1" strokeWidth="2">
              <rect x="80" y="98" width="16" height="20" rx="4" />
              <rect x="100" y="98" width="18" height="22" rx="4" />
              <rect x="122" y="98" width="18" height="22" rx="4" />
              <rect x="144" y="98" width="16" height="20" rx="4" />
            </g>
            {/* Sparkling Stars */}
            <path d="M 60 60 L 63 68 L 71 71 L 63 74 L 60 82 L 57 74 L 49 71 L 57 68 Z" fill="#facc15" className="animate-spin duration-[4000ms]" />
            <path d="M 180 60 L 183 68 L 191 71 L 183 74 L 180 82 L 177 74 L 169 71 L 177 68 Z" fill="#facc15" className="animate-spin duration-[3000ms]" />

            {/* Animated Toothbrush moving back and forth gently */}
            <g className="animate-[pulse_1.2s_ease-in-out_infinite]">
              <g className="translate-x-2">
                <rect x="40" y="80" width="140" height="20" rx="10" fill="#0284c7" />
                <rect x="150" y="70" width="30" height="15" rx="3" fill="#38bdf8" />
                {/* Toothpaste blob */}
                <path d="M 152 70 Q 165 55 178 70" fill="#ec4899" />
                <circle cx="165" cy="62" r="4" fill="#fbcfe8" />
              </g>
            </g>
          </svg>
          {label && (
            <div className="mt-3 px-4 py-1.5 bg-slate-900/80 text-white font-bold text-lg rounded-xl shadow">
              {label}
            </div>
          )}
        </div>
      );

    case 'plant_growth':
      return (
        <div className={`relative flex flex-col items-center justify-center p-4 ${className}`}>
          <svg viewBox="0 0 200 200" className="w-full h-full max-w-[280px] drop-shadow-md">
            {/* Sky background */}
            <rect width="200" height="200" rx="20" fill="#f0fdf4" />
            {/* Warm Sun */}
            <circle cx="160" cy="40" r="24" fill="#fde047" className="animate-pulse" />
            {/* Rich Earth / Soil */}
            <path d="M 0 150 Q 100 140 200 150 L 200 200 L 0 200 Z" fill="#78350f" />
            {/* Sprouting Seed */}
            <ellipse cx="100" cy="165" rx="12" ry="8" fill="#451a03" />
            {/* Animated Stem & Leaves */}
            <g className="transition-all duration-1000 ease-out">
              {/* Green Stem */}
              <path
                d="M 100 160 Q 98 110 100 80"
                stroke="#16a34a"
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
              />
              {/* Left Leaf */}
              <path
                d="M 100 115 Q 65 95 65 75 Q 98 85 100 115 Z"
                fill="#22c55e"
                className="animate-[pulse_2s_ease-in-out_infinite]"
              />
              {/* Right Leaf */}
              <path
                d="M 100 95 Q 135 75 135 55 Q 102 65 100 95 Z"
                fill="#4ade80"
                className="animate-[pulse_2.2s_ease-in-out_infinite]"
              />
              {/* Flower Bud */}
              <circle cx="100" cy="72" r="10" fill="#f43f5e" />
              <circle cx="100" cy="72" r="5" fill="#fef08a" />
            </g>
          </svg>
          {label && (
            <div className="mt-3 px-4 py-1.5 bg-slate-900/80 text-white font-bold text-lg rounded-xl shadow">
              {label}
            </div>
          )}
        </div>
      );

    case 'traffic_light':
      return (
        <div className={`relative flex flex-col items-center justify-center p-4 ${className}`}>
          <svg viewBox="0 0 200 240" className="w-full h-full max-w-[240px] drop-shadow-md">
            <rect width="200" height="240" rx="20" fill="#f8fafc" />
            {/* Signal pole and hood */}
            <rect x="70" y="20" width="60" height="160" rx="16" fill="#1e293b" />
            <rect x="94" y="180" width="12" height="50" fill="#475569" />

            {/* Red Light */}
            <circle cx="100" cy="50" r="18" fill="#ef4444" className="filter drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            {/* Yellow Light */}
            <circle cx="100" cy="100" r="18" fill="#f59e0b" className="filter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            {/* Green Light */}
            <circle cx="100" cy="150" r="18" fill="#10b981" className="filter drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </svg>
          {label && (
            <div className="mt-3 px-4 py-1.5 bg-slate-900/80 text-white font-bold text-lg rounded-xl shadow">
              {label}
            </div>
          )}
        </div>
      );

    case 'bouncing_ball':
      return (
        <div className={`relative flex flex-col items-center justify-center p-4 ${className}`}>
          <svg viewBox="0 0 200 200" className="w-full h-full max-w-[260px] drop-shadow-md">
            <rect width="200" height="200" rx="20" fill="#faf5ff" />
            {/* Floor */}
            <line x1="20" y1="170" x2="180" y2="170" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
            {/* Animated Ball */}
            <g className="animate-[bounce_1s_infinite]">
              <circle cx="100" cy="80" r="32" fill="#8b5cf6" />
              {/* Pattern on ball */}
              <path d="M 75 70 Q 100 95 125 70" stroke="#c4b5fd" strokeWidth="4" fill="none" />
              <circle cx="88" cy="65" r="5" fill="#ede9fe" />
            </g>
            {/* Shadow expanding/contracting */}
            <ellipse cx="100" cy="170" rx="25" ry="6" fill="#cbd5e1" opacity="0.6" className="animate-pulse" />
          </svg>
          {label && (
            <div className="mt-3 px-4 py-1.5 bg-slate-900/80 text-white font-bold text-lg rounded-xl shadow">
              {label}
            </div>
          )}
        </div>
      );

    case 'water_flow':
      return (
        <div className={`relative flex flex-col items-center justify-center p-4 ${className}`}>
          <svg viewBox="0 0 200 200" className="w-full h-full max-w-[260px] drop-shadow-md">
            <rect width="200" height="200" rx="20" fill="#f0fdfa" />
            {/* Faucet */}
            <path d="M 60 40 L 105 40 L 105 75 L 95 75 L 95 55 L 60 55 Z" fill="#64748b" />
            <circle cx="60" cy="47" r="10" fill="#0284c7" />
            {/* Water Stream */}
            <g className="animate-[pulse_0.8s_ease-in-out_infinite]">
              <path d="M 98 75 Q 102 110 100 150" stroke="#38bdf8" strokeWidth="12" strokeLinecap="round" fill="none" />
              <path d="M 100 75 Q 98 110 100 150" stroke="#e0f2fe" strokeWidth="4" strokeLinecap="round" fill="none" />
            </g>
            {/* Water Drops */}
            <circle cx="95" cy="115" r="4" fill="#0284c7" className="animate-bounce" />
            <circle cx="105" cy="130" r="3" fill="#38bdf8" className="animate-bounce" />
            {/* Basin / Ripples */}
            <ellipse cx="100" cy="165" rx="55" ry="16" fill="#bae6fd" />
            <ellipse cx="100" cy="165" rx="35" ry="10" fill="#38bdf8" opacity="0.7" className="animate-ping" />
          </svg>
          {label && (
            <div className="mt-3 px-4 py-1.5 bg-slate-900/80 text-white font-bold text-lg rounded-xl shadow">
              {label}
            </div>
          )}
        </div>
      );

    case 'hand_washing':
      return (
        <div className={`relative flex flex-col items-center justify-center p-4 ${className}`}>
          <svg viewBox="0 0 200 200" className="w-full h-full max-w-[260px] drop-shadow-md">
            <rect width="200" height="200" rx="20" fill="#ecfeff" />
            {/* Two hands gently rubbing */}
            <g className="animate-[pulse_1s_ease-in-out_infinite]">
              {/* Left hand */}
              <ellipse cx="80" cy="110" rx="30" ry="40" fill="#fed7aa" transform="rotate(-15 80 110)" />
              {/* Right hand */}
              <ellipse cx="120" cy="110" rx="30" ry="40" fill="#fdba74" transform="rotate(15 120 110)" />
              {/* Soap Bubbles */}
              <circle cx="100" cy="95" r="14" fill="#ffffff" stroke="#38bdf8" strokeWidth="2" opacity="0.9" />
              <circle cx="85" cy="80" r="10" fill="#ffffff" stroke="#38bdf8" strokeWidth="2" opacity="0.9" />
              <circle cx="118" cy="85" r="12" fill="#ffffff" stroke="#38bdf8" strokeWidth="2" opacity="0.9" />
              <circle cx="100" cy="130" r="8" fill="#ffffff" stroke="#38bdf8" strokeWidth="2" opacity="0.8" />
            </g>
          </svg>
          {label && (
            <div className="mt-3 px-4 py-1.5 bg-slate-900/80 text-white font-bold text-lg rounded-xl shadow">
              {label}
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
};
