import type { Context } from 'hono';

// Custom context variables
export interface AppContext {
  Variables: {
    userId: string;
    apiKey: {
      id: string;
      userId: string;
      key: string;
      rateLimit: number;
      dailyLimit: number;
      canExtract: boolean;
      canGenerate: boolean;
    };
  };
}

export type AppContextType = Context<AppContext>;
