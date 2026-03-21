import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://faroke.github.io",
  base: "/backcap",
  integrations: [
    starlight({
      title: "Backcap",
      description:
        "Production-ready backend features for TypeScript. Copy and own — auth, billing, search and more.",
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
            { label: "Domains", slug: "concepts/domains" },
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
          label: "Domains",
          items: [
            { label: "All Features", slug: "domains" },
            { label: "Analytics", slug: "domains/analytics" },
            { label: "Audit Log", slug: "domains/audit-log" },
            { label: "Auth", slug: "domains/auth" },
            { label: "Billing", slug: "domains/billing" },
            { label: "Blog", slug: "domains/blog" },
            { label: "Cart", slug: "domains/cart" },
            { label: "Catalog", slug: "domains/catalog" },
            { label: "Comments", slug: "domains/comments" },
            { label: "Feature Flags", slug: "domains/feature-flags" },
            { label: "Files", slug: "domains/files" },
            { label: "Forms", slug: "domains/forms" },
            { label: "Media", slug: "domains/media" },
            { label: "Notifications", slug: "domains/notifications" },
            { label: "Orders", slug: "domains/orders" },
            { label: "Organizations", slug: "domains/organizations" },
            { label: "Queues", slug: "domains/queues" },
            { label: "RBAC", slug: "domains/rbac" },
            { label: "Search", slug: "domains/search" },
            { label: "Tags", slug: "domains/tags" },
            { label: "Webhooks", slug: "domains/webhooks" },
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
