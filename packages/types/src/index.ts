import { z, ZodNull, ZodObject, type ZodRawShape } from "zod";

export * from "./schemas";

export type WSCommand<K extends PropertyKey = string, P = unknown> = {
  key: K;
  payload: P;
};

export type WSCommandEntry = {
  group: string;
  command: WSCommand;
};

export type WSCommandEntryWithUserId<UserId extends string | number> = {
  group: string;
  userId: UserId;
  command: WSCommand;
};

export type CommandsOf<
  Entries extends WSCommandEntry,
  Group extends Entries["group"],
> = Extract<Entries, { group: Group }>["command"];

export type CommandPayloadOf<
  Entries extends WSCommandEntry,
  Group extends Entries["group"],
  Key extends CommandsOf<Entries, Group>["key"],
> = Extract<CommandsOf<Entries, Group>, { key: Key }>["payload"];

export type BaseWSCommands = {
  group: "base";
  command:
    | { key: "connect"; payload: Event }
    | { key: "disconnect"; payload: CloseEvent };
};

export type BaseGroup = BaseWSCommands["group"];

export type HandlerStore<Entries extends WSCommandEntry> = {
  [Group in Entries["group"]]?: {
    [Key in CommandsOf<Entries, Group>["key"]]?: Set<
      (payload: CommandPayloadOf<Entries, Group, Key>) => void
    >;
  };
};

export type GroupHandlers<
  Entries extends WSCommandEntry,
  Group extends Entries["group"],
> = NonNullable<HandlerStore<Entries>[Group]>;

export type SocketinatorClientParams = {
  url: string;
};

export type SocketinatorReadEntriesConfig = {
  [group: string]: {
    [key: string]: {
      schema: ZodObject<ZodRawShape> | ZodNull;
      /**
       * @default 10
       */
      maxRequestPerSecond?: number;
    };
  };
};
export type SocketinatorServerParams<C extends SocketinatorReadEntriesConfig> =
  {
    url: string;
    readEnvelopes: C;
  };

export type ReadEntryUnion<C extends SocketinatorReadEntriesConfig> = {
  [G in keyof C]: {
    [K in keyof C[G]]: {
      group: G & string;
      key: K & string;
      payload: z.infer<C[G][K]["schema"]>;
    };
  }[keyof C[G]];
}[keyof C];

export type ReadGroups<C extends SocketinatorReadEntriesConfig> =
  ReadEntryUnion<C>["group"];

export type ReadKeys<
  C extends SocketinatorReadEntriesConfig,
  G extends ReadGroups<C>,
> = Extract<ReadEntryUnion<C>, { group: G }>["key"];
export type ReadPayload<
  C extends SocketinatorReadEntriesConfig,
  G extends ReadGroups<C>,
  K extends ReadKeys<C, G>,
> = Extract<Extract<ReadEntryUnion<C>, { group: G }>, { key: K }>["payload"];

export type WithUserId<T, U extends string | number> = [T] extends [null]
  ? { userId: U }
  : T & { userId: U };

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

export type CallbackStore<
  C extends SocketinatorReadEntriesConfig,
  U extends string | number,
> = {
  [G in ReadGroups<C>]?: {
    [K in ReadKeys<C, G>]?: Set<
      (d: WithUserId<ReadPayload<C, G, K>, U>) => void
    >;
  };
};
