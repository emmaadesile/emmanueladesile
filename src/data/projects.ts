// Placeholder projects — swap copy, stats and tools for real work.
export type Project = {
  num: string;
  title: string;
  description: string;
  role: string;
  timeline: string;
  year: string;
  stat: string;
  statLabel: string;
  tools: string[];
};

export const projects: Project[] = [
  {
    num: "01",
    title: "Nebula Commerce",
    description:
      "A headless storefront rebuilt for speed and scale. Reworked the checkout and product discovery flow around a component-driven design system, cutting load times and lifting conversion.",
    role: "Lead Developer",
    timeline: "4 Months",
    year: "2025",
    stat: "+42%",
    statLabel: "conversion lift",
    tools: ["React", "TypeScript", "Stripe", "Figma"],
  },
  {
    num: "02",
    title: "Atlas Analytics",
    description:
      "A real-time analytics dashboard for a data platform. Designed dense, legible visualizations and an interaction model that stays responsive while streaming millions of events a day.",
    role: "Full-Stack Engineer",
    timeline: "6 Months",
    year: "2024",
    stat: "3.2M",
    statLabel: "events / day",
    tools: ["Next.js", "WebGL", "Node", "Postgres"],
  },
  {
    num: "03",
    title: "Form Design System",
    description:
      "A cross-product design system and component library. Unified patterns, tokens and accessibility across teams, giving designers and engineers one shared, documented source of truth.",
    role: "Design Engineer",
    timeline: "3 Months",
    year: "2024",
    stat: "120+",
    statLabel: "components shipped",
    tools: ["React", "Storybook", "Tokens", "a11y"],
  },
];
