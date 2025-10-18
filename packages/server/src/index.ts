import type {
  RateConfig,
  WsClientCommandEnvelope,
  WsServerCommandEnvelope,
  WsServerInit,
  WsServerSessionEvent,
} from "@socketinator/types";

import {
  wsServerMessageSchema,
  wsClientCommandEnvelopeSchema,
} from "@socketinator/schemas";
import { env } from "bun";
import { Cookie, Elysia } from "elysia";
import { ElysiaWS } from "elysia/dist/ws";

// Set by the backend, with the key create-session
const expSessionMap = new Map<string, { userId: string; exp: number }>();
// Set by the socket server when a user is joining by retrieving the session token, verifying the exp and getting the userId
const userWsMap = new Map<
  string | number,
  { ws: ElysiaWS; sessionToken: string }[]
>();

const SECRET = env.SECRET;
const port = env.PORT;
const sessionCookieName = env.SESSION_COOKIE_NAME ?? "session_token";

const isExpired = (exp: number): boolean => Date.now() > exp;

let rateConfig: RateConfig = {};
const requestCountMap = new Map<string, number>();

const toClientCommand = (
  data: WsServerCommandEnvelope,
): WsClientCommandEnvelope => ({
  group: data.group,
  command: data.command,
});

const handleSessionEvent = (data: WsServerSessionEvent["payload"]) => {
  switch (data.key) {
    case "set": {
      data.exp;
      break;
    }
    case "delete": {
      expSessionMap.delete(data.token);
      const sockets = userWsMap.get(data.userId);
      if (!sockets || sockets.length === 0) return;
      sockets.filter(({ sessionToken }) => sessionToken !== data.token);
      break;
    }
  }
};

const handleInit = (data: WsServerInit) => {
  rateConfig = data.routes;
};

let serverWs: ElysiaWS | null = null;

setInterval(requestCountMap.clear, 1000);

const app = new Elysia()
  .derive(({ cookie }) => {
    const sessionToken =
      (cookie[sessionCookieName] as Cookie<string> | undefined)?.value ?? null;
    const expSession = sessionToken
      ? expSessionMap.get(sessionToken)
      : undefined;

    return {
      sessionToken,
      userId: expSession?.userId ?? null,
    };
  })
  .ws("/ws", {
    open: (ws) => {
      const userId = ws.data.userId;
      const sessionToken = ws.data.sessionToken;
      if (!userId || !sessionToken) return;

      const clients = userWsMap.get(userId);
      if (!clients) {
        userWsMap.set(userId, [{ ws, sessionToken }]);
        return;
      }

      clients.push({ ws, sessionToken });
    },

    close: (ws) => {
      const sessionTokenCookie = ws.data.cookie[
        sessionCookieName
      ] as Cookie<string>;
      expSessionMap.delete(sessionTokenCookie.value);
    },

    message: (ws, data) => {
      const userId = ws.data.userId;
      if (!userId || !serverWs) return;

      const requestCountKey = `${data.group}${data.command.key}${userId}`;
      const currentRequestCount = requestCountMap.get(requestCountKey);
      if (!currentRequestCount) requestCountMap.set(requestCountKey, 0);
      else if (currentRequestCount > rateConfig[data.group][data.command.key]) {
        ws.close();
      }

      serverWs.send({
        group: data.group,
        userId,
        command: data.command,
      });
    },

    body: wsClientCommandEnvelopeSchema,

    beforeHandle: ({ cookie, status }) => {
      const sessionToken = cookie[sessionCookieName] as Cookie<string>;
      const expSession = expSessionMap.get(sessionToken.value);
      if (!sessionToken || !expSession) {
        return status(401);
      }

      const { exp } = expSession;
      if (isExpired(exp)) {
        return status(401);
      }
    },
  })
  .ws("/ws/server", {
    open: (ws) => {
      serverWs = ws;
    },

    close: () => {
      serverWs = null;
    },

    message: async (_, data) => {
      switch (data.type) {
        case "data": {
          const clients = userWsMap.get(data.payload.userId);
          if (!clients || clients.length === 0) break;

          const clientCommand = toClientCommand(data.payload);
          for (const { ws } of clients) {
            ws.send(clientCommand);
          }
          break;
        }
        case "session": {
          handleSessionEvent(data.payload);
          break;
        }
        case "init": {
          handleInit(data.payload);
        }
      }
    },

    body: wsServerMessageSchema,

    beforeHandle: ({ headers, status }) => {
      const secret = headers["x-api-key"];
      if (!secret || secret !== SECRET) {
        return status(401);
      }
    },
  })
  .listen(port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
