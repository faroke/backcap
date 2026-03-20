import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://faroke.github.io",
  base: "/backcap",
  integrations: [
    starlight({
      title: "Backcap",
      description:
        "A registry of composable backend capabilities for TypeScript. Install backend features like packages.",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/faroke/backcap",
        },
      ],
      editLink: {
        baseUrl: "https://github.com/faroke/backcap/edit/main/apps/docs/",
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
          items: [
            { label: "Commands", slug: "cli/commands" },
            { label: "Configuration", slug: "cli/configuration" },
          ],
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
          label: "Examples",
          items: [
            {
              label: "Express Blog",
              slug: "guides/express-blog-example",
            },
            {
              label: "Fastify Blog",
              slug: "guides/fastify-blog-example",
            },
            {
              label: "Hono Blog",
              slug: "guides/hono-blog-example",
            },
            {
              label: "NestJS Blog",
              slug: "guides/nestjs-blog-example",
            },
            {
              label: "Next.js Blog",
              slug: "guides/nextjs-blog-example",
            },
          ],
        },
        {
          label: "Capabilities",
          items: [
            { label: "Analytics", slug: "capabilities/analytics" },
            { label: "Audit Log", slug: "capabilities/audit-log" },
            { label: "Auth", slug: "capabilities/auth" },
            { label: "Billing", slug: "capabilities/billing" },
            { label: "Blog", slug: "capabilities/blog" },
            { label: "Cart", slug: "capabilities/cart" },
            { label: "Catalog", slug: "capabilities/catalog" },
            { label: "Comments", slug: "capabilities/comments" },
            { label: "Feature Flags", slug: "capabilities/feature-flags" },
            { label: "Files", slug: "capabilities/files" },
            { label: "Forms", slug: "capabilities/forms" },
            { label: "Media", slug: "capabilities/media" },
            { label: "Notifications", slug: "capabilities/notifications" },
            { label: "Orders", slug: "capabilities/orders" },
            { label: "Organizations", slug: "capabilities/organizations" },
            { label: "Queues", slug: "capabilities/queues" },
            { label: "RBAC", slug: "capabilities/rbac" },
            { label: "Search", slug: "capabilities/search" },
            { label: "Tags", slug: "capabilities/tags" },
            { label: "Webhooks", slug: "capabilities/webhooks" },
          ],
        },
        {
          label: "Adapters",
          items: [
            { label: "Prisma", slug: "adapters/prisma" },
            { label: "Express", slug: "adapters/express" },
            { label: "Fastify", slug: "adapters/fastify" },
            { label: "Hono", slug: "adapters/hono" },
            { label: "NestJS", slug: "adapters/nestjs" },
            { label: "Next.js", slug: "adapters/nextjs" },
          ],
        },
      ],
      customCss: ["./src/styles/custom.css"],
      components: {
        ThemeSelect: "./src/components/ThemeSelect.astro",
      },
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
