// ─────────────────────────────────────────────────────────────────────────
// Edit everything about the site's copy and contact details here.
// Values marked PLACEHOLDER are safe stand-ins — swap for real info.
// ─────────────────────────────────────────────────────────────────────────

const YEARS_OF_EXPREIENCE = new Date().getFullYear() - 2018

export const site = {
  firstName: "EMMANUEL",
  lastName: "ADESILE",
  fullName: "Emmanuel Adesile",

  role: "Creative Developer", // PLACEHOLDER
  discipline: "DESIGN · MOTION · WEB · CODE", // PLACEHOLDER

  // Hero headline, one word per animated line.
  headline: ["BUILDING", "BOLD DIGITAL", "EXPERIENCES"], // PLACEHOLDER

  intro:
    `Hi, I'm Emmanuel Adesile, a Creative Developer. I have ${YEARS_OF_EXPREIENCE} years of designing and building fast, intuitive interfaces, turning ideas into products that are performant, user-friendly and sleeek. I also make quality developer content`, // PLACEHOLDER

  status: "AVAILABLE FOR WORK",
  currentlyAt: "CURRENTLY FREELANCING", // PLACEHOLDER

  // Location / meta
  location: "Porto, Portugal",
  region: "PORTUGAL",
  coords: "41.15°N · 8.61°W",
  timezone: "Europe/Lisbon",

  email: "hello@emmanueladesile.com", // PLACEHOLDER

  socials: [
    { label: "Github", href: "#", handle: "@emmanueladesile" }, // PLACEHOLDER
    { label: "LinkedIn", href: "#", handle: "in/emmanueladesile" }, // PLACEHOLDER
    { label: "Twitter", href: "#", handle: "@emmanueladesile" }, // PLACEHOLDER
    { label: "Email", href: "mailto:hello@emmanueladesile.com", handle: "" }, // PLACEHOLDER
  ],

  nav: [
    { num: "01", label: "Work", href: "#work" },
    { num: "02", label: "About", href: "#about" },
    { num: "03", label: "Contact", href: "#footer" },
  ],

  year: new Date().getFullYear(),
};
