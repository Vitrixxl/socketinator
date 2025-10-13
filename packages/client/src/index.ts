import type { Entry, DataMap } from "@socketinator/types";

type SocketinatorClientParams = {
  onConnect: (ev: Event) => any;
  onDisconnect: (ev: CloseEvent) => any;
  baseUrl: string;
};

export class SocketinatorClient<T extends DataMap> {
  private callbackMap = new Map<string, (data: any) => any>();
  private ws: WebSocket;

  constructor({ onConnect, onDisconnect, baseUrl }: SocketinatorClientParams) {
    this.ws = new WebSocket(new URL("/ws", baseUrl));
    this.ws.onopen = onConnect;
    this.ws.onclose = onDisconnect;
    this.ws.onmessage = this.handleMessage;
  }

  private handleMessage = (data: MessageEvent) => {
    const parsedData: Entry = JSON.parse(data.data);
    const callback = this.callbackMap.get(parsedData.key);
    if (!callback) return null;
    callback(parsedData.payload);
  };

  on = <K extends T[number]["key"]>(
    key: K,
    callback: (payload: Extract<T[number], { key: K }>["payload"]) => any,
  ) => {
    this.callbackMap.set(key, callback);
  };
}
