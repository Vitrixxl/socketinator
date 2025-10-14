import type {
  wsClientMessageSchema,
  wsServerMessageEntrySchema,
  wsServerSessionMessageSchema,
} from "@socketinator/schemas";
import { z } from "zod";

export type WsServerMessageEntry = z.infer<typeof wsServerMessageEntrySchema>;
export type WsServerSessionMessage = z.infer<
  typeof wsServerSessionMessageSchema
>;

export type WsClientMessage = z.infer<typeof wsClientMessageSchema>;
