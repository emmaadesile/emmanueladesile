import type { Collection } from "tinacms";

export const PageCollection: Collection = {
  name: "page",
  label: "Pages",
  path: "src/content/page",
  format: "mdx",
  ui: {
    // index.astro renders home.mdx at "/"; there is no /home page.
    router: ({ document }) => {
      return document._sys.filename === "home" ? "/" : `/${document._sys.filename}`;
    },
  },
  fields: [
    {
      name: "seoTitle",
      type: "string",
      required: true
    },
    // Structured hero, used by the home page. Optional so other pages
    // (about, etc.) remain valid without it.
    {
      name: "hero",
      label: "Hero",
      type: "object",
      fields: [
        {
          name: "role",
          label: "Role",
          type: "string",
          description: "Large uppercase line, e.g. \"Frontend Engineer\"",
        },
        {
          name: "specialties",
          label: "Specialties",
          type: "string",
          list: true,
          description: "Expertise strip below the hero.",
        },
        {
          name: "givenName",
          label: "Given name",
          type: "string",
          description: "Used in the hero introduction.",
        },
        {
          name: "familyName",
          label: "Family name",
          type: "string",
          description: "Used in the hero introduction.",
        },
        {
          name: "facts",
          label: "Facts",
          type: "string",
          list: true,
          description: "Bulleted row along the bottom of the hero",
        },
        {
          name: "portrait",
          label: "Portrait",
          type: "image",
          description:
            "Optional About section portrait. The hero uses a procedural 3D sculpture.",
        },
      ],
    },
    // Selected work. Optional; the section is skipped when empty.
    {
      name: "work",
      label: "Selected work",
      type: "object",
      list: true,
      ui: {
        itemProps: (item) => ({ label: item?.name ?? "Project" }),
      },
      fields: [
        {
          name: "name",
          label: "Name",
          type: "string",
          required: true,
        },
        {
          name: "description",
          label: "Description",
          type: "string",
          ui: { component: "textarea" },
        },
        {
          name: "url",
          label: "Link",
          type: "string",
        },
        {
          name: "year",
          label: "Year",
          type: "string",
        },
        {
          name: "tags",
          label: "Tags",
          type: "string",
          list: true,
        },
      ],
    },
    // The way I build: three principles. The diagrams follow the list order.
    {
      name: "approach",
      label: "Approach",
      type: "object",
      list: true,
      ui: {
        itemProps: (item) => ({ label: item?.title ?? "Principle" }),
      },
      fields: [
        { name: "name", label: "Label", type: "string", description: "Small uppercase label, e.g. \"Web performance\"" },
        { name: "title", label: "Title", type: "string" },
        { name: "text", label: "Text", type: "string", ui: { component: "textarea" } },
      ],
    },
    {
      name: "statement",
      label: "Statement",
      type: "string",
      ui: { component: "textarea" },
      description: "One large sentence. It fills with ink as the visitor scrolls.",
    },
    {
      name: "body",
      type: "rich-text",
      isBody: true,
      required: true
    }
  ]
}
