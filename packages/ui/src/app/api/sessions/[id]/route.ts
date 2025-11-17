import { getCloudflareContext } from "@opennextjs/cloudflare";
import { SessionManager } from "@/app/lib/storage";
import { D1SessionStorage } from "@/app/lib/storage/providers";

export const runtime = "edge";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { env } = getCloudflareContext();
    const storage = new D1SessionStorage(env.DB);
    const sessionManager = new SessionManager(storage);

    const session = await sessionManager.getSession(id);

    if (!session) {
      return new Response(
        JSON.stringify({
          error: `Session "${id}" not found`,
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    return new Response(JSON.stringify({ session }), {
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
