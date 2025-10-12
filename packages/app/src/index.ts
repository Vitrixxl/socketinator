import { env } from "bun";
import { Elysia } from "elysia";
import { ElysiaWS } from "elysia/dist/ws";
import z from "zod";

const socketMap = new Map<string, ElysiaWS>();
const sessionMap = new Map<string, number>();

const secret = env.SECRET;
const port = env.PORT;
const sessionCookieName = env.SESSION_COOKIE_NAME ?? "session_token";

const sessionSchema = z.object({
  token: z.string(),
  exp: z.number(),
});

const deleteSession = z.object({
  token: z.string(),
});

const dataSchema = z.object({
  session: z.string(),
  data: z.object({
    key: z.string(),
    payload: z.any(),
  }),
});

const authMacro = new Elysia().macro({
  auth: {
    async resolve({ status, headers }) {
      const key = headers["x-api-key"];
      if (!key || key != secret) {
        return status(401);
      }
    },
  },
});

const app = new Elysia()
  .ws("/ws", {
    open(ws) {
      const sessionToken = ws.data.cookie[sessionCookieName].value as string;
      const exp = sessionMap.get(sessionToken);
      if (!exp || exp < Date.now()) {
        sessionMap.delete(sessionToken);
        ws.close();
        return;
      }
      socketMap.set(sessionToken, ws);
    },
    close(ws, code) {
      if (code != 1000) return;
      socketMap.delete(ws.data.cookie[sessionCookieName].value as string);
    },
  })
  .use(authMacro)
  .group("sessions", (g) => {
    g.use(authMacro);
    g.post(
      "/",
      ({ body: { token, exp } }) => {
        sessionMap.set(token, exp);
      },
      {
        body: sessionSchema,
        auth: true,
      },
    ).delete(
      "/",
      ({ body: { token } }) => {
        sessionMap.delete(token);
      },
      {
        body: deleteSession,
        auth: true,
      },
    );
    return g;
  })
  .post(
    "/data",
    ({ body: { data, session } }) => {
      const exp = sessionMap.get(session);
      if (!exp || exp < Date.now()) {
        sessionMap.delete(session);
        socketMap.delete(session);
        return;
      }
      const socket = socketMap.get(session);
      if (!socket) return;
      socket.send(JSON.stringify(data));
    },
    { body: dataSchema, auth: true },
  )
  .listen(port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
