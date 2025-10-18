import z from "zod";

export const wsCommandSchema = z.object({
  key: z.string(),
  payload: z.any(),
});

// SERVER SCHEMAS
export const wsServerCommandEnvelopeSchema = z.object({
  group: z.string(),
  userId: z.string().or(z.number()),
  command: wsCommandSchema,
});

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

export const wsServerInitEventSchema = z.object({
  type: z.literal("init"),
  payload: z.object({
    allowedRoutes: z.array(
      z.object({
        group: z.string(),
        details: z.array(
          z.object({
            key: z.string(),
            maxRequestPerSecond: z.number(),
          }),
        ),
      }),
    ),
  }),
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
});
