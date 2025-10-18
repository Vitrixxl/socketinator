import type z from "zod";
import type { SocketinatorReadEntriesConfig } from ".";

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

export type ParsedClientIncomingMessage<
  C extends SocketinatorReadEntriesConfig,
  G extends ReadGroups<C>,
  K extends ReadKeys<C, G>,
> = {
  group: G;
  key: K;
  payload: ReadPayload<C, G, K>;
};

export type WithUserId<T, U extends string | number> = [T] extends [null]
  ? { userId: U }
  : T & { userId: U };
