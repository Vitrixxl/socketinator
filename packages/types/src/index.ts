export * from "./schemas";

export type WSAction<K extends PropertyKey = string, P = unknown> = {
  key: K;
  payload: P;
};

export type WSActionEntry = {
  group: string;
  action: WSAction;
};

export type WSActionEntryWithUserId<UserId extends string | number> = {
  group: string;
  userId: UserId;
  action: WSAction;
};

export type ActionsOf<
  Entries extends WSActionEntry,
  Group extends Entries["group"],
> = Extract<Entries, { group: Group }>["action"];

export type PayloadOf<
  Entries extends WSActionEntry,
  Group extends Entries["group"],
  Key extends ActionsOf<Entries, Group>["key"],
> = Extract<ActionsOf<Entries, Group>, { key: Key }>["payload"];

export type BaseWSActions = {
  group: "base";
  action:
    | { key: "connect"; payload: Event }
    | { key: "disconnect"; payload: null };
};

export type HandlerStore<Entries extends WSActionEntry> = {
  [Group in Entries["group"]]?: {
    [Key in ActionsOf<Entries, Group>["key"]]?: Set<
      (payload: PayloadOf<Entries, Group, Key>) => void
    >;
  };
};

export type HandlerStoreWithUserId<
  Entries extends WSActionEntry,
  UserId extends string | number,
> = {
  [Group in Entries["group"]]?: {
    [Key in ActionsOf<Entries, Group>["key"]]?: Set<
      (payload: PayloadOf<Entries, Group, Key>, userId: UserId) => void
    >;
  };
};

export type GroupHandlers<
  Entries extends WSActionEntry,
  Group extends Entries["group"],
> = NonNullable<HandlerStore<Entries>[Group]>;

export type SocketinatorClientParams = {
  url: string;
};
