// Generate pixel-perfect SVG replicating the uploaded Snap Shots logo
const fs = require('fs');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 140" fill="none">
  <defs>
    <!-- Orange to Yellow gradient for camera outline & text -->
    <linearGradient id="camGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FF3B00"/>
      <stop offset="45%" stop-color="#FF7700"/>
      <stop offset="85%" stop-color="#FFAE00"/>
      <stop offset="100%" stop-color="#FFC800"/>
    </linearGradient>

    <linearGradient id="shGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FF3A00"/>
      <stop offset="100%" stop-color="#FF7500"/>
    </linearGradient>

    <linearGradient id="tGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FFA000"/>
      <stop offset="100%" stop-color="#FFBE00"/>
    </linearGradient>

    <!-- Filter for subtle crisp glow -->
    <filter id="subtleGlow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <g filter="url(#subtleGlow)">
    <!-- 1. Letter 's' (white) -->
    <text x="32" y="88" fill="#FFFFFF" font-family="'Plus Jakarta Sans', 'Inter', 'Montserrat', system-ui, sans-serif" font-weight="900" font-size="64" letter-spacing="-1">s</text>

    <!-- 2. Letter 'n' (white) -->
    <text x="76" y="88" fill="#FFFFFF" font-family="'Plus Jakarta Sans', 'Inter', 'Montserrat', system-ui, sans-serif" font-weight="900" font-size="64" letter-spacing="-1">n</text>

    <!-- 3. Letter 'a' (white) with Rewind ◀◀ inside -->
    <text x="130" y="88" fill="#FFFFFF" font-family="'Plus Jakarta Sans', 'Inter', 'Montserrat', system-ui, sans-serif" font-weight="900" font-size="64" letter-spacing="-1">a</text>
    <!-- Rewind triangles inside 'a' counter -->
    <path d="M158 68 L163 64 L163 72 Z" fill="#000000"/>
    <path d="M152 68 L157 64 L157 72 Z" fill="#000000"/>

    <!-- 4. Letter 'p' (white) with Fast-Forward ▶▶ inside -->
    <text x="180" y="88" fill="#FFFFFF" font-family="'Plus Jakarta Sans', 'Inter', 'Montserrat', system-ui, sans-serif" font-weight="900" font-size="64" letter-spacing="-1">p</text>
    <!-- Fast-forward triangles inside 'p' counter -->
    <path d="M204 68 L199 64 L199 72 Z" fill="#000000"/>
    <path d="M210 68 L205 64 L205 72 Z" fill="#000000"/>

    <!-- 5. Letters 'sh' (Orange/Red Gradient) -->
    <text x="230" y="88" fill="url(#shGrad)" font-family="'Plus Jakarta Sans', 'Inter', 'Montserrat', system-ui, sans-serif" font-weight="900" font-size="64" letter-spacing="-1">sh</text>

    <!-- 6. Stylized Camera Body Frame & Top Red Button -->
    <!-- Top red shutter button -->
    <rect x="366" y="24" width="16" height="5" rx="2.5" fill="#E61919"/>
    
    <!-- Camera upper & lower body bracket line -->
    <path d="M326 42 C326 34, 334 32, 342 32 L392 32 C398 32, 404 36, 404 42" stroke="url(#camGrad)" stroke-width="6.5" stroke-linecap="round" fill="none"/>
    
    <!-- Camera bottom bracket extending under 'ots' -->
    <path d="M315 62 L315 90 C315 98, 321 102, 329 102 L440 102 C446 102, 452 98, 452 94" stroke="url(#camGrad)" stroke-width="7" stroke-linecap="round" fill="none"/>

    <!-- 7. Letter 'o' as Camera Aperture Lens -->
    <g transform="translate(364, 69)">
      <!-- Outer white lens ring -->
      <circle cx="0" cy="0" r="28" fill="#050505" stroke="#FFFFFF" stroke-width="4.5"/>
      <circle cx="0" cy="0" r="23" fill="#000000" stroke="#FFFFFF" stroke-width="1.5" stroke-opacity="0.4"/>
      
      <!-- 8 Aperture Blades -->
      <g stroke="#000000" stroke-width="1.8" fill="#FFFFFF">
        <path d="M-19 -11 L0 -23 L-5 -11 Z"/>
        <path d="M-3 -22 L16 -16 L4 -12 Z"/>
        <path d="M14 -17 L22 1 L11 -2 Z"/>
        <path d="M21 0 L17 19 L9 9 Z"/>
        <path d="M18 17 L0 23 L6 11 Z"/>
        <path d="M2 22 L-16 16 L-4 12 Z"/>
        <path d="M-15 16 L-22 0 L-10 3 Z"/>
        <path d="M-22 1 L-18 -18 L-9 -8 Z"/>
      </g>

      <!-- Center Inner Aperture Hole (Black Circle) -->
      <circle cx="0" cy="0" r="10.5" fill="#000000" stroke="#FFFFFF" stroke-width="1.2"/>

      <!-- Red Play Triangle ▶ at Center -->
      <polygon points="-3,-5 6,0 -3,5" fill="#E61919"/>
    </g>

    <!-- 8. Letter 't' (Orange-Yellow Gradient) -->
    <text x="408" y="88" fill="url(#tGrad)" font-family="'Plus Jakarta Sans', 'Inter', 'Montserrat', system-ui, sans-serif" font-weight="900" font-size="64" letter-spacing="-1">t</text>

    <!-- 9. Trailing Letter 's' (Crisp White) -->
    <text x="444" y="88" fill="#FFFFFF" font-family="'Plus Jakarta Sans', 'Inter', 'Montserrat', system-ui, sans-serif" font-weight="900" font-size="64" letter-spacing="-1">s</text>
  </g>
</svg>`;

// Also generate the full profile square version with the dark background & subtle red glow
const squareSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" fill="none">
  <!-- Solid Black Background -->
  <rect width="500" height="500" fill="#000000"/>
  
  <!-- Subtle Dark Red Central Ambient Glow -->
  <radialGradient id="profileGlow" cx="45%" cy="50%" r="45%">
    <stop offset="0%" stop-color="#660a0a" stop-opacity="0.8"/>
    <stop offset="40%" stop-color="#330000" stop-opacity="0.4"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
  </radialGradient>
  <rect width="500" height="500" fill="url(#profileGlow)"/>

  <!-- Centered Logo -->
  <g transform="translate(-20, 180)">
    ${svgContent.replace('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 140" fill="none">', '').replace('</svg>', '')}
  </g>
</svg>`;

fs.writeFileSync('public/snapshots-logo.svg', svgContent);
fs.writeFileSync('public/logo.svg', svgContent);
fs.writeFileSync('public/snapshots-logo-square.svg', squareSvgContent);
console.log('Successfully generated official logo SVGs!');
