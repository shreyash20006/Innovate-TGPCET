import React from 'react';

export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <circle cx="100" cy="100" r="95" fill="#111827" stroke="#EAB308" strokeWidth="3" />
      <circle cx="100" cy="100" r="65" fill="none" stroke="#EAB308" strokeWidth="1.5" />
      
      {/* Center Hexagon */}
      <polygon points="100,45 145,70 145,130 100,155 55,130 55,70" fill="none" stroke="#EAB308" strokeWidth="2.5" />
      
      {/* Center Text */}
      <text x="100" y="110" fontFamily="sans-serif" fontSize="28" fontWeight="900" fill="#FFFFFF" textAnchor="middle" letterSpacing="1">TGPCET</text>
      
      {/* Circuit lines inside hexagon */}
      {/* Top Right Circuit */}
      <path d="M 115,53 L 125,63 L 135,63" fill="none" stroke="#EAB308" strokeWidth="2" />
      <circle cx="115" cy="53" r="2" fill="#EAB308" />
      <circle cx="135" cy="63" r="2" fill="#EAB308" />
      
      <path d="M 125,63 L 125,75 L 135,85" fill="none" stroke="#EAB308" strokeWidth="2" />
      <circle cx="135" cy="85" r="2" fill="#EAB308" />

      {/* Bottom Left Circuit */}
      <path d="M 60,115 L 75,115 L 85,125 L 100,125" fill="none" stroke="#EAB308" strokeWidth="2" />
      <circle cx="60" cy="115" r="2" fill="#EAB308" />
      <circle cx="100" cy="125" r="2" fill="#EAB308" />

      <path d="M 85,125 L 85,135 L 95,145" fill="none" stroke="#EAB308" strokeWidth="2" />
      <circle cx="95" cy="145" r="2" fill="#EAB308" />

      {/* Circular Text Paths */}
      <defs>
        {/* Top arc for INNOVATE.TGPCET */}
        <path id="topArc" d="M 25,100 A 75,75 0 0,1 175,100" />
        {/* Bottom arc for IDEAS -> PROJECTS -> IMPACT */}
        <path id="bottomArc" d="M 22,100 A 78,78 0 0,0 178,100" />
        {/* Inner bottom arc for INNOVATING THE FUTURE */}
        <path id="innerBottomArc" d="M 42,100 A 58,58 0 0,0 158,100" />
      </defs>

      {/* Outer Text Top */}
      <text fontFamily="sans-serif" fontSize="18" fontWeight="bold" fill="#FFFFFF" letterSpacing="2">
        <textPath href="#topArc" startOffset="50%" textAnchor="middle">INNOVATE.TGPCET</textPath>
      </text>

      {/* Outer Text Bottom */}
      <text fontFamily="sans-serif" fontSize="13" fontWeight="bold" fill="#FFFFFF" letterSpacing="1.5">
        <textPath href="#bottomArc" startOffset="50%" textAnchor="middle">IDEAS ➔ PROJECTS ➔ IMPACT</textPath>
      </text>

      {/* Inner Text Bottom */}
      <text fontFamily="sans-serif" fontSize="9" fontWeight="bold" fill="#FFFFFF" letterSpacing="2">
        <textPath href="#innerBottomArc" startOffset="50%" textAnchor="middle">INNOVATING THE FUTURE</textPath>
      </text>

      {/* Side Dots */}
      <circle cx="15" cy="100" r="3" fill="#EAB308" />
      <circle cx="185" cy="100" r="3" fill="#EAB308" />
    </svg>
  );
}
