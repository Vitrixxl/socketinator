import z from "zod";

export const wsMessageSchema = z.object({
  key: z.string(),
  payload: z.any(),
});

// SERVER SCHEMAS

export const wsServerMessageEntrySchema = z.object({
  group: z.string(),
  userId: z.string(),
  message: wsMessageSchema,
});

export const wsServerDataMessageSchema = z.object({
  action: z.literal("data"),
  payload: wsServerMessageEntrySchema,
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

export const wsServerSessionMessageSchema = z.object({
  action: z.literal("session"),
  payload: z.union([wsSetSessionSchema, wsDeleteSessionSchema]),
});

export const wsServerMessageSchema = z.union([
  wsServerSessionMessageSchema,
  wsServerDataMessageSchema,
]);

// CLIENT SCHEMA

export const wsClientMessageSchema = z.object({
  group: z.string(),
  ...wsMessageSchema.shape,
});
