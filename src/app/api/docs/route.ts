import { generateSpec } from "@/lib/docs/generate";

export const dynamic = "force-dynamic";

export async function GET() {
  const spec = generateSpec();
  return Response.json(spec);
}
