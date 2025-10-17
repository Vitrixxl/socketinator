import { z } from "zod";
import type {
  wsClientCommandEnvelopeSchema,
  wsDeleteSessionSchema,
  wsServerCommandEnvelopeSchema,
  wsServerDataEventSchema,
  wsServerSessionEventSchema,
  wsSetSessionSchema,
} from "@socketinator/schemas";

export type WsServerCommandEnvelope = z.infer<
  typeof wsServerCommandEnvelopeSchema
>;
export type WsServerSessionEvent = z.infer<typeof wsServerSessionEventSchema>;
export type WsClientCommandEnvelope = z.infer<
  typeof wsClientCommandEnvelopeSchema
>;
export type WsSetSession = z.infer<typeof wsSetSessionSchema>;
export type WsDeleteSession = z.infer<typeof wsDeleteSessionSchema>;
export type WsServerDataEvent = z.infer<typeof wsServerDataEventSchema>;
