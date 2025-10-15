 # Socketinator

Socketinator is a Bun-powered WebSocket toolkit that pairs an Elysia server with type-safe client and server SDKs. It keeps
real-time messaging predictable by sharing schemas, actions, and event contracts across the stack.

## What It Does
- Provides a production-ready WebSocket server (`@socketinator/server`) built on Elysia and Bun.
- Ships client and server SDKs (`@socketinator/client-sdk`, `@socketinator/server-sdk`) that wrap low-level socket APIs with
strongly typed helpers.
- Manages authenticated sessions and user targeting via shared transport primitives.
- Emits built-in lifecycle actions (`base/connect`, `base/disconnect`) so consumers can react consistently to socket state
changes.
- Validates every incoming and outgoing action with Zod to guarantee runtime safety.

## Why Type Safety Matters Here
- **Shared contracts**: Client and server use the same `group` + `action` definitions, so adding a new action in one place
automatically updates both ends.
- **Compile-time guarantees**: Utilities like `CommandsOf` and `CommandPayloadOf` ensure you can only send or subscribe to commands
that exist. Mistyped keys fail fast during development.
- **Safe parsing**: All raw frames pass through Zod schemas before dispatch so malformed payloads never reach your business
logic.
- **Ergonomic handlers**: Subscription helpers return properly typed payloads, giving you rich IDE autocompletion without
manual casting.

## How to use it ?
- **Install**
  ```bash
  npm install @socketinator/client-sdk @socketinator/server-sdk @socketinator/server @socketinator/types @socketinator/schemas
  ```
  ```bash
  bun add @socketinator/client-sdk @socketinator/server-sdk @socketinator/server @socketinator/types @socketinator/schemas
  ```
- **Définir vos commandes partagées**
  ```ts
  import type { WSCommand, WSCommandEntry, WithBase } from "@socketinator/types";

  type ChatMessage = WSCommand<"message", { text: string }>;

  type ChatEntry = WSCommandEntry & {
    group: "chat";
    command: ChatMessage;
  };

  export type ClientCommands = WithBase<ChatEntry>;
  export type ServerCommands = ClientCommands;
  ```
- **Client SDK (navigateur)**
  ```ts
  import { SocketinatorClient } from "@socketinator/client-sdk";
  import type { ClientCommands } from "./commands";

  const client = new SocketinatorClient<ClientCommands, ClientCommands>({
    url: "wss://your-server/ws",
  });

  client.on("chat", "message", ({ text }) => {
    console.log("Message reçu:", text);
  });

  client.send("chat", "message", { text: "Hello!" });
  ```
- **Server SDK (backend vers le relayeur)**
  ```ts
  import { Socketinator } from "@socketinator/server-sdk";
  import type { ServerCommands } from "./commands";

  type UserId = string;

  const server = new Socketinator<UserId, ServerCommands, ClientCommands>({
    url: "wss://your-server/ws/server",
  });

  server.send("chat", "message", "user-123", { text: "Bienvenue !" });
  server.on("chat", "message", (payload, userId) => {
    console.log(`Message de ${userId}:`, payload.text);
  });
  ```
- **Lancer le relayeur WebSocket**
  ```bash
  bunx --bun @socketinator/server
  ```
- **Types dérivés et helpers**
  ```ts
  import type {
    CommandPayloadOf,
    CommandsOf,
    WSCommandEntry,
  } from "@socketinator/types";

  type Entries = ClientCommands;
  type ChatCommandKeys = CommandsOf<Entries, "chat">["key"]; // "message"
  type ChatPayload = CommandPayloadOf<Entries, "chat", "message">;
  ```

## Packages
- `@socketinator/server`: Bun CLI for running the WebSocket relay (launch with `bunx --bun @socketinator/server`).
- `@socketinator/client-sdk`: Browser-friendly client that queues handlers, parses actions, and serialises payloads.
- `@socketinator/server-sdk`: Helper layer for backend services that need to push actions to connected users.
- `@socketinator/types`: Shared Zod schemas and TypeScript utilities underpinning the action model.
- `@socketinator/schemas`: Zod schemas for validating the trasmitted data insuring only safe data.

## Getting Started
`bun install`

### Development

- Run the WebSocket server during development:

`bun --filter @socketinator/server dev`
- Build all packages:

`bun run build`

## Project Stack

- Runtime: Bun
- Server framework: Elysia
- Validation: Zod
- Bundling: Bun build with tsc checking

## In the future ?

- I need to add a limit rate and a list of allowed group/key pair to prevent abusive clients from flooding the socket with unauthorized actions or overwhelming the server.
