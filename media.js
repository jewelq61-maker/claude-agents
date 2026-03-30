const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const os = require("os");

const BRAND = {
  coral: "#FF6B9D",
  violet: "#8C64F0",
  pink: "#FF375F",
  green: "#30D158",
  darkBg: "#0E0C14",
  lightBg: "#F8F8FA",
  white: "#FFFFFF",
  black: "#1A1A2E",
};

/**
 * Generate a social media post image
 * @param {object} spec - { title, subtitle, category, bgColor, accentColor, width, height, logo }
 * @returns {Buffer} PNG buffer
 */
async function generatePostImage(spec) {
  const {
    title = "وردتي",
    subtitle = "",
    category = "",
    bgColor = BRAND.violet,
    accentColor = BRAND.coral,
    textColor = BRAND.white,
    width = 1080,
    height = 1080,
    style = "gradient", // gradient, solid, dark, light
  } = spec;

  let bg;
  if (style === "dark") {
    bg = `<rect width="${width}" height="${height}" fill="${BRAND.darkBg}"/>`;
  } else if (style === "light") {
    bg = `<rect width="${width}" height="${height}" fill="${BRAND.lightBg}"/>`;
  } else {
    bg = `
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor}"/>
          <stop offset="100%" style="stop-color:${accentColor}"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
    `;
  }

  // Decorative circles
  const circles = `
    <circle cx="${width * 0.85}" cy="${height * 0.15}" r="${width * 0.2}" fill="${BRAND.white}" opacity="0.06"/>
    <circle cx="${width * 0.1}" cy="${height * 0.85}" r="${width * 0.15}" fill="${BRAND.white}" opacity="0.04"/>
  `;

  // Logo flower
  const logoY = height * 0.25;
  const logo = `
    <circle cx="${width / 2}" cy="${logoY}" r="45" fill="${BRAND.white}" opacity="0.15"/>
    <text x="${width / 2}" y="${logoY + 8}" text-anchor="middle" font-family="Noto Sans Arabic, sans-serif" font-size="36" fill="${BRAND.white}" font-weight="700">🌸</text>
  `;

  // Title
  const titleY = height * 0.48;
  const titleSize = title.length > 30 ? 52 : title.length > 20 ? 64 : 80;
  const finalTextColor = (style === "light") ? BRAND.black : textColor;
  const subtitleColor = (style === "light") ? "#636373" : `${BRAND.white}CC`;

  // Category badge
  const categoryBadge = category
    ? `<rect x="${width / 2 - 60}" y="${height * 0.35}" width="120" height="36" rx="18" fill="${BRAND.white}" opacity="0.2"/>
       <text x="${width / 2}" y="${height * 0.35 + 24}" text-anchor="middle" font-family="Noto Sans Arabic, sans-serif" font-size="18" fill="${finalTextColor}" font-weight="600">${escapeXml(category)}</text>`
    : "";

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${bg}
      ${circles}
      ${logo}
      ${categoryBadge}
      <text x="${width / 2}" y="${titleY}" text-anchor="middle" font-family="Noto Sans Arabic, sans-serif" font-size="${titleSize}" fill="${finalTextColor}" font-weight="800" direction="rtl">${escapeXml(title)}</text>
      ${subtitle ? `<text x="${width / 2}" y="${titleY + titleSize * 0.8}" text-anchor="middle" font-family="Noto Sans Arabic, sans-serif" font-size="32" fill="${subtitleColor}" font-weight="400" direction="rtl">${escapeXml(subtitle)}</text>` : ""}

      <!-- Bottom bar -->
      <rect x="0" y="${height - 100}" width="${width}" height="100" fill="${BRAND.black}" opacity="0.3"/>
      <text x="${width / 2}" y="${height - 45}" text-anchor="middle" font-family="Noto Sans Arabic, sans-serif" font-size="28" fill="${BRAND.white}" font-weight="700">وردتي | wardaty.app</text>
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

/**
 * Generate a story/reel image (9:16)
 */
async function generateStoryImage(spec) {
  return generatePostImage({ ...spec, width: 1080, height: 1920 });
}

/**
 * Generate a video from image frames with text animation
 * @param {object} spec - { title, subtitle, frames, duration, bgColor, accentColor }
 * @returns {string} path to MP4 file
 */
async function generateVideo(spec) {
  const {
    title = "وردتي",
    subtitle = "",
    slides = [],
    duration = 6,
    width = 1080,
    height = 1920,
    bgColor = BRAND.violet,
    accentColor = BRAND.coral,
  } = spec;

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "wardaty-video-"));
  const outputPath = path.join(tmpDir, "output.mp4");

  // Generate frames for each slide
  const allSlides =
    slides.length > 0
      ? slides
      : [
          { title, subtitle, bgColor, accentColor },
          { title: "حمّلي الآن", subtitle: "wardaty.app", bgColor: accentColor, accentColor: bgColor },
        ];

  const frameRate = 30;
  const framesPerSlide = Math.floor((duration / allSlides.length) * frameRate);
  const totalFrames = framesPerSlide * allSlides.length;

  // Generate each frame as PNG
  for (let i = 0; i < totalFrames; i++) {
    const slideIndex = Math.min(Math.floor(i / framesPerSlide), allSlides.length - 1);
    const slide = allSlides[slideIndex];
    const frameInSlide = i - slideIndex * framesPerSlide;
    const progress = frameInSlide / framesPerSlide;

    // Fade in effect
    const opacity = Math.min(progress * 4, 1);
    const slideUp = Math.max(0, 30 * (1 - progress * 3));

    const frameBuffer = await generateAnimatedFrame({
      ...slide,
      width,
      height,
      opacity,
      offsetY: slideUp,
    });

    const framePath = path.join(tmpDir, `frame_${String(i).padStart(5, "0")}.png`);
    fs.writeFileSync(framePath, frameBuffer);
  }

  // Use ffmpeg to create video
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(path.join(tmpDir, "frame_%05d.png"))
      .inputFPS(frameRate)
      .output(outputPath)
      .videoCodec("libx264")
      .outputOptions([
        "-pix_fmt yuv420p",
        "-preset fast",
        "-crf 23",
        `-t ${duration}`,
      ])
      .on("end", () => resolve(outputPath))
      .on("error", (err) => reject(err))
      .run();
  });
}

