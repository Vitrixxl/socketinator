import type {
  Method,
  SocketinatorData,
  SocketinatorSessionData,
} from "@socketinator/types";

type FetchParams = {
  path: string;
  method: Method;
  data: any;
};
export type SocketinatorParams = {
  baseUrl: string;
  port: string;
  secret: string;
};
export class Socketinator {
  private url: URL;
  private headers: Headers;
  constructor({ baseUrl, port, secret }: SocketinatorParams) {
    this.url = new URL(baseUrl);
    this.url.port = port;
    this.headers = new Headers();
    this.headers.set("x-api-key", secret);
  }
  private fetch = async ({ data, path, method }: FetchParams) => {
    await fetch(new URL(path, this.url), {
      method,
      body: JSON.stringify(data),
    });
  };

  upsertSession = async (data: SocketinatorSessionData) => {
    await this.fetch({ path: "/session", method: "POST", data });
  };
  deleteSession = async (token: string) => {
    await this.fetch({ path: "/session", method: "DELETE", data: { token } });
  };
  sendData = async (data: SocketinatorData) => {
    await this.fetch({ path: "/data", method: "POST", data });
  };
}
