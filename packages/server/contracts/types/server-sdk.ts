import type { ZodNull, ZodObject, ZodRawShape } from "zod";
import type {
  ReadGroups,
  ReadKeys,
  ReadPayload,
  WithUserId,
} from "./server-utils";
import type { ZodAny } from "zod";

export type SocketinatorReadEntriesConfig = {
  [group: string]: {
    [key: string]: {
      schema: ZodObject<ZodRawShape> | ZodNull;
      /**
       * @default 10
       */
      maxRequestPerSecond?: number;
      /**
       * To specify only if you want a reponse for the request on the client
       */
      responseSchema?: ZodAny;
    };
  };
};

export type ParsedIncomingMessage<
  U extends number | string,
  C extends SocketinatorReadEntriesConfig,
  G extends ReadGroups<C>,
  K extends ReadKeys<C, G>,
  P extends WithUserId<ReadPayload<C, G, K>, U>,
> = {
  group: keyof C;
  key: K;
  payload: P;
};

export type CallbackStoreWithUserId<
  C extends SocketinatorReadEntriesConfig,
  U extends string | number,
> = {
  [G in ReadGroups<C>]?: {
    [K in ReadKeys<C, G>]?: Set<
      (d: WithUserId<ReadPayload<C, G, K>, U>) => void
    >;
  };
};

export type ParsedIncomingMessageAny<
  U extends string | number,
  C extends SocketinatorReadEntriesConfig,
> = {
  [G in ReadGroups<C>]: {
    [K in ReadKeys<C, G>]: ParsedIncomingMessage<
      U,
      C,
      G,
      K,
      WithUserId<ReadPayload<C, G, K>, U>
    >;
  }[ReadKeys<C, G>];
}[ReadGroups<C>];

export type SocketinatorServerParams<C extends SocketinatorReadEntriesConfig> =
  {
    url: string;
    readEnvelopes: C;
    onConnect: (e: Event) => void;
    onClose: (e: CloseEvent) => void;
  };
