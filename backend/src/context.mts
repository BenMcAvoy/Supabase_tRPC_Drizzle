import type { User } from "@supabase/supabase-js";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { getSupabaseClient } from "./supabase.mjs";

type Context = {
  user: User | null;
};

export async function createContext({ req }: CreateFastifyContextOptions): Promise<Context> {
  // Extract the Bearer token from the Authorization header
  const authorization = req.headers.authorization;
  const token = typeof authorization === "string"
    ? authorization.match(/^Bearer\s+(.+)$/i)?.[1]
    : undefined;
  if (!token) return { user: null };

  // Get supabase client
  const supabase = getSupabaseClient();

  // Get the users data and the error if there is one
  const { data, error } = await supabase.auth.getUser(token);

  // Return null if there was an error looking up the user
  if (error) {
    return { user: null };
  }

  // Return the user data if it was found
  return { user: data.user };
}

export type { Context };
