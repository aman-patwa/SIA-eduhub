// convex/http.ts
import { httpRouter } from "convex/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

/**
 * Clerk Webhook
 * URL: https://<your-deployment>.convex.site/clerk-webhook
 */
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("Missing CLERK_WEBHOOK_SECRET environment variable");
    }

    // check headers
    const svix_id = request.headers.get("svix-id");
    const svix_signature = request.headers.get("svix-signature");
    const svix_timestamp = request.headers.get("svix-timestamp");

    if (!svix_id || !svix_signature || !svix_timestamp) {
      return new Response("Error occurred -- no svix headers", { status: 400 });
    }

    const payload = await request.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);
    let evt: any;

    // verify webhook
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as any;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Error occurred -- invalid webhook", { status: 400 });
    }

    const eventType = evt.type;

    if (eventType === "user.created") {
      const {
        id,
        email_addresses,
        first_name,
        last_name,
        image_url,
        username,
      } = evt.data;

      const email = email_addresses?.[0]?.email_address;
      if (!email) {
        return new Response("No email found on Clerk user", { status: 400 });
      }

      const fullname = `${first_name || ""} ${last_name || ""}`.trim();
      const finalUsername = username || email.split("@")[0];

      try {
        await ctx.runMutation(api.users.createUser, {
          email,
          fullname: fullname || finalUsername,
          image: image_url || "",
          clerkId: id,
          username: finalUsername,
        });
      } catch (error) {
        console.log("Error creating user:", error);
        return new Response("Error creating user", { status: 500 });
      }
    }

    return new Response("Webhook processed successfully", { status: 200 });
  }),
});

/**
 * Admin creates Teacher in Clerk (server-to-server)
 * URL: https://<your-deployment>.convex.site/admin/create-teacher
 */
http.route({
  path: "/admin/create-teacher",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return new Response("Not authenticated", { status: 401 });

    // Ensure caller is admin in Convex
    const me = await ctx.runQuery(api.users.getMe, {});
    if (!me || me.role !== "admin") {
      return new Response("Not authorized", { status: 403 });
    }

    const secret = process.env.CLERK_SECRET_KEY;
    if (!secret)
      return new Response("Missing CLERK_SECRET_KEY", { status: 500 });

    const body = await request.json();

    // expected from client
    const { email, username, fullname, tempPassword } = body as {
      email: string;
      username: string;
      fullname: string;
      tempPassword: string;
    };

    if (!email || !username || !fullname || !tempPassword) {
      return new Response("Missing fields", { status: 400 });
    }

    // Create user in Clerk (Admin API)
    const clerkRes = await fetch("https://api.clerk.com/v1/users", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: [email],
        username,
        password: tempPassword,
        first_name: fullname,
        skip_password_checks: true,
        skip_password_requirement: true,
      }),
    });

    if (!clerkRes.ok) {
      const errText = await clerkRes.text();
      return new Response(errText, { status: 400 });
    }

    const clerkUser = await clerkRes.json();

    return Response.json(
      {
        clerkId: clerkUser.id,
        email,
        username,
      },
      { status: 200 },
    );
  }),
});

export default http;
