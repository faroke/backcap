import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://faroke.github.io",
  base: "/backcap",
  integrations: [
    starlight({
      title: "Backcap",
      description:
        "Production-ready backend features for TypeScript. Copy and own — auth, billing, blog and more.",
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
              label: "Create a Domain",
              slug: "guides/create-domain",
            },
            { label: "AI Workflow", slug: "guides/ai-workflow" },
          ],
        },
        {
          label: "Domains",
          items: [
            { label: "All Features", slug: "domains" },
            { label: "Activity", slug: "domains/activity" },
            { label: "Audit Log", slug: "domains/audit-log" },
            { label: "Auth", slug: "domains/auth" },
            { label: "Billing", slug: "domains/billing" },
            { label: "Blog", slug: "domains/blog" },
            { label: "Cart", slug: "domains/cart" },
            { label: "Catalog", slug: "domains/catalog" },
            { label: "Comments", slug: "domains/comments" },
            { label: "Discounts", slug: "domains/discounts" },
            { label: "Files", slug: "domains/files" },
            { label: "Forms", slug: "domains/forms" },
            { label: "Inventory", slug: "domains/inventory" },
            { label: "Notifications", slug: "domains/notifications" },
            { label: "Orders", slug: "domains/orders" },
            { label: "Organizations", slug: "domains/organizations" },
            { label: "RBAC", slug: "domains/rbac" },
            { label: "Reviews", slug: "domains/reviews" },
            { label: "Shipping", slug: "domains/shipping" },
            { label: "Tags", slug: "domains/tags" },
            { label: "Users", slug: "domains/users" },
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
