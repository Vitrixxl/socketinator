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
npm install @socketinator/client-sdk @socketinator/server-sdk @socketinator/server @socketinator/contracts
```
```bash
bun add @socketinator/client-sdk @socketinator/server-sdk @socketinator/server @socketinator/contracts
```

### Run the WebSocket relay
```bash
bunx --bun @socketinator/server
```

## Packages
- `@socketinator/server`: Bun CLI for running the WebSocket relay (launch with `bunx --bun @socketinator/server`).
- `@socketinator/client-sdk`: Browser-friendly client that queues handlers, parses commands, and serialises payloads.
- `@socketinator/server-sdk`: Helper layer for backend services that need to push commands to connected users.
- `@socketinator/contracts`: Shared Zod schemas and TypeScript utilities underpinning the command model.

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
