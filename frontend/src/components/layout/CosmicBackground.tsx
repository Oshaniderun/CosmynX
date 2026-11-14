export function CosmicBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
    >
      {/* 1. Base Abyssal Cosmic Void with Volumetric Depth Gradients */}
      <div
        className="absolute inset-0 bg-[#02050c]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 78% 18%, rgba(30, 58, 102, 0.42) 0%, rgba(12, 27, 52, 0.28) 28%, rgba(4, 9, 20, 0.9) 65%, #02050c 100%),
            radial-gradient(circle at 18% 25%, rgba(18, 38, 72, 0.32) 0%, rgba(8, 18, 36, 0.18) 35%, transparent 60%),
            radial-gradient(circle at 25% 75%, rgba(20, 32, 64, 0.28) 0%, transparent 50%),
            radial-gradient(circle at 50% 90%, rgba(6, 14, 28, 0.4) 0%, transparent 60%)
          `,
        }}
      />

      {/* 2. Scalable High-Fidelity Celestial Artwork, Stars, Meteors & Orbital Dynamics */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMin slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Intense Limb Glow Filter */}
          <filter id="intense-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="40" result="blur2" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="90" result="blur3" />
            <feMerge>
              <feMergeNode in="blur3" />
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Soft Atmospheric Haze Filter */}
          <filter id="atmospheric-haze" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="64" />
          </filter>

          {/* Micro Glow Filter for Waypoint Nodes & Meteors */}
          <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Primary Celestial Body Shading (Sunlit Top-Right, Shadowed Bottom-Left) */}
          <radialGradient id="lunar-surface" cx="72%" cy="26%" r="70%">
            <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.95" />
            <stop offset="12%" stopColor="#93c5fd" stopOpacity="0.75" />
            <stop offset="28%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="48%" stopColor="#1e3a5f" stopOpacity="0.2" />
            <stop offset="68%" stopColor="#081426" stopOpacity="0.85" />
            <stop offset="85%" stopColor="#020712" stopOpacity="0.98" />
            <stop offset="100%" stopColor="#010307" stopOpacity="1" />
          </radialGradient>

          {/* Atmospheric Rim Scattering Gradient */}
          <radialGradient id="atmospheric-limb" cx="75%" cy="24%" r="58%">
            <stop offset="78%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="88%" stopColor="#a5f3fc" stopOpacity="0.25" />
            <stop offset="93%" stopColor="#38bdf8" stopOpacity="0.75" />
            <stop offset="97%" stopColor="#67e8f9" stopOpacity="0.95" />
            <stop offset="99%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>

          {/* Outer Atmospheric Corona Glow */}
          <radialGradient id="outer-corona" cx="74%" cy="22%" r="62%">
            <stop offset="80%" stopColor="#38bdf8" stopOpacity="0.32" />
            <stop offset="90%" stopColor="#0284c7" stopOpacity="0.16" />
            <stop offset="96%" stopColor="#0369a1" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
          </radialGradient>

          {/* Secondary Moon Gradient */}
          <radialGradient id="sec-moon-grad" cx="68%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#64748b" stopOpacity="0.4" />
            <stop offset="75%" stopColor="#0b1320" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#02060e" stopOpacity="1" />
          </radialGradient>

          {/* Orbital Trajectory Arc Stroke Gradients */}
          <linearGradient id="orbit-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.05" />
            <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.4" />
            <stop offset="55%" stopColor="#e0f2fe" stopOpacity="0.7" />
            <stop offset="75%" stopColor="#38bdf8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.02" />
          </linearGradient>

          <linearGradient id="orbit-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a5f3fc" stopOpacity="0.5" />
            <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.25" />
            <stop offset="80%" stopColor="#818cf8" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>

          {/* Meteor / Shooting Star Trails (High luminosity at head, smooth atmospheric taper at tail) */}
          <linearGradient id="meteor-trail-1" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0369a1" stopOpacity="0" />
            <stop offset="30%" stopColor="#0284c7" stopOpacity="0.25" />
            <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.75" />
            <stop offset="85%" stopColor="#a5f3fc" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="meteor-trail-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0" />
            <stop offset="35%" stopColor="#0369a1" stopOpacity="0.3" />
            <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="90%" stopColor="#67e8f9" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="meteor-trail-3" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0" />
            <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.35" />
            <stop offset="75%" stopColor="#818cf8" stopOpacity="0.75" />
            <stop offset="92%" stopColor="#bae6fd" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="meteor-trail-4" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0369a1" stopOpacity="0" />
            <stop offset="35%" stopColor="#0284c7" stopOpacity="0.25" />
            <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.75" />
            <stop offset="90%" stopColor="#a5f3fc" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
          </linearGradient>

          {/* Left Nebula Dust Gradients */}
          <radialGradient id="left-nebula-1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.16" />
            <stop offset="50%" stopColor="#1e3a8a" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#02050c" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="left-nebula-2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.12" />
            <stop offset="50%" stopColor="#0369a1" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#02050c" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 3. Left Subtle Cosmic Nebula Clouds (Gives depth behind left modules) */}
        <g className="anim-nebula">
          <ellipse cx="260" cy="380" rx="360" ry="260" fill="url(#left-nebula-1)" filter="url(#atmospheric-haze)" />
          <ellipse cx="380" cy="720" rx="300" ry="220" fill="url(#left-nebula-2)" filter="url(#atmospheric-haze)" />
        </g>

        {/* 4. Volumetric Atmospheric Glow Backplate for Primary Celestial Body */}
        <circle
          cx="1420"
          cy="260"
          r="480"
          fill="url(#outer-corona)"
          filter="url(#atmospheric-haze)"
          className="anim-corona"
        />

        {/* 5. Giant Celestial Lunar/Planetary Sphere (Inspired by reference Kepler sphere) */}
        <g id="celestial-body">
          {/* Main sphere silhouette */}
          <circle cx="1400" cy="250" r="380" fill="url(#lunar-surface)" />

          {/* Detailed crater and terrain shadow textures */}
          <path
            d="M 1250,120 Q 1340,160 1390,240 Q 1420,320 1380,420 Q 1340,510 1200,560 Q 1100,590 1030,550 C 1200,480 1300,340 1250,120 Z"
            fill="#030814"
            opacity="0.65"
          />
          <circle cx="1320" cy="220" r="42" fill="#030814" opacity="0.35" />
          <circle cx="1450" cy="160" r="28" fill="#020713" opacity="0.4" />
          <circle cx="1380" cy="340" r="55" fill="#020611" opacity="0.45" />
          <circle cx="1480" cy="280" r="36" fill="#030816" opacity="0.35" />

          {/* Brilliant Atmospheric Limb Ring (The radiant edge from the reference) */}
          <circle
            cx="1400"
            cy="250"
            r="380"
            fill="none"
            stroke="url(#atmospheric-limb)"
            strokeWidth="18"
            opacity="0.95"
            filter="url(#intense-glow)"
            className="anim-corona"
          />
          <circle
            cx="1400"
            cy="250"
            r="380"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3.5"
            opacity="0.85"
          />
        </g>

        {/* 6. Secondary Orbiting Celestial Companion (Mirroring the smaller moon in reference) */}
        <g id="secondary-moon" opacity="0.85">
          <circle cx="1060" cy="180" r="62" fill="url(#sec-moon-grad)" />
          {/* Secondary crescent edge light */}
          <path
            d="M 1060,118 A 62 62 0 0 1 1122,180 A 62 62 0 0 0 1060,118 Z"
            fill="#ffffff"
            opacity="0.75"
            filter="url(#node-glow)"
          />
          <circle
            cx="1060"
            cy="180"
            r="62"
            fill="none"
            stroke="#a5f3fc"
            strokeWidth="1.2"
            opacity="0.6"
          />
        </g>

        {/* 7. Orbital Trajectory Rings & Flight Paths (Like Kepler's orbital lines) */}
        <g id="orbital-trajectories">
          {/* Primary inclined orbit ellipse */}
          <ellipse
            cx="1350"
            cy="320"
            rx="640"
            ry="220"
            transform="rotate(-26 1350 320)"
            fill="none"
            stroke="url(#orbit-grad-1)"
            strokeWidth="1.8"
            strokeDasharray="12 8 4 8"
            className="anim-orbit"
          />

          {/* Secondary wider equatorial transfer ellipse */}
          <ellipse
            cx="1380"
            cy="360"
            rx="780"
            ry="280"
            transform="rotate(-18 1380 360)"
            fill="none"
            stroke="url(#orbit-grad-2)"
            strokeWidth="1.2"
            strokeOpacity="0.65"
          />

          {/* Polar Insertion Trajectory Arc */}
          <path
            d="M 680,680 C 880,520 1150,380 1520,310 S 1850,380 1920,440"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.2"
            strokeDasharray="4 8"
            strokeOpacity="0.4"
          />

          {/* Glowing Waypoint Nodes along the orbits (Mirroring the radar/waypoint blips) */}
          <circle cx="1230" cy="145" r="5.5" fill="#ffffff" filter="url(#node-glow)" className="anim-waypoint" />
          <circle cx="1230" cy="145" r="12" fill="none" stroke="#38bdf8" strokeWidth="1.2" opacity="0.75" />

          <circle cx="1690" cy="280" r="4.8" fill="#38bdf8" filter="url(#node-glow)" className="anim-waypoint" />
          <circle cx="1690" cy="280" r="10" fill="none" stroke="#a5f3fc" strokeWidth="1" opacity="0.6" />
          <circle cx="1780" cy="410" r="3.6" fill="#a5f3fc" opacity="0.85" />
          <circle cx="940" cy="460" r="4.5" fill="#818cf8" filter="url(#node-glow)" opacity="0.8" className="anim-waypoint" />
          <circle cx="940" cy="460" r="9" fill="none" stroke="#818cf8" strokeWidth="0.8" opacity="0.5" />

          {/* Tiny drifting micro-asteroids / space dust */}
          <polygon points="1720,490 1726,493 1723,499 1716,496" fill="#475569" opacity="0.75" />
          <polygon points="1680,515 1685,518 1682,522 1677,519" fill="#334155" opacity="0.65" />
        </g>

        {/* 8. Active Animated Meteors / Shooting Star Streaks Across the Sky */}
        <g id="meteors">
          {/* Meteor / Comet Streak 1 (Primary High-Velocity Comet on Upper-Left) */}
          <g className="anim-meteor-1">
            {/* Diffuse Outer Glow Trail */}
            <line
              x1="580"
              y1="42"
              x2="260"
              y2="298"
              stroke="url(#meteor-trail-1)"
              strokeWidth="9"
              strokeLinecap="round"
              opacity="0.3"
              filter="url(#node-glow)"
            />
            {/* Core Tail */}
            <line
              x1="580"
              y1="42"
              x2="260"
              y2="298"
              stroke="url(#meteor-trail-1)"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            {/* Inner Intense White Center Tail */}
            <line
              x1="360"
              y1="218"
              x2="260"
              y2="298"
              stroke="#ffffff"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.85"
            />
            {/* Glowing Comet Head Aura & Coma */}
            <circle cx="260" cy="298" r="18" fill="#38bdf8" opacity="0.28" filter="url(#node-glow)" />
            <circle cx="260" cy="298" r="10" fill="#a5f3fc" opacity="0.75" filter="url(#node-glow)" />
            <circle cx="260" cy="298" r="4.5" fill="#ffffff" filter="url(#node-glow)" />
            {/* Optical Flare Cross */}
            <polygon
              points="260,284 261.4,296.6 274,298 261.4,299.4 260,312 258.6,299.4 246,298 258.6,296.6"
              fill="#ffffff"
              opacity="0.85"
            />
          </g>

          {/* Meteor / Comet Streak 2 (Mid-Left Tapered Comet) */}
          <g className="anim-meteor-2">
            <line
              x1="440"
              y1="372"
              x2="190"
              y2="572"
              stroke="url(#meteor-trail-2)"
              strokeWidth="7"
              strokeLinecap="round"
              opacity="0.28"
              filter="url(#node-glow)"
            />
            <line
              x1="440"
              y1="372"
              x2="190"
              y2="572"
              stroke="url(#meteor-trail-2)"
              strokeWidth="3.6"
              strokeLinecap="round"
            />
            <line
              x1="280"
              y1="500"
              x2="190"
              y2="572"
              stroke="#ffffff"
              strokeWidth="1.4"
              strokeLinecap="round"
              opacity="0.8"
            />
            <circle cx="190" cy="572" r="14" fill="#0284c7" opacity="0.3" filter="url(#node-glow)" />
            <circle cx="190" cy="572" r="8" fill="#38bdf8" opacity="0.7" filter="url(#node-glow)" />
            <circle cx="190" cy="572" r="3.8" fill="#ffffff" filter="url(#node-glow)" />
            <polygon
              points="190,562 191.2,570.8 200,572 191.2,573.2 190,582 188.8,573.2 180,572 188.8,570.8"
              fill="#ffffff"
              opacity="0.75"
            />
          </g>

          {/* Meteor / Comet Streak 3 (High-Altitude Fast Comet) */}
          <g className="anim-meteor-3">
            <line
              x1="860"
              y1="-14"
              x2="600"
              y2="194"
              stroke="url(#meteor-trail-3)"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.25"
            />
            <line
              x1="860"
              y1="-14"
              x2="600"
              y2="194"
              stroke="url(#meteor-trail-3)"
              strokeWidth="3.0"
              strokeLinecap="round"
            />
            <circle cx="600" cy="194" r="10" fill="#818cf8" opacity="0.35" filter="url(#node-glow)" />
            <circle cx="600" cy="194" r="6" fill="#bae6fd" opacity="0.75" filter="url(#node-glow)" />
            <circle cx="600" cy="194" r="3.2" fill="#ffffff" filter="url(#node-glow)" />
          </g>

          {/* Meteor / Comet Streak 4 (Upper Celestial Traverse) */}
          <g className="anim-meteor-4">
            <line
              x1="1240"
              y1="60"
              x2="980"
              y2="268"
              stroke="url(#meteor-trail-4)"
              strokeWidth="7"
              strokeLinecap="round"
              opacity="0.28"
              filter="url(#node-glow)"
            />
            <line
              x1="1240"
              y1="60"
              x2="980"
              y2="268"
              stroke="url(#meteor-trail-4)"
              strokeWidth="3.4"
              strokeLinecap="round"
            />
            <circle cx="980" cy="268" r="12" fill="#38bdf8" opacity="0.32" filter="url(#node-glow)" />
            <circle cx="980" cy="268" r="7" fill="#a5f3fc" opacity="0.75" filter="url(#node-glow)" />
            <circle cx="980" cy="268" r="3.5" fill="#ffffff" filter="url(#node-glow)" />
          </g>
        </g>

        {/* 9. Left Navigational Constellations & Diamond Sparkle Stars */}
        <g id="left-constellations" opacity="0.9">
          {/* Faint Constellation Geometric Guide Lines */}
          <polyline
            points="120,240 240,190 340,280 290,410 180,360 120,240"
            fill="none"
            stroke="rgba(56, 189, 248, 0.22)"
            strokeWidth="0.8"
            strokeDasharray="3 4"
          />
          <line x1="240" y1="190" x2="290" y2="410" stroke="rgba(56, 189, 248, 0.16)" strokeWidth="0.6" strokeDasharray="2 3" />
          <polyline
            points="290,410 380,520 480,480 540,600"
            fill="none"
            stroke="rgba(129, 140, 248, 0.2)"
            strokeWidth="0.7"
            strokeDasharray="3 4"
          />

          {/* Large Radiant 4-Point Diamond Sparkle Stars on Prominent Navigational Waypoints */}
          <g transform="translate(240, 190)" className="anim-twinkle-1">
            <polygon
              points="0,-14 2.5,-2.5 14,0 2.5,2.5 0,14 -2.5,2.5 -14,0 -2.5,-2.5"
              fill="#ffffff"
              filter="url(#node-glow)"
            />
            <circle cx="0" cy="0" r="3.2" fill="#ffffff" filter="url(#node-glow)" />
            <circle cx="0" cy="0" r="8" fill="none" stroke="#a5f3fc" strokeWidth="0.8" opacity="0.65" />
          </g>

          <g transform="translate(340, 280)" className="anim-twinkle-2">
            <polygon
              points="0,-11 2,-2 11,0 2,2 0,11 -2,2 -11,0 -2,-2"
              fill="#ffffff"
              filter="url(#node-glow)"
            />
            <circle cx="0" cy="0" r="2.8" fill="#38bdf8" filter="url(#node-glow)" />
            <circle cx="0" cy="0" r="6" fill="none" stroke="#38bdf8" strokeWidth="0.8" opacity="0.5" />
          </g>

          <g transform="translate(180, 360)" className="anim-twinkle-3">
            <polygon
              points="0,-9 1.8,-1.8 9,0 1.8,1.8 0,9 -1.8,1.8 -9,0 -1.8,-1.8"
              fill="#ffffff"
              filter="url(#node-glow)"
            />
            <circle cx="0" cy="0" r="2.4" fill="#e0f2fe" />
          </g>

          <g transform="translate(480, 480)" className="anim-twinkle-1">
            <polygon
              points="0,-13 2.5,-2.5 13,0 2.5,2.5 0,13 -2.5,2.5 -13,0 -2.5,-2.5"
              fill="#ffffff"
              filter="url(#node-glow)"
            />
            <circle cx="0" cy="0" r="3.0" fill="#818cf8" filter="url(#node-glow)" />
            <circle cx="0" cy="0" r="7" fill="none" stroke="#818cf8" strokeWidth="0.8" opacity="0.6" />
          </g>

          <g transform="translate(120, 240)" className="anim-twinkle-2">
            <polygon
              points="0,-9 1.8,-1.8 9,0 1.8,1.8 0,9 -1.8,1.8 -9,0 -1.8,-1.8"
              fill="#ffffff"
              filter="url(#node-glow)"
            />
            <circle cx="0" cy="0" r="2.4" fill="#38bdf8" />
          </g>

          <g transform="translate(540, 600)" className="anim-twinkle-3">
            <polygon
              points="0,-11 2,-2 11,0 2,2 0,11 -2,2 -11,0 -2,-2"
              fill="#ffffff"
              filter="url(#node-glow)"
            />
            <circle cx="0" cy="0" r="2.6" fill="#a5f3fc" />
          </g>

          {/* Additional Celestial Diamond Stars in Sky & Horizon */}
          <g transform="translate(760, 140)" className="anim-twinkle-1">
            <polygon
              points="0,-13 2.5,-2.5 13,0 2.5,2.5 0,13 -2.5,2.5 -13,0 -2.5,-2.5"
              fill="#ffffff"
              filter="url(#node-glow)"
            />
            <circle cx="0" cy="0" r="3.2" fill="#ffffff" filter="url(#node-glow)" />
            <circle cx="0" cy="0" r="7.5" fill="none" stroke="#38bdf8" strokeWidth="0.8" opacity="0.6" />
          </g>

          <g transform="translate(380, 720)" className="anim-twinkle-2">
            <polygon
              points="0,-11 2,-2 11,0 2,2 0,11 -2,2 -11,0 -2,-2"
              fill="#ffffff"
              filter="url(#node-glow)"
            />
            <circle cx="0" cy="0" r="2.8" fill="#bae6fd" filter="url(#node-glow)" />
          </g>

          <g transform="translate(1720, 130)" className="anim-twinkle-1">
            <polygon
              points="0,-12 2.2,-2.2 12,0 2.2,2.2 0,12 -2.2,2.2 -12,0 -2.2,-2.2"
              fill="#ffffff"
              filter="url(#node-glow)"
            />
            <circle cx="0" cy="0" r="3.0" fill="#a5f3fc" filter="url(#node-glow)" />
          </g>
        </g>

        {/* 10. Precision NASA HUD Coordinate & Target Vector Overlay */}
        <g id="hud-telemetry" opacity="0.65">
          {/* Target Reticle (Top-Right of primary sphere) */}
          <g transform="translate(1480, 110)">
            <rect
              x="0"
              y="0"
              width="196"
              height="58"
              rx="10"
              fill="rgba(8, 16, 30, 0.6)"
              stroke="rgba(56, 189, 248, 0.3)"
              strokeWidth="1"
            />
            <text x="16" y="20" fill="#94a3b8" fontSize="10.5" fontFamily="var(--font-mono, monospace)" letterSpacing="1.5">
              TARGET
            </text>
            <text x="16" y="37" fill="#f8fafc" fontSize="14.5" fontWeight="600" fontFamily="var(--font-heading, sans-serif)">
              ARTEMIS-III / POLE
            </text>
            <text x="16" y="50" fill="#38bdf8" fontSize="9.5" fontFamily="var(--font-mono, monospace)">
              LAT -89.9° · ELEV +1,737 KM
            </text>
            <circle cx="172" cy="29" r="4.5" fill="#38bdf8" filter="url(#node-glow)" />
            <path d="M 0,29 L -24,29 L -42,50" fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" />
          </g>

          {/* Left-edge Mission Control coordinate marks */}
          <g transform="translate(40, 360)">
            <path d="M 0,0 L 8,0 M 4,-6 L 4,6" stroke="rgba(148, 163, 184, 0.25)" strokeWidth="1" />
            <text x="16" y="4" fill="#64748b" fontSize="10.5" fontFamily="var(--font-mono, monospace)">
              MOON (301) / HORIZONS
            </text>
          </g>
          <g transform="translate(40, 680)">
            <path d="M 0,0 L 8,0 M 4,-6 L 4,6" stroke="rgba(148, 163, 184, 0.25)" strokeWidth="1" />
            <text x="16" y="4" fill="#64748b" fontSize="10.5" fontFamily="var(--font-mono, monospace)">
              POLAR STEREO · R=1737.4 KM
            </text>
          </g>
        </g>

        {/* 11. Living Starfield with Enlarged Stars & Multi-Phase Motion */}
        <g id="starfield">
          {/* Twinkle Group 1: High-Intensity Pulsing & Moving Stars (Significantly Enlarged) */}
          <g className="anim-twinkle-1">
            {/* Star with diffuse luminous halo */}
            <g>
              <circle cx="110" cy="90" r="9" fill="#38bdf8" opacity="0.3" filter="url(#node-glow)" />
              <circle cx="110" cy="90" r="3.6" fill="#a5f3fc" filter="url(#node-glow)" />
              <circle cx="110" cy="90" r="1.8" fill="#ffffff" />
            </g>
            <g>
              <circle cx="310" cy="150" r="8" fill="#38bdf8" opacity="0.25" filter="url(#node-glow)" />
              <circle cx="310" cy="150" r="3.4" fill="#bae6fd" filter="url(#node-glow)" />
              <circle cx="310" cy="150" r="1.6" fill="#ffffff" />
            </g>
            <g>
              <circle cx="550" cy="160" r="10" fill="#38bdf8" opacity="0.32" filter="url(#node-glow)" />
              <circle cx="550" cy="160" r="4.2" fill="#ffffff" filter="url(#node-glow)" />
            </g>
            <g>
              <circle cx="320" cy="460" r="8" fill="#818cf8" opacity="0.28" filter="url(#node-glow)" />
              <circle cx="320" cy="460" r="3.5" fill="#ffffff" filter="url(#node-glow)" />
            </g>
            <g>
              <circle cx="160" cy="720" r="8" fill="#38bdf8" opacity="0.28" filter="url(#node-glow)" />
              <circle cx="160" cy="720" r="3.4" fill="#bae6fd" filter="url(#node-glow)" />
            </g>
            <g>
              <circle cx="380" cy="740" r="9" fill="#0284c7" opacity="0.3" filter="url(#node-glow)" />
              <circle cx="380" cy="740" r="3.6" fill="#38bdf8" filter="url(#node-glow)" />
            </g>
            <g>
              <circle cx="820" cy="95" r="9" fill="#38bdf8" opacity="0.3" filter="url(#node-glow)" />
              <circle cx="820" cy="95" r="3.8" fill="#ffffff" filter="url(#node-glow)" />
            </g>
            <g>
              <circle cx="1680" cy="90" r="8" fill="#38bdf8" opacity="0.25" filter="url(#node-glow)" />
              <circle cx="1680" cy="90" r="3.4" fill="#bae6fd" />
            </g>
            <g>
              <circle cx="1760" cy="620" r="8" fill="#38bdf8" opacity="0.25" filter="url(#node-glow)" />
              <circle cx="1760" cy="620" r="3.5" fill="#7dd3fc" filter="url(#node-glow)" />
            </g>
          </g>

          {/* Twinkle Group 2: Mid-Paced Ambient Stars (Enlarged) */}
          <g className="anim-twinkle-2">
            <circle cx="70" cy="140" r="2.6" fill="#ffffff" opacity="0.9" filter="url(#node-glow)" />
            <circle cx="190" cy="190" r="2.4" fill="#bae6fd" opacity="0.85" />
            <circle cx="260" cy="260" r="2.8" fill="#ffffff" opacity="0.9" filter="url(#node-glow)" />
            <circle cx="420" cy="310" r="2.6" fill="#ffffff" opacity="0.9" />
            <circle cx="510" cy="230" r="2.8" fill="#7dd3fc" opacity="0.85" filter="url(#node-glow)" />
            <circle cx="170" cy="490" r="3.0" fill="#ffffff" opacity="0.9" filter="url(#node-glow)" />
            <circle cx="250" cy="520" r="2.6" fill="#a5f3fc" opacity="0.85" />
            <circle cx="410" cy="520" r="2.6" fill="#bae6fd" opacity="0.85" />
            <circle cx="590" cy="620" r="3.0" fill="#7dd3fc" opacity="0.9" filter="url(#node-glow)" />
            <circle cx="270" cy="740" r="2.8" fill="#ffffff" opacity="0.9" />
            <circle cx="510" cy="720" r="2.6" fill="#ffffff" opacity="0.9" />
            <circle cx="630" cy="750" r="2.8" fill="#bae6fd" opacity="0.9" filter="url(#node-glow)" />
            <circle cx="1180" cy="70" r="2.8" fill="#ffffff" opacity="0.9" filter="url(#node-glow)" />
            <circle cx="1820" cy="180" r="2.6" fill="#ffffff" opacity="0.85" />
          </g>

          {/* Gently Drifting Star Cluster Layer (Slow Physical Spatial Drift) */}
          <g className="anim-star-drift">
            <circle cx="680" cy="280" r="2.8" fill="#e0f2fe" opacity="0.8" filter="url(#node-glow)" />
            <circle cx="790" cy="340" r="2.4" fill="#bae6fd" opacity="0.75" />
            <circle cx="890" cy="210" r="3.0" fill="#ffffff" opacity="0.85" filter="url(#node-glow)" />
            <circle cx="480" cy="680" r="2.6" fill="#a5f3fc" opacity="0.8" />
            <circle cx="640" cy="490" r="2.4" fill="#ffffff" opacity="0.75" />
          </g>

          {/* Twinkle Group 3: Deep Space Distant Stars */}
          <g className="anim-twinkle-3">
            <circle cx="140" cy="310" r="1.8" fill="#e2e8f0" opacity="0.8" />
            <circle cx="210" cy="130" r="1.6" fill="#94a3b8" opacity="0.7" />
            <circle cx="370" cy="230" r="1.9" fill="#cbd5e1" opacity="0.75" />
            <circle cx="460" cy="370" r="1.6" fill="#94a3b8" opacity="0.7" />
            <circle cx="620" cy="220" r="1.8" fill="#cbd5e1" opacity="0.75" />
            <circle cx="80" cy="470" r="2.2" fill="#bae6fd" opacity="0.85" />
            <circle cx="130" cy="530" r="1.7" fill="#e2e8f0" opacity="0.7" />
            <circle cx="220" cy="580" r="1.8" fill="#cbd5e1" opacity="0.75" />
            <circle cx="360" cy="590" r="1.6" fill="#94a3b8" opacity="0.7" />
            <circle cx="440" cy="630" r="1.9" fill="#e2e8f0" opacity="0.75" />
            <circle cx="500" cy="540" r="2.5" fill="#ffffff" opacity="0.9" />
            <circle cx="560" cy="490" r="1.6" fill="#94a3b8" opacity="0.7" />
            <circle cx="70" cy="690" r="2.2" fill="#ffffff" opacity="0.9" />
            <circle cx="110" cy="760" r="1.8" fill="#cbd5e1" opacity="0.75" />
            <circle cx="210" cy="790" r="1.6" fill="#94a3b8" opacity="0.7" />
            <circle cx="330" cy="810" r="1.9" fill="#e0f2fe" opacity="0.8" />
            <circle cx="450" cy="800" r="1.8" fill="#cbd5e1" opacity="0.7" />
            <circle cx="570" cy="820" r="1.6" fill="#94a3b8" opacity="0.7" />
            <circle cx="120" cy="890" r="1.9" fill="#e2e8f0" opacity="0.75" />
            <circle cx="230" cy="940" r="1.6" fill="#94a3b8" opacity="0.65" />
            <circle cx="310" cy="910" r="2.4" fill="#ffffff" opacity="0.85" />
            <circle cx="420" cy="880" r="2.0" fill="#bae6fd" opacity="0.8" />
            <circle cx="530" cy="930" r="1.8" fill="#cbd5e1" opacity="0.7" />
            <circle cx="950" cy="240" r="1.9" fill="#e0f2fe" opacity="0.75" />
            <circle cx="1860" cy="740" r="1.9" fill="#ffffff" opacity="0.75" />
            <circle cx="1020" cy="580" r="1.5" fill="#cbd5e1" opacity="0.6" />
            <circle cx="1140" cy="720" r="1.8" fill="#94a3b8" opacity="0.7" />
            <circle cx="1290" cy="640" r="1.6" fill="#bae6fd" opacity="0.6" />
            <circle cx="1440" cy="780" r="1.9" fill="#e2e8f0" opacity="0.75" />
            <circle cx="1580" cy="850" r="1.5" fill="#cbd5e1" opacity="0.65" />
            <circle cx="1650" cy="940" r="1.8" fill="#94a3b8" opacity="0.7" />
            <circle cx="1820" cy="910" r="1.6" fill="#bae6fd" opacity="0.6" />
          </g>
        </g>
      </svg>

      {/* 12. Ultra-Subtle Vignette to ensure readability around screen borders */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(2, 5, 12, 0.45) 80%, rgba(1, 3, 8, 0.85) 100%)`,
        }}
      />
    </div>
  );
}
