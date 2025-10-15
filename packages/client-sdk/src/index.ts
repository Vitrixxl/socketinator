import { wsClientActionSchema } from "@socketinator/schemas";
import type {
  ActionsOf,
  BaseWSActions,
  GroupHandlers,
  HandlerStore,
  PayloadOf,
  SocketinatorClientParams,
  WSActionEntry,
} from "@socketinator/types";

export class SocketinatorClient<
  ReadEntries extends WSActionEntry & BaseWSActions,
  WriteEntries extends WSActionEntry,
> {
  private ws: WebSocket;
  private handlerStore: HandlerStore<ReadEntries> = {};

  constructor({ url }: SocketinatorClientParams) {
    this.ws = new WebSocket(url);

    this.ws.onmessage = (event) => {
      this.handleRawMessage(event.data);
    };

    this.ws.onopen = (event) => {
      this.dispatch({
        group: "base",
        action: {
          key: "connect",
          payload: event,
        },
      } as ReadEntries);
    };

    this.ws.onclose = (event) => {
      this.dispatch({
        group: "base",
        action: {
          key: "disconnect",
          payload: event,
        },
      } as ReadEntries);
    };
  }

  private handleRawMessage(raw: unknown) {
    const parsed = this.parseIncoming(raw);
    this.dispatch(parsed);
  }

  private parseIncoming(raw: unknown): ReadEntries {
    const candidate = typeof raw === "string" ? JSON.parse(raw) : raw;
    const result = wsClientActionSchema.safeParse(candidate);

    if (!result.success) {
      throw new Error(`Invalid WS payload: ${result.error.message}`);
    }

    return result.data as ReadEntries;
  }

  private dispatch<Entry extends ReadEntries>(message: Entry) {
    type Group = Entry["group"];
    type Key = Entry["action"]["key"];

    const groupHandlers = this.handlerStore[message.group as Group] as
      | GroupHandlers<ReadEntries, Group>
      | undefined;

    if (!groupHandlers) return;

    const callbacks = groupHandlers[message.action.key as Key] as
      | Set<(payload: Entry["action"]["payload"]) => void>
      | undefined;

    callbacks?.forEach((fn) => fn(message.action.payload));
  }

  send = <
    Group extends WriteEntries["group"],
    Key extends ActionsOf<WriteEntries, Group>["key"],
  >(
    group: Group,
    key: Key,
    payload: PayloadOf<WriteEntries, Group, Key>,
  ) => {
    this.ws.send(
      JSON.stringify({
        group,
        action: {
          key,
          payload,
        },
      }),
    );
  };

  on = <
    Group extends ReadEntries["group"],
    Key extends ActionsOf<ReadEntries, Group>["key"],
  >(
    group: Group,
    key: Key,
    callback: (data: PayloadOf<ReadEntries, Group, Key>) => void,
  ) => {
    const groupHandlers = (this.handlerStore[group] ??= {} as GroupHandlers<
      ReadEntries,
      Group
    >);

    const callbacks = (groupHandlers[key] ??= new Set<
      (data: PayloadOf<ReadEntries, Group, Key>) => void
    >());

    callbacks.add(callback);
    return () => callbacks.delete(callback);
  };
}
