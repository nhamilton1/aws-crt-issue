import type { StackContext } from "sst/constructs";
import { NextjsSite, use } from "sst/constructs";
import { Realtime } from "./realtime";
import * as lambda from "aws-cdk-lib/aws-lambda";

export function Web({ stack, app }: StackContext) {
  const realtime = use(Realtime);

  const site = new NextjsSite(stack, "site", {
    permissions: ["iot"],
    environment: {
      NEXT_PUBLIC_STAGE: app.stage,
      NEXT_PUBLIC_IOT_HOST: realtime.endpointAddress,
    },
    cdk: {
      server: {
        layers: [
          // this is a current fix for the iot lib which is not bundled correctly bec the binary file
          new lambda.LayerVersion(stack, "iotLayer", {
            description: "iot layer",
            code: lambda.Code.fromAsset("node_modules/aws-iot-device-sdk-v2"),
          }),
        ],
      },
    },
  });

  stack.addOutputs({
    SiteUrl: site.url,
  });
}
