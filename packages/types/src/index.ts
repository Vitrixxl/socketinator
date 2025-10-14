export * from "./schemas";
export type WSMessage<K extends PropertyKey = string, P = unknown> = {
  key: K;
  payload: P;
};

export type WSMessageEntryWithUserId = {
  group: string;
  userId: string;
  message: WSMessage;
};
export type WSMessageEntry = {
  group: string;
  message: WSMessage;
};

export type MessagesOf<
  Entries extends WSMessageEntry,
  Group extends Entries["group"],
> = Extract<Entries, { group: Group }>["message"];

export type PayloadOf<
  Entries extends WSMessageEntry,
  Group extends Entries["group"],
  Key extends MessagesOf<Entries, Group>["key"],
> = Extract<MessagesOf<Entries, Group>, { key: Key }>["payload"];
