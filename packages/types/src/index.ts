export * from "./schemas";

export type WithBase<Entries extends WSCommandEntry> =
  | BaseWSCommands
  | Exclude<Entries, { group: BaseGroup }>;

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

export type HandlerStoreWithUserId<
  Entries extends WSCommandEntry,
  UserId extends string | number,
> = {
  [Group in Entries["group"]]?: {
    [Key in CommandsOf<Entries, Group>["key"]]?: Set<
      (payload: CommandPayloadOf<Entries, Group, Key>, userId: UserId) => void
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
export type SocketinatorServerParams = {
  url: string;
};
