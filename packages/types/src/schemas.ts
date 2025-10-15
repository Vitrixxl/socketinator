import { z } from "zod";
import type {
  wsClientCommandSchema,
  wsDeleteSessionSchema,
  wsServerCommandPayloadSchema,
  wsServerDataEventSchema,
  wsServerSessionEventSchema,
  wsSetSessionSchema,
} from "@socketinator/schemas";

export type WsServerCommandPayload = z.infer<
  typeof wsServerCommandPayloadSchema
>;
export type WsServerSessionEvent = z.infer<typeof wsServerSessionEventSchema>;
export type WsClientCommand = z.infer<typeof wsClientCommandSchema>;
export type WsSetSession = z.infer<typeof wsSetSessionSchema>;
export type WsDeleteSession = z.infer<typeof wsDeleteSessionSchema>;
export type WsServerDataEvent = z.infer<typeof wsServerDataEventSchema>;