async function generateAnimatedFrame(spec) {
  const {
    title = "",
    subtitle = "",
    width = 1080,
    height = 1920,
    bgColor = BRAND.violet,
    accentColor = BRAND.coral,
    opacity = 1,
    offsetY = 0,
  } = spec;

  const titleY = height * 0.42 + offsetY;
  const titleSize = title.length > 30 ? 56 : title.length > 20 ? 72 : 90;

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor}"/>
          <stop offset="100%" style="stop-color:${accentColor}"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      <circle cx="${width * 0.8}" cy="${height * 0.15}" r="${width * 0.25}" fill="${BRAND.white}" opacity="0.05"/>
      <circle cx="${width * 0.15}" cy="${height * 0.8}" r="${width * 0.2}" fill="${BRAND.white}" opacity="0.03"/>

      <g opacity="${opacity}">
        <text x="${width / 2}" y="${height * 0.25}" text-anchor="middle" font-family="Noto Sans Arabic, sans-serif" font-size="48" fill="${BRAND.white}" opacity="0.9">🌸</text>
        <text x="${width / 2}" y="${titleY}" text-anchor="middle" font-family="Noto Sans Arabic, sans-serif" font-size="${titleSize}" fill="${BRAND.white}" font-weight="800" direction="rtl">${escapeXml(title)}</text>
        ${subtitle ? `<text x="${width / 2}" y="${titleY + titleSize}" text-anchor="middle" font-family="Noto Sans Arabic, sans-serif" font-size="36" fill="${BRAND.white}CC" font-weight="400" direction="rtl">${escapeXml(subtitle)}</text>` : ""}
      </g>

      <rect x="0" y="${height - 120}" width="${width}" height="120" fill="${BRAND.black}" opacity="0.25"/>
      <text x="${width / 2}" y="${height - 55}" text-anchor="middle" font-family="Noto Sans Arabic, sans-serif" font-size="32" fill="${BRAND.white}" font-weight="700">وردتي</text>
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Cleanup temp files
function cleanupTempDir(dirPath) {
  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
  } catch {}
}

module.exports = {
  generatePostImage,
  generateStoryImage,
  generateVideo,
  cleanupTempDir,
  BRAND,
};
