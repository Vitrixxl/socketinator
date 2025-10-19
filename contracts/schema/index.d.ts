import { z } from "zod";
export declare const wsCommandSchema: z.ZodObject<{
    key: z.ZodString;
    payload: z.ZodAny;
}, z.core.$strip>;
export declare const wsServerCommandEnvelopeSchema: z.ZodObject<{
    group: z.ZodString;
    userId: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
    command: z.ZodObject<{
        key: z.ZodString;
        payload: z.ZodAny;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const wsServerDataEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"data">;
    payload: z.ZodObject<{
        group: z.ZodString;
        userId: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        command: z.ZodObject<{
            key: z.ZodString;
            payload: z.ZodAny;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const wsSetSessionSchema: z.ZodObject<{
    key: z.ZodLiteral<"set">;
    token: z.ZodString;
    userId: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
    exp: z.ZodNumber;
}, z.core.$strip>;
export declare const wsDeleteSessionSchema: z.ZodObject<{
    key: z.ZodLiteral<"delete">;
    userId: z.ZodString;
    token: z.ZodString;
}, z.core.$strip>;
export declare const wsServerSessionEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"session">;
    payload: z.ZodUnion<readonly [z.ZodObject<{
        key: z.ZodLiteral<"set">;
        token: z.ZodString;
        userId: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        exp: z.ZodNumber;
    }, z.core.$strip>, z.ZodObject<{
        key: z.ZodLiteral<"delete">;
        userId: z.ZodString;
        token: z.ZodString;
    }, z.core.$strip>]>;
}, z.core.$strip>;
export declare const wsServerInitSchema: z.ZodObject<{
    key: z.ZodLiteral<"init">;
    routes: z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodNumber>>;
}, z.core.$strip>;
export declare const wsServerInitEventSchema: z.ZodObject<{
    type: z.ZodLiteral<"init">;
    payload: z.ZodObject<{
        key: z.ZodLiteral<"init">;
        routes: z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodNumber>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const wsServerMessageSchema: z.ZodUnion<readonly [z.ZodObject<{
    type: z.ZodLiteral<"data">;
    payload: z.ZodObject<{
        group: z.ZodString;
        userId: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        command: z.ZodObject<{
            key: z.ZodString;
            payload: z.ZodAny;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"session">;
    payload: z.ZodUnion<readonly [z.ZodObject<{
        key: z.ZodLiteral<"set">;
        token: z.ZodString;
        userId: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        exp: z.ZodNumber;
    }, z.core.$strip>, z.ZodObject<{
        key: z.ZodLiteral<"delete">;
        userId: z.ZodString;
        token: z.ZodString;
    }, z.core.$strip>]>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"init">;
    payload: z.ZodObject<{
        key: z.ZodLiteral<"init">;
        routes: z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodNumber>>;
    }, z.core.$strip>;
}, z.core.$strip>]>;
export declare const wsClientCommandEnvelopeSchema: z.ZodObject<{
    group: z.ZodString;
    command: z.ZodObject<{
        key: z.ZodString;
        payload: z.ZodAny;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=index.d.ts.map