import { getServices } from "@/lib/services";

export async function GET(request: Request) {
  const { searchService } = getServices();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  const result = await searchService.searchDocuments({
    indexName: "posts",
    query,
    page: 1,
    pageSize: 20,
  });

  if (result.isOk()) {
    return Response.json(result.unwrap());
  }

  return Response.json({ error: result.unwrapError().message }, { status: 500 });
}
