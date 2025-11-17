import type { Context } from "core";
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { sessions } from "@/app/lib/db/schema";
import type {
  ISessionStorage,
  Session,
  SessionListItem,
} from "@/app/lib/storage";

function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class D1SessionStorage implements ISessionStorage {
  private db;

  constructor(d1: D1Database) {
    this.db = drizzle(d1);
  }

  async create(): Promise<Session> {
    const now = new Date();
    const session: Session = {
      id: generateId(),
      messages: [],
      copilotResponses: [],
      createdAt: now,
      updatedAt: now,
    };

    await this.db.insert(sessions).values({
      id: session.id,
      messages: session.messages as unknown as string,
      copilotResponses: session.copilotResponses as unknown as string,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    });

    return session;
  }

  async get(id: string): Promise<Session | null> {
    const result = await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.id, id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    return {
      id: row.id,
      messages: row.messages as Context["messages"],
      copilotResponses: row.copilotResponses as Context["copilotResponses"],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async update(
    id: string,
    data: Partial<Pick<Session, "messages" | "copilotResponses">>,
  ): Promise<void> {
    await this.db
      .update(sessions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(sessions.id, id));
  }

  async list(): Promise<SessionListItem[]> {
    const result = await this.db
      .select()
      .from(sessions)
      .orderBy(desc(sessions.updatedAt));

    return result.map((row) => ({
      id: row.id,
      messageCount: (row.messages as Context["messages"]).length,
      copilotResponseCount: (
        row.copilotResponses as Context["copilotResponses"]
      ).length,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.id, id));
  }
}
