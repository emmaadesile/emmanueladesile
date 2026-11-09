import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";

// Self-hosted fonts (woff2, subset by unicode-range at runtime).
// The name font (Archivo) is defined as a subset @font-face in styles.css.
import "@fontsource-variable/big-shoulders-display"; // section headings
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";

import appCss from "../styles.css?url";
import { useSmoothScroll } from "../lib/smoothScroll";

const DESCRIPTION =
  "Emmanuel Adesile — creative developer building fast, expressive interfaces and digital experiences.";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "color-scheme", content: "dark" },
      { name: "theme-color", content: "#0a0a0a" },
      { title: "Emmanuel Adesile — Creative Developer" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Emmanuel Adesile — Creative Developer" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  useSmoothScroll();

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
