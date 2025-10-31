import type { z } from "zod";
import type {
  wsClientCommandEnvelopeSchema,
  wsDeleteSessionSchema,
  wsServerCommandEnvelopeSchema,
  wsServerDataEventSchema,
  wsServerInitEventSchema,
  wsServerInitSchema,
  wsServerResponseEnvelopeSchema,
  wsServerResponseSchema,
  wsServerSessionEventSchema,
  wsServerToClientEnvelopeSchema,
  wsSetSessionSchema,
} from "../schema";

export type WsServerCommandEnvelope = z.infer<
  typeof wsServerCommandEnvelopeSchema
>;

export type WsServerResponseEnvelope = z.infer<
  typeof wsServerResponseEnvelopeSchema
>;

export type WsServerSessionEvent = z.infer<typeof wsServerSessionEventSchema>;

export type WsClientCommandEnvelope = z.infer<
  typeof wsClientCommandEnvelopeSchema
>;

export type WsServerToClientEnvelope = z.infer<
  typeof wsServerToClientEnvelopeSchema
>;

export type WsSetSession = z.infer<typeof wsSetSessionSchema>;

export type WsDeleteSession = z.infer<typeof wsDeleteSessionSchema>;

export type WsServerDataEvent = z.infer<typeof wsServerDataEventSchema>;

export type WsServerInit = z.infer<typeof wsServerInitSchema>;

export type WsServerInitEvent = z.infer<typeof wsServerInitEventSchema>;

export type WsServerResponse = z.infer<typeof wsServerResponseSchema>;
