import { getServices } from "@/lib/services";

export async function GET() {
  const { blogHandlers } = getServices();
  return blogHandlers.posts.GET();
}

export async function POST(request: Request) {
  const { blogHandlers } = getServices();
  return blogHandlers.posts.POST(request);
}
