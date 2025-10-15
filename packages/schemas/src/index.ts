import z from "zod";

export const wsActionPayloadSchema = z.object({
  key: z.string(),
  payload: z.any(),
});

// SERVER SCHEMAS
export const wsServerActionSchema = z.object({
  group: z.string(),
  userId: z.string(),
  action: wsActionPayloadSchema,
});

export const wsServerDataEventSchema = z.object({
  action: z.literal("data"),
  payload: wsServerActionSchema,
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
  action: z.literal("session"),
  payload: z.union([wsSetSessionSchema, wsDeleteSessionSchema]),
});

export const wsServerMessageSchema = z.union([
  wsServerDataEventSchema,
  wsServerSessionEventSchema,
]);

// CLIENT SCHEMA

export const wsClientActionSchema = z.object({
  group: z.string(),
  action: wsActionPayloadSchema.shape,
});
