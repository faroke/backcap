export const mockRegistryData = {
  name: "backcap-registry",
  version: "1.0.0",
  description: "Test registry",
  items: [
    {
      name: "auth",
      type: "capability",
      description: "Authentication capability with login and registration",
      files: [],
    },
    {
      name: "blog",
      type: "capability",
      description: "Blog capability with CRUD operations",
      files: [],
    },
    {
      name: "auth-prisma",
      type: "adapter",
      description: "Prisma adapter for auth",
      files: [],
    },
  ],
};
