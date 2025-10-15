import z from "zod";

export const wsCommandSchema = z.object({
  key: z.string(),
  payload: z.any(),
});

// SERVER SCHEMAS
export const wsServerCommandPayloadSchema = z.object({
  group: z.string(),
  userId: z.string().or(z.number()),
  command: wsCommandSchema,
});

export const wsServerDataEventSchema = z.object({
  type: z.literal("data"),
  payload: wsServerCommandPayloadSchema,
});

export const wsSetSessionSchema = z.object({
  key: z.literal("set"),
  token: z.string(),
  userId: z.string().or(z.number()),
  exp: z.number(),
});

export const wsDeleteSessionSchema = z.object({
  key: z.literal("delete"),
  userId: z.string(),
  token: z.string(),
});

export const wsServerSessionEventSchema = z.object({
  type: z.literal("session"),
  payload: z.union([wsSetSessionSchema, wsDeleteSessionSchema]),
});

export const wsServerMessageSchema = z.union([
  wsServerDataEventSchema,
  wsServerSessionEventSchema,
]);

// CLIENT SCHEMA
export const wsClientCommandSchema = z.object({
  group: z.string(),
  command: wsCommandSchema,
});
