export * from "./schemas";
export type WSMessage<K extends PropertyKey = string, P = unknown> = {
  key: K;
  payload: P;
};

export type WSServerMessageEntry = {
  group: string;
  message: WSMessage;
};
export type WSClientMessageEntry = {
  group: string;
  userId: string;
  message: WSMessage;
};

export type WSMessageEntry = WSServerMessageEntry | WSClientMessageEntry;

export type MessagesOf<
  Entries extends WSMessageEntry,
  Group extends Entries["group"],
> = Extract<Entries, { group: Group }>["message"];

export type PayloadOf<
  Entries extends WSMessageEntry,
  Group extends Entries["group"],
  Key extends MessagesOf<Entries, Group>["key"],
> = Extract<MessagesOf<Entries, Group>, { key: Key }>["payload"];

export class Socketinator<
  ServerEntries extends WSServerMessageEntry,
  ClientEntries extends WSClientMessageEntry,
> {
  constructor() {}

  send = <
    Group extends ServerEntries["group"],
    Key extends MessagesOf<ServerEntries, Group>["key"],
  >(
    group: Group,
    key: Key,
    data: PayloadOf<ServerEntries, Group, Key>,
  ) => {};

  on = <
    Group extends ServerEntries["group"],
    Key extends MessagesOf<ServerEntries, Group>["key"],
  >(
    group: Group,
    key: Key,
    callback: (data: PayloadOf<ClientEntries, Group, Key>) => void,
  ) => {};
}

export class SocketinatorClient<Entries extends WSMEssageEntry> {
  constructor() {}

  on = <
    Group extends Entries["group"],
    Key extends MessagesOf<Entries, Group>["key"],
  >(
    group: Group,
    key: Key,
    callback: (data: PayloadOf<Entries, Group, Key>) => any,
  ) => {};
}

type AppEvents =
  | {
      group: "chat";
      message:
        | WSMessage<"message", { text: string }>
        | WSMessage<"online", null>;
    }
  | { group: "system"; message: WSMessage<"ping"> };

const socket = new Socketinator<AppEvents>();
