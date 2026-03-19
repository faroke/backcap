import { getServices } from "@/lib/services";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { blogHandlers } = getServices();
  return blogHandlers.postById.GET(request, context);
}
