import "dotenv/config";
import cors from "@fastify/cors";
import fastify from "fastify";
import {
  fastifyTRPCPlugin,
  type FastifyTRPCPluginOptions,
} from "@trpc/server/adapters/fastify";
import { createContext } from "./context.js";
import { loggerOptions } from "./logger.js";
import { appRouter, type AppRouter } from "./router.js";

const port = Number(process.env.PORT ?? 3001);
const server = fastify({
  logger: loggerOptions,
  routerOptions: { maxParamLength: 5000 },
});

server.register(cors, { origin: "*" });
const trpcOptions = {
  router: appRouter,
  createContext,
  onError({ path, error, type }) {
    if (error.code === "INTERNAL_SERVER_ERROR") {
      server.log.error({ err: error, path, type }, "Unhandled tRPC error");
    }
  },
} satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"];

server.register(fastifyTRPCPlugin, {
  prefix: "/api/trpc",
  trpcOptions,
});

async function startServer() {
  try {
    await server.listen({ port, host: "0.0.0.0" });
    server.log.info({ port, host: "0.0.0.0", path: "/api/trpc" }, "tRPC API listening");
  } catch (error) {
    server.log.error({ err: error, port }, "Failed to start the tRPC API");
    process.exit(1);
  }
}

void startServer();
