import type { StackContext } from "sst/constructs";
import { NextjsSite, use } from "sst/constructs";
import { Realtime } from "./realtime";

export function Web({ stack, app }: StackContext) {
  const realtime = use(Realtime);

  const site = new NextjsSite(stack, "site", {
    permissions: ["iot"], 
    environment: {
      NEXT_PUBLIC_STAGE: app.stage,
      NEXT_PUBLIC_IOT_HOST: realtime.endpointAddress,
    },
  });

  stack.addOutputs({
    SiteUrl: site.url,
  });
}
