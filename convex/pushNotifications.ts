// convex/pushNotifications.ts
import { v } from "convex/values";
import { api } from "./_generated/api";
import { action } from "./_generated/server";

type ExpoPushMessage = {
  to: string;
  sound: "default";
  title: string;
  body: string;
  data: {
    screen: string;
    dept: string;
  };
};

type SendNoticePushResult = {
  sent: number;
  response?: unknown;
};

export const sendNoticePush = action({
  args: {
    dept: v.string(),
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args): Promise<SendNoticePushResult> => {
    const students: string[] = await ctx.runQuery(
      api.internalPush.getStudentTokensByDept,
      {
        dept: args.dept,
      },
    );

    const messages: ExpoPushMessage[] = students.map((token: string) => ({
      to: token,
      sound: "default",
      title: args.title,
      body: args.body,
      data: {
        screen: "notifications",
        dept: args.dept,
      },
    }));

    if (messages.length === 0) {
      return { sent: 0 };
    }

    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    const json: unknown = await res.json();

    return {
      sent: messages.length,
      response: json,
    };
  },
});
