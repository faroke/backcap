import { getServices } from "@/lib/services";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { blogHandlers } = getServices();
  return blogHandlers.publish.PUT(request, context);
}
