import { getHistory, isLens } from "@/lib/bitget-history";
import { instruments, type Asset } from "@/lib/market";
export async function GET(request: Request) {
  const url = new URL(request.url),
    asset = url.searchParams.get("asset") || "",
    lens = url.searchParams.get("lens") || "";
  if (!Object.hasOwn(instruments, asset) || !isLens(lens))
    return Response.json(
      {
        error:
          "Choose a supported ticker and the weekend, earnings or inflation lens.",
      },
      { status: 400 },
    );
  try {
    return Response.json(await getHistory(asset as Asset, lens), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error(
      "History validation:",
      error instanceof Error ? error.message : "Unknown failure",
    );
    return Response.json(
      {
        error:
          "Verified history is unavailable for this lens. No historical comparison was calculated. Try again later.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
