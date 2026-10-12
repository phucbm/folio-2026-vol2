import { searchDocs } from "@/lib/search"

export const dynamic = "force-static"

// The search box's documents (`lib/search.ts`), fetched when it first opens. Rebuilt on every deploy.
export function GET() {
  return Response.json(searchDocs())
}
