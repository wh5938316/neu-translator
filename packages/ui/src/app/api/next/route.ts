import { getCloudflareContext } from "@opennextjs/cloudflare";
import { AgentLoop, type CopilotResponse, type UserModelMessage } from "core";
import { SessionManager } from "@/app/lib/storage";
import { D1SessionStorage } from "@/app/lib/storage/providers";

export const runtime = "edge";

export type AgentResponse = Awaited<ReturnType<AgentLoop["next"]>>;

export async function POST(req: Request) {
  try {
    const {
      copilotResponses,
      sessionId,
      userInput,
    }: {
      sessionId?: string;
      userInput?: string;
      copilotResponses?: CopilotResponse[];
    } = await req.json();

    const { env } = getCloudflareContext();
    const storage = new D1SessionStorage(env.DB);
    const sessionManager = new SessionManager(storage);

    const session = sessionId
      ? await sessionManager.getSession(sessionId)
      : await sessionManager.createSession();

    if (!session) {
      return new Response(`Session "${sessionId}" not found`, { status: 404 });
    }

    const agentLoop = new AgentLoop(
      {
        abortSignal: req.signal,
      },
      session.messages,
    );

    if (userInput) {
      const userMessages: UserModelMessage[] = [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userInput,
            },
          ],
        },
      ];
      await sessionManager.addMessages(session.id, userMessages);
      await agentLoop.userInput(userMessages);
    }

    if (copilotResponses) {
      await sessionManager.addCopilotResponses(session.id, copilotResponses);
      await agentLoop.addCopilotResponses(copilotResponses);
    }

    const res = await agentLoop.next();

    await sessionManager.addMessages(session.id, res.messages);

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        agentResponse: res,
      }),
      { status: 200 },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 },
    );
  }
}
