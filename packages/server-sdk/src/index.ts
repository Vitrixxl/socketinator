import { wsClientActionSchema } from "@socketinator/schemas";
import type {
  ActionsOf,
  HandlerStoreWithUserId,
  PayloadOf,
  WSActionEntryWithUserId,
} from "@socketinator/types";

type GroupHandlersWithUserId<
  Entries extends WSActionEntryWithUserId<UserId>,
  Group extends Entries["group"],
  UserId extends string | number,
> = NonNullable<HandlerStoreWithUserId<Entries, UserId>[Group]>;

export class Socketinator<
  UserId extends string | number,
  ServerEntries extends WSActionEntryWithUserId<UserId>,
  ClientEntries extends WSActionEntryWithUserId<UserId>,
> {
  private readonly sockets = new Map<UserId, WebSocket>();
  private readonly handlerStore: HandlerStoreWithUserId<ClientEntries, UserId> =
    {};

  registerConnection(userId: UserId, socket: WebSocket) {
    this.sockets.set(userId, socket);

    socket.addEventListener("message", (event) =>
      this.handleRawMessage(event.data, userId),
    );

    socket.addEventListener("close", () => {
      if (this.sockets.get(userId) === socket) {
        this.sockets.delete(userId);
      }
    });
  }

  private handleRawMessage(raw: unknown, userId: UserId) {
    const parsed = this.parseIncoming(raw, userId);
    this.dispatch(parsed);
  }

  private parseIncoming(raw: unknown, userId: UserId): ClientEntries {
    const candidate = typeof raw === "string" ? JSON.parse(raw) : raw;
    const result = wsClientActionSchema.safeParse(candidate);

    if (!result.success) {
      throw new Error(`Invalid WS payload: ${result.error.message}`);
    }

    const { group, action } = result.data;

    return {
      group,
      userId,
      action,
    } as ClientEntries;
  }

  private dispatch<Entry extends ClientEntries>(message: Entry) {
    type Group = Entry["group"];
    type Key = Entry["action"]["key"];

    const groupHandlers = this.handlerStore[message.group as Group] as
      | GroupHandlersWithUserId<ClientEntries, Group, UserId>
      | undefined;

    if (!groupHandlers) return;

    const callbacks = groupHandlers[message.action.key as Key];
    callbacks?.forEach((callback) =>
      callback(
        message.action.payload as PayloadOf<ClientEntries, Group, Key>,
        message.userId,
      ),
    );
  }

  send = <
    Group extends ServerEntries["group"],
    Key extends ActionsOf<ServerEntries, Group>["key"],
  >(
    group: Group,
    key: Key,
    userId: UserId,
    data: PayloadOf<ServerEntries, Group, Key>,
  ) => {
    const socket = this.sockets.get(userId);
    if (!socket) return;

    socket.send(
      JSON.stringify({
        group,
        action: {
          key,
          payload: data,
        },
      }),
    );
  };

  on = <
    Group extends ClientEntries["group"],
    Key extends ActionsOf<ClientEntries, Group>["key"],
  >(
    group: Group,
    key: Key,
    callback: (
      data: PayloadOf<ClientEntries, Group, Key>,
      userId: UserId,
    ) => void,
  ) => {
    const groupHandlers = (this.handlerStore[group] ??=
      {} as GroupHandlersWithUserId<ClientEntries, Group, UserId>);

    const callbacks = (groupHandlers[key] ??= new Set<
      (data: PayloadOf<ClientEntries, Group, Key>, userId: UserId) => void
    >());

    callbacks.add(callback);
    return () => callbacks.delete(callback);
  };
}
