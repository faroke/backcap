export const createPostSchema = {
  body: {
    type: "object" as const,
    required: ["title", "content", "authorId"],
    properties: {
      title: { type: "string" as const },
      slug: { type: "string" as const },
      content: { type: "string" as const },
      authorId: { type: "string" as const },
    },
  },
};

export const publishPostSchema = {
  params: {
    type: "object" as const,
    required: ["id"],
    properties: {
      id: { type: "string" as const },
    },
  },
};

export const getPostSchema = {
  params: {
    type: "object" as const,
    required: ["id"],
    properties: {
      id: { type: "string" as const },
    },
  },
};
