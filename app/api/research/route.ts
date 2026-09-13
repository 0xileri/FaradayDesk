import { env } from "cloudflare:workers";
import { createResearchHandlers } from "@/lib/research-handler";
import { reserveResearch } from "@/lib/research-budget";
export const { GET, POST } = createResearchHandlers(
  () => env as unknown as Record<string, string | undefined>,
  () => reserveResearch(env.DB),
);
