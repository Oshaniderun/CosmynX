export function CosmicBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none bg-[#050505]"
    >
      {/* 1. Deep Space Void with Realistic Subtle Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 20%, #0A0A0A 0%, #050505 70%, #020202 100%)",
        }}
      />

      {/* 2. Scalable High-Precision Astronomical Starfield (Static, Sharp Point Sources) */}
      <svg
        className="absolute inset-0 h-full w-full opacity-65"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMin slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="star-soft" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#F1F0EC" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#050505" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Primary Navigational Stars (Subtle, realistic stellar coordinates) */}
        <g fill="#F1F0EC">
          <circle cx="140" cy="120" r="1.2" opacity="0.8" />
          <circle cx="280" cy="85" r="0.9" opacity="0.6" />
          <circle cx="420" cy="240" r="1.4" opacity="0.85" />
          <circle cx="560" cy="160" r="0.8" opacity="0.5" />
          <circle cx="710" cy="95" r="1.1" opacity="0.7" />
          <circle cx="890" cy="210" r="1.5" opacity="0.9" />
          <circle cx="1040" cy="140" r="0.8" opacity="0.5" />
          <circle cx="1210" cy="80" r="1.3" opacity="0.8" />
          <circle cx="1380" cy="190" r="1.0" opacity="0.65" />
          <circle cx="1540" cy="110" r="1.6" opacity="0.9" />
          <circle cx="1710" cy="230" r="0.9" opacity="0.55" />
          <circle cx="1840" cy="150" r="1.2" opacity="0.75" />

          {/* Lower field stars */}
          <circle cx="95" cy="460" r="0.8" opacity="0.5" />
          <circle cx="215" cy="580" r="1.2" opacity="0.7" />
          <circle cx="340" cy="720" r="0.9" opacity="0.6" />
          <circle cx="490" cy="860" r="1.4" opacity="0.8" />
          <circle cx="680" cy="620" r="0.7" opacity="0.45" />
          <circle cx="810" cy="780" r="1.1" opacity="0.65" />
          <circle cx="980" cy="540" r="1.3" opacity="0.75" />
          <circle cx="1140" cy="690" r="0.8" opacity="0.5" />
          <circle cx="1320" cy="840" r="1.0" opacity="0.6" />
          <circle cx="1490" cy="590" r="1.5" opacity="0.85" />
          <circle cx="1660" cy="750" r="0.9" opacity="0.55" />
          <circle cx="1810" cy="910" r="1.2" opacity="0.7" />
        </g>

        {/* Faint Background Stellar Dust (0.5px - 0.7px sharp micro-stars) */}
        <g fill="#A8A8A8" opacity="0.45">
          <circle cx="60" cy="220" r="0.6" />
          <circle cx="190" cy="310" r="0.5" />
          <circle cx="310" cy="180" r="0.7" />
          <circle cx="460" cy="70" r="0.5" />
          <circle cx="620" cy="290" r="0.6" />
          <circle cx="780" cy="340" r="0.5" />
          <circle cx="940" cy="110" r="0.7" />
          <circle cx="1110" cy="260" r="0.6" />
          <circle cx="1270" cy="320" r="0.5" />
          <circle cx="1450" cy="90" r="0.7" />
          <circle cx="1620" cy="280" r="0.6" />
          <circle cx="1780" cy="50" r="0.5" />
          <circle cx="1890" cy="330" r="0.7" />

          <circle cx="120" cy="810" r="0.5" />
          <circle cx="260" cy="940" r="0.6" />
          <circle cx="410" cy="630" r="0.7" />
          <circle cx="580" cy="740" r="0.5" />
          <circle cx="740" cy="920" r="0.6" />
          <circle cx="900" cy="670" r="0.5" />
          <circle cx="1060" cy="880" r="0.7" />
          <circle cx="1230" cy="610" r="0.6" />
          <circle cx="1390" cy="950" r="0.5" />
          <circle cx="1580" cy="710" r="0.7" />
          <circle cx="1740" cy="830" r="0.6" />
        </g>
      </svg>
    </div>
  );
}
