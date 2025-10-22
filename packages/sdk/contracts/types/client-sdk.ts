import type { CommandPayloadOf, CommandsOf, WSCommandEntry } from "./core";

export type SocketinatorClientParams = {
  url: string;
};

export type CallbackStore<Entries extends WSCommandEntry> = {
  [Group in Entries["group"]]?: {
    [Key in CommandsOf<Entries, Group>["key"]]?: Set<
      (payload: CommandPayloadOf<Entries, Group, Key>) => void
    >;
  };
};
