import { SSTConfig } from "sst";
import { Web } from "./stacks/web";
import { Realtime } from "./stacks/realtime";

export default {
  config(_input) {
    return {
      name: "aws-crt-issue",
      region: "us-east-1",
    };
  },
  stacks(app) {
    if (app.stage !== "production") {
      app.setDefaultRemovalPolicy("destroy");
    }

    app.setDefaultFunctionProps({
      architecture: "arm_64",
    });

    app.stack(Realtime).stack(Web);
  },
} satisfies SSTConfig;
