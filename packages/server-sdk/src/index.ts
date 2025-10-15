import { wsServerCommandPayloadSchema } from "@socketinator/schemas";
import type {
  CommandsOf,
  HandlerStoreWithUserId,
  CommandPayloadOf,
  SocketinatorServerParams,
  WSCommandEntryWithUserId,
  WsServerSessionEvent,
  WsSetSession,
  WsDeleteSession,
  WsServerDataEvent,
} from "@socketinator/types";

type GroupHandlersWithUserId<
  Entries extends WSCommandEntryWithUserId<UserId>,
  Group extends Entries["group"],
  UserId extends string | number,
> = NonNullable<HandlerStoreWithUserId<Entries, UserId>[Group]>;

export class Socketinator<
  UserId extends string | number,
  ServerEntries extends WSCommandEntryWithUserId<UserId>,
  ClientEntries extends WSCommandEntryWithUserId<UserId>,
> {
  private readonly handlerStore: HandlerStoreWithUserId<ClientEntries, UserId> =
    {};
  private ws: WebSocket | null = null;
  private onConnect: ((e: Event) => void) | null = null;
  private onClose: ((e: CloseEvent) => void) | null = null;
  constructor({ url }: SocketinatorServerParams) {
    this.ws = new WebSocket(url);

    this.ws.onmessage = (event) => {
      this.handleRawMessage(event.data);
    };
    this.ws.onopen = (e: Event) => {
      if (this.onConnect != null) {
        this.onConnect(e);
      }
    };
    this.ws.onclose = (e: CloseEvent) => {
      if (this.onClose != null) {
        this.onClose(e);
        this.ws = null;
      }
    };
  }

  private handleRawMessage(raw: unknown) {
    const parsed = this.parseIncoming(raw);
    this.dispatch(parsed);
  }

  private parseIncoming = (raw: unknown): ClientEntries => {
    const candidate = typeof raw === "string" ? JSON.parse(raw) : raw;
    const result = wsServerCommandPayloadSchema.safeParse(candidate);

    if (!result.success) {
      throw new Error(`Invalid WS payload: ${result.error.message}`);
    }

    const { group, command, userId } = result.data;

    return {
      group,
      userId,
      command,
    } as ClientEntries;
  };

  private dispatch = <Entry extends ClientEntries>(message: Entry) => {
    type Group = Entry["group"];
    type Key = Entry["command"]["key"];

    const groupHandlers = this.handlerStore[message.group as Group] as
      | GroupHandlersWithUserId<ClientEntries, Group, UserId>
      | undefined;

    if (!groupHandlers) return;

    const callbacks = groupHandlers[message.command.key as Key];
    callbacks?.forEach((callback) =>
      callback(
        message.command.payload as CommandPayloadOf<ClientEntries, Group, Key>,
        message.userId,
      ),
    );
  };

  private safeSend = (data: WsServerSessionEvent | WsServerDataEvent) => {
    if (this.ws) {
      this.ws.send(JSON.stringify(data));
    }
  };

  send = <
    Group extends ServerEntries["group"],
    Key extends CommandsOf<ServerEntries, Group>["key"],
  >(
    group: Group,
    key: Key,
    userId: UserId,
    payload: CommandPayloadOf<ServerEntries, Group, Key>,
  ) => {
    this.safeSend({
      type: "data",
      payload: {
        group,
        userId,
        command: {
          key,
          payload,
        },
      },
    });
  };

  on = <
    Group extends ClientEntries["group"],
    Key extends CommandsOf<ClientEntries, Group>["key"],
  >(
    group: Group,
    key: Key,
    callback: (
      data: CommandPayloadOf<ClientEntries, Group, Key>,
      userId: UserId,
    ) => void,
  ) => {
    const groupHandlers = (this.handlerStore[group] ??=
      {} as GroupHandlersWithUserId<ClientEntries, Group, UserId>);

    const callbacks = (groupHandlers[key] ??= new Set<
      (
        data: CommandPayloadOf<ClientEntries, Group, Key>,
        userId: UserId,
      ) => void
    >());

    callbacks.add(callback);
    return () => callbacks.delete(callback);
  };

  setSession = (params: Omit<WsSetSession, "key">) => {
    this.safeSend({
      type: "session",
      payload: {
        key: "set",
        ...params,
      },
    } satisfies WsServerSessionEvent);
  };
  deleteSession = (params: Omit<WsDeleteSession, "key">) => {
    this.safeSend({
      type: "session",
      payload: {
        key: "delete",
        ...params,
      },
    } satisfies WsServerSessionEvent);
  };
}
