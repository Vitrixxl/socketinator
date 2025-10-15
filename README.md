# Socketinator

Socketinator is a Bun-powered WebSocket toolkit that pairs an Elysia-based relay server with type-safe SDKs for browsers and backend services. It keeps real-time messaging predictable by sharing Zod schemas and command contracts across the stack.

## What It Does
- Provides a production-ready WebSocket relay (`@socketinator/server`) built on Elysia and Bun.
- Ships client and server SDKs (`@socketinator/client-sdk`, `@socketinator/server-sdk`) that wrap low-level socket APIs with strongly typed helpers.
- Manages authenticated sessions and user targeting via shared transport primitives.
- Emits built-in lifecycle commands (`base/connect`, `base/disconnect`) so consumers can react consistently to socket state changes.
- Validates every incoming and outgoing command with Zod to guarantee runtime safety.

## Why Type Safety Matters Here
- **Shared contracts**: Client and server use the same `group` + `command` definitions, so adding a new command in one place automatically updates both ends.
- **Compile-time guarantees**: Utilities like `CommandsOf` and `CommandPayloadOf` ensure you can only send or subscribe to commands that exist. Mistyped keys fail fast during development.
- **Safe parsing**: All raw frames pass through Zod schemas before dispatch, so malformed payloads never reach your business logic.
- **Ergonomic handlers**: Subscription helpers return properly typed payloads, giving you rich IDE autocompletion without manual casting.

## How to Use It

### Install
```bash
npm install @socketinator/client-sdk @socketinator/server-sdk @socketinator/server @socketinator/types @socketinator/schemas
```
```bash
bun add @socketinator/client-sdk @socketinator/server-sdk @socketinator/server @socketinator/types @socketinator/schemas
```

### Share command definitions
```ts
// commands.ts
import type {
  WSCommand,
  WSCommandEntryWithUserId,
  BaseWSCommands,
} from "@socketinator/types";

type ChatMessageCommand = WSCommand<"message", { text: string }>;

type ChatClientEntry = {
  group: "chat";
  command: ChatMessageCommand;
};

export type ClientReadableCommands = BaseWSCommands | ChatClientEntry;
export type ClientWritableCommands = ChatClientEntry;

type ChatRelayEntry = WSCommandEntryWithUserId<string> & {
  group: "chat";
  command: ChatMessageCommand;
};

export type RelayCommands = ChatRelayEntry;
```

### Browser client usage
```ts
import { SocketinatorClient } from "@socketinator/client-sdk";
import type {
  ClientReadableCommands,
  ClientWritableCommands,
} from "./commands";

const client = new SocketinatorClient<
  ClientReadableCommands,
  ClientWritableCommands
>({
  url: "wss://your-relay.example.com/ws",
});

client.on("chat", "message", ({ text }) => {
  console.log("Message received:", text);
});

client.on("base", "connect", () => {
  client.send("chat", "message", { text: "Hello from the browser!" });
});
```

### Backend broadcaster (server SDK)
```ts
import { Socketinator } from "@socketinator/server-sdk";
import type { RelayCommands } from "./commands";

type UserId = string;

const relay = new Socketinator<UserId, RelayCommands, RelayCommands>({
  url: "wss://your-relay.example.com/ws/server",
});

relay.send("chat", "message", "user-123", { text: "Welcome aboard!" });

relay.on("chat", "message", (payload, userId) => {
  console.log(`Client ${userId} said: ${payload.text}`);
});

relay.setSession({
  token: "session-token",
  userId: "user-123",
  exp: Date.now() + 1000 * 60 * 60,
});
```

### Run the WebSocket relay
```bash
bunx --bun @socketinator/server
```

### Type utilities
```ts
import type { CommandsOf, CommandPayloadOf } from "@socketinator/types";
import type { ClientReadableCommands } from "./commands";

type ChatKeys = CommandsOf<ClientReadableCommands, "chat">["key"];
type ChatPayload = CommandPayloadOf<
  ClientReadableCommands,
  "chat",
  "message"
>;
```

## Packages
- `@socketinator/server`: Bun CLI for running the WebSocket relay (launch with `bunx --bun @socketinator/server`).
- `@socketinator/client-sdk`: Browser-friendly client that queues handlers, parses commands, and serialises payloads.
- `@socketinator/server-sdk`: Helper layer for backend services that need to push commands to connected users.
- `@socketinator/types`: Shared Zod schemas and TypeScript utilities underpinning the command model.
- `@socketinator/schemas`: Zod schemas for validating the transmitted data, ensuring only safe payloads.

## Getting Started
`bun install`

### Development
- Run the WebSocket server during development: `bun --filter @socketinator/server dev`
- Build all packages: `bun run build`

## Project Stack
- Runtime: Bun
- Server framework: Elysia
- Validation: Zod
- Bundling: Bun build with TypeScript checking

## In the Future
- Add rate limiting and an allow-list of `group`/`key` pairs to prevent abusive clients from flooding the relay with unauthorized commands.
- Adding global event that will be passed to every connected user
