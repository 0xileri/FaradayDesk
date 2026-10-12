// Renders public/og-image.png, the link preview card. Run after changing the
// wording or palette: node scripts/make-og-image.mjs
import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const ivory = "#f3f1e9";
const ink = "#20221f";
const orange = "#ff7f00";
const muted = "#5c6057";
const hexagon = "M32 2 58 17v30L32 62 6 47V17z";
const letterF = "M21 18h25v7H29v7h14v7H29v12h-8z";
const font = "Segoe UI, Helvetica, Arial, sans-serif";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${ivory}"/>
  <rect x="760" width="440" height="630" fill="${orange}"/>
  <g transform="translate(814 149) scale(5.2)" fill="none" stroke="${ink}" stroke-width=".6" opacity=".55">
    <path d="${hexagon}"/>
  </g>
  <g transform="translate(880 180) scale(3.4)"><path d="${letterF}" fill="${ink}"/></g>
  <g transform="translate(86 56) scale(.95)">
    <path d="${hexagon}" fill="${orange}"/>
    <path d="${letterF}" fill="${ivory}"/>
  </g>
  <text x="168" y="104" font-family="${font}" font-size="30" font-weight="600" fill="${ink}" letter-spacing="-.5">FaradayDesk</text>
  <text x="86" y="286" font-family="${font}" font-size="104" font-weight="700" fill="${ink}" letter-spacing="-5">Before</text>
  <text x="86" y="382" font-family="${font}" font-size="104" font-weight="700" fill="${ink}" letter-spacing="-5">the open.</text>
  <text x="86" y="444" font-family="${font}" font-size="27" fill="${muted}">Stress-test a Bitget stock-token thesis against</text>
  <text x="86" y="482" font-family="${font}" font-size="27" fill="${muted}">observed weekend history. Humans decide.</text>
  <rect y="548" width="1200" height="82" fill="${ink}"/>
  <text x="86" y="598" font-family="${font}" font-size="22" fill="${ivory}" letter-spacing="2.5">RNVDAUSDT · RTSLAUSDT · RAAPLUSDT</text>
  <text x="1114" y="598" font-family="${font}" font-size="22" fill="${orange}" text-anchor="end" letter-spacing="1">EVIDENCE BEFORE CONVICTION</text>
</svg>`;

const png = await sharp(Buffer.from(svg), { density: 96 }).png().toBuffer();
await writeFile(new URL("../public/og-image.png", import.meta.url), png);
console.log("wrote public/og-image.png", png.length, "bytes");
