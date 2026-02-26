import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: "https://smiling-ray-95.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
