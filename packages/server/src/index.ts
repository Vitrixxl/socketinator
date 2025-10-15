import type {
  WsClientCommand,
  WsServerCommandPayload,
  WsServerSessionEvent,
} from "@socketinator/types";

import {
  wsServerMessageSchema,
  wsClientCommandSchema,
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

const toClientCommand = (data: WsServerCommandPayload): WsClientCommand => ({
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

let serverWs: ElysiaWS | null = null;

const app = new Elysia()
  .derive(({ cookie }) => {
    const sessionToken =
      (cookie[sessionCookieName] as Cookie<string> | undefined)?.value ?? null;
    const expSession = sessionToken
      ? expSessionMap.get(sessionToken)
      : undefined;

    return {
      sessionToken, // string | null
      userId: expSession?.userId ?? null, // string | null
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

      serverWs.send({
        group: data.group,
        userId,
        command: data.command,
      });
    },

    body: wsClientCommandSchema,

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
