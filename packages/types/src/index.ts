export * from "./schemas";
export * from "./server";
export * from "./client";
export * from "./server-utils";
export * from "./client-utils";

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

export type HandlerStore<Entries extends WSCommandEntry> = {
  [Group in Entries["group"]]?: {
    [Key in CommandsOf<Entries, Group>["key"]]?: Set<
      (payload: CommandPayloadOf<Entries, Group, Key>) => void
    >;
  };
};
