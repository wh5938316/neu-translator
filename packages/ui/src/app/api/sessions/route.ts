import { getCloudflareContext } from "@opennextjs/cloudflare";
import { SessionManager } from "@/app/lib/storage";
import { D1SessionStorage } from "@/app/lib/storage/providers";

export const runtime = "edge";

export async function GET() {
  try {
    const { env } = getCloudflareContext();
    const storage = new D1SessionStorage(env.DB);
    const sessionManager = new SessionManager(storage);

    const sessions = await sessionManager.listSessions();

    return new Response(JSON.stringify({ sessions }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
