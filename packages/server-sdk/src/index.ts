import { wsServerCommandEnvelopeSchema } from "@socketinator/schemas";
import type {
  CommandPayloadOf,
  SocketinatorServerParams,
  WSCommandEntryWithUserId,
  WsServerSessionEvent,
  WsSetSession,
  WsDeleteSession,
  WsServerDataEvent,
  SocketinatorReadEntriesConfig,
  ReadPayload,
  ReadGroups,
  ReadKeys,
  CallbackStoreWithUserId,
  ParsedIncomingMessage,
  ParsedIncomingMessageAny,
  WithUserId,
  CommandsOf,
  WsServerInitEvent,
} from "@socketinator/types";

export class Socketinator<
  UserId extends string | number,
  WriteEntries extends WSCommandEntryWithUserId<UserId>,
  const C extends SocketinatorReadEntriesConfig,
> {
  private readonly handlerStore: CallbackStoreWithUserId<C, UserId> = {};
  private ws: WebSocket | null = null;
  private onConnect: ((e: Event) => void) | null = null;
  private onClose: ((e: CloseEvent) => void) | null = null;
  private readEnvelopes: C;
  constructor({ url, readEnvelopes }: SocketinatorServerParams<C>) {
    this.readEnvelopes = readEnvelopes;
    this.ws = new WebSocket(url);

    this.ws.onmessage = (event) => {
      this.handleRawMessage(event.data);
    };
    this.ws.onopen = (e: Event) => {
      this.transmitConfig(readEnvelopes);
      if (this.onConnect != null) {
        this.onConnect(e);
      }
    };
    this.ws.onclose = (e: CloseEvent) => {
      this.ws = null;
      if (this.onClose != null) {
        this.onClose(e);
      }
    };
  }

  private transformConfigToRoutes = (config: SocketinatorReadEntriesConfig) => {
    const routes: Record<string, Record<string, number>> = {};

    for (const [group, entries] of Object.entries(config)) {
      routes[group] = {};
      for (const [key, value] of Object.entries(entries)) {
        routes[group][key] = value.maxRequestPerSecond ?? 10;
      }
    }

    return routes;
  };

  private transmitConfig = (readEnvelopes: C) => {
    const parsedConfig = this.transformConfigToRoutes(readEnvelopes);
    this.safeSend({
      type: "init",
      payload: {
        key: "init",
        routes: parsedConfig,
      },
    } satisfies WsServerInitEvent);
  };

  private handleRawMessage(raw: unknown) {
    const parsed = this.parseIncoming(raw);
    this.dispatch(parsed);
  }
  private hasOwn = <O extends object, K extends PropertyKey>(
    obj: O,
    key: K,
  ): key is Extract<K, keyof O> =>
    Object.prototype.hasOwnProperty.call(obj, key);

  private parseIncoming = (
    raw: unknown,
  ): ParsedIncomingMessageAny<UserId, C> | null => {
    const candidate = typeof raw === "string" ? JSON.parse(raw) : raw;

    const parsedEnvelope = wsServerCommandEnvelopeSchema.safeParse(candidate);
    if (!parsedEnvelope.success) {
      throw new Error(`Invalid WS payload: ${parsedEnvelope.error.message}`);
    }

    const { group, userId, command } = parsedEnvelope.data;

    if (!this.hasOwn(this.readEnvelopes, group)) return null;
    const groupEntry = this.readEnvelopes[group];
    if (!groupEntry) return null;

    if (!this.hasOwn(groupEntry, command.key)) return null;
    const entry = groupEntry[command.key];
    if (!entry) return null;

    type G = Extract<typeof group, ReadGroups<C>>;
    type K = Extract<typeof command.key, ReadKeys<C, G>>;

    type Payload = WithUserId<ReadPayload<C, G, K>, UserId>;
    const schema = entry.schema;

    const parsePayloadResult = schema.safeParse(command.payload);
    if (!parsePayloadResult.success) return null;

    const parsedPayload =
      parsePayloadResult.data || ({} as ReadPayload<C, G, K>);

    const payloadWithUser = {
      ...parsedPayload,
      userId,
    } as WithUserId<ReadPayload<C, G, K>, UserId>;

    const result: ParsedIncomingMessage<UserId, C, G, K, Payload> = {
      group: group as G,
      key: command.key as K,
      payload: payloadWithUser,
    };

    return result;
  };

  private dispatch = (msg: ParsedIncomingMessageAny<UserId, C> | null) => {
    if (!msg) return;

    const { group, key, payload } = msg;

    if (!this.hasOwn(this.handlerStore, group)) return;
    const groupHandlers = this.handlerStore[group];
    if (!groupHandlers) return;

    if (!this.hasOwn(groupHandlers, key)) return;
    const callbacks = groupHandlers[key];

    if (!callbacks?.size) return;

    for (const cb of callbacks) cb(payload as any);
  };

  private safeSend = (
    data: WsServerSessionEvent | WsServerDataEvent | WsServerInitEvent,
  ) => {
    if (this.ws) {
      this.ws.send(JSON.stringify(data));
    }
  };

  send = <
    Group extends WriteEntries["group"],
    Key extends CommandsOf<WriteEntries, Group>["key"],
  >({
    group,
    key,
    userId,
    payload,
  }: {
    group: Group;
    key: Key;
    userId: UserId;
    payload: CommandPayloadOf<WriteEntries, Group, Key>;
  }) => {
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

  on = <G extends ReadGroups<C>, K extends ReadKeys<C, G>>(
    group: G,
    key: K,
    callback: (data: WithUserId<ReadPayload<C, G, K>, UserId>) => void,
  ) => {
    const groupHandlers = (this.handlerStore[group] ??= {} as NonNullable<
      CallbackStoreWithUserId<C, UserId>[G]
    >);
    const callbacks = (groupHandlers[key] ??= new Set<typeof callback>());

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
