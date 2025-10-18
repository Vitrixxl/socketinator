import { wsClientCommandEnvelopeSchema } from "@socketinator/schemas";
import type {
  CommandsOf,
  CallbackStore,
  CommandPayloadOf,
  SocketinatorClientParams,
  WSCommandEntry,
} from "@socketinator/types";

export class SocketinatorClient<
  WriteEntries extends WSCommandEntry,
  ReadEntries extends WSCommandEntry,
> {
  private ws: WebSocket;
  private handlerStore: CallbackStore<ReadEntries> = {};

  onConnect: ((e: Event) => any) | null = null;
  onClose: ((e: CloseEvent) => null) | null = null;
  constructor({ url }: SocketinatorClientParams) {
    this.ws = new WebSocket(url);
    this.ws.onmessage = (event) => {
      this.handleRawMessage(event.data);
    };
    this.ws.onopen = (event) => {
      if (this.onConnect) {
        this.onConnect(event);
      }
    };
    this.ws.onclose = (event) => {
      if (this.onClose) {
        this.onClose(event);
      }
    };
  }

  private handleRawMessage(raw: unknown) {
    const parsed = this.parseIncoming(raw);
    this.dispatch(parsed);
  }

  private parseIncoming(raw: unknown): ReadEntries {
    const candidate = typeof raw === "string" ? JSON.parse(raw) : raw;
    const result = wsClientCommandEnvelopeSchema.safeParse(candidate);

    if (!result.success) {
      throw new Error(`Invalid WS payload: ${result.error.message}`);
    }

    return result.data as ReadEntries;
  }

  private dispatch<Entry extends ReadEntries>(message: Entry) {
    type Group = Entry["group"];
    type Key = Entry["command"]["key"];

    const groupHandlers = this.handlerStore[message.group as Group] as
      | CallbackStore<ReadEntries>[Group]
      | undefined;

    if (!groupHandlers) return;

    const callbacks = groupHandlers[message.command.key as Key] as
      | Set<(payload: Entry["command"]["payload"]) => void>
      | undefined;

    callbacks?.forEach((fn) => fn(message.command.payload));
  }

  send = <
    Group extends WriteEntries["group"],
    Key extends CommandsOf<WriteEntries, Group>["key"],
  >({
    group,
    key,
    payload,
  }: {
    group: Group;
    key: Key;
    payload: CommandPayloadOf<WriteEntries, Group, Key>;
  }) => {
    this.ws.send(
      JSON.stringify({
        group,
        command: {
          key,
          payload,
        },
      }),
    );
  };

  on = <
    Group extends ReadEntries["group"],
    Key extends CommandsOf<ReadEntries, Group>["key"],
  >(
    group: Group,
    key: Key,
    callback: (payload: CommandPayloadOf<ReadEntries, Group, Key>) => void,
  ) => {
    const groupHandlers = (this.handlerStore[group] ??= {} as NonNullable<
      CallbackStore<ReadEntries>
    >[Group]);

    if (!groupHandlers) return;

    const callbacks = (groupHandlers[key] ??= new Set<
      (payload: CommandPayloadOf<ReadEntries, Group, Key>) => void
    >());

    callbacks.add(callback);
    return () => callbacks.delete(callback);
  };
}
