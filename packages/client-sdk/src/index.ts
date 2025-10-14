import type {
  MessagesOf,
  PayloadOf,
  WSMessageEntry,
  WSMessageEntryWithUserId,
} from "@socketinator/types";

export class SocketinatorClient<
  ServerEntries extends WSMessageEntry,
  ClientEntries extends WSMessageEntry,
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
    Group extends ClientEntries["group"],
    Key extends MessagesOf<ClientEntries, Group>["key"],
  >(
    group: Group,
    key: Key,
    callback: (data: PayloadOf<ClientEntries, Group, Key>) => void,
  ) => {};
}
