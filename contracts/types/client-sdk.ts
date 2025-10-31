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

export type PendingRequest = {
  resolve: (payload: any) => void;
  reject: (error: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
};
