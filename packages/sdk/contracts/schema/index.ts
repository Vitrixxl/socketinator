import { z } from "zod";

export const wsCommandSchema = z.object({
  key: z.string(),
  payload: z.any(),
});
// SERVER SCHEMAS
export const wsServerCommandEnvelopeSchema = z.object({
  group: z.string(),
  userId: z.string().or(z.number()),
  requestId: z.string(),
  command: wsCommandSchema,
});

const successResponse = z.object({
  requestId: z.string(),
  data: z.any(),
  error: z.null(),
});

const errorResponse = z.object({
  requestId: z.string(),
  data: z.null(),
  error: z.object({
    message: z.string(),
    details: z.record(z.string(), z.any()),
  }),
});

export const wsServerResponseSchema = z.union([successResponse, errorResponse]);

export const wsServerDataEventSchema = z.object({
  type: z.literal("data"),
  payload: wsServerCommandEnvelopeSchema,
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

export const wsServerInitSchema = z.object({
  key: z.literal("init"),
  routes: z.record(z.string(), z.record(z.string(), z.number())),
});

export const wsServerInitEventSchema = z.object({
  type: z.literal("init"),
  payload: wsServerInitSchema,
});

export const wsServerMessageSchema = z.union([
  wsServerDataEventSchema,
  wsServerSessionEventSchema,
  wsServerInitEventSchema,
]);

// CLIENT SCHEMA
export const wsClientCommandEnvelopeSchema = z.object({
  group: z.string(),
  command: wsCommandSchema,
  requestId: z.string(),
});
