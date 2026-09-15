import { getWeekendHistory } from "@/lib/bitget-history";
import { instruments, type Asset } from "@/lib/market";
export async function GET(request: Request) {
  const url = new URL(request.url),
    asset = url.searchParams.get("asset") || "";
  if (
    !Object.hasOwn(instruments, asset) ||
    url.searchParams.get("lens") !== "weekend"
  )
    return Response.json(
      { error: "Choose a supported ticker and the weekend lens." },
      { status: 400 },
    );
  try {
    return Response.json(await getWeekendHistory(asset as Asset), {
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
          "Verified weekend history is unavailable. No historical comparison was calculated. Try again later.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
