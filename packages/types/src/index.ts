// Shared types for Socketinator

// Base entry type for type-safe event handling
export type Entry<K extends PropertyKey = string, P = unknown> = {
  key: K;
  payload: P;
};

// Collection of entries for typed WebSocket events
export type DataMap = readonly Entry[];

// Session data structure
export type SocketinatorSessionData = {
  token: string;
  exp: number;
};

// Data payload for WebSocket messages
export type SocketinatorData = {
  key: string;
  payload: any;
};

// HTTP methods
export type Method = "GET" | "POST" | "PUT" | "DELETE";
