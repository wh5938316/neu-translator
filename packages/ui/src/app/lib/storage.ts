import type { Context } from "core";

export type Session = {
  id: string;
  messages: Context["messages"];
  copilotResponses: Context["copilotResponses"];
  createdAt: Date;
  updatedAt: Date;
};

export type SessionListItem = {
  id: string;
  messageCount: number;
  copilotResponseCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export interface ISessionStorage {
  create(): Promise<Session>;
  get(id: string): Promise<Session | null>;
  update(
    id: string,
    data: Partial<Pick<Session, "messages" | "copilotResponses">>,
  ): Promise<void>;
  list(): Promise<SessionListItem[]>;
  delete(id: string): Promise<void>;
}

export class SessionManager {
  private storage: ISessionStorage;

  constructor(storage: ISessionStorage) {
    this.storage = storage;
  }

  createSession(): Promise<Session> {
    return this.storage.create();
  }

  getSession(id: string): Promise<Session | null> {
    return this.storage.get(id);
  }

  async addMessages(id: string, messages: Context["messages"]): Promise<void> {
    const session = await this.storage.get(id);
    if (!session) {
      throw new Error(`Session ${id} not found`);
    }

    await this.storage.update(id, {
      messages: [...session.messages, ...messages],
    });
  }

  async addCopilotResponses(
    id: string,
    responses: Context["copilotResponses"],
  ): Promise<void> {
    const session = await this.storage.get(id);
    if (!session) {
      throw new Error(`Session ${id} not found`);
    }

    await this.storage.update(id, {
      copilotResponses: [...session.copilotResponses, ...responses],
    });
  }

  listSessions(): Promise<SessionListItem[]> {
    return this.storage.list();
  }

  deleteSession(id: string): Promise<void> {
    return this.storage.delete(id);
  }
}
