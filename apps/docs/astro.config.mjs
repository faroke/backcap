import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  integrations: [
    starlight({
      title: "Backcap",
      description:
        "A registry of composable backend capabilities for TypeScript. Install backend features like packages.",
      logo: {
        alt: "Backcap",
      },
      social: {
        github: "https://github.com/backcap/backcap",
      },
      editLink: {
        baseUrl: "https://github.com/backcap/backcap/edit/main/apps/docs/",
      },
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Introduction", slug: "getting-started/introduction" },
            { label: "Installation", slug: "getting-started/installation" },
            { label: "Quick Start", slug: "getting-started/quick-start" },
          ],
        },
        {
          label: "Concepts",
          items: [
            { label: "Capabilities", slug: "concepts/capabilities" },
            { label: "Skills", slug: "concepts/skills" },
            { label: "Adapters", slug: "concepts/adapters" },
            { label: "Bridges", slug: "concepts/bridges" },
            { label: "Architecture", slug: "concepts/architecture" },
          ],
        },
        {
          label: "CLI Reference",
          items: [{ label: "Commands", slug: "cli/commands" }],
        },
        {
          label: "Guides",
          items: [
            {
              label: "Create a Capability",
              slug: "guides/create-capability",
            },
            { label: "Create an Adapter", slug: "guides/create-adapter" },
            { label: "AI Workflow", slug: "guides/ai-workflow" },
          ],
        },
        {
          label: "Capabilities",
          items: [
            { label: "Auth", slug: "capabilities/auth" },
            { label: "Blog", slug: "capabilities/blog" },
            { label: "Search", slug: "capabilities/search" },
          ],
        },
        {
          label: "Adapters",
          items: [
            { label: "Prisma", slug: "adapters/prisma" },
            { label: "Express", slug: "adapters/express" },
          ],
        },
      ],
      customCss: [],
      head: [
        {
          tag: "link",
          attrs: {
            rel: "preconnect",
            href: "https://fonts.googleapis.com",
          },
        },
      ],
    }),
  ],
});
