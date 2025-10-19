import z from "zod";
import { Socketinator } from "../../server-sdk/src";

export * from "./schemas";
export * from "./server-sdk";
export * from "./client-sdk";
export * from "./server-sdk-utils";
export * from "./client-sdk-utils";
export * from "./server";

export type WSCommand<K extends PropertyKey = string, P = unknown> = {
  key: K;
  payload: P;
};

export type WSCommandEntry = {
  group: string;
  command: WSCommand;
};

export type WSCommandEntryWithUserId<UserId extends string | number> = {
  group: string;
  userId: UserId;
  command: WSCommand;
};

export type CommandsOf<
  Entries extends WSCommandEntry,
  Group extends Entries["group"],
> = Extract<Entries, { group: Group }>["command"];

export type CommandPayloadOf<
  Entries extends WSCommandEntry,
  Group extends Entries["group"],
  Key extends CommandsOf<Entries, Group>["key"],
> = Extract<CommandsOf<Entries, Group>, { key: Key }>["payload"];

export type HandlerStore<Entries extends WSCommandEntry> = {
  [Group in Entries["group"]]?: {
    [Key in CommandsOf<Entries, Group>["key"]]?: Set<
      (payload: CommandPayloadOf<Entries, Group, Key>) => void
    >;
  };
};
