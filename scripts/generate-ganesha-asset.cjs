const fs = require('fs');
const { execSync } = require('child_process');

const width = 720;
const height = 1280;

// High-fidelity SVG of the Lord Ganesha Black & White Utsav Idol with spotlight and Snap Shots watermark
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <!-- Background Gradient -->
    <radialGradient id="bgLight" cx="45%" cy="30%" r="70%" fx="35%" fy="15%">
      <stop offset="0%" stop-color="#404040" />
      <stop offset="35%" stop-color="#181818" />
      <stop offset="70%" stop-color="#0a0a0a" />
      <stop offset="100%" stop-color="#020202" />
    </radialGradient>

    <!-- Overhead Spotlight Cone -->
    <linearGradient id="spotlightCone" x1="20%" y1="0%" x2="60%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45" />
      <stop offset="40%" stop-color="#ffffff" stop-opacity="0.18" />
      <stop offset="75%" stop-color="#ffffff" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </linearGradient>

    <!-- Golden/Silver Metallic Idol Shading -->
    <linearGradient id="silverSkin" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f0f0f0" />
      <stop offset="25%" stop-color="#d4d4d4" />
      <stop offset="50%" stop-color="#999999" />
      <stop offset="75%" stop-color="#555555" />
      <stop offset="100%" stop-color="#222222" />
    </linearGradient>

    <linearGradient id="highlightSkin" x1="30%" y1="0%" x2="70%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="40%" stop-color="#e0e0e0" />
      <stop offset="80%" stop-color="#888888" />
      <stop offset="100%" stop-color="#2a2a2a" />
    </linearGradient>

    <linearGradient id="dhotiSilk" x1="0%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#e8e8e8" />
      <stop offset="30%" stop-color="#b0b0b0" />
      <stop offset="60%" stop-color="#606060" />
      <stop offset="90%" stop-color="#202020" />
      <stop offset="100%" stop-color="#0d0d0d" />
    </linearGradient>

    <linearGradient id="turbanFold" x1="0%" y1="0%" x2="100%" y2="80%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="35%" stop-color="#cccccc" />
      <stop offset="70%" stop-color="#777777" />
      <stop offset="100%" stop-color="#1f1f1f" />
    </linearGradient>

    <linearGradient id="garlandBead" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="50%" stop-color="#999999" />
      <stop offset="100%" stop-color="#222222" />
    </linearGradient>

    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>

    <filter id="smokeBlur" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="16" />
    </filter>

    <filter id="dropShadowDark" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="15" flood-color="#000000" flood-opacity="0.9" />
    </filter>
  </defs>

  <!-- Deep Black Studio Stage Background -->
  <rect width="${width}" height="${height}" fill="url(#bgLight)" />

  <!-- Overhead Spotlight Beam (From Top Left) -->
  <polygon points="120,0 280,0 620,1280 80,1280" fill="url(#spotlightCone)" />

  <!-- Atmosphere Smoke Swirls (Chiaroscuro fine art mist) -->
  <g opacity="0.35" filter="url(#smokeBlur)">
    <path d="M-50,600 Q150,520 280,680 T650,580 Q800,650 750,900" fill="none" stroke="#ffffff" stroke-width="85" />
    <path d="M100,300 Q300,240 450,380 T750,280" fill="none" stroke="#ffffff" stroke-width="60" opacity="0.5" />
    <path d="M0,900 Q200,820 400,950 T800,850" fill="none" stroke="#ffffff" stroke-width="110" opacity="0.4" />
  </g>

  <!-- Lord Ganesha Idol Group -->
  <g transform="translate(0, 40)" filter="url(#dropShadowDark)">
    <!-- Throne & Pedestal (Asana) -->
    <path d="M80,1080 L640,1080 L680,1190 L40,1190 Z" fill="#151515" stroke="#333333" stroke-width="3" />
    <rect x="60" y="1120" width="600" height="25" fill="#252525" />
    <line x1="80" y1="1100" x2="640" y2="1100" stroke="#555555" stroke-width="2" />

    <!-- Ornate Lower Floral Cushion -->
    <path d="M60,1060 Q360,1030 660,1060 Q680,1100 640,1110 Q360,1080 80,1110 Z" fill="#202020" stroke="#444444" stroke-width="2" />

    <!-- Draped Silken Dhoti / Lower Garment (Rich folds) -->
    <g>
      <!-- Left leg folded in Lalitasana -->
      <path d="M140,820 C100,890 90,980 180,1040 C280,1090 400,1050 420,980 C410,900 320,840 250,830 Z" fill="url(#dhotiSilk)" stroke="#111111" stroke-width="2" />
      <!-- Right leg resting down -->
      <path d="M380,830 C450,840 550,880 570,960 C580,1020 530,1070 430,1070 C350,1070 340,990 350,910 Z" fill="url(#dhotiSilk)" stroke="#111111" stroke-width="2" />
      <!-- Central pleated pleats cascading -->
      <path d="M310,870 L340,1070 L380,1070 L410,870 Z" fill="url(#dhotiSilk)" />
      <path d="M330,880 L350,1065" stroke="#ffffff" stroke-width="2" opacity="0.6" />
      <path d="M350,880 L365,1065" stroke="#000000" stroke-width="3" opacity="0.8" />
      <path d="M370,880 L385,1065" stroke="#ffffff" stroke-width="2" opacity="0.6" />
    </g>

    <!-- Torso and Sacred Pot-Belly (Udara) -->
    <ellipse cx="360" cy="740" rx="145" ry="125" fill="url(#silverSkin)" />
    <!-- Chest Muscles & Highlights -->
    <path d="M260,650 C290,630 360,640 360,690 C360,640 430,630 460,650 C460,710 400,750 360,750 C320,750 260,710 260,650 Z" fill="url(#highlightSkin)" opacity="0.85" />
    <path d="M360,660 L360,740" stroke="#222222" stroke-width="3" />

    <!-- Ornate Jewelry: Waistband (Kamarbandh) & Golden Navel -->
    <circle cx="360" cy="770" r="9" fill="#151515" stroke="#888888" stroke-width="2" />
    <path d="M230,810 Q360,860 490,810 Q360,840 230,810 Z" fill="#dddddd" stroke="#222222" stroke-width="2" />
    <path d="M245,825 Q360,875 475,825" stroke="#ffffff" stroke-width="3" fill="none" />

    <!-- Sacred Thread (Yajnopavita / Nagabandha) across chest -->
    <path d="M275,610 Q325,720 450,830" stroke="#ffffff" stroke-width="5" fill="none" filter="url(#softGlow)" />
    <path d="M275,610 Q325,720 450,830" stroke="#444444" stroke-width="2" fill="none" />

    <!-- Back Left Arm (Holding Ankusha / Goad) -->
    <path d="M190,560 C130,580 90,640 100,710 C105,740 130,750 145,720 C160,680 170,620 220,590 Z" fill="url(#silverSkin)" />
    <!-- Hand holding Goad -->
    <circle cx="105" cy="710" r="22" fill="url(#highlightSkin)" />
    <!-- Ankusha Axe Weapon -->
    <path d="M85,630 L115,790" stroke="#dddddd" stroke-width="7" />
    <path d="M80,630 Q120,600 135,640 Q105,660 80,630 Z" fill="#ffffff" stroke="#222222" stroke-width="2" />

    <!-- Front Left Hand (Abhaya Mudra - Blessing Hand with Lotus) -->
    <g>
      <path d="M210,630 C170,660 140,710 145,770 C150,820 180,830 200,810 C220,780 230,730 250,690 Z" fill="url(#silverSkin)" />
      <!-- Blessing Palm facing viewer -->
      <path d="M135,745 C125,775 140,840 180,845 C205,845 220,815 215,775 C210,740 180,725 155,730 Z" fill="url(#highlightSkin)" stroke="#222222" stroke-width="2" />
      <!-- Fingers -->
      <rect x="135" y="715" width="11" height="35" rx="5" fill="#f0f0f0" />
      <rect x="150" y="700" width="11" height="42" rx="5" fill="#ffffff" />
      <rect x="165" y="702" width="11" height="40" rx="5" fill="#ffffff" />
      <rect x="180" y="712" width="11" height="34" rx="5" fill="#e0e0e0" />
      <!-- Thumb -->
      <path d="M195,750 C215,765 210,785 195,785 Z" fill="#dddddd" />
      <!-- Sacred Symbol on Palm -->
      <circle cx="168" cy="775" r="9" fill="#111111" />
      <circle cx="168" cy="775" r="6" fill="#ffffff" />
    </g>

    <!-- Back Right Arm (Holding Lotus / Pasha) -->
    <path d="M520,560 C580,590 620,660 610,720 C600,750 575,750 560,720 C545,680 540,620 490,590 Z" fill="url(#silverSkin)" />
    <!-- Trishula / Trident / Lotus Weapon -->
    <path d="M605,620 L585,800" stroke="#dddddd" stroke-width="7" />
    <circle cx="610" cy="620" r="18" fill="#ffffff" />

    <!-- Front Right Hand (Holding Modak Vessel) -->
    <g>
      <path d="M480,660 C520,700 550,750 535,820 C520,860 480,870 450,840 C430,810 440,760 440,710 Z" fill="url(#silverSkin)" />
      <!-- Hand cradle -->
      <ellipse cx="485" cy="830" rx="32" ry="24" fill="url(#highlightSkin)" stroke="#222222" stroke-width="2" />
      <!-- Golden Sacred Modak on Palm -->
      <path d="M470,830 Q485,790 500,830 Q485,845 470,830 Z" fill="#ffffff" filter="url(#softGlow)" />
      <circle cx="485" cy="820" r="8" fill="#e5e5e5" stroke="#ffffff" stroke-width="1.5" />
    </g>

    <!-- Grand Floral and Pearl Necklace Garlands (Har) -->
    <g filter="url(#dropShadowDark)">
      <!-- Main Pearl Mala -->
      <path d="M260,540 Q360,780 460,540" fill="none" stroke="#222222" stroke-width="16" />
      <path d="M260,540 Q360,780 460,540" fill="none" stroke="#ffffff" stroke-width="10" stroke-dasharray="14,6" />
      
      <!-- Heavy Floral Garland (Rose & Marigold layered petals in B&W) -->
      <path d="M220,530 C200,680 250,910 360,930 C470,910 520,680 500,530 C480,720 430,880 360,890 C290,880 240,720 220,530 Z" fill="#181818" stroke="#333333" stroke-width="2" />
      <!-- White textured flower beads -->
      <path d="M230,550 Q360,920 490,550" fill="none" stroke="#dddddd" stroke-width="18" stroke-dasharray="24,12" stroke-linecap="round" />
      <path d="M230,550 Q360,920 490,550" fill="none" stroke="#ffffff" stroke-width="8" stroke-dasharray="12,24" />
      
      <!-- Pendant (Locket) resting on chest -->
      <path d="M340,750 L380,750 L360,795 Z" fill="#ffffff" stroke="#222222" stroke-width="2" />
      <circle cx="360" cy="765" r="7" fill="#111111" />
    </g>

    <!-- Large Majestic Elephant Ears (Karna) -->
    <!-- Left Ear (Viewer's Left, bathed in spotlight) -->
    <g>
      <path d="M260,380 C150,340 70,410 80,510 C90,620 180,680 270,620 Z" fill="url(#highlightSkin)" stroke="#222222" stroke-width="3" />
      <!-- Inner ear folds & vein shading -->
      <path d="M245,410 C170,390 120,440 125,510 C130,580 190,620 250,580 Z" fill="#252525" opacity="0.8" />
      <path d="M150,450 Q210,480 230,540" stroke="#ffffff" stroke-width="2" fill="none" opacity="0.6" />
    </g>

    <!-- Right Ear (Viewer's Right, shadow side) -->
    <g>
      <path d="M460,380 C570,340 650,410 640,510 C630,620 540,680 450,620 Z" fill="url(#silverSkin)" stroke="#222222" stroke-width="3" />
      <!-- Inner ear folds -->
      <path d="M475,410 C550,390 600,440 595,510 C590,580 530,620 470,580 Z" fill="#181818" opacity="0.9" />
      <path d="M570,450 Q510,480 490,540" stroke="#777777" stroke-width="2" fill="none" opacity="0.5" />
    </g>

    <!-- Head (Mastaka) & Forehead -->
    <ellipse cx="360" cy="450" rx="115" ry="105" fill="url(#highlightSkin)" />
    <!-- Temples -->
    <circle cx="305" cy="410" r="50" fill="url(#highlightSkin)" />
    <circle cx="415" cy="410" r="50" fill="url(#silverSkin)" />

    <!-- Sacred Tilak / Trishula Namam on Forehead (Pundraka) -->
    <g filter="url(#dropShadowDark)">
      <path d="M340,360 L350,430 L370,430 L380,360 Q360,375 340,360 Z" fill="#ffffff" />
      <!-- Central Vermillion/Chandan Line -->
      <path d="M356,365 L356,430 L364,430 L364,365 Z" fill="#111111" />
      <!-- Sacred Crescent & Bindi -->
      <circle cx="360" cy="445" r="7" fill="#ffffff" stroke="#000000" stroke-width="1.5" />
      <circle cx="360" cy="445" r="3" fill="#000000" />
    </g>

    <!-- Kind, Divine Eyes (Nayanas) -->
    <!-- Left Eye (Lit) -->
    <g transform="translate(290, 440)">
      <ellipse cx="0" cy="0" rx="20" ry="11" fill="#ffffff" stroke="#111111" stroke-width="2" />
      <circle cx="-2" cy="0" r="7" fill="#111111" />
      <circle cx="-4" cy="-2" r="3" fill="#ffffff" />
      <!-- Eyelash & Brow -->
      <path d="M-24,-8 Q-4,-18 18,-6" stroke="#222222" stroke-width="4" fill="none" />
      <path d="M-22,-7 Q-3,-13 16,-5" stroke="#ffffff" stroke-width="1.5" fill="none" opacity="0.8" />
    </g>

    <!-- Right Eye (Subtle shadow side) -->
    <g transform="translate(430, 440)">
      <ellipse cx="0" cy="0" rx="20" ry="11" fill="#e5e5e5" stroke="#111111" stroke-width="2" />
      <circle cx="2" cy="0" r="7" fill="#111111" />
      <circle cx="0" cy="-2" r="2.5" fill="#ffffff" />
      <!-- Eyelash & Brow -->
      <path d="M-18,-6 Q4,-18 24,-8" stroke="#222222" stroke-width="4" fill="none" />
    </g>

    <!-- Tusks (Dantas) -->
    <!-- Broken Left Tusk (Ekadanta) on viewer's right -->
    <path d="M410,545 C425,550 435,565 430,575 C420,580 405,565 400,550 Z" fill="#ffffff" stroke="#222222" stroke-width="1.5" />
    <!-- Full Majestic Tusk on viewer's left -->
    <path d="M315,545 C285,550 255,580 250,605 C255,615 270,610 295,585 C310,570 320,555 315,545 Z" fill="#ffffff" stroke="#222222" stroke-width="2" filter="url(#dropShadowDark)" />

    <!-- Majestic Graceful Trunk (Vakratunda) curving toward Modak -->
    <g filter="url(#dropShadowDark)">
      <path d="M320,490 C320,580 310,640 330,710 C350,780 390,830 450,845 C480,850 500,830 490,805 C475,785 440,790 415,765 C390,740 380,680 380,590 C380,540 395,510 395,490 Z" fill="url(#highlightSkin)" stroke="#111111" stroke-width="2.5" />
      
      <!-- Horizontal Wrinkles / Rings across Trunk -->
      <path d="M325,530 Q355,540 385,530" stroke="#222222" stroke-width="3" fill="none" />
      <path d="M325,560 Q355,570 385,560" stroke="#222222" stroke-width="3" fill="none" />
      <path d="M325,595 Q355,605 385,595" stroke="#222222" stroke-width="3" fill="none" />
      <path d="M325,630 Q355,640 385,630" stroke="#222222" stroke-width="3" fill="none" />
      <path d="M330,670 Q355,680 385,670" stroke="#222222" stroke-width="3" fill="none" />
      <path d="M340,710 Q370,725 395,710" stroke="#222222" stroke-width="3" fill="none" />
      <path d="M360,750 Q390,770 420,750" stroke="#222222" stroke-width="3" fill="none" />
      <!-- Highlights along left edge of trunk from spotlight -->
      <path d="M325,490 C322,580 315,640 332,710 C345,760 375,800 440,830" stroke="#ffffff" stroke-width="4" fill="none" opacity="0.8" />
    </g>

    <!-- Royal Ornate Headdress / Pagadi Turban (Mukuta) -->
    <g filter="url(#dropShadowDark)">
      <!-- Base Headband (Ornate Jewels & Pearls) -->
      <path d="M270,370 C290,340 430,340 450,370 L460,390 C420,380 300,380 260,390 Z" fill="#dddddd" stroke="#111111" stroke-width="2" />
      <!-- Pearls on headband -->
      <circle cx="280" cy="380" r="5" fill="#ffffff" />
      <circle cx="300" cy="378" r="5" fill="#ffffff" />
      <circle cx="320" cy="376" r="5" fill="#ffffff" />
      <circle cx="340" cy="375" r="5" fill="#ffffff" />
      <circle cx="360" cy="375" r="6" fill="#ffffff" />
      <circle cx="380" cy="375" r="5" fill="#ffffff" />
      <circle cx="400" cy="376" r="5" fill="#ffffff" />
      <circle cx="420" cy="378" r="5" fill="#ffffff" />
      <circle cx="440" cy="380" r="5" fill="#ffffff" />

      <!-- High Tiered Turban & Silken Fan Pleats -->
      <!-- Left Fan Wing of Turban -->
      <path d="M260,370 C230,320 210,250 250,210 C290,180 330,220 330,270 L310,360 Z" fill="url(#turbanFold)" stroke="#111111" stroke-width="2" />
      <path d="M245,260 Q285,280 325,270" stroke="#ffffff" stroke-width="2" fill="none" />
      <path d="M235,290 Q275,310 315,310" stroke="#ffffff" stroke-width="2" fill="none" />

      <!-- Center Towering Royal Crown Mukuta -->
      <path d="M300,360 L315,220 C325,160 395,160 405,220 L420,360 Z" fill="url(#turbanFold)" stroke="#111111" stroke-width="2" />
      <path d="M330,170 Q360,140 390,170" stroke="#ffffff" stroke-width="3" fill="none" />
      <!-- Golden Kalash Finial Pinnacle at Top of Crown -->
      <circle cx="360" cy="145" r="16" fill="#ffffff" stroke="#111111" stroke-width="2" filter="url(#softGlow)" />
      <polygon points="360,115 352,135 368,135" fill="#ffffff" />

      <!-- Right Royal Drapery of Turban -->
      <path d="M390,360 L410,270 C420,220 480,210 510,250 C530,290 510,340 450,370 Z" fill="url(#turbanFold)" stroke="#111111" stroke-width="2" />
      <path d="M410,275 Q450,285 490,265" stroke="#888888" stroke-width="2" fill="none" />

      <!-- Royal Brooch & Emerald Feather Plume (Kalgi) -->
      <ellipse cx="360" cy="300" rx="18" ry="24" fill="#ffffff" stroke="#111111" stroke-width="2" />
      <circle cx="360" cy="300" r="9" fill="#111111" />
      <path d="M360,276 C355,230 380,210 370,185 C360,210 350,230 360,276 Z" fill="#ffffff" opacity="0.9" />
    </g>
  </g>

  <!-- Top Right Watermark: Snap Shots Official Brand Logo (Exact replica of user's video) -->
  <g transform="translate(${width - 230}, 42)">
    <!-- Dark pill background for crisp watermark contrast -->
    <rect x="-10" y="-8" width="220" height="48" rx="24" fill="#000000" fill-opacity="0.6" stroke="#ffffff" stroke-opacity="0.15" stroke-width="1" />
    
    <!-- Camera icon & text -->
    <g transform="translate(10, 4) scale(0.38)">
      <!-- Text 'snapshots' in bold white & red/yellow accent -->
      <text x="0" y="55" fill="#FFFFFF" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="900" font-size="44" letter-spacing="-1">snap</text>
      <!-- Camera Aperture O in red & orange -->
      <g transform="translate(145, 40)">
        <circle cx="0" cy="0" r="22" fill="#E61919" stroke="#FFC800" stroke-width="4"/>
        <polygon points="-4,-6 8,0 -4,6" fill="#FFFFFF"/>
      </g>
      <text x="180" y="55" fill="#FFC800" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="900" font-size="44" letter-spacing="-1">shots</text>
    </g>
  </g>

  <!-- Bottom Gradient Overlay for text readability -->
  <rect y="${height - 240}" width="${width}" height="240" fill="url(#bgLight)" opacity="0.85" />
</svg>`;

// Write SVG
const svgPath = 'public/assets/ganesha-utsav-reel-poster.svg';
const pngPath = 'public/assets/ganesha-utsav-reel-poster.png';
const jpgPath = 'public/assets/ganesha-utsav-reel-poster.jpg';
const mp4Path = 'public/assets/ganesha-utsav-reel.mp4';

fs.mkdirSync('public/assets', { recursive: true });
fs.writeFileSync(svgPath, svg);
console.log('Saved SVG to', svgPath);

// Convert to PNG & JPG via ImageMagick
try {
  execSync(`convert -density 150 ${svgPath} ${pngPath}`);
  execSync(`convert ${pngPath} -quality 92 ${jpgPath}`);
  console.log('Successfully rendered PNG & JPG posters!');
} catch (e) {
  console.warn('ImageMagick conversion warning:', e.message);
}

// Generate MP4 video via FFmpeg with slow dramatic push-in zoom and subtle light pulse over 17 seconds
try {
  const inputImage = fs.existsSync(pngPath) ? pngPath : svgPath;
  const ffmpegCmd = `ffmpeg -y -loop 1 -i ${inputImage} -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 -filter_complex "[0:v]scale=720:1280,zoompan=z='min(zoom+0.0006,1.15)':d=510:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=720x1280,format=yuv420p[v]" -map "[v]" -map 1:a -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -t 17 -pix_fmt yuv420p ${mp4Path}`;
  console.log('Rendering 17s vertical reel video via ffmpeg...');
  execSync(ffmpegCmd);
  console.log('Successfully generated MP4 at', mp4Path);
} catch (e) {
  console.warn('FFmpeg video generation warning:', e.message);
}
