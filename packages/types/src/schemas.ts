import { z } from "zod";
import type {
  wsClientActionSchema,
  wsServerActionSchema,
  wsServerSessionEventSchema,
} from "@socketinator/schemas";

export type WsServerActionMessage = z.infer<typeof wsServerActionSchema>;
export type WsServerSessionEvent = z.infer<typeof wsServerSessionEventSchema>;
export type WsClientAction = z.infer<typeof wsClientActionSchema>;
