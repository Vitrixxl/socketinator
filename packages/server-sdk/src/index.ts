import type {
  MessagesOf,
  PayloadOf,
  WSMessageEntryWithUserId,
} from "@socketinator/types";

export class Socketinator<
  UserId extends string | number,
  ServerEntries extends WSMessageEntryWithUserId,
  ClientEntries extends WSMessageEntryWithUserId,
> {
  constructor() {}

  send = <
    Group extends ServerEntries["group"],
    Key extends MessagesOf<ServerEntries, Group>["key"],
  >(
    group: Group,
    key: Key,
    userId: UserId,
    data: PayloadOf<ServerEntries, Group, Key>,
  ) => {};

  on = <
    Group extends ClientEntries["group"],
    Key extends MessagesOf<ClientEntries, Group>["key"],
  >(
    group: Group,
    key: Key,
    callback: (
      data: PayloadOf<ClientEntries, Group, Key>,
      userId: UserId,
    ) => void,
  ) => {};
}
